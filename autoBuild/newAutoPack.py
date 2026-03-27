import os
import sys
import re
import zipfile
import shutil
import glob  # 用于查找图片文件

def read_index_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    return content

def get_image_files():
    """获取当前目录下所有的jpg和png图片"""
    image_extensions = ['*.jpg', '*.jpeg', '*.png']
    image_files = []
    for ext in image_extensions:
        image_files.extend(glob.glob(ext))
    return image_files

def copy_images_to_folder(image_files, target_folder, base_name):
    """
    将图片复制到目标文件夹，并按base_name重命名
    
    :param image_files: 图片文件列表
    :param target_folder: 目标文件夹路径
    :param base_name: 基础文件名（不含扩展名）
    """
    for img_path in image_files:
        # 获取图片扩展名
        ext = os.path.splitext(img_path)[1].lower()
        # 构建目标文件名
        target_name = f"{base_name}{ext}"
        target_path = os.path.join(target_folder, target_name)
        # 复制文件
        shutil.copy2(img_path, target_path)
        print(f"已复制图片到 {target_path}")

def write_html_file(content, ad_type, gg_url, file_name, zip_name, folder_name, image_files):
    try:
        replaced_content = content.replace(
            'window["AD_TYPE"]=""',
            f'window["AD_TYPE"]="{ad_type}"')

        if ad_type == "UNITY":
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";\nfunction u_a(){{mraid.open()}};')
        if ad_type == "APPLOVIN":
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";\nfunction u_a(){{mraid.open()}};')
        if ad_type == "NEWSBREAK":
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";\nfunction u_a(){{mraid.open()}};')
        if ad_type == "IRONSOURCES":
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";\nfunction u_a(){{mraid.open()}};')
        if ad_type == "MOLOCO":
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";\nwindow.FBPlayableOnCTAClick = () => (typeof FbPlayableAd === "undefined") ? alert("FBPlayableAd.onCTAClick") : FbPlayableAd.onCTAClick();')
        if ad_type == "Google":
            # Google 渠道需要添加 exitapi.js 脚本和 u_a 函数
            # 先替换 GGURL
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";\nfunction u_a(){{ExitApi.exit()}};')
            # 在 </head> 标签前添加 script 标签引入 exitapi.js
            head_end_position = replaced_content.find('</head>')
            if head_end_position != -1:
                script_tag = '<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>\n'
                replaced_content = replaced_content[:head_end_position] + script_tag + replaced_content[head_end_position:]
        elif ad_type == "TT":
            # TikTok Pangle 渠道：替换 GGURL（虽然 TikTok 不使用 mraid，但保留 GGURL 以保持兼容性）
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";')
            # 在 </body> 标签前添加 TikTok playable SDK 脚本（在主体底部和开发人员自己的 JS 之前）
            body_end_position = replaced_content.rfind('</body>')
            if body_end_position != -1:
                # TikTok playable SDK 脚本
                tiktok_script = '<script src="https://sf16-muse-va.ibytedtos.com/obj/union-fe-nc-i18n/playable/sdk/playable-sdk.js"></script>\n'
                replaced_content = replaced_content[:body_end_position] + tiktok_script + replaced_content[body_end_position:]
        else:
            replaced_content = replaced_content.replace(
                'window["GGURL"]=""',
                f'window["GGURL"]="{gg_url}";')

        if replaced_content:
            if ad_type in ['MTG', 'KWAI', 'Google', 'TT']:
                # 创建临时 HTML 文件
                temp_file_name = file_name
                with open(temp_file_name, 'w', encoding='utf-8') as file:
                    file.write(replaced_content)
                
                # 对于 TikTok，需要将 HTML 文件重命名为 index.html，并添加 config.json
                if ad_type == 'TT':
                    # 重命名为 index.html
                    index_html_name = 'index.html'
                    os.rename(temp_file_name, index_html_name)
                    temp_file_name = index_html_name
                    
                    # 创建 config.json 文件（TikTok 要求）
                    # playable_orientation: 0=横版或竖版, 1=仅竖版, 2=仅横版
                    config_json = {
                        "playable_orientation": 0  # 默认支持横竖版，可根据需要修改
                    }
                    config_file_name = 'config.json'
                    import json
                    with open(config_file_name, 'w', encoding='utf-8') as config_file:
                        json.dump(config_json, config_file, ensure_ascii=False, indent=2)
                    
                    # 创建 ZIP 文件，包含 index.html 和 config.json
                    with zipfile.ZipFile(zip_name, 'w') as zipf:
                        zipf.write(index_html_name)
                        zipf.write(config_file_name)
                    
                    # 删除临时文件
                    os.remove(index_html_name)
                    os.remove(config_file_name)
                else:
                    # 其他平台正常打包
                    with zipfile.ZipFile(zip_name, 'w') as zipf:
                        zipf.write(temp_file_name)
                    # 删除临时 HTML 文件
                    os.remove(temp_file_name)
                
                # 移动 ZIP 文件到对应的文件夹
                shutil.move(zip_name, os.path.join(folder_name, zip_name))
                print(f"压缩包 {zip_name} 已成功生成并移动到 {folder_name} 文件夹。")
                
                # 获取基础文件名（不含扩展名）用于图片命名
                base_name = os.path.splitext(zip_name)[0]
            else:
                # 对于非 MTG、KWAI 和 Google 类型，直接写入 HTML 文件
                with open(file_name, 'w', encoding='utf-8') as file:
                    file.write(replaced_content)
                # 移动 HTML 文件到对应的文件夹
                shutil.move(file_name, os.path.join(folder_name, file_name))
                print(f"文件 {file_name} 已成功生成并移动到 {folder_name} 文件夹。")
                
                # 获取基础文件名（不含扩展名）用于图片命名
                base_name = os.path.splitext(file_name)[0]
            
            # 如果有图片文件，则复制到当前文件夹
            if image_files:
                copy_images_to_folder(image_files, folder_name, base_name)
        else:
            print('内容替换失败。')

    except Exception as e:
        print(f"异常: {e}")

def validate_pack_name(pack_name):
    """
    验证打包名字是否符合规则
    
    规则：
    1. 必须包含至少5个下划线
    2. 按前5个下划线分割成6个词
    3. 第二个词必须是 "pla"（不区分大小写）
    4. 第四个词必须是5个数字
    5. 第五个词必须以 "v" 开头（不区分大小写）
    
    :param pack_name: 打包名字
    :return: (is_valid: bool, error_message: str)
    """
    # 检查是否包含至少5个下划线
    underscore_count = pack_name.count('_')
    if underscore_count < 5:
        return False, f"打包名字必须包含至少5个下划线，当前只有 {underscore_count} 个"
    
    # 按前5个下划线分割
    parts = pack_name.split('_', 5)  # 最多分割5次，得到6个部分
    
    if len(parts) < 6:
        return False, f"打包名字按前5个下划线分割后应该有6个词，当前只有 {len(parts)} 个"
    
    # 提取各个部分
    word1 = parts[0]  # 第一个词（如 SuperHabit）
    word2 = parts[1]  # 第二个词（必须是 pla）
    word3 = parts[2]  # 第三个词（如 Checkin）
    word4 = parts[3]  # 第四个词（必须是5个数字）
    word5 = parts[4]  # 第五个词（必须以 v 开头）
    word6 = parts[5]  # 第六个词（剩余部分，如 sign_blue）
    
    # 验证第二个词必须是 "pla"（不区分大小写）
    if word2.lower() != 'pla':
        return False, f"第二个词必须是 'pla'，当前是 '{word2}'"
    
    # 验证第四个词必须是5个数字
    if not word4.isdigit() or len(word4) != 5:
        return False, f"第四个词必须是5个数字，当前是 '{word4}'（长度: {len(word4)}）"
    
    # 验证第五个词必须以 "v" 开头（不区分大小写）
    if not word5 or word5[0].lower() != 'v':
        return False, f"第五个词必须以 'v' 开头（大小写都可以），当前是 '{word5}'"
    
    # 所有验证通过
    return True, ""

def create_test_html(index_path, output_path='test.html'):
    """
    复制 index.html 并添加指定语言选择器代码生成 test.html
    :param index_path: index.html 文件路径
    :param output_path: 生成的 test.html 路径，默认当前目录下
    """
    index_content = read_index_html(index_path)
    # 要插入的代码片段
    insert_code = '''
    <div id="language-selector" style="position: fixed; bottom: 10px; right: 10px;">
        <select id="language-dropdown">
            <option value="us">英语</option>
            <option value="jp">日语</option>
            <option value="de">德语</option>
            <option value="fr">法语</option>
            <option value="kr">韩语</option>
            <option value="br">巴西</option>
            <option value="mx">墨西哥</option>
            <option value="es">西班牙</option>
            <option value="th">泰语</option>
            <option value="vn">越南</option>
            <option value="id">印尼</option>
            <option value="it">意大利</option>
            <option value="pl">波兰</option>
            <option value="tw">中国台湾</option>
            <option value="ru">ru</option>
            <option value="sa">sa</option>
            <option value="hk">中国香港</option>
        </select>
    </div>
    <script>
      document.getElementById('language-dropdown').addEventListener('change', function() {
        var selectedLanguage = this.value;
          window.setTestLanguage(selectedLanguage)
          console.log(selectedLanguage)
      });
    </script>
    '''
    # 找到插入位置，这里简单通过 </body> 标签前插入，可根据实际 HTML 结构调整更精准的定位逻辑
    insert_position = index_content.find('</body>')
    if insert_position != -1:
        new_content = index_content[:insert_position] + insert_code + index_content[insert_position:]
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"已成功生成 {output_path}")
    else:
        print("未找到 </body> 标签，无法插入代码")

if __name__ == "__main__":
    file_path = '../build/index.html'
    content = read_index_html(file_path)

    # 新增生成 test.html 的功能
    create_test_html(file_path)

    gg_url = input("请输入输出的链接:")
    pack_name = input("请输入打包名字: ")
    
    # 验证打包名字
    print("\n正在验证打包名字...")
    is_valid, error_message = validate_pack_name(pack_name)
    
    if not is_valid:
        print(f"\n❌ 打包名字不合规: {error_message}")
        print(f"当前打包名字: {pack_name}")
        print("\n正确格式示例:")
        print("  SuperHabit_pla_Checkin_25001_v2_sign_blue")
        print("  BrainSolitaire_pla_Solitaire_25168_v1_card")
        print("\n规则说明:")
        print("  1. 必须包含至少5个下划线")
        print("  2. 第二个词必须是 'pla'")
        print("  3. 第四个词必须是5个数字")
        print("  4. 第五个词必须以 'v' 开头（大小写都可以）")
        sys.exit(1)
    
    print("✅ 打包名字验证通过！\n")
    
    ad_types = ["UNITY", "MTG", "KWAI", "APPLOVIN","NEWSBREAK", "IRONSOURCES","Moloco","Google", "TT"]
    ad_arr = ["Unity", "Mintegral", "Kwai", "AppLovin","newsBreak", "ironSource","Moloco","Google", "TikTok"]
    folder_Arr = ["Unity", "Mintegral", "Kwai", "AppLovin","newsBreak","ironSource","Moloco","Google", "TikTok"]
    
    # 获取当前目录下的所有图片文件
    image_files = get_image_files()
    if image_files:
        print(f"发现图片文件: {', '.join(image_files)}")
    else:
        print("未发现图片文件，将跳过图片复制步骤")

    for idx, ad_type in enumerate(ad_types):
        # 创建文件夹
        os.mkdir(folder_Arr[idx])
        # 定义文件名
        file_name = f"{pack_name}__xsm__{ad_arr[idx]}.html"
        zip_name = f"{pack_name}__xsm__{ad_arr[idx]}.zip"
        folder_name = folder_Arr[idx]
        # 写入文件并复制图片
        write_html_file(content, ad_type, gg_url, file_name, zip_name, folder_name, image_files)

    print("所有文件已生成并已打包成压缩包，且移动到对应的文件夹！")

    # 创建以 pack_name 命名的新文件夹
    os.mkdir(pack_name)
    # 将所有文件夹移动到以 pack_name 命名的新文件夹中
    for folder in folder_Arr:
        shutil.move(folder, os.path.join(pack_name, folder))

    print(f"所有文件夹已移动到 {pack_name} 文件夹中。")
             