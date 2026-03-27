const { ccclass, property } = cc._decorator;

@ccclass
export default class blockItem extends cc.Component {
    @property(cc.Sprite)
    private itemSprite: cc.Sprite = null

    @property(cc.SpriteFrame)
    private normalSpriteFrame: cc.SpriteFrame = null

    @property(cc.SpriteFrame)
    private pinkSpriteFrame: cc.SpriteFrame = null

    @property(cc.SpriteFrame)
    private yellowSpriteFrame: cc.SpriteFrame = null

    private getTargetSprite(): cc.Sprite {
        if (this.itemSprite) {
            return this.itemSprite
        }
        return this.getComponent(cc.Sprite)
    }

    /** 通用换图方法：外部可直接传入任意 spriteFrame */
    public setItemSprite(spriteFrame: cc.SpriteFrame): void {
        const sp = this.getTargetSprite()
        if (!sp || !spriteFrame) {
            return
        }
        sp.spriteFrame = spriteFrame
    }

    /** 切换默认/粉色皮肤 */
    public setPink(usePink: boolean): void {
        const sp = this.getTargetSprite()
        if (!sp) {
            return
        }
        if (usePink) {
            if (this.pinkSpriteFrame) {
                sp.spriteFrame = this.pinkSpriteFrame
            }
            return
        }
        if (this.normalSpriteFrame) {
            sp.spriteFrame = this.normalSpriteFrame
        }
    }

    public setYellow(useYellow: boolean): void {
        const sp = this.getTargetSprite()
        if (!sp) {
            return
        }
        if (useYellow) {
            if (this.yellowSpriteFrame) {
                sp.spriteFrame = this.yellowSpriteFrame
            }
            return
        }
        if (this.normalSpriteFrame) {
            sp.spriteFrame = this.normalSpriteFrame
        }
    }
}
