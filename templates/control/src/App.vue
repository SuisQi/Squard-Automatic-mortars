<script setup lang="js">
import io from "socket.io-client";
import {nextTick, onMounted, ref} from "vue";
import {
  get_settings,
  getControl,
  list_fires,
  list_trajectories,
  setMortarRounds,
  setControl,
  update_settings, create_squad,
  get_ai_api_key, set_ai_api_key, ai_chat,
  get_voice_config, set_voice_config
} from "@/api";
import QrcodeVue from 'qrcode.vue';
import {
  Briefcase,
  Delete,
  Refresh,
  Message,
  Search,
  Star,
  ChatDotRound,
  Setting,
  Microphone,
} from '@element-plus/icons-vue'
import * as d3 from 'd3';
import BezierCurve from "@/components/BezierCurve.vue";
import {ElMessage} from "element-plus";
const qrShow=ref(true)  //显示二维码
const isOn = ref(false) //开火控制
const showOnlyMe = ref(true) //是否只显示自己的火力点
const synergy = ref(false) //开火控制
const autoFire=ref(true)  //自动开火
const logs = ref([])
const fires = ref([])
const mortarRounds = ref(3)
const mortarRoundsSelectList = ref([])
const dialogFires = ref(false)
const dialogSetting = ref(false)
const dialogOrigentationSetting = ref(false)
const dialogFeature = ref(false)
const dialogAI = ref(false)  // AI对话弹窗
const squadName = ref("pjp")
const createSquadState=ref(false)
const mail_trajectories = ref([])
const origentation_trajectories = ref([])
// AI 相关状态
const aiApiKey = ref("")
const aiApiKeyConfigured = ref(false)
const aiApiKeyInput = ref("")
const aiMessage = ref("")
const aiChatHistory = ref([])
const aiLoading = ref(false)
const aiActiveTab = ref("chat")  // 当前选项卡: chat / voice
// 语音服务配置状态
const voiceConfig = ref({
  secret_id: "",
  secret_key: "",
  app_id: "",
  hotword_id: "",
  configured: false
})
const voiceConfigInput = ref({
  secret_id: "",
  secret_key: "",
  app_id: "",
  hotword_id: ""
})
const settings = ref({
  "beforeFire": [0.5,1],
  "afterFire": [0.5,1],
  "mail_gap": 1,
  "orientation_gap": 0.1
})

let viewportWidth = ref(window.innerWidth);
let viewportHeight = window.innerHeight;
let host = ref(window.location.hostname)

console.log(viewportWidth)
onMounted(() => {
  init()
  for (let i = 0; i < 9; i++) {
    mortarRoundsSelectList.value.push({
      value:i+1,
      label:"每轮发射"+(i+1)+"炮"
    })
  }
  mortarRoundsSelectList.value.push({
    value:999,
    label:"一直砸"
  })
  const socket = io(`http://${host.value}:8080`);
  // const socket = io(`http://192.168.1.103:8080`);
  console.log(socket)
  socket.on("log_message", (message) => {
    logs.value.push(message.data);
    nextTick(() => {
      const container = document.getElementsByClassName("log-container")[0];
      container.scrollTop = container.scrollHeight
    })
  });
  list_trajectories("mail").then(res=>{
    mail_trajectories.value=res.data.data
  })
  list_trajectories("orientation").then(res=>{
    origentation_trajectories.value=res.data.data
  })
  // 获取 AI API Key 状态
  loadAiApiKey()
  // 获取语音服务配置
  loadVoiceConfig()

  setInterval(init, 500)
})
const init = () => {
  viewportWidth.value = window.innerWidth;

  getControl({type:"state"}).then(res => {

    isOn.value = parseInt(res.data.data) === 1
  })
  getControl({type:"synergy"}).then(res => {

    synergy.value = parseInt(res.data.data) === 1
  })
  getControl({type:"auto_fire"}).then(res => {

    autoFire.value = parseInt(res.data.data) === 1
  })
  list_fires(showOnlyMe.value?1:0).then(res => {
    fires.value = res.data.data
  })
  get_settings().then(res=>{
    settings.value=res.data.data
  })
}
const changeSettings=()=>{
  update_settings({
    ...settings.value
  })
  return true
}
const toggleSwitch = () => {
  setControl({
    state:!isOn.value?1:0,

  }).then(res => {
    isOn.value = parseInt(res.data.data.state) === 1

  })
}
const set_synergy=(synergy)=>{
  setControl({

    synergy:synergy?1:0
  })

}

const set_auto_fire = (autoFire) => {
  setControl({
    auto_fire:autoFire?1:0
  })
}
const onMortarRoundsChange = (value) => {
  setMortarRounds(value)
}


const handleCreateSquad=()=>{
  if(squadName.value.trim().length===0) {
    ElMessage({
      showClose: true,
      message: "队名不能为空",
      type: 'error',
    })
    return
  }
  create_squad(squadName.value)
  createSquadState.value=!createSquadState.value
}

// AI 相关函数
const loadAiApiKey = () => {
  get_ai_api_key().then(res => {
    if (res.data.success === 0) {
      aiApiKey.value = res.data.data.api_key
      aiApiKeyConfigured.value = res.data.data.configured
    }
  })
}

const saveAiApiKey = () => {
  if (!aiApiKeyInput.value.trim()) {
    ElMessage({
      showClose: true,
      message: "API Key 不能为空",
      type: 'error',
    })
    return
  }
  set_ai_api_key(aiApiKeyInput.value).then(res => {
    if (res.data.success === 0) {
      ElMessage({
        showClose: true,
        message: "API Key 保存成功",
        type: 'success',
      })
      loadAiApiKey()
      aiApiKeyInput.value = ""
    }
  })
}

const sendAiMessage = () => {
  if (!aiMessage.value.trim()) {
    return
  }
  if (!aiApiKeyConfigured.value) {
    ElMessage({
      showClose: true,
      message: "请先配置 API Key",
      type: 'warning',
    })
    return
  }

  const userMsg = aiMessage.value
  aiChatHistory.value.push({ role: 'user', content: userMsg })
  aiMessage.value = ""
  aiLoading.value = true

  ai_chat(userMsg).then(res => {
    aiLoading.value = false
    if (res.data.success === 0) {
      aiChatHistory.value.push({ role: 'assistant', content: res.data.data.response })
    } else {
      aiChatHistory.value.push({ role: 'error', content: res.data.data || res.data.message || "请求失败" })
    }
    // 滚动到底部
    nextTick(() => {
      const container = document.querySelector(".ai-chat-container")
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }).catch(err => {
    aiLoading.value = false
    aiChatHistory.value.push({ role: 'error', content: "网络错误" })
  })
}

const clearAiHistory = () => {
  aiChatHistory.value = []
}

// 语音服务配置相关函数
const loadVoiceConfig = () => {
  get_voice_config().then(res => {
    if (res.data.success === 0) {
      voiceConfig.value = res.data.data
    }
  })
}

const saveVoiceConfig = () => {
  const { secret_id, secret_key, app_id, hotword_id } = voiceConfigInput.value
  if (!secret_id.trim() || !secret_key.trim() || !app_id.trim()) {
    ElMessage({
      showClose: true,
      message: "Secret ID、Secret Key、App ID 为必填项",
      type: 'error',
    })
    return
  }
  set_voice_config({
    secret_id: secret_id.trim(),
    secret_key: secret_key.trim(),
    app_id: app_id.trim(),
    hotword_id: hotword_id.trim()
  }).then(res => {
    if (res.data.success === 0) {
      ElMessage({
        showClose: true,
        message: "语音服务配置保存成功",
        type: 'success',
      })
      loadVoiceConfig()
      // 清空输入框
      voiceConfigInput.value = {
        secret_id: "",
        secret_key: "",
        app_id: "",
        hotword_id: ""
      }
    }
  })
}
</script>

<template>
  <div class="w-full h-screen bg-gray-200   flex flex-col justify-center max-sm:block">
    <el-dialog v-if="viewportWidth>480" v-model="qrShow" >
      <div class="w-full flex flex-col items-center gap-4"  >
        <qrcode-vue :value="`http://${host}:5173`" :size="500"></qrcode-vue>
        <div><span class="text-blue-600">保持手机和电脑在同一局域网且关闭防火墙</span> 使用微信或者浏览器扫描该二维码</div>
        <div class="text-red-400">如果还扫不出就手机开热点电脑连接</div>
      </div>
    </el-dialog>
    <div
        class="  basis-full  grid grid-cols-2 max-md:grid-cols-1   max-md:gap-0 gap-10 mt-auto ">

      <div class="flex flex-col items-center max-md:justify-start justify-center gap-3">

        <!-- 查看火力点的按钮 -->


        <div class="grid grid-cols-2 gap-1 justify-center">
          <!-- 新增的迫击炮轮数控制块 -->
          <el-select
              v-model="mortarRounds"
              placeholder="Select"
              size="large"
              @change="onMortarRoundsChange"
          >

            <el-option
                v-for="item in mortarRoundsSelectList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />

          </el-select>
          <el-button  @click="()=>dialogFires=true" type="danger">查看火力点</el-button>

          <el-switch
              v-model="synergy"
              active-text="协同开火"
              inactive-text="单独开火"
              @change="set_synergy"
          />
          <el-switch
              v-model="autoFire"
              active-text="自动开火"
              inactive-text="手动开火"
              @change="set_auto_fire"

          />
          <el-button @click="dialogFeature=true" type="warning" :icon="Briefcase">功能</el-button>
          <el-button @click="dialogAI=true" type="primary" :icon="ChatDotRound">AI助手</el-button>
          <div class="flex flex-row">
            <el-input v-model="squadName" placeholder="输入队名" maxlength="10">
              <template #append>
                <el-button @click="handleCreateSquad" >{{ createSquadState?"停止":"建队" }}</el-button>
              </template>
            </el-input>
          </div>
        </div>
        <el-dialog
          title="功能"
          :width="viewportWidth*0.9>600?600:viewportWidth*0.9"
          v-model="dialogFeature">


          <div class="w-full flex flex-col gap-4 justify-start items-start">




            <div></div>
            <el-button class="w-full"  @click="()=>dialogSetting=true" type="info">编辑密位轨迹点</el-button>
            <div></div>
            <el-button class="w-full"  @click="()=>dialogOrigentationSetting=true" type="info">编辑方位轨迹点</el-button>
            <div class="w-full grid grid-cols-[100px_auto] gap-2">
              <div class="min-w-[100px]">开火前停顿(s)</div>
              <el-slider class="w-full" v-model="settings.beforeFire" :step="0.1"  range show-stops :max="2" @change="changeSettings"/>
              <div class="min-w-[100px]">开火后停顿(s)</div>
              <el-slider class="w-full" v-model="settings.afterFire" :step="0.1"  range show-stops :max="2" @change="changeSettings" />
              <div>密位最大误差</div>
              <el-input-number
                  v-model="settings.mail_gap"
                  :min="0"
                  :max="10"
                  size="small"
                  controls-position="right"
                  @change="changeSettings"

              />
              <div>方位最大误差</div>
              <el-input-number
                  v-model="settings.orientation_gap"
                  :min="0"
                  :max="10"
                  size="small"
                  controls-position="right"
                  @change="changeSettings"
              />
            </div>


            <div class="flex flex-row w-full items-center">

            </div>
          </div>
        </el-dialog>
        <el-dialog
            v-model="dialogFires"
            title="火力点"
            width="300"
        >
          <div class="flex flex-row ">
            <div class="只显示自己"></div>
            <el-switch v-model="showOnlyMe" active-text="只显示自己"
                       inactive-text="整个房间"/>
          </div>
          <el-table :data="fires" stripe style="width: 100%">
            <el-table-column prop="entityId" label="id" width="40"/>
            <el-table-column prop="dir" label="方位"/>
            <el-table-column prop="angle" label="密位"/>


          </el-table>

        </el-dialog>
        <el-dialog
            v-model="dialogSetting"
            title="密位轨迹设置"
            :width="viewportWidth"
        >
          <div class="w-full flex flex-col items-center"  >
            <BezierCurve v-for="(item,index) in mail_trajectories"  type="mail" :width="viewportWidth*0.9" :height="200" :points="item.points" :name="item.name" :num_points="item.num_points"></BezierCurve>
          </div>
        </el-dialog>
        <el-dialog
            v-model="dialogOrigentationSetting"
            title="方位轨迹设置"
            :width="viewportWidth"
        >
          <div class="w-full flex flex-col items-center" >
            <BezierCurve v-for="(item,index) in origentation_trajectories" type="orientation" :width="viewportWidth*0.9" :height="200" :points="item.points" :name="item.name" :num_points="item.num_points"></BezierCurve>
          </div>
        </el-dialog>
        <!-- AI 助手对话弹窗 -->
        <el-dialog
            v-model="dialogAI"
            title="AI 助手"
            :width="viewportWidth*0.9>500?500:viewportWidth*0.9"
        >
          <el-tabs v-model="aiActiveTab">
            <!-- AI 对话选项卡 -->
            <el-tab-pane label="AI 对话" name="chat">
              <div class="flex flex-col gap-4">
                <!-- API Key 设置 -->
                <div class="flex flex-col gap-2 p-3 bg-gray-100 rounded-lg">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">GLM-4 API Key:</span>
                    <span v-if="aiApiKeyConfigured" class="text-green-600 text-sm">{{ aiApiKey }}</span>
                    <span v-else class="text-red-500 text-sm">未配置</span>
                  </div>
                  <div class="flex gap-2">
                    <el-input
                        v-model="aiApiKeyInput"
                        placeholder="输入智谱 GLM-4 API Key"
                        type="password"
                        show-password
                        size="small"
                    />
                    <el-button type="primary" size="small" @click="saveAiApiKey">保存</el-button>
                  </div>
                </div>

                <!-- 对话区域 -->
                <div class="ai-chat-container bg-gray-50 rounded-lg p-3 h-[250px] overflow-auto">
                  <div v-if="aiChatHistory.length === 0" class="text-gray-400 text-center py-10">
                    开始对话，获取战术建议...
                  </div>
                  <div v-for="(msg, index) in aiChatHistory" :key="index" class="mb-3">
                    <div v-if="msg.role === 'user'" class="flex justify-end">
                      <div class="bg-blue-500 text-white px-3 py-2 rounded-lg max-w-[80%]">
                        {{ msg.content }}
                      </div>
                    </div>
                    <div v-else-if="msg.role === 'assistant'" class="flex justify-start">
                      <div class="bg-white border px-3 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap">
                        {{ msg.content }}
                      </div>
                    </div>
                    <div v-else class="flex justify-start">
                      <div class="bg-red-100 text-red-600 px-3 py-2 rounded-lg max-w-[80%]">
                        {{ msg.content }}
                      </div>
                    </div>
                  </div>
                  <div v-if="aiLoading" class="flex justify-start">
                    <div class="bg-gray-200 px-3 py-2 rounded-lg">
                      <span class="animate-pulse">思考中...</span>
                    </div>
                  </div>
                </div>

                <!-- 输入区域 -->
                <div class="flex gap-2">
                  <el-input
                      v-model="aiMessage"
                      placeholder="输入问题..."
                      @keyup.enter="sendAiMessage"
                      :disabled="aiLoading"
                  />
                  <el-button type="primary" @click="sendAiMessage" :loading="aiLoading">发送</el-button>
                  <el-button @click="clearAiHistory" :icon="Delete">清空</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 语音设置选项卡 -->
            <el-tab-pane label="语音设置" name="voice">
              <div class="flex flex-col gap-4">
                <div class="text-sm text-gray-600 mb-2">
                  配置腾讯云语音识别服务，按住 Q 键即可语音输入
                </div>

                <!-- 当前配置状态 -->
                <div class="p-3 bg-gray-100 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium">配置状态:</span>
                    <span v-if="voiceConfig.configured" class="text-green-600 text-sm">已配置</span>
                    <span v-else class="text-red-500 text-sm">未配置</span>
                  </div>
                  <div v-if="voiceConfig.configured" class="text-xs text-gray-500 space-y-1">
                    <div>Secret ID: {{ voiceConfig.secret_id }}</div>
                    <div>Secret Key: {{ voiceConfig.secret_key }}</div>
                    <div>App ID: {{ voiceConfig.app_id }}</div>
                    <div v-if="voiceConfig.hotword_id">热词表 ID: {{ voiceConfig.hotword_id }}</div>
                  </div>
                </div>

                <!-- 配置输入表单 -->
                <div class="space-y-3">
                  <div>
                    <label class="text-sm text-gray-600 block mb-1">Secret ID <span class="text-red-500">*</span></label>
                    <el-input
                        v-model="voiceConfigInput.secret_id"
                        placeholder="腾讯云 API 密钥 ID"
                        size="small"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600 block mb-1">Secret Key <span class="text-red-500">*</span></label>
                    <el-input
                        v-model="voiceConfigInput.secret_key"
                        placeholder="腾讯云 API 密钥密钥"
                        type="password"
                        show-password
                        size="small"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600 block mb-1">App ID <span class="text-red-500">*</span></label>
                    <el-input
                        v-model="voiceConfigInput.app_id"
                        placeholder="腾讯云应用 ID"
                        size="small"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-gray-600 block mb-1">热词表 ID（可选）</label>
                    <el-input
                        v-model="voiceConfigInput.hotword_id"
                        placeholder="提高地图名识别准确率"
                        size="small"
                    />
                  </div>
                  <el-button type="primary" @click="saveVoiceConfig" class="w-full">
                    保存配置
                  </el-button>
                </div>

                <!-- 使用说明 -->
                <div class="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
                  <div class="font-medium mb-1">使用说明：</div>
                  <div>1. 登录腾讯云控制台 → 访问管理 → API密钥管理</div>
                  <div>2. 创建或获取 SecretId 和 SecretKey</div>
                  <div>3. 在语音识别控制台获取 AppID</div>
                  <div>4. 配置完成后，按住 Q 键即可语音输入</div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-dialog>
        <div
            class="w-32 h-32 rounded-full flex justify-center items-center cursor-pointer"
            :class="isOn ? 'bg-green-500' : 'bg-blue-500'"
            @click="toggleSwitch"
        >
          <span class="text-white text-2xl">{{ isOn ? '停止' : '启动' }}</span>
        </div>
      </div>
      <div class="p-4 w-full h-full max-md:row-span-2 flex flex-col justify-center max-sm:block">
        <!--        <h2 class="text-2xl font-bold mb-4 ">日志消息</h2>-->
        <div class="log-container bg-gray-900 p-4 rounded-lg h-[600px] max-md:h-[300px] overflow-auto">
          <ul>
            <li v-for="(log, index) in logs" :key="index" class="text-sm mb-2">
              <span class="text-green-400">{{ log.substring(0, 13) }}</span>
              <span class="text-gray-300">{{ log.substring(13) }}</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

