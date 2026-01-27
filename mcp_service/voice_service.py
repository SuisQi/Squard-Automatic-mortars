"""
语音服务模块 - Push-to-Talk 语音输入

按住 Q 键说话，松开后将识别结果发送给 GLM-4 AI 对话。

依赖:
- websockets: 腾讯云 ASR WebSocket 通信
- pyaudio: 麦克风音频采集
- pynput: 按键监听
"""

import asyncio
import json
import time
import base64
import hashlib
import hmac
import random
import threading
import queue
from typing import Optional, Callable
from urllib.parse import quote

import requests

try:
    import websockets
    import pyaudio
    from pynput import keyboard
    VOICE_DEPS_AVAILABLE = True
except ImportError as e:
    VOICE_DEPS_AVAILABLE = False
    VOICE_DEPS_ERROR = str(e)


class TencentCloudASR:
    """腾讯云实时语音识别客户端"""

    def __init__(self, secret_id: str, secret_key: str, app_id: str):
        self.secret_id = secret_id
        self.secret_key = secret_key
        self.app_id = app_id
        self.websocket = None
        self.voice_id = None
        self.is_connected = False
        self.callback: Optional[Callable] = None

    def _generate_sign(self, params: dict) -> str:
        """生成签名"""
        sorted_params = sorted(params.items())
        params_str = "&".join([f"{k}={v}" for k, v in sorted_params])
        sign_str = f"asr.cloud.tencent.com/asr/v2/{self.app_id}?{params_str}"

        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            sign_str.encode('utf-8'),
            hashlib.sha1
        ).digest()

        return base64.b64encode(signature).decode('utf-8')

    async def connect(self, callback: Optional[Callable] = None,
                      engine_model_type: str = "16k_zh",
                      hotword_id: str = "") -> bool:
        """连接到腾讯云 ASR 服务"""
        self.callback = callback

        try:
            timestamp = int(time.time())
            expired = timestamp + 86400
            nonce = random.randint(10000, 99999)
            self.voice_id = f"{timestamp}{random.randint(10000, 99999)}"

            params = {
                "secretid": self.secret_id,
                "timestamp": str(timestamp),
                "expired": str(expired),
                "nonce": str(nonce),
                "engine_model_type": engine_model_type,
                "voice_id": self.voice_id,
                "voice_format": "1",
                "needvad": "1",
                "filter_dirty": "0",
                "filter_modal": "0",
                "filter_punc": "0",
                "convert_num_mode": "1",
                "word_info": "0",
            }

            if hotword_id:
                params["hotword_id"] = hotword_id

            signature = self._generate_sign(params)

            sorted_params = sorted(params.items())
            url_params = "&".join([f"{k}={quote(str(v), safe='')}" for k, v in sorted_params])
            url = (
                f"wss://asr.cloud.tencent.com/asr/v2/{self.app_id}"
                f"?{url_params}"
                f"&signature={quote(signature, safe='')}"
            )

            self.websocket = await websockets.connect(
                url,
                ping_interval=20,
                ping_timeout=30
            )
            self.is_connected = True

            asyncio.create_task(self._receive_loop())
            print(f"[语音] ASR 连接成功")
            return True

        except Exception as e:
            print(f"[语音] ASR 连接失败: {e}")
            return False

    async def send_audio(self, audio_data: bytes):
        """发送音频数据"""
        if not self.is_connected or self.websocket is None:
            return

        try:
            await self.websocket.send(audio_data)
        except Exception as e:
            print(f"[语音] 发送音频失败: {e}")

    async def send_end(self):
        """发送结束标记"""
        if not self.is_connected or self.websocket is None:
            return

        try:
            end_msg = json.dumps({"type": "end"})
            await self.websocket.send(end_msg)
        except Exception as e:
            print(f"[语音] 发送结束标记失败: {e}")

    async def _receive_loop(self):
        """接收识别结果"""
        try:
            while self.is_connected and self.websocket:
                try:
                    message = await asyncio.wait_for(
                        self.websocket.recv(),
                        timeout=30.0
                    )

                    result = json.loads(message)
                    code = result.get('code', -1)

                    if code == 0:
                        voice_text = result.get('result', {}).get('voice_text_str', '')
                        slice_type = result.get('result', {}).get('slice_type', 0)
                        is_final = (slice_type == 2)

                        if voice_text:
                            if is_final:
                                print(f"[语音识别] {voice_text}")
                            else:
                                print(f"[识别中...] {voice_text}", end='\r')

                            if self.callback:
                                self.callback(voice_text, is_final, result)
                    else:
                        error_msg = result.get('message', '未知错误')
                        print(f"[语音] 错误 (code={code}): {error_msg}")

                except asyncio.TimeoutError:
                    continue

        except asyncio.CancelledError:
            pass
        except Exception as e:
            if "ConnectionClosed" not in str(type(e)):
                print(f"[语音] 接收错误: {e}")
        finally:
            self.is_connected = False

    async def disconnect(self):
        """断开连接"""
        self.is_connected = False
        if self.websocket:
            try:
                await self.websocket.close()
            except Exception:
                pass
            self.websocket = None


class MicrophoneRecorder:
    """麦克风音频采集器"""

    def __init__(self, sample_rate: int = 16000, chunk_duration_ms: int = 40):
        self.sample_rate = sample_rate
        self.chunk_size = int(sample_rate * chunk_duration_ms / 1000)
        self.chunk_duration_ms = chunk_duration_ms
        self.is_recording = False
        self.audio = None
        self.stream = None

    def start(self) -> bool:
        """开始录音"""
        try:
            self.audio = pyaudio.PyAudio()
            self.stream = self.audio.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size
            )
            self.is_recording = True
            print(f"[语音] 开始录音...")
            return True
        except Exception as e:
            print(f"[语音] 麦克风启动失败: {e}")
            return False

    def read_chunk(self) -> Optional[bytes]:
        """读取一个音频块"""
        if not self.is_recording or not self.stream:
            return None

        try:
            audio_data = self.stream.read(self.chunk_size, exception_on_overflow=False)
            return audio_data
        except Exception as e:
            print(f"[语音] 读取失败: {e}")
            return None

    def stop(self):
        """停止录音"""
        self.is_recording = False

        if self.stream:
            try:
                self.stream.stop_stream()
                self.stream.close()
            except Exception:
                pass
            self.stream = None

        if self.audio:
            try:
                self.audio.terminate()
            except Exception:
                pass
            self.audio = None

        print("[语音] 录音停止")


class VoiceService:
    """
    语音服务主类 - Push-to-Talk 模式

    在独立线程中运行，管理:
    - 按键监听 (Q 键)
    - 麦克风采集
    - ASR 连接
    - AI 对话调用
    """

    def __init__(self):
        self.loop: Optional[asyncio.AbstractEventLoop] = None
        self.asr: Optional[TencentCloudASR] = None
        self.recorder: Optional[MicrophoneRecorder] = None
        self.is_recording = False
        self.is_running = False
        self.ptt_key = 'q'
        self.event_queue: queue.Queue = queue.Queue()

        # 配置（从 Redis 获取）
        self.secret_id = ""
        self.secret_key = ""
        self.app_id = ""
        self.hotword_id = ""

        # 最终识别结果
        self.final_text = ""

    def _load_config(self):
        """从 Redis 加载配置"""
        try:
            from utils.redis_connect import redis_cli

            self.secret_id = redis_cli.get("squad:voice:secret_id")
            self.secret_key = redis_cli.get("squad:voice:secret_key")
            self.app_id = redis_cli.get("squad:voice:app_id")
            self.hotword_id = redis_cli.get("squad:voice:hotword_id")

            # 解码 bytes
            if self.secret_id:
                self.secret_id = self.secret_id.decode() if isinstance(self.secret_id, bytes) else self.secret_id
            if self.secret_key:
                self.secret_key = self.secret_key.decode() if isinstance(self.secret_key, bytes) else self.secret_key
            if self.app_id:
                self.app_id = self.app_id.decode() if isinstance(self.app_id, bytes) else self.app_id
            if self.hotword_id:
                self.hotword_id = self.hotword_id.decode() if isinstance(self.hotword_id, bytes) else self.hotword_id

            return bool(self.secret_id and self.secret_key and self.app_id)
        except Exception as e:
            print(f"[语音] 加载配置失败: {e}")
            return False

    def start(self):
        """启动语音服务（阻塞，在独立线程中调用）"""
        if not VOICE_DEPS_AVAILABLE:
            print(f"[语音] 依赖缺失，服务未启动: {VOICE_DEPS_ERROR}")
            return

        if not self._load_config():
            print("[语音] 配置未设置，请在 Redis 中配置 squad:voice:* 相关键")
            print("[语音] 需要: secret_id, secret_key, app_id")
            return

        self.is_running = True
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

        # 在 executor 中启动按键监听
        # self.loop.run_in_executor(None, self._ptt_listener_thread)

        # 启动事件处理循环
        self.loop.run_until_complete(self._event_loop())

    def stop(self):
        """停止服务"""
        self.is_running = False
        if self.loop:
            self.loop.call_soon_threadsafe(self.loop.stop)

    def _ptt_listener_thread(self):
        """PTT 按键监听线程"""
        is_pressed = False

        def on_press(key):
            nonlocal is_pressed
            try:
                if hasattr(key, 'char') and key.char == self.ptt_key:
                    if not is_pressed:
                        is_pressed = True
                        self.event_queue.put(('ptt_start', None))
                        print(f"[语音] Q 键按下")
            except AttributeError:
                pass

        def on_release(key):
            nonlocal is_pressed
            try:
                if hasattr(key, 'char') and key.char == self.ptt_key:
                    if is_pressed:
                        is_pressed = False
                        self.event_queue.put(('ptt_stop', None))
                        print(f"[语音] Q 键释放")
            except AttributeError:
                pass

        listener = keyboard.Listener(on_press=on_press, on_release=on_release)
        listener.start()

        # 保持线程运行直到服务停止
        while self.is_running:
            time.sleep(0.1)

        listener.stop()

    async def _event_loop(self):
        """主事件循环"""
        print(f"[语音] 服务已启动，按住 {self.ptt_key.upper()} 键说话")

        while self.is_running:
            try:
                # 非阻塞检查事件
                try:
                    event = self.event_queue.get_nowait()
                    event_type, event_data = event

                    if event_type == 'ptt_start':
                        await self._on_ptt_start()
                    elif event_type == 'ptt_stop':
                        await self._on_ptt_stop()
                except queue.Empty:
                    pass

                # 如果正在录音，发送音频数据
                if self.is_recording and self.recorder and self.asr:
                    chunk = await self.loop.run_in_executor(
                        None, self.recorder.read_chunk
                    )
                    if chunk:
                        await self.asr.send_audio(chunk)

                await asyncio.sleep(0.04)  # 40ms

            except Exception as e:
                print(f"[语音] 事件循环错误: {e}")
                await asyncio.sleep(1)

    async def _on_ptt_start(self):
        """Q 键按下：开始录音"""
        if self.is_recording:
            return

        self.is_recording = True
        self.final_text = ""

        # 创建 ASR 客户端
        self.asr = TencentCloudASR(self.secret_id, self.secret_key, self.app_id)

        # 连接 ASR
        connected = await self.asr.connect(
            callback=self._on_recognition_result,
            engine_model_type="16k_zh",
            hotword_id=self.hotword_id or ""
        )

        if not connected:
            self.is_recording = False
            return

        # 启动麦克风
        self.recorder = MicrophoneRecorder(sample_rate=16000, chunk_duration_ms=40)
        if not self.recorder.start():
            self.is_recording = False
            await self.asr.disconnect()
            return

    async def _on_ptt_stop(self):
        """Q 键释放：停止录音"""
        if not self.is_recording:
            return

        self.is_recording = False

        # 停止麦克风
        if self.recorder:
            self.recorder.stop()
            self.recorder = None

        # 发送结束标记
        if self.asr:
            await self.asr.send_end()
            # 等待最终结果
            await asyncio.sleep(1.0)
            await self.asr.disconnect()
            self.asr = None

        # 发送最终结果给 AI
        if self.final_text.strip():
            await self._send_to_ai(self.final_text.strip())

    def _on_recognition_result(self, text: str, is_final: bool, full_result: dict):
        """处理识别结果回调"""
        if is_final:
            self.final_text = text

    async def _send_to_ai(self, text: str):
        """将识别结果发送给 AI 服务"""
        # 去掉语音识别中常见的顿号
        text = text.replace("、", "")
        print(f"[语音] 发送给 AI: {text}")

        try:
            response = await self.loop.run_in_executor(
                None,
                lambda: requests.post(
                    "http://127.0.0.1:8765/voice_chat",
                    json={"message": text},
                    timeout=60
                )
            )

            if response.status_code == 200:
                data = response.json()
                ai_response = data.get("response", "")
                if ai_response:
                    print(f"[AI 回复] {ai_response}")
            else:
                print(f"[语音] AI 请求失败: {response.status_code}")

        except Exception as e:
            print(f"[语音] AI 请求异常: {e}")


def start_voice_service():
    """启动语音服务（供 index.py 调用）"""
    service = VoiceService()
    service.start()


if __name__ == "__main__":
    # 独立测试
    start_voice_service()
