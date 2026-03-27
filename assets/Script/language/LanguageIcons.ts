import { PayType } from "../sdk/PlayableSDK";
import { LanguageManager } from "./LanguageManager";
const { ccclass, property } = cc._decorator;

@ccclass
export class LanguageIcons extends cc.Component {

    @property({ type: cc.Boolean })
    public isFollowLanage: boolean = true;

    @property({ type: cc.String, tooltip: CC_DEV && 'pay文件夹下的路径名,全部按语言缩写配置' })
    public srcName: string = ''

    @property({
        type: cc.Enum(PayType),
        visible: function () {
            return !this.isFollowLanage;
        }
    })
    public payType: PayType = PayType.One;
    private icon: cc.Sprite = null;
    public static instance: LanguageIcons = null;

    onLoad() {
        LanguageIcons.instance = this
        this.icon = this.node.getComponent(cc.Sprite);
        
    }

    start() {
        this.updateIcon();
        if(LanguageManager.instance.isTest){
            let testCountry = LanguageManager.instance.testCountry
            LanguageManager.instance.setTestLanguage(testCountry)
        }
    }

    public updateIcon(isTest:boolean = false,testCountry:string = 'us'): void {
        if (this.icon == null) return;
        let lang = ''
        if (cc.sys.language == 'zh') {
            lang = 'us'
        } else {
            lang = cc.sys.language
        }
        let cfg = this.isFollowLanage ? LanguageManager.instance.payAppInfo : LanguageManager.instance.getPayAppInfo(this.payType);
        let res = `${this.srcName}/${lang}`;
        if(cc.sys.language == 'zh'){
            res = `${this.srcName}/${lang}`
        }else{
            let country = cc.sys.languageCode.split('-')[1]
            res = `${this.srcName}/${country}`
        }
        if(isTest){
            res = `${this.srcName}/${testCountry}`
        }
        cc.loader.loadRes(`/pay/${res}`, cc.SpriteFrame, (error, res) => {
            if (error) {
                console.log("error = ", error);
                return;
            }
            this.icon.spriteFrame = res;
        });
    }
    onDestroy() {
        cc.director.off('language-changed', this.updateIcon, this);
    }
}
