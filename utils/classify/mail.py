import os
import time

import onnxruntime as ort
import numpy as np
import cv2
import yaml
from matplotlib import pyplot as plt

# 加载 ONNX 模型
onnx_model_path = './model/mail.onnx'

# 定义类别标签
mail_class_labels = {0: '1000', 1: '1010', 2: '1020', 3: '1030', 4: '1040', 5: '1050', 6: '1060', 7: '1070', 8: '1080',
                     9: '1090', 10: '1100', 11: '1110', 12: '1120', 13: '1130', 14: '1140', 15: '1150', 16: '1160',
                     17: '1170', 18: '1180', 19: '1190', 20: '1200', 21: '1210', 22: '1220', 23: '1230', 24: '1240',
                     25: '1250', 26: '1260', 27: '1270', 28: '1280', 29: '1290', 30: '1300', 31: '1310', 32: '1320',
                     33: '1330', 34: '1340', 35: '1350', 36: '1360', 37: '1370', 38: '1380', 39: '1390', 40: '1400',
                     41: '1410', 42: '1420', 43: '1430', 44: '1440', 45: '1450', 46: '1460', 47: '1470', 48: '1480',
                     49: '1490', 50: '1500', 51: '1510', 52: '1520', 53: '1530', 54: '1540', 55: '1550', 56: '1560',
                     57: '1570', 58: '1580', 59: '810', 60: '820', 61: '830', 62: '840', 63: '850', 64: '860',
                     65: '870',
                     66: '880', 67: '890', 68: '900', 69: '910', 70: '920', 71: '930', 72: '940', 73: '950', 74: '960',
                     75: '970', 76: '980', 77: '990'}
number_class_labels = {0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9'}


class ToTensor:
    def __init__(self, half=False):
        super().__init__()
        self.half = half

    def __call__(self, im):  # im = np.array HWC in BGR order
        if im.ndim == 2:  # 如果图像是单通道
            im = np.stack([im] * 3, axis=-1)  # 转换为三通道
        im = np.ascontiguousarray(im.transpose((2, 0, 1))[::-1])  # HWC to CHW -> BGR to RGB -> contiguous
        if self.half:
            im = im.astype(np.float16)
        else:
            im = im.astype(np.float32)
        im /= 255.0  # 0-255 to 0.0-1.0
        return im


class CenterCrop:
    def __init__(self, size=640):
        super().__init__()
        self.h, self.w = (size, size) if isinstance(size, int) else size

    def __call__(self, im):  # im = np.array HWC
        imh, imw = im.shape[:2]
        m = min(imh, imw)  # min dimension
        top, left = (imh - m) // 2, (imw - m) // 2
        return cv2.resize(im[top: top + m, left: left + m], (self.w, self.h), interpolation=cv2.INTER_LINEAR)


class Resize:
    def __init__(self, size=640):
        super().__init__()
        self.h, self.w = (size, size) if isinstance(size, int) else size

    def __call__(self, im):  # im = np.array HWC
        return cv2.resize(im, (self.w, self.h), interpolation=cv2.INTER_LINEAR)


class Normalize:
    def __init__(self, mean, std):
        self.mean = np.array(mean).reshape((3, 1, 1)).astype(np.float32)
        self.std = np.array(std).reshape((3, 1, 1)).astype(np.float32)

    def __call__(self, img):
        img = (img - self.mean) / self.std
        return img


# 图像预处理
def preprocess(img, img_size):
    img = img.astype(np.float32)

    img = Resize(img_size)(img)
    img = CenterCrop(img_size)(img)
    # plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    # plt.title('Cropped Image')
    # plt.axis('off')
    # plt.show()
    # 显示中心裁剪后的图片

    img = ToTensor()(img)
    img = Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])(img)
    img = np.expand_dims(img, axis=0)  # 添加 batch 维度
    # 保留五位小数
    # img = np.round(img, 5)
    return img


# 使用 ONNX 模型进行推理
class DetectMultiBackend:
    def __init__(self, weights="yolov5s.onnx", data=None, fp16=False):
        self.weights = weights
        self.fp16 = fp16
        self.model_type = self._model_type(weights)

        if self.model_type == 'onnx':
            self._load_onnx(weights)
        else:
            raise NotImplementedError(f"ERROR: {weights} is not a supported format")

        # Load class names
        if data:
            with open(data, 'r') as f:
                metadata = yaml.safe_load(f)
                self.names = metadata['names']
                self.stride = metadata.get('stride', 32)
        else:
            self.names = {i: f'class{i}' for i in range(999)}

    def forward(self, im):
        im = np.array(im, dtype=np.float32)
        if self.fp16:
            im = im.astype(np.float16)

        if self.model_type == 'onnx':
            return self._forward_onnx(im)
        else:
            raise NotImplementedError("Model type not supported for forward pass")

    def _load_onnx(self, w):
        self.session = ort.InferenceSession(w)
        self.input_name = self.session.get_inputs()[0].name
        self.output_names = [x.name for x in self.session.get_outputs()]

    def _forward_onnx(self, im):
        return self.session.run(self.output_names, {self.input_name: im})

    @staticmethod
    def _model_type(p):
        if p.endswith(".onnx"):
            return "onnx"
        else:
            raise ValueError("Unsupported model format")


def normalize_output(output):
    output_min = np.min(output)
    output_max = np.max(output)
    normalized_output = (output - output_min) / (output_max - output_min)
    return normalized_output


class PredictMail():
    def __init__(self, model_path):
        self._model = DetectMultiBackend(weights=model_path, fp16=False)
        self._img_size = 224

    def __call__(self, im, saved=True):
        input_data = preprocess(im, self._img_size)
        # 调试输出
        output = self._model.forward(input_data)[0]

        # 对输出进行 softmax 处理
        def softmax(x):
            e_x = np.exp(x - np.max(x))
            return e_x / e_x.sum(axis=-1, keepdims=True)

        # 确保 softmax 输出为一维数组
        probabilities = softmax(output)[0]

        # 找到最高概率的类别索引
        max_index = np.argmax(probabilities)
        max_prob = probabilities[max_index]

        mail = int(mail_class_labels[max_index])

        if max_prob >= 0.7:
            file_name = f'./imgs/mail/{mail}/{mail}_[{round(max_prob, 2)}]_{int(time.time() * 1000)}.png'

            folder_path = f'./imgs/mail/{mail}'
            if not os.path.exists(folder_path):
                # 创建文件夹
                os.makedirs(folder_path)
            cv2.imwrite(file_name, im)
            return int(mail_class_labels[max_index])
        else:
            file_name = f'./imgs/error/mail/{mail}/{mail}_[{round(max_prob, 2)}]_{int(time.time() * 1000)}.png'

            folder_path = f'./imgs/error/mail/{mail}'
            if not os.path.exists(folder_path):
                # 创建文件夹
                os.makedirs(folder_path)
            cv2.imwrite(file_name, im)
            return 0


class PredictNumber():
    def __init__(self, model_path):
        self._model = DetectMultiBackend(weights=model_path, fp16=False)
        self._img_size = 64

    def __call__(self, im, saved=True):
        input_data = preprocess(im, self._img_size)
        # 调试输出
        output = self._model.forward(input_data)[0]

        # 对输出进行 softmax 处理
        def softmax(x):
            e_x = np.exp(x - np.max(x))
            return e_x / e_x.sum(axis=-1, keepdims=True)

        # 确保 softmax 输出为一维数组
        probabilities = softmax(output)[0]

        # 找到最高概率的类别索引
        max_index = np.argmax(probabilities)
        max_prob = probabilities[max_index]

        number = int(number_class_labels[max_index])

        if max_prob >= 0.7:
            file_name = f'./imgs/number/{number}/{number}_[{round(max_prob, 2)}]_{int(time.time() * 1000)}.png'

            folder_path = f'./imgs/number/{number}'
            if not os.path.exists(folder_path):
                # 创建文件夹
                os.makedirs(folder_path)
            cv2.imwrite(file_name, im)
            return number
        else:
            file_name = f'./imgs/error/number/{number}/{number}_[{round(max_prob, 2)}]_{int(time.time() * 1000)}.png'

            folder_path = f'./imgs/error/number/{number}'
            if not os.path.exists(folder_path):
                # 创建文件夹
                os.makedirs(folder_path)
            cv2.imwrite(file_name, im)
            return -1
