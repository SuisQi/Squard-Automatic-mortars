import time

import cv2
import onnxruntime
import numpy as np
from utils.utils import letterbox, scale_coords, log
from ctypes import *
import cv2
import numpy.ctypeslib as npct

names = ['t1', 'mortar', 'light-launcher', "tB_1", "tC_1"]
names_maps = {
    "t1": "对标",
    "mortar": "迫击炮",
    "light-launcher": "请筒",
    "tB_1": "B标",
    "tC_1": "C标"
}


class Detector:
    """
    检测类
    """

    def __init__(self, weights, img_size=640, iou_thres=0.45):
        self.img_size = img_size
        self.iou_thres = iou_thres
        self.stride = 1
        self.weights = weights
        self.init_model()
        self.names = names

    def init_model(self):
        """
        模型初始化
        """
        providers = ['CUDAExecutionProvider']
        self.sess = onnxruntime.InferenceSession(self.weights, providers=providers)
        self.input_name = self.sess.get_inputs()[0].name  # 获得输入节点
        self.output_names = [output.name for output in self.sess.get_outputs()]  # 所有的输出节点

    def preprocess(self, img):
        """
        图片预处理过程
        :param img: 输入图像
        :return: 预处理后的图像和原始图像
        """
        img0 = img.copy()
        img = letterbox(img, new_shape=self.img_size)[0]
        img = img[:, :, ::-1].transpose(2, 0, 1)
        img = np.ascontiguousarray(img).astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        assert len(img.shape) == 4
        return img0, img

    def detect(self, im, conf_thres=0.25, loged=True):
        """
        进行检测
        :param im: 输入图像
        :return: 检测结果列表，每个结果包含类别、置信度和边界框坐标
        """
        start_time = time.time()  # 开始计时a
        img0, img = self.preprocess(im)

        pred = self.sess.run(None, {self.input_name: img})[0]  # 执行推理
        end_time = time.time()
        if loged:
            print(f"目标检测耗时: {end_time - start_time:.2f} 秒")
        pred = pred.astype(np.float32)
        pred = np.squeeze(pred, axis=0)
        boxes = []
        classIds = []
        confidences = []
        shape = (self.img_size, self.img_size)
        for detection in pred:
            scores = detection[5:]
            classID = np.argmax(scores)
            confidence = scores[classID] * detection[4]  # 置信度为类别的概率和目标框概率的乘积

            if confidence > conf_thres:
                box = detection[0:4]
                (centerX, centerY, width, height) = box.astype("int")
                x_min = int(centerX - (width / 2))
                y_min = int(centerY - (height / 2))
                x_max = int(centerX + (width / 2))
                y_max = int(centerY + (height / 2))
                boxes.append([x_min, y_min, x_max, y_max])
                classIds.append(classID)
                confidences.append(float(confidence))
        idxs = cv2.dnn.NMSBoxes(boxes, confidences, conf_thres, self.iou_thres)  # 执行nms算法
        detections = []
        if len(idxs) > 0:
            for i in idxs.flatten():
                confidence = confidences[i]
                if confidence >= conf_thres:
                    box = boxes[i]
                    box = [box[0], box[1], box[2] - box[0], box[3] - box[1]]
                    x_min, y_min, width, height = box
                    x_max = x_min + width
                    y_max = y_min + height
                    box = np.array([x_min, y_min, x_max, y_max])
                    box = np.squeeze(
                        scale_coords(shape, np.expand_dims(box, axis=0).astype("float"), im.shape[:2]).round(),
                        axis=0).astype(
                        "int")  # 进行坐标还原

                    detection = {
                        "class": self.names[classIds[i]],
                        "confidence": confidences[i],
                        "bbox": [box[0], box[1], box[2] - box[0], box[3] - box[1]],
                    }
                    detections.append(detection)
        return detections

    def draw_detections(self, img, detections, output_path):
        """
        在图像上绘制检测结果并保存
        :param img: 输入图像
        :param detections: 检测结果列表
        :param output_path: 保存的图像路径
        """
        for detection in detections:
            class_name = detection["class"]
            confidence = detection["confidence"]
            bbox = detection["bbox"]
            x_min, y_min, width, height = bbox
            x_max = x_min + width
            y_max = y_min + height

            # 画边界框
            cv2.rectangle(img, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            # 画标签
            label = f"{class_name}: {confidence:.2f}"
            cv2.putText(img, label, (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # 保存图像
        cv2.imwrite(output_path, img)

    def free(self):
        pass


class DetectorTRT():
    def __init__(self, model_path, dll_path):
        self.yolov5 = CDLL(dll_path, winmode=0)
        self.yolov5.Detect.argtypes = [c_void_p, c_int, c_int, POINTER(c_ubyte),
                                       npct.ndpointer(dtype=np.float32, ndim=2, shape=(50, 6), flags="C_CONTIGUOUS")]
        self.yolov5.Init.restype = c_void_p
        self.yolov5.Init.argtypes = [c_void_p]
        self.yolov5.cuda_free.argtypes = [c_void_p]
        self.c_point = self.yolov5.Init(model_path)
        self._names = names

    def detect(self, img, conf=0.5, loged=True):
        rows, cols = img.shape[0], img.shape[1]
        res_arr = np.zeros((50, 6), dtype=np.float32)
        img_ = img.ctypes.data_as(POINTER(c_ubyte))
        start_time = time.time()  # 开始计时
        self.yolov5.Detect(self.c_point, c_int(rows), c_int(cols), img_, res_arr)

        end_time = time.time()
        if loged:
            log(f"目标检测耗时: {end_time - start_time:.2f} 秒")
        self.bbox_array = res_arr[~((res_arr == 0).all(1) | (res_arr[:, 5] < conf))]
        arr = []
        for bbox in self.bbox_array:
            bbox = bbox.tolist()
            arr.append({
                "class": self._names[int(bbox[4])],
                "confidence": bbox[5],
                "bbox": [bbox[0], bbox[1], bbox[2], bbox[3]],
            })
        # self.free()
        # return self.bbox_array
        return arr

    def free(self):
        self.yolov5.cuda_free(self.c_point)

    def draw_detections(self, img, bbox_array, output_path):
        for bbox in bbox_array:
            temp = bbox['bbox']  # xywh
            clas = bbox['class']
            score = bbox['confidence']
            cv2.rectangle(img, (int(temp[0]), int(temp[1])), (int(temp[0] + temp[2]), int(temp[1] + temp[3])),
                          (105, 237, 249), 2)
            img = cv2.putText(img, "class:" + str(clas) + " " + str(round(score, 2)), (int(temp[0]), int(temp[1]) - 5),
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (105, 237, 249), 1)
        cv2.imwrite(output_path, img)
