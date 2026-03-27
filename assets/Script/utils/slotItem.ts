
const { ccclass, property } = cc._decorator;

@ccclass
export default class slotItem extends cc.Component {
    @property(cc.Node)
    private itemNode: cc.Node = null;
    
    _spriteIdx:number = -1;
    initItem(spriteIndex:number){
        this._spriteIdx = spriteIndex; // 设置spriteIndex
        // 使用同步加载，确保资源立即加载完成
        let spriteFrame = cc.loader.getRes(`/slot/slot${spriteIndex}`, cc.SpriteFrame);
        if (spriteFrame) {
            // 如果已缓存，直接使用
            this.itemNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        } else {
            // 如果未缓存，异步加载
            cc.loader.loadRes(`/slot/slot${spriteIndex}`, cc.SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`加载slot${spriteIndex}失败:`, err);
                    return;
                }
                if (this.itemNode && this.itemNode.isValid) {
                    let sprite = this.itemNode.getComponent(cc.Sprite);
                    if (sprite) {
                        sprite.spriteFrame = spriteFrame;
                    }
                }
            });
        }
    }
    
    /**同步设置spriteFrame（确保资源已加载） */
    setSpriteFrameSync(spriteIndex:number){
        this._spriteIdx = spriteIndex;
        let spriteFrame = cc.loader.getRes(`/slot/slot${spriteIndex}`, cc.SpriteFrame);
        if (spriteFrame && this.itemNode && this.itemNode.isValid) {
            let sprite = this.itemNode.getComponent(cc.Sprite);
            if (sprite) {
                sprite.spriteFrame = spriteFrame;
            }
        }
    }
    set spriteIndex(idx:number){
        this._spriteIdx = idx;
    }
    get spriteIndex():number{
        return this._spriteIdx;
    }

    protected onDisable(): void {
    }
}

