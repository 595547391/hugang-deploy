#!/usr/bin/env python3
import fitz  # pymupdf
from PIL import Image
import io
import os

def process_pdf(pdf_path, output_path, name):
    """处理PDF并提取高清图片"""
    print(f"\n处理 {name}...")
    
    # 打开PDF
    doc = fitz.open(pdf_path)
    print(f"PDF页数: {len(doc)}")

    # 获取第一页
    page = doc[0]
    print(f"页面尺寸: {page.rect.width} x {page.rect.height}")

    # 将页面渲染为高分辨率图片 (4倍缩放提高清晰度)
    mat = fitz.Matrix(4, 4)
    pix = page.get_pixmap(matrix=mat)

    # 转换为PIL Image
    img_data = pix.tobytes("png")
    img = Image.open(io.BytesIO(img_data))
    print(f"原始图片尺寸: {img.size}")

    # 找到非空白区域的边界
    img_rgb = img.convert('RGB')
    width, height = img.size

    left = width
    top = height
    right = 0
    bottom = 0

    # 采样检测非空白区域（每隔10像素检测一次，加快速度）
    for y in range(0, height, 10):
        for x in range(0, width, 10):
            r, g, b = img_rgb.getpixel((x, y))
            if r < 245 or g < 245 or b < 245:
                if x < left:
                    left = x
                if x > right:
                    right = x
                if y < top:
                    top = y
                if y > bottom:
                    bottom = y

    # 扩展边界到实际像素
    left = max(0, left - 10)
    top = max(0, top - 10)
    right = min(width, right + 10)
    bottom = min(height, bottom + 10)
    
    print(f"非空白区域: left={left}, top={top}, right={right}, bottom={bottom}")

    # 裁剪非空白区域
    cropped = img.crop((left, top, right, bottom))
    print(f"裁剪后尺寸: {cropped.size}")

    # 调整为1:2比例
    crop_width, crop_height = cropped.size
    target_ratio = 1 / 2
    current_ratio = crop_width / crop_height

    if current_ratio > target_ratio:
        # 当前太宽，需要增加高度
        new_height = int(crop_width / target_ratio)
        new_img = Image.new('RGB', (crop_width, new_height), (255, 255, 255))
        new_img.paste(cropped, (0, 0))
        final_img = new_img
    else:
        # 当前太高，需要增加宽度
        new_width = int(crop_height * target_ratio)
        new_img = Image.new('RGB', (new_width, crop_height), (255, 255, 255))
        new_img.paste(cropped, (0, 0))
        final_img = new_img

    print(f"调整比例后尺寸: {final_img.size}")

    # 调整到高清尺寸（宽度1200，高度2400）
    final_width = 1200
    final_height = 2400
    final_img = final_img.resize((final_width, final_height), Image.LANCZOS)
    print(f"最终高清尺寸: {final_img.size}")

    # 保存高质量PNG
    final_img.save(output_path, 'PNG', optimize=True)
    print(f"已保存到: {output_path}")
    
    # 显示文件大小
    file_size = os.path.getsize(output_path) / 1024
    print(f"文件大小: {file_size:.1f} KB")

    doc.close()
    return output_path

# 处理早上护岗PDF
morning_pdf = '/workspace/projects/assets/morning.pdf'
morning_output = '/workspace/projects/morning-bg.png'
if os.path.exists(morning_pdf):
    process_pdf(morning_pdf, morning_output, "早上护岗")
else:
    print(f"文件不存在: {morning_pdf}")

# 处理傍晚护岗PDF
evening_pdf = '/workspace/projects/assets/evening.pdf'
evening_output = '/workspace/projects/evening-bg.png'
if os.path.exists(evening_pdf):
    process_pdf(evening_pdf, evening_output, "傍晚护岗")
else:
    print(f"文件不存在: {evening_pdf}")

print("\n处理完成！")
