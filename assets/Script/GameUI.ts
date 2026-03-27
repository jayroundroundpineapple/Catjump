
import { GameModel } from "./GameModel";
import RESSpriteFrame from "./RESSpriteFrame";



const { ccclass, property } = cc._decorator;

@ccclass
export default class GameUI extends cc.Component {
    @property(cc.Node)
    private catPre:cc.Node = null
    @property(cc.Node)
    private bottomNode:cc.Node = null
    @property(cc.Prefab)
    private blockPre: cc.Prefab = null
    @property(cc.Node)
    private mapNode:cc.Node = null
    @property(cc.Node)
    private finger: cc.Node = null;
    @property(cc.Node)
    private bgNode: cc.Node = null
    @property(cc.Node)
    private maxBg: cc.Node = null
    @property(cc.Node)
    private maskNode: cc.Node = null
    @property(cc.Node)
    private resultNode: cc.Node = null

    private bgmAudioFlag: boolean = true
    private canPlayMusic: boolean = false
    private gameModel: GameModel = null
    private blockPool: cc.NodePool = new cc.NodePool()
    private activeBlocks: cc.Node[] = []
    private laneXList: number[] = []
    private initialBlockCount: number = 3
    private blockFallSpeed: number = 420
    private topSpawnY: number = 0
    private bottomRecycleY: number = 0
    private laneGap: number = 0
    private blockSpawnExtraScale: number = 0.65
    private isBlockMoving: boolean = false
    protected onLoad(): void {
        this.gameModel = new GameModel()
        this.gameModel.mGame = this
    }
    protected start(): void {
        PlayerAdSdk.init();
        this.resize()
        let that = this;
        /**屏幕旋转尺寸改变 */
        cc.view.setResizeCallback(() => {
            that.resize();
        })
        cc.find('Canvas').on('touchstart', () => {
            this.canPlayMusic = true
            this.bgmAudioFlag && cc.audioEngine.play(RESSpriteFrame.instance.bgmAudioClip, false, 1)
            this.bgmAudioFlag = false
        })
        this.resize()
        this.initStartBlocks()
        this.bindFingerTapEvent()
    }
    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
        cc.director.getScene().getComponentsInChildren(cc.Widget).forEach(function (t) {
            t.updateAlignment()
        });
        this.maxBg.active = !isVerTical
        this.refreshBlockBoundary()
    }
    private initStartBlocks() {
        if (!this.mapNode || !this.blockPre) {
            return
        }
        this.clearAllBlocks()
        this.prepareLanes()
        this.refreshBlockBoundary()
        const span = this.topSpawnY - this.bottomRecycleY
        for (let i = 0; i < this.initialBlockCount; i++) {
            // 从下往上排；用 (i+1)/(n+1) 避免贴在 bottomRecycleY/topSpawnY 上触发回收或出屏
            const progress = (i + 1) / (this.initialBlockCount + 1)
            const y = this.bottomRecycleY + progress * span
            const blockNode = this.createOrReuseBlock()
            // 第一个block固定在中间列，x = 0
            if (i === 0) {
                this.placeBlock(blockNode, y, false)
            } else {
                this.placeBlock(blockNode, y, true)
            }
            blockNode.name = `block_${i}`
            this.activeBlocks.push(blockNode)
        }
    }
    private bindFingerTapEvent() {
        if (!this.bgNode) {
            return
        }
        this.bgNode.off(cc.Node.EventType.TOUCH_START, this.onFingerTap, this)
        this.bgNode.on(cc.Node.EventType.TOUCH_START, this.onFingerTap, this)
    }
    private onFingerTap() {
        if (this.isBlockMoving) {
            return
        }
        this.bottomNode.active = false
        this.isBlockMoving = true
    }
    private prepareLanes() {
        this.laneXList.length = 0
        const laneCount = 3
        const mapWidth = this.mapNode.width * 0.8
        this.laneGap = mapWidth / laneCount
        const startX = -mapWidth * 0.5 + this.laneGap * 0.5
        for (let i = 0; i < laneCount; i++) {
            this.laneXList.push(startX + i * this.laneGap)
        }
    }
    private refreshBlockBoundary() {
        if (!this.mapNode) {
            return
        }
        const halfHeight = this.mapNode.height * 0.5
        this.topSpawnY = halfHeight + 120
        this.bottomRecycleY = -halfHeight - 160
    }
    private createOrReuseBlock() {
        let node: cc.Node = null
        if (this.blockPool.size() > 0) {
            node = this.blockPool.get()
        } else {
            node = cc.instantiate(this.blockPre)
        }
        if (!node.parent) {
            node.parent = this.mapNode
        }
        node.active = true
        return node
    }
    private placeBlock(blockNode: cc.Node, y: number, randomLane: boolean) {
        let posX = randomLane ? this.laneXList[this.getRandomInt(0, this.laneXList.length - 1)] : 0
        blockNode.setPosition(posX, y)
        const totalRange = this.topSpawnY - this.bottomRecycleY
        const nearRatio = Math.max(0, Math.min(1, (this.topSpawnY - y) / totalRange))
        // 2D拟3D: 越靠下越“近”，尺寸稍微变大
        blockNode.scale = this.blockSpawnExtraScale + nearRatio * 0.55
    }
    private respawnBlockAtTop(blockNode: cc.Node) {
        this.placeBlock(blockNode, this.topSpawnY, true)
    }
    private clearAllBlocks() {
        for (let i = 0; i < this.activeBlocks.length; i++) {
            const node = this.activeBlocks[i]
            if (node && node.isValid) {
                node.removeFromParent(false)
                this.blockPool.put(node)
            }
        }
        this.activeBlocks.length = 0
    }
    protected update(dt: number): void {
        if (!this.isBlockMoving || this.activeBlocks.length <= 0) {
            return
        }
        for (let i = 0; i < this.activeBlocks.length; i++) {
            const blockNode = this.activeBlocks[i]
            if (!blockNode || !blockNode.isValid) {
                continue
            }
            blockNode.y -= this.blockFallSpeed * dt
            if (blockNode.y <= this.bottomRecycleY) {
                this.respawnBlockAtTop(blockNode)
                continue
            }
            const totalRange = this.topSpawnY - this.bottomRecycleY
            const nearRatio = Math.max(0, Math.min(1, (this.topSpawnY - blockNode.y) / totalRange))
            blockNode.scale = this.blockSpawnExtraScale + nearRatio * 0.55
        }
    }
    private cashoutFunc() {
        console.log('跳转');
        this.canPlayMusic && cc.audioEngine.play(RESSpriteFrame.instance.clickAudioClip, false, 1)
        PlayerAdSdk.gameEnd()
        PlayerAdSdk.jumpStore()
    }
    protected onDisable(): void {
        if (this.bgNode) {
            this.bgNode.off(cc.Node.EventType.TOUCH_START, this.onFingerTap, this)
        }
        this.clearAllBlocks()
    }
}   
