const {ccclass, property} = cc._decorator;

@ccclass
export default class LanguageColor extends cc.Component {

    @property({ type: cc.Boolean, tooltip: CC_DEV && '是否自动配置文本颜色' })
    autoTextColor: boolean = false;
    
    private lable: cc.Label | cc.RichText = null;

    protected onLoad(): void {
        if (this.node.getComponent(cc.Label))
            this.lable = this.getComponent(cc.Label);
        else if (this.getComponent(cc.RichText))
            this.lable = this.getComponent(cc.RichText);
    }
    start () {
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
                        this.lable.node.color = cc.color('#133983');
                    break;
                case 'br':
                        this.lable.node.color = cc.color('#32bcad');
                    break;
                case 'kr':
                        this.lable.node.color = cc.color('#232323');
                    break;
                case 'jp':
                        this.lable.node.color = cc.color('#fe0034');
                    break;
                case 'tr':
                        this.lable.node.color = cc.color('#50abd9');
                    break;
                default:
                        this.lable.node.color =  cc.color('#133983');
            }
        }
    }
}
