import os
from PIL import Image

# 指定要列出文件的目录
directory_path = "E:\\code\\py\\SquadCalc\\public\\maps\\albasrah\\terrainmap"

# 列出目录中的所有文件
file_list = os.listdir(directory_path)
files = []
# 打印文件列表
for file_name in file_list:
    files.append(f'{directory_path}\\{file_name}')

# 解析文件名获取最大 x 和 y 值
coordinates = [list(map(int, f.split('.')[0].split('_')[1:])) for f in files if f.startswith(f'{directory_path}\\4_')]
max_x = max(coordinates, key=lambda item: item[0])[0]
max_y = max(coordinates, key=lambda item: item[1])[1]

# 创建空白图像，大小为(max_x + 1) x (max_y + 1)
first_image = Image.open(files[0])
width, height = first_image.size
composite_image = Image.new('RGB', ((max_x + 1) * width, (max_y + 1) * height))

# 按照坐标拼接图片
for x, y in coordinates:
    img = Image.open(f'{directory_path}\\4_{x}_{y}.webp')
    composite_image.paste(img, (x * width, y * height))

# 保存拼接后的图片
composite_image.save('composite_image_z4.webp')
composite_image.show()
