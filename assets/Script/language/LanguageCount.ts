import { LanguageManager } from "./LanguageManager";

const { ccclass, property } = cc._decorator;
enum FontType {
    Medium = 0,
    MuseoSansRounded900 = 1
}
@ccclass
export class LanguageCount extends cc.Component {
    @property({
        type: cc.Enum(FontType),
        tooltip: CC_DEV && '选择显示文本的字体类型',
        displayName: '字体类型'
    })
    fontIndex: FontType = FontType.Medium;
    @property({ type: cc.Boolean, tooltip: CC_DEV && '是否自动配置货币' })
    autoPrefix: boolean = true
    // 添加是否自动配置文本颜色的属性
    @property({ type: cc.Boolean, tooltip: CC_DEV && '是否自动配置文本颜色' })
    autoTextColor: boolean = false;
    @property({ type: cc.Boolean, tooltip: CC_DEV && '是否自动配置货币后缀' })
    autoEndfix: boolean = false
    @property({ type: cc.Integer, tooltip: CC_DEV && '数字' })
    languageNum: number = 0;
    @property({ type: cc.String, tooltip: CC_DEV && '前缀' })
    prefix: string = ''
    @property({ type: cc.String, tooltip: CC_DEV && '后缀' })
    endFix: string = ''
    private lable: cc.Label | cc.RichText = null;

    protected onLoad(): void {
        if (this.getComponent(cc.Label))
            this.lable = this.getComponent(cc.Label);
        else if (this.getComponent(cc.RichText))
            this.lable = this.getComponent(cc.RichText);
    }

    protected start(): void {
        this.ChangeLanguage();
        let font = this.fontIndex == 0 ? 'Medium' : 'MuseoSansRounded900'
        cc.loader.loadRes(`/ttf/${font}`,cc.TTFFont,(error,res)=>{
            if(error){
                return
            }else{
                this.node.getComponent(cc.Label).font = res
            }
        })
    }

    protected onEnable(): void {
        this.ChangeLanguage();
    }

    private ChangeLanguage(): void {
        if (!this.lable)
            return;
        let mgr = LanguageManager.instance;
        let unit = mgr.getText(10001)
        if (this.autoPrefix) {
            this.lable.string = `${this.prefix}${unit}${mgr.formatUnit(this.languageNum)}${this.endFix}`;
        } else {
            this.lable.string = `${this.prefix}${mgr.formatUnit(this.languageNum)}${this.endFix}`;
        }
        if (this.autoEndfix) {
            this.lable.string = `${this.prefix}${mgr.formatUnit(this.languageNum)}${this.endFix}${unit}`;
        }
        // 根据是否自动配置文本颜色设置颜色
        if (this.autoTextColor) {
            // 假设国家代码可以通过某种方式从 LanguageManager 获取
            let country = cc.sys.languageCode.split('-')[1]
            if (country = 'cn') {
                country = 'us'
            }
            switch (country) {
                case 'us':
                case 'de':
                case 'fr':
                case 'mx':
                    if (this.lable instanceof cc.Label) {
                        this.lable.node.color = cc.color('#133983');
                    }
                    break;
                case 'br':
                    if (this.lable instanceof cc.Label) {
                        this.lable.node.color = cc.color('#32bcad');
                    }
                    break;
                case 'kr':
                    if (this.lable instanceof cc.Label) {
                        this.lable.node.color = cc.color('#232323');
                    }
                    break;
                case 'jp':
                    if (this.lable instanceof cc.Label) {
                        this.lable.node.color = cc.color('#fe0034');
                    }
                    break;
                case 'tr':
                    if (this.lable instanceof cc.Label) {
                        this.lable.node.color = cc.color('#50abd9');
                    }
                    break;
                default:
                    if (this.lable instanceof cc.Label) {
                        this.lable.node.color = cc.Color.WHITE;
                    }
            }
        }
    }
}
