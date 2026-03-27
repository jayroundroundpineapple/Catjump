// 按钮、手指引导
export default class GuideEffect {
    //手指
     /**
  * 
  * @param node 节点
  * @param statrScale 起始缩放默认1.1 
  *  @param endScale 末尾缩放默认1
  * @param time 时间间隔默认0.3秒
  * @param isRepeat 默认重复
  * @param times 播放次数
  */
  public static SetScale(node: cc.Node,time:number = 0.3,statrScale: number = 1.1,endScale:number = 1, isRepeat: boolean = true, times: number = 3) {
    if (isRepeat == null) isRepeat = true
    let scale1 = cc.tween().to(time, { scale: statrScale })
    let scale2 = cc.tween().to(time, { scale: endScale })
    var tween = cc.tween().sequence(scale1, scale2)
    if (isRepeat) {
      cc.tween(node).repeatForever(tween).start()
    } else {
      cc.tween(node).repeat(times, tween).start()
    }
  }
    /**
     * 上下引导特效
     * @param node 
     * @param y 
     * @param time 
     */
    public static UpDownGuide(node: cc.Node, disY: number = 10, time: number = 0.1) {
        node.stopAllActions()
        cc.tween(node).repeatForever(
            cc.tween().to(time, { scale: 1.15, y: node.y + disY })
                .to(time, { scale: 1.15, y: node.y - disY })
        ).start()
    }
    /**?
     * 旋转引导特效
     * @param 时间间隔
     */
    public static RotateGuideEffect
    (node: cc.Node, lightNode: cc.Node, startAngle: number = 0, endAngle: number = 12, time = 0.12) {
        node.stopAllActions()
        node.angle = startAngle
        cc.tween(node).repeatForever(
            cc.tween(node)
                .to(time, { angle: endAngle })
                .to(time, { angle: startAngle })
        ).start()
        cc.tween(lightNode).repeatForever(
            cc.tween(lightNode)
                .to(time, { opacity: 255 })
                .to(time, { opacity: 0 })
        ).start()
    }
    /**?
     * 引导特效1
     */
    public static GuideEffect1(node: cc.Node, lightNode: cc.Node, clickTime: number = 3, clickSclae: number = 1.15, endScale: number = 2, clickGapTime: number = 0.3, moveTime: number = 0.5) {
        lightNode.opacity = 0
        node.active = true
        let clickTween = cc.tween(node)
            .to(clickGapTime, { scale: 1 })
            .to(clickGapTime, { scale: clickSclae })
            .start()
        cc.tween(node).repeatForever(
            cc.tween(node).repeat(clickTime, clickTween)
                .to(clickGapTime, { scale: 1 })
                .delay(0.1)
                .to(moveTime, { x: node.x + 200, y: node.y - 200, scale: endScale, opacity: 0 }, { easing: 'quadOut' })
                .delay(0.2)
                .to(moveTime, { x: node.x, y: node.y, scale: 1, opacity: 255 }, { easing: 'quadInOut' })
                .start()
        ).start()
        cc.tween(lightNode).repeatForever(
            cc.tween(lightNode)
            .delay(clickGapTime)
            .repeat(clickTime,cc.tween(lightNode)
            .to(clickGapTime,{opacity:0})
            .to(clickGapTime,{opacity:255})
             )
             .to(0.01,{opacity:0})
             .delay(0.3+moveTime*2)
             .start()
        ).start()

    }

    //按钮
    /**
     * Q弹 按钮动态
     */
    public static BtnElasticX(node: cc.Node, startScaleX: number = 0.7, endSclaeX: number = 1.25, time: number = 0.3) {
        node.stopAllActions()
        cc.tween(node).repeatForever(
            cc.tween(node).delay(time)
                .to(time, { scaleX: startScaleX })
                .to(time, { scaleX: endSclaeX })
                .to(time, { scaleX: 1 })
        ).start()
    }

    public static BtnElasticY(node: cc.Node, startScaleY: number = 0.7, endSclaeY: number = 1.25, time: number = 0.3) {
        node.stopAllActions()
        cc.tween(node).repeatForever(
            cc.tween(node).delay(time)
                .to(time, { scaleY: startScaleY })
                .to(time, { scaleY: endSclaeY })
                .to(time, { scaleY: 1 })
        ).start()
    }
    /**?
     * @param 手指
     * @param 指引光
     */
    public static normalFingerGuide(guideFinger:cc.Node,guideLight:cc.Node){
        guideLight.opacity = 0
        cc.tween(guideFinger).repeatForever(
            cc.tween(guideFinger)
                .delay(0.2)
                .to(0.15, { scale: 0.9 })
                .to(0.15, { scale: 1 })
                .start()
        ).start()
        
        cc.tween(guideLight).repeatForever(
            cc.tween(guideLight)
            .delay(0.2)
            .to(0.1,{opacity:255})
            .to(0.2,{opacity:0})
            .start()
        ).start()
    }
}