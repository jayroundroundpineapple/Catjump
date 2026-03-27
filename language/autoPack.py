import os

def read_index_html(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    return content

def write_html_file(content, ad_type, gg_url, file_name):
    replaced_content = content.replace('window["AD_TYPE"]="IRONSOURCES";', f'window["AD_TYPE"]="{ad_type}";')
    replaced_content = replaced_content.replace('window["GGURL"]=""', f'window["GGURL"]="{gg_url}";')

    with open(file_name, 'w') as file:
        file.write(replaced_content)

if __name__ == "__main__":
    file_path = 'index.html'
    content = read_index_html(file_path)

    ad_types = ["UNITY", "Mintegral", "Kwai", "Unity", "IRONSOURCES"]
    gg_url = input("请输入输出的链接: ")

    for idx, ad_type in enumerate(ad_types):
        file_name = f"{ad_type}_index_{idx}.html"
        write_html_file(content, ad_type, gg_url, file_name)

    print("文件已生成！")
