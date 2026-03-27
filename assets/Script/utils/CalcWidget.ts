const { ccclass, property } = cc._decorator;

@ccclass
export class CalcWidget extends cc.Component {
    @property({type:cc.Boolean})
    public isLeft:boolean = true

    start() {
        this.fitFunc();
        // cc.view.setResizeCallback(() => {
        //     this.fitFunc();
        // })
    }
    private fitFunc(){
        this.node.active = cc.winSize.width > cc.winSize.height ? true : false
        let widget = this.node.getComponent(cc.Widget)
        // if(widget == null)return
        if(this.isLeft){
            widget.left = (((cc.winSize.width - 720 ) / 2) - this.node.width) / 2
        }else{
            widget.right = (((cc.winSize.width - 720 ) / 2) - this.node.width) / 2
        }
    }
}
