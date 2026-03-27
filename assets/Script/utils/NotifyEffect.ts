/**
 * 弹窗特效类
 */

export default class NotifyEffect {
    /**
     * 弹窗接口
     * @param delay 弹窗延迟时间
     * @param canPlayerMusic 能否播放音频
     * @returns {number}
     */
    public static NormalShowUI(node: cc.Node, audio: cc.AudioClip, delay: number, canPlayMusic: boolean, callback: Function = null, StartScale: number = 1, EndScale: number = 1, time1: number = 0.3, time2: number = 0.3) {
        setTimeout(() => {
            canPlayMusic && cc.audioEngine.play(audio, false, 1)
            node.scale = 0
            node.active = true
            cc.tween(node)
                .to(time1, { scale: StartScale }, { easing: 'quadOut' })
                .to(time2, { scale: EndScale }, { easing: 'quadOut' })
                .call(() => {
                    if (callback) callback()
                })
                .start()
            canPlayMusic && cc.audioEngine.play(audio, false, 1)
        }, delay * 1000)
    }
    /**?
     * 震动弹窗接口
     * @param duartion 动画持续时间 0则为永久
     * @param shakeSpeed 震动速度时间默认0.04
     * @param shakeWake 震幅默认为1倍
     */
    public static shakeShowUI(node: cc.Node, audio: cc.AudioClip, duartion: number = 0, scale: number = 1.2, shakeSpeed: number = 0.04, shakeWake: number = 1) {
        let posX = node.x
        let posY = node.y
        let shakeAction = cc.sequence(
            cc.moveTo(shakeSpeed, cc.v2(posX + 5 * shakeWake, posY + 7 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX + -6 * shakeWake, posY + 7 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX + -13 * shakeWake, posY + 3 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX + 3 * shakeWake, posY - 6 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX + -5 * shakeWake, posY + 5 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX + 2 * shakeWake, posY - 8 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX + -8 * shakeWake, posY - 10 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX + 3 * shakeWake, posY + 10 * shakeWake)),
            cc.moveTo(shakeSpeed, cc.v2(posX, posY)),
        )
        let swapAction = cc.spawn(
            cc.scaleTo(shakeSpeed, scale),
            shakeAction,
        )
        let seq = cc.sequence(
            cc.delayTime(0.15),
            swapAction,
            cc.delayTime(0.15),
            cc.scaleTo(0.2, 1),
        )
        node.runAction(cc.repeatForever(seq))
        if (duartion != 0) {
            setTimeout(() => {
                node.stopAllActions()
                node.scale = 1
                node.setPosition(0, 0)
            }, duartion * 1000)
        }
    }
    /**?
     * Q弹动态弹窗  
     * @param StartScaleX 初始缩放
     * @param StartRatio 初始宽高比
     * @param MidRatio 宽高比2
     * @param EndRatio 宽高比3
     */
    public static FlexShowUI(node: cc.Node, StartScale: number = 1, StartRatio: number = 0.85, MidRatio: number = 1.15, EndRatio: number = 0.85) {
        node.scale = 0
        node.active = true
        let startScaleX = StartScale, startScaleY = StartScale, midScaleX = StartScale, midScaleY = StartScale, endScaleX = StartScale, endScaleY = StartScale
        startScaleY = startScaleX / StartRatio
        midScaleX = midScaleY * MidRatio
        midScaleY = 0.75
        endScaleY = endScaleX / EndRatio
        cc.tween(node)
            .to(0.2, { scaleX: startScaleX, scaleY: startScaleY }, { easing: 'quadOut' })
            .to(0.25, { scaleX: midScaleX, scaleY: midScaleY }, { easing: '' })
            .to(0.12, { scaleX: endScaleX, scaleY: endScaleY }, { easing: '' })
            .to(0.12, { scaleX: 1, scaleY: 1 }, { easing: '' })
            .start()
    }
    /**
     * 弹窗  大变小
     */
    public static FarShowUI(node: cc.Node, startScale: number = 1.5, midScale: number = 0.85, endScale: number = 1.15, time: number = 0.5) {
        node.scale = startScale
        node.active = true
        cc.tween(node)
            .to(time, { scale: midScale }, { easing: 'quadIn' })
            .to(time, { scale: endScale }, { easing: 'quadOut' })
            .to(time, { scale: 1 }, { easing: 'quadOut' })
            .start()
    }
    /**?
    * 震动接口  
    * @param shakeOffset 偏移量
    * @param shakeCount 震动次数
    * @param shakeDuration 速度
    */
    public static shakeUI1(node: cc.Node, shakeOffset: number = 30, shakeCount: number = 4, shakeDuration = 0.05) {
        cc.tween(node)
            .repeat(shakeCount,
                cc.tween()
                    .by(shakeDuration, { position: cc.v2(shakeOffset, shakeOffset) })
                    .by(shakeDuration, { position: cc.v2(-shakeOffset, -shakeOffset) })
            )
            .start();
    }
    /**?
         * 震动放大接口  
         * @param shakeAngle 角度
         * @param shakeCount 震动次数
         * @param shakeDuration 速度
         * @param scaleFactor 放大倍数
         */
    public static shakeAndScaleNode(node: cc.Node, shakeAngle: number, shakeCount: number, shakeDuration: number, scaleFactor: number) {
        const originalScale = node.scale;
        const targetScale = originalScale * scaleFactor;
        cc.tween(node)
            .to(shakeDuration, { scale: targetScale }) // 放大
            .repeat(shakeCount,
                cc.tween()
                    .to(shakeDuration, { angle: shakeAngle })
                    .to(shakeDuration, { angle: 0 })
                    .to(shakeDuration, { angle: -shakeAngle })
                    .to(shakeDuration, { angle: 0 })
            )
            .to(shakeDuration, { scale: originalScale }) // 恢复原始大小
            .start();
    }
}
