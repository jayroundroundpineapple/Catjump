const {ccclass, property} = cc._decorator;
enum FontType {
    Medium = 0,
    MuseoSansRounded900 = 1
}
@ccclass
export class LanguageFont extends cc.Component {
    @property({
        type: cc.Enum(FontType),
        tooltip: CC_DEV && '选择显示文本的字体类型',
        displayName: '字体类型'
    })
    fontIndex: FontType = FontType.Medium;
   

    protected onLoad(): void {
       
    }

    protected start(): void {
        // let font = this.fontIndex == 0 ? 'Medium' : 'MuseoSansRounded900'
        // cc.loader.loadRes(`/ttf/${font}`,cc.TTFFont,(error,res)=>{
        //     if(error){
        //         return
        //     }else{
        //         this.node.getComponent(cc.Label).font = res
        //     }
        // })
    }
    initFont(fontIndex:number){
        const fontNames = ['Medium', 'MuseoSansRounded900'];
        const fontName = fontNames[fontIndex] || fontNames[0]; // 默认使用Medium
        cc.loader.loadRes(`/ttf/${fontName}`,cc.TTFFont,(error,res)=>{
            if(error){
                return
            }else{
                this.node.getComponent(cc.Label).font = res
            }
        })     
    }

    protected onEnable(): void {
    }
}
