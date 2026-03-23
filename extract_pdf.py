#!/usr/bin/env python3
import fitz  # pymupdf
from PIL import Image
import io
import os

# 打开PDF
pdf_path = '/workspace/projects/assets/morning.pdf'
doc = fitz.open(pdf_path)

print(f"PDF页数: {len(doc)}")

# 获取第一页
page = doc[0]
print(f"页面尺寸: {page.rect.width} x {page.rect.height}")

# 将页面渲染为高分辨率图片
mat = fitz.Matrix(2, 2)  # 2倍缩放
pix = page.get_pixmap(matrix=mat)

# 转换为PIL Image
img_data = pix.tobytes("png")
img = Image.open(io.BytesIO(img_data))
print(f"原始图片尺寸: {img.size}")

# 找到非空白区域的边界
# 转换为RGB模式
img_rgb = img.convert('RGB')
width, height = img.size

# 找到非白色区域的边界
left = width
top = height
right = 0
bottom = 0

for y in range(height):
    for x in range(width):
        r, g, b = img_rgb.getpixel((x, y))
        # 判断是否为非白色/非空白区域（阈值：RGB都大于240认为是白色）
        if r < 240 or g < 240 or b < 240:
            if x < left:
                left = x
            if x > right:
                right = x
            if y < top:
                top = y
            if y > bottom:
                bottom = y

print(f"非空白区域: left={left}, top={top}, right={right}, bottom={bottom}")

# 添加一些边距
padding = 20
left = max(0, left - padding)
top = max(0, top - padding)
right = min(width, right + padding)
bottom = min(height, bottom + padding)

# 裁剪非空白区域
cropped = img.crop((left, top, right, bottom))
print(f"裁剪后尺寸: {cropped.size}")

# 调整为1:2比例
crop_width, crop_height = cropped.size

# 目标是1:2比例
# 如果当前比例不是1:2，需要调整
target_ratio = 1 / 2  # 宽:高 = 1:2
current_ratio = crop_width / crop_height

if current_ratio > target_ratio:
    # 当前太宽，需要增加高度或减少宽度
    new_height = int(crop_width / target_ratio)
    # 在底部添加空间（白色）
    new_img = Image.new('RGB', (crop_width, new_height), (255, 255, 255))
    new_img.paste(cropped, (0, 0))
    final_img = new_img
else:
    # 当前太高，需要增加宽度或减少高度
    new_width = int(crop_height * target_ratio)
    # 在右侧添加空间（白色）
    new_img = Image.new('RGB', (new_width, crop_height), (255, 255, 255))
    new_img.paste(cropped, (0, 0))
    final_img = new_img

print(f"最终尺寸: {final_img.size}")

# 调整到合适的手机尺寸（宽度800，高度1600）
final_width = 800
final_height = 1600
final_img = final_img.resize((final_width, final_height), Image.LANCZOS)
print(f"调整后尺寸: {final_img.size}")

# 保存
output_path = '/workspace/projects/morning-bg.png'
final_img.save(output_path, 'PNG')
print(f"已保存到: {output_path}")

doc.close()
