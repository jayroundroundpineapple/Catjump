#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
读取 AppLovin.html 文件，替换 window["GGURL"] 的值，生成多个 HTML 文件
"""

import os
import re
import json

def read_and_replace_ggurl(input_file, urls):
    """
    读取 HTML 文件，替换 GGURL 的值，生成多个文件
    
    Args:
        input_file: 输入的 HTML 文件路径
        urls: URL 数组，例如 ["test1Url", "test2URL", "testUrl3"]
    """
    # 检查输入文件是否存在
    if not os.path.exists(input_file):
        print(f"错误: 文件 {input_file} 不存在")
        return
    
    # 读取原始 HTML 文件
    with open(input_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # 查找 window["GGURL"] 的模式（支持分号）
    pattern = r'window\["GGURL"\]\s*=\s*"([^"]+)"\s*;?'
    match = re.search(pattern, html_content)
    
    if not match:
        print("错误: 未找到 window[\"GGURL\"] 的定义")
        return
    
    original_url = match.group(1)
    print(f"找到原始 URL: {original_url}")
    
    # 为每个 URL 生成新文件
    for index, new_url in enumerate(urls, start=1):
        # 替换 URL，保持原有格式（包括分号）
        new_content = re.sub(pattern, f'window["GGURL"]="{new_url}";', html_content)
        
        # 生成输出文件名
        output_file = f"url{index}.html"
        
        # 写入新文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"已生成: {output_file} (URL: {new_url})")
    
    print(f"\n成功生成 {len(urls)} 个文件")


if __name__ == "__main__":
    # 当前目录下的 AppLovin.html
    input_file = "AppLovin.html"
    
    # 提示用户输入 URL 数组
    print("=" * 50)
    print("HTML 文件生成工具")
    print("=" * 50)
    print("\n请输入 URL 数组")
    print("支持格式:")
    print("  JSON 格式: [\"name1\",\"name2\"]")
    print("  逗号分隔: name1,name2,name3")
    
    user_input = input("\n请输入: ").strip()
    
    if not user_input:
        print("错误: 未输入任何 URL")
        exit(1)
    
    # 尝试解析 JSON 格式的数组
    urls = []
    try:
        # 尝试解析 JSON 数组
        parsed = json.loads(user_input)
        if isinstance(parsed, list):
            urls = [str(url) for url in parsed if url]
        else:
            raise ValueError("不是数组格式")
    except (json.JSONDecodeError, ValueError):
        # 如果不是 JSON 格式，按逗号分隔
        urls = [url.strip().strip('"').strip("'") for url in user_input.split(',') if url.strip()]
    
    if not urls:
        print("错误: 未输入有效的 URL")
        exit(1)
    
    print(f"\n将使用以下 {len(urls)} 个 URL 生成文件:")
    for i, url in enumerate(urls, 1):
        print(f"  {i}. {url}")
    print()
    
    read_and_replace_ggurl(input_file, urls)
