const {ccclass, property} = cc._decorator;

@ccclass
export default class MaskUI extends cc.Component {

    @property(cc.Mask)
    private maskNode:cc.Mask = null
    @property(cc.Node)
    private btn1:cc.Node = null
    @property(cc.Node)
    private btn2:cc.Node = null

    start () {
        this.resize()
        // 延迟一帧执行，确保Widget更新完成
        this.scheduleOnce(() => {
            this.setMask()
        }, 0)
    }
    
    setMask(){
        // 确保Widget已经更新 如果Widget没有更新，节点的实际位置和大小可能不准确
        let graphics1 = (this.maskNode as any)._graphics;
        if (!graphics1) {
            console.error('Mask graphics not found!');
            return;
        }
        
        graphics1.clear()
        graphics1.fillColor = new cc.Color(255,255,255,0)
        
        // 获取btn在遮罩节点坐标系中的位置
        let btn1WorldPos = this.btn1.parent.convertToWorldSpaceAR(this.btn1.position)
        let btn1LocalPos = this.maskNode.node.parent.convertToNodeSpaceAR(btn1WorldPos)
        
        let btn2WorldPos = this.btn2.parent.convertToWorldSpaceAR(this.btn2.position)
        let btn2LocalPos = this.maskNode.node.parent.convertToNodeSpaceAR(btn2WorldPos)
        
        // 获取btn的实际大小（Widget更新后的）
        let btn1Width = this.btn1.width
        let btn1Height = this.btn1.height
        let btn2Width = this.btn2.width
        let btn2Height = this.btn2.height
        
        // 绘制圆角矩形（挖洞区域）
        graphics1.roundRect(
            btn1LocalPos.x - btn1Width / 2,
            btn1LocalPos.y - btn1Height / 2,
            btn1Width,
            btn1Height,
            0
        )
        graphics1.roundRect(
            btn2LocalPos.x - btn2Width / 2,
            btn2LocalPos.y - btn2Height / 2,
            btn2Width,
            btn2Height,
            0
        )
        graphics1.fill()
    }
    private resize() {
        const canvasValue: any = cc.Canvas.instance;
        let frameSize = cc.view.getFrameSize();
        let isVerTical = cc.winSize.height > cc.winSize.width
        if (isVerTical) {//竖屏
            if (cc.winSize.width / cc.winSize.height > 0.7) {
                cc.Canvas.instance.fitHeight = true;
                cc.Canvas.instance.fitWidth = false;
            } else {
            cc.Canvas.instance.fitHeight = false;
                cc.Canvas.instance.fitWidth = true;
            }
        } else {
            cc.Canvas.instance.fitHeight = true;
            cc.Canvas.instance.fitWidth = false;
        }
        
        /**
         * 重要：必须调用updateAlignment()，原因如下：
         * 
         * 1. Widget组件的工作原理：
         *    - Widget组件会根据Canvas的适配模式（fitHeight/fitWidth）自动调整节点的位置和大小
         *    - 但是Widget的调整是"延迟"的，需要调用updateAlignment()才会真正应用到节点上
         * 
         * 2. 如果不调用updateAlignment()：
         *    - 节点的position、width、height等属性仍然是旧的值（适配前的值）
         *    - 在setMask()中使用convertToWorldSpaceAR转换坐标时，使用的是旧的位置
         *    - 导致graphics绘制的区域位置不准确，遮罩效果失效
         * 
         * 3. 为什么遮罩会失效：
         *    - graphics的绘制坐标系是相对于maskNode.node的
         *    - 如果maskNode.node的位置/大小没有更新，绘制的区域就会错位
         *    - 如果btn的位置没有更新，计算出的挖洞位置也会错位
         *    - 最终导致遮罩区域和实际btn位置不匹配，遮罩效果失效
         * 
         * 4. 解决方案：
         *    - 必须在resize()后调用updateAlignment()，确保所有Widget都更新完成
         *    - 然后在setMask()中才能获取到正确的节点位置和大小
         */
        cc.director.getScene().getComponentsInChildren(cc.Widget).forEach(function (t) {
            t.updateAlignment()
        });
    }
}
