
import { GameModel } from "./GameModel";
import RESSpriteFrame from "./RESSpriteFrame";
import blockItem from "./blockItem";



const { ccclass, property } = cc._decorator;

@ccclass
export default class GameUI extends cc.Component {
    @property(cc.SpriteFrame)
    private bgSpriteFrameArr: cc.SpriteFrame[] = []
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
    private successUI: cc.Node = null

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
    private blockVerticalGap: number = 0
    private laneGap: number = 0
    private blockSpawnExtraScale: number = 0.65
    private isBlockMoving: boolean = false
    private catJumpDuration: number = 0.48
    private catJumpHeight: number = 45
    private catStandOffsetY: number = -50
    private catCurrentBlock: cc.Node = null
    private catNextBlock: cc.Node = null
    private catJumping: boolean = false
    private catJumpElapsed: number = 0
    private catBaseScaleX: number = 1
    private catBaseScaleY: number = 1
    private catScaleInited: boolean = false
    private blockFadeDuration: number = 0.22
    private jumpSuccessCount: number = 0
    private pinkAfterJumpCount: number = 2
    private yellowAfterJumpCount: number = 4
    private successAfterYellowExtraJumps: number = 3
    private hasShownSuccessUI: boolean = false
    private hasFrozenForSuccess: boolean = false
    /** 0:默认, 1:粉色, 2:黄色 */
    private colorStage: number = 0
    /** 跳跃触发低点：初始化时第一个 block 的 y */
    private catJumpTriggerY: number = -200
    /** 当前脚下 block 是否已触发过一次跳跃，防止同一块反复触发 */
    private catTriggeredOnCurrent: boolean = false
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
        this.successUI.active = false
        this.resize()
        this.resolveCatNodeRef()
        this.initStartBlocks()
        this.initCatOnFirstBlock()
        this.updateBgByStage(this.colorStage)
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
        this.blockVerticalGap = span / (this.initialBlockCount + 1)
        for (let i = 0; i < this.initialBlockCount; i++) {
            // 固定中心点间距，后续重生也按同样间距补位
            const y = this.bottomRecycleY + this.blockVerticalGap * (i + 1)
            const blockNode = this.createOrReuseBlock()
            // 第一个block固定在中间列，x = 0
            if (i === 0) {
                this.placeBlock(blockNode, y, false)
                this.catJumpTriggerY = y
            } else {
                this.placeBlock(blockNode, y, true)
            }
            this.applyBlockSkin(blockNode)
            blockNode.name = `block_${i}`
            this.activeBlocks.push(blockNode)
        }
    }
    private resolveCatNodeRef() {
        if (this.catPre && this.catPre.isValid) {
            return
        }
        if (this.mapNode && this.mapNode.parent) {
            const byName = this.mapNode.parent.getChildByName("cat")
            if (byName) {
                this.catPre = byName
            }
        }
    }
    private getTopBlock(): cc.Node {
        let best: cc.Node = null
        let bestY = -Infinity
        for (let i = 0; i < this.activeBlocks.length; i++) {
            const b = this.activeBlocks[i]
            if (!b || !b.isValid) continue
            if (b.y > bestY) {
                bestY = b.y
                best = b
            }
        }
        return best
    }
    private getBlockIndex(node: cc.Node): number {
        if (!node || !node.name) return -1
        const m = node.name.match(/^block_(\d+)$/)
        return m ? Number(m[1]) : -1
    }
    private getBlockByIndex(index: number): cc.Node {
        for (let i = 0; i < this.activeBlocks.length; i++) {
            const b = this.activeBlocks[i]
            if (!b || !b.isValid) continue
            if (this.getBlockIndex(b) === index) {
                return b
            }
        }
        return null
    }
    private getNextBlockFrom(current: cc.Node): cc.Node {
        if (!current) return null
        // 按编号顺序跳：block_0 -> block_1 -> block_2 -> block_0
        const curIdx = this.getBlockIndex(current)
        if (curIdx >= 0 && this.initialBlockCount > 0) {
            const nextIdx = (curIdx + 1) % this.initialBlockCount
            const byIdx = this.getBlockByIndex(nextIdx)
            if (byIdx) {
                return byIdx
            }
        }
        // 兜底：如果名字不规范，保持旧的按高度逻辑
        let candidate: cc.Node = null
        let maxLowerY = -Infinity
        for (let i = 0; i < this.activeBlocks.length; i++) {
            const b = this.activeBlocks[i]
            if (!b || !b.isValid || b === current) continue
            if (b.y < current.y && b.y > maxLowerY) {
                maxLowerY = b.y
                candidate = b
            }
        }
        return candidate || this.getTopBlock()
    }
    private getCatStandPosByBlock(block: cc.Node): cc.Vec2 {
        if (!this.catPre || !this.mapNode || !block) return null
        const parent = this.catPre.parent
        if (!parent) return null
        const halfH = block.height * 0.5 * Math.abs(block.scaleY)
        const inMap = cc.v2(block.x, block.y + halfH + this.catStandOffsetY)
        const world = this.mapNode.convertToWorldSpaceAR(inMap)
        const catHalf = this.catPre.height * 0.5 * Math.abs(this.catPre.scaleY)
        world.y += catHalf
        return parent.convertToNodeSpaceAR(world)
    }
    private initCatOnFirstBlock() {
        this.resolveCatNodeRef()
        if (!this.catPre) return
        if (!this.catScaleInited) {
            this.catBaseScaleX = this.catPre.scaleX
            this.catBaseScaleY = this.catPre.scaleY
            this.catScaleInited = true
        }
        this.catCurrentBlock = this.getBlockByIndex(0) || this.getTopBlock()
        const pos = this.getCatStandPosByBlock(this.catCurrentBlock)
        if (pos) {
            this.catPre.setPosition(pos)
        }
    }
    private updateCatJump(dt: number) {
        this.resolveCatNodeRef()
        if (!this.catPre || this.activeBlocks.length <= 0) return
        if (!this.catCurrentBlock || !this.catCurrentBlock.isValid) {
            this.catCurrentBlock = this.getBlockByIndex(0) || this.getTopBlock()
            this.catTriggeredOnCurrent = false
        }
        // block 静止时不跳，只保持站在当前 block 上
        if (!this.isBlockMoving) {
            const holdPos = this.getCatStandPosByBlock(this.catCurrentBlock)
            if (holdPos) this.catPre.setPosition(holdPos)
            return
        }
        if (!this.catJumping) {
            // 只有当前 block 到达触发低点时才跳
            if (!this.catTriggeredOnCurrent && this.catCurrentBlock.y <= this.catJumpTriggerY) {
                this.catTriggeredOnCurrent = true
                this.catNextBlock = this.getNextBlockFrom(this.catCurrentBlock)
                if (this.catNextBlock && this.catNextBlock !== this.catCurrentBlock) {
                    this.playCurrentBlockFadeOut(this.catCurrentBlock)
                    this.catJumping = true
                    this.catJumpElapsed = 0
                }
            }
            if (!this.catJumping) {
                const holdPos = this.getCatStandPosByBlock(this.catCurrentBlock)
                if (holdPos) this.catPre.setPosition(holdPos)
                return
            }
        }
        const fromPos = this.getCatStandPosByBlock(this.catCurrentBlock)
        const toPos = this.getCatStandPosByBlock(this.catNextBlock)
        if (!fromPos || !toPos) return
        this.catJumpElapsed += dt
        const t = Math.max(0, Math.min(1, this.catJumpElapsed / this.catJumpDuration))
        const groundX = fromPos.x + (toPos.x - fromPos.x) * t
        const groundY = fromPos.y + (toPos.y - fromPos.y) * t
        const hopY = 4 * this.catJumpHeight * t * (1 - t)
        const stretch = 1 + 0.08 * Math.sin(t * Math.PI)
        this.catPre.scaleX = this.catBaseScaleX / Math.sqrt(stretch)
        this.catPre.scaleY = this.catBaseScaleY * stretch
        this.catPre.setPosition(groundX, groundY + hopY)
        if (t >= 1) {
            this.jumpSuccessCount += 1
            this.refreshColorStageByJumpCount()
            this.tryShowSuccessUI()
            this.catCurrentBlock = this.catNextBlock
            this.catNextBlock = null
            this.catJumping = false
            this.catTriggeredOnCurrent = false
            this.catPre.scaleX = this.catBaseScaleX
            this.catPre.scaleY = this.catBaseScaleY
        }
    }
    private tryShowSuccessUI() {
        if (this.hasShownSuccessUI) {
            return
        }
        const target = this.yellowAfterJumpCount + this.successAfterYellowExtraJumps
        if (this.jumpSuccessCount < target) {
            return
        }
        this.freezeForSuccess()
        this.hasShownSuccessUI = true
        if (this.successUI) {
            this.successUI.active = true
        }
    }
    private freezeForSuccess() {
        if (this.hasFrozenForSuccess) {
            return
        }
        this.hasFrozenForSuccess = true
        // 停止后续 block 下落与生成
        this.isBlockMoving = false
        // 停止小猫跳跃并恢复基础缩放
        this.catJumping = false
        this.catNextBlock = null
        this.catJumpElapsed = 0
        if (this.catPre && this.catScaleInited) {
            this.catPre.scaleX = this.catBaseScaleX
            this.catPre.scaleY = this.catBaseScaleY
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
        if (this.isBlockMoving || this.hasShownSuccessUI || this.hasFrozenForSuccess) {
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
        this.topSpawnY = halfHeight + 320
        this.bottomRecycleY = -halfHeight - 80
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
        blockNode.stopAllActions()
        blockNode.opacity = 255
        blockNode.setPosition(posX, y)
        const totalRange = this.topSpawnY - this.bottomRecycleY
        const nearRatio = Math.max(0, Math.min(1, (this.topSpawnY - y) / totalRange))
        // 2D拟3D: 越靠下越“近”，尺寸稍微变大
        blockNode.scale = this.blockSpawnExtraScale + nearRatio * 0.55
    }
    private playCurrentBlockFadeOut(blockNode: cc.Node) {
        if (!blockNode || !blockNode.isValid) return
        blockNode.stopAllActions()
        blockNode.runAction(cc.fadeTo(this.blockFadeDuration, 0))
    }
    private respawnBlockAtTop(blockNode: cc.Node) {
        const topBlock = this.getTopBlock()
        const nextY = topBlock ? (topBlock.y + this.blockVerticalGap) : this.topSpawnY
        this.placeBlock(blockNode, nextY, true)
        this.applyBlockSkin(blockNode)
    }
    private applyBlockSkin(blockNode: cc.Node) {
        if (!blockNode || !blockNode.isValid) return
        let item = blockNode.getComponent(blockItem)
        if (!item) {
            item = blockNode.addComponent(blockItem)
        }
        if (this.jumpSuccessCount >= this.yellowAfterJumpCount) {
            item.setYellow(true)
            return
        }
        if (this.jumpSuccessCount >= this.pinkAfterJumpCount) {
            item.setPink(true)
            return
        }
        item.setPink(false)
    }
    private refreshColorStageByJumpCount() {
        let nextStage = 0
        if (this.jumpSuccessCount >= this.yellowAfterJumpCount) {
            nextStage = 2
        } else if (this.jumpSuccessCount >= this.pinkAfterJumpCount) {
            nextStage = 1
        }
        if (nextStage === this.colorStage) {
            return
        }
        this.colorStage = nextStage
        this.updateBgByStage(this.colorStage)
    }
    private updateBgByStage(stage: number) {
        if (!this.bgNode || !this.bgSpriteFrameArr || this.bgSpriteFrameArr.length <= 0) {
            return
        }
        const sp = this.bgNode.getComponent(cc.Sprite)
        if (!sp) {
            return
        }
        // 约定：0=默认，1=粉色，2=黄色（超出范围则忽略）
        if (stage >= 0 && stage < this.bgSpriteFrameArr.length && this.bgSpriteFrameArr[stage]) {
            sp.spriteFrame = this.bgSpriteFrameArr[stage]
        }
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
        this.updateCatJump(dt)
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
