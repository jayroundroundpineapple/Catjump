import { LanguageManager } from "./LanguageManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class LanguageComponent extends cc.Component {

    @property(cc.Integer)
    languageId: number = 0;
    @property({type:cc.Boolean,tooltip:CC_DEV && '是否需要自定义配置%s'})
    IsCustom:boolean = false
    @property({type:cc.Boolean,tooltip:CC_DEV && '是否需要前缀'})
    IsPrefix:boolean = false
     @property({type:cc.String,tooltip:CC_DEV && '前缀'})
    prefix:string = ''
    @property({type:cc.Boolean,tooltip:CC_DEV && '是否需要后缀'})
    IsEndprefix:boolean = false
     @property({type:cc.String,tooltip:CC_DEV && '后缀'})
    endPrefix:string = ''
    @property({type:cc.Integer,tooltip:CC_DEV && '配置的数字'})
    cusTomNum:number = 0
    private lable: cc.Label | cc.RichText = null;
    private formatArgs: any[] = null;

    protected onLoad(): void {
        if (this.getComponent(cc.Label))
            this.lable = this.getComponent(cc.Label);
        else if (this.getComponent(cc.RichText))
            this.lable = this.getComponent(cc.RichText);
    }

    protected start(): void {
        this.ChangeLanguage();
    }

    protected onEnable(): void {
        this.ChangeLanguage();
    }

    private ChangeLanguage(): void {
        if (!this.lable)
            return;
        
        let mgr = LanguageManager.instance;
        //this.formatArgs != null
        if (this.IsCustom && this.cusTomNum){
            this.lable.string = mgr.getText(this.languageId,this.cusTomNum);
            if(this.IsPrefix){
                this.lable.string = `${this.prefix}${mgr.getText(this.languageId,this.cusTomNum)}`
            }
            if(this.IsEndprefix){
                this.lable.string = `${mgr.getText(this.languageId,this.cusTomNum)}${this.endPrefix}`
            }
        } else {
            this.lable.string = `${mgr.getText(this.languageId)}`
            if(this.IsPrefix)this.lable.string = `${this.prefix}${mgr.getText(this.languageId)}`
            if(this.IsEndprefix)this.lable.string = `${mgr.getText(this.languageId)}${this.endPrefix}`
            if(this.IsEndprefix && this.IsPrefix) this.lable.string = `${this.prefix}${mgr.getText(this.languageId)}${this.endPrefix}`
        }
    }

    public ChangeNormalId(textId: number, ...args: any[]): void {
        this.languageId = textId;
        if (args.length <= 0) {
            this.formatArgs = null;
        } else {
            this.formatArgs = args;
        }

        this.ChangeLanguage();
    }

    public SetFormatText(...args: any[]): void {
        this.formatArgs = args;
        this.ChangeLanguage();
    }
}
