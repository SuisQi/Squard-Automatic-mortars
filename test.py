import onnxruntime

print(onnxruntime.get_device())

ort_session = onnxruntime.InferenceSession("./model/map.onnx",
providers=['CUDAExecutionProvider'])
print(ort_session.get_providers())