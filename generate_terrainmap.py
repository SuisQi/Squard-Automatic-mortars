import os
from PIL import Image
from tqdm import tqdm

# 指定要列出文件的目录
MAP_NAMES = os.listdir("E:\\code\\py\\SquadCalc\\public\\maps")
for name in MAP_NAMES:
    directory_path = f"E:\\code\\py\\SquadCalc\\public\\maps\\{name}\\terrainmap"

    # 列出目录中的所有文件
    file_list = os.listdir(directory_path)
    files = []
    # 记录所有文件的完整路径
    for file_name in file_list:
        files.append(f'{directory_path}\\{file_name}')

    # 解析文件名获取最大 x 和 y 值
    coordinates = [list(map(int, f.split('.')[0].split('_')[1:])) for f in files if
                   f.startswith(f'{directory_path}\\4_')]
    max_x = max(coordinates, key=lambda item: item[0])[0]
    max_y = max(coordinates, key=lambda item: item[1])[1]

    # 打开第一张图像获取尺寸
    first_image = Image.open(files[0])
    width, height = first_image.size
    first_image.close()

    # 创建空白图像，大小为(max_x + 1) x (max_y + 1)
    composite_image = Image.new('RGB', ((max_x + 1) * width, (max_y + 1) * height))

    # 按照坐标拼接图片
    for x, y in tqdm(coordinates, desc=f'Processing {name}'):
        img = Image.open(f'{directory_path}\\4_{x}_{y}.webp')
        composite_image.paste(img, (x * width, y * height))
        img.close()

    # 保存拼接后的图片
    output_dir = './terrainmap'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    composite_image.save(f'{output_dir}/{name}.jpg')
