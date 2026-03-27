import { GameConf } from "../GameConf";
import slotItem from "./slotItem";
const { ccclass, property } = cc._decorator;
/**
 * Slot 转轮组件
 * 可以挂载在单个 slot 列节点上，管理该列的旋转动画
 */
@ccclass
export default class SlotReel extends cc.Component {
    @property(cc.Prefab)
    private slotItemPre: cc.Prefab = null;  
    
    @property({
        tooltip: "初始显示的 spriteIndex 数组（从上到下）"
    })
    private initialSpriteIndices: number[] = [0, 1, 2, 3, 4];
    
    // 内部状态
    private slotItemArr: cc.Node[] = [];  // 该列的 item 数组
    private isSpinning: boolean = false;  // 是否正在旋转
    private currentTween: cc.Tween = null;  // 当前动画 tween
    private targetSpriteId: number = -1;  // 目标 spriteId
    private currentSpeed: number = 0.5;  // 当前速度（duration）
    private minSpeed: number = 0.05;  // 最快速度
    private maxSpeed: number = 0.5;  // 最慢速度
    private speedChangeStep: number = 0.01;  // 速度变化步长
    
    // 回调函数
    private onStopCallback: (spriteId: number) => void = null;  // 停止回调
    
    protected onLoad(): void {
        this.initSlotReel();
    }
    
    /**
     * 初始化 slot 转轮
     */
    private initSlotReel(): void {
        this.slotItemArr = [];
        this.node.removeAllChildren();
        for (let j = 0; j < GameConf.SlotRowNum; j++) {
            let slotItemNode = cc.instantiate(this.slotItemPre);
            slotItemNode.parent = this.node;
            let slotItemComp = slotItemNode.getComponent(slotItem);
            let spriteIndex = this.initialSpriteIndices[j] || j;
            slotItemComp.initItem(spriteIndex);
            slotItemNode.setPosition(0, GameConf.SlotFirstY - j * GameConf.SlotItemHeight);
            this.slotItemArr.push(slotItemNode);
        }
    }
    /**
     * 启动转轮
     * @param targetSpriteId 目标 spriteId，如果不传则随机
     * @param onStop 停止后的回调函数
     */
    public startSpin(targetSpriteId?: number, onStop?: (spriteId: number) => void): void {
        if (this.isSpinning) {
            return;
        }
        
        this.isSpinning = true;
        this.onStopCallback = onStop;
        
        // 设置目标 spriteId（如果未指定则随机）
        if (targetSpriteId === undefined || targetSpriteId < 0) {
            targetSpriteId = this.getRandomInt(0, 4);  // 假设有 5 种 sprite（0-4）
        }
        this.targetSpriteId = targetSpriteId;
        
        // 停止所有现有动画
        this.stopAllAnimations();
        
        // 启动动画
        this.startColumnAnimation();
    }
    
    /**
     * 停止转轮
     */
    public stopSpin(): void {
        if (!this.isSpinning) {
            return;
        }
        this.stopAllAnimations();
        this.stopColumn();
    }
    
    /**
     * 是否正在旋转
     */
    public getIsSpinning(): boolean {
        return this.isSpinning;
    }
    
    /**
     * 获取当前显示区域中心的 spriteId
     */
    public getCenterSpriteId(): number {
        let displayCenterY = 0;
        let centerItem = this.getItemAtY(displayCenterY);
        if (centerItem) {
            let comp = centerItem.getComponent(slotItem);
            if (comp) {
                return comp.spriteIndex;
            }
        }
        return -1;
    }
    
    /**
     * 启动列动画
     */
    private startColumnAnimation(): void {
        // 计算需要移动的次数（加速阶段 + 匀速阶段 + 减速阶段）
        let speedUpSteps = 8;  // 加速阶段步数
        let constantSteps = 12 + this.getRandomInt(5, 15);  // 匀速阶段步数（随机增加变化）
        let slowDownSteps = 8;  // 减速阶段步数
        
        // 计算需要额外移动的步数，确保停止时显示区域中心的 item 有正确的 spriteIndex
        let extraSteps = this.calculateExtraSteps(this.targetSpriteId);
        let totalSteps = speedUpSteps + constantSteps + slowDownSteps + extraSteps;
        
        // 开始动画
        this.doSlotAnimWithSpeed(0, totalSteps, speedUpSteps, slowDownSteps);
    }
    
    /**
     * 计算需要额外移动的步数，使显示区域中心的 item 有指定的 spriteIndex
     */
    private calculateExtraSteps(targetSpriteId: number): number {
        // 显示区域中心 Y 坐标（根据配置，显示 3 行，中心在 0）
        let displayCenterY = 0;
        
        // 找到当前最接近显示区域中心的 item
        let centerItem = this.getItemAtY(displayCenterY);
        if (!centerItem) {
            return 0;
        }
        
        // 找到目标 spriteIndex 的 item
        let targetItem = null;
        for (let i = 0; i < this.slotItemArr.length; i++) {
            let item = this.slotItemArr[i];
            let comp = item.getComponent(slotItem);
            if (comp && comp.spriteIndex === targetSpriteId) {
                targetItem = item;
                break;
            }
        }
        
        if (!targetItem) {
            return 0;
        }
        
        // 计算需要移动的距离（向上移动，y 值减小）
        let centerY = centerItem.y;
        let targetY = targetItem.y;
        
        // 如果 targetItem 在 centerItem 下方，需要多转一圈
        if (targetY > centerY) {
            // targetItem 在上方，直接计算步数
            let steps = Math.ceil((targetY - centerY) / GameConf.SlotItemHeight);
            return steps;
        } else {
            if (targetY == centerY) return 0;
            // targetItem 在下方，需要移动 (5 个 item 的高度) + (centerY - targetY)
            let steps = Math.ceil((GameConf.SlotItemHeight * GameConf.SlotRowNum + (centerY - targetY)) / GameConf.SlotItemHeight);
            return steps;
        }
    }
    
    /**
     * 获取指定 Y 坐标位置的 item
     */
    private getItemAtY(y: number): cc.Node {
        let minDist = Infinity;
        let closestItem = null;
        for (let i = 0; i < this.slotItemArr.length; i++) {
            let item = this.slotItemArr[i];
            let dist = Math.abs(item.y - y);
            if (dist < minDist) {
                minDist = dist;
                closestItem = item;
            }
        }
        return closestItem;
    }
    
    /**
     * 带速度变化的 slot 动画
     */
    private doSlotAnimWithSpeed(currentStep: number, totalSteps: number, speedUpSteps: number, slowDownSteps: number): void {
        if (!this.isSpinning) {
            return;
        }
        
        // 计算当前速度
        let speed = this.maxSpeed;
        if (currentStep < speedUpSteps) {
            // 加速阶段：从慢到快
            let progress = currentStep / speedUpSteps;
            speed = this.maxSpeed - (this.maxSpeed - this.minSpeed) * progress;
        } else if (currentStep >= totalSteps - slowDownSteps) {
            // 减速阶段：从快到慢
            let progress = (currentStep - (totalSteps - slowDownSteps)) / slowDownSteps;
            speed = this.minSpeed + (this.maxSpeed - this.minSpeed) * progress;
        } else {
            // 匀速阶段
            speed = this.minSpeed;
        }
        
        this.currentSpeed = speed;
        
        // 同步移动该列的所有 item
        let completedCount = 0;
        let itemCount = this.slotItemArr.length;
        
        for (let j = 0; j < itemCount; j++) {
            let node = this.slotItemArr[j];
            cc.tween(node)
                .by(speed, { y: -GameConf.SlotItemHeight })
                .call(() => {
                    if (node.y <= GameConf.SlotLastY) {
                        // 回到第一个位置，并更新 spriteIndex（循环）
                        // 确保位置精确对齐到网格
                        node.setPosition(0, GameConf.SlotFirstY);
                        this.updateItemSpriteIndex(node);
                    }
                    
                    // 所有 item 移动完成后，继续下一步
                    completedCount++;
                    if (completedCount >= itemCount) {
                        let nextStep = currentStep + 1;
                        if (nextStep >= totalSteps) {
                            // 停止该列
                            this.stopColumn();
                        } else {
                            this.doSlotAnimWithSpeed(nextStep, totalSteps, speedUpSteps, slowDownSteps);
                        }
                    }
                })
                .start();
        }
    }
    
    /**
     * 更新 item 的 spriteIndex（循环）
     */
    private updateItemSpriteIndex(node: cc.Node): void {
        let comp = node.getComponent(slotItem);
        if (comp) {
            let currentIdx = comp.spriteIndex;
            let nextIdx = (currentIdx + 1) % 5;  // 假设有 5 种 sprite（0-4）
            comp.initItem(nextIdx);
        }
    }
    
    /**
     * 停止列
     */
    private stopColumn(): void {
        this.isSpinning = false;
        
        // 停止该列的所有动画
        this.stopAllAnimations();
        
        // 精确调整位置，确保显示区域的 item 有正确的 spriteIndex
        this.adjustColumnPosition(this.targetSpriteId);
        
        // 调用停止回调
        if (this.onStopCallback) {
            this.onStopCallback(this.targetSpriteId);
        }
    }
    
    /**
     * 精确调整列的位置
     */
    private adjustColumnPosition(targetSpriteId: number): void {
        // 显示区域中心 Y 坐标
        let displayCenterY = 0;
        
        // 找到目标 spriteIndex 的 item
        let targetItem = null;
        for (let i = 0; i < this.slotItemArr.length; i++) {
            let item = this.slotItemArr[i];
            let itemComp = item.getComponent(slotItem);
            if (itemComp && itemComp.spriteIndex === targetSpriteId) {
                targetItem = item;
                break;
            }
        }
        
        if (!targetItem) {
            return;
        }
        
        // 计算需要调整的偏移量，使目标 item 移动到显示区域中心
        let offset = targetItem.y - displayCenterY;
        
        // 调整该列所有 item 的位置
        for (let i = 0; i < this.slotItemArr.length; i++) {
            let item = this.slotItemArr[i];
            item.y -= offset;
        }
        
        // 对齐所有 item 到正确的网格位置（300, 150, 0, -150, -300）
        this.alignItemsToGrid();
    }
    
    /**
     * 将所有 item 对齐到网格位置
     */
    private alignItemsToGrid(): void {
        // 标准网格位置：300, 150, 0, -150, -300
        // 根据 item 的当前 y 坐标，找到最接近的标准位置
        
        // 先按 y 坐标排序 item（从大到小），并记录原始索引
        let itemsWithIndex = this.slotItemArr.map((item, index) => ({
            item: item,
            index: index,
            y: item.y
        }));
        itemsWithIndex.sort((a, b) => b.y - a.y);
        
        // 标准位置数组（从大到小）：300, 150, 0, -150, -300
        let standardPositions = [];
        for (let i = 0; i < GameConf.SlotRowNum; i++) {
            standardPositions.push(GameConf.SlotFirstY - i * GameConf.SlotItemHeight);
        }
        
        // 将每个 item 对齐到对应的标准位置
        for (let i = 0; i < itemsWithIndex.length && i < standardPositions.length; i++) {
            itemsWithIndex[i].item.y = standardPositions[i];
        }
    }
    
    /**
     * 停止所有动画
     */
    private stopAllAnimations(): void {
        for (let j = 0; j < this.slotItemArr.length; j++) {
            cc.Tween.stopAllByTarget(this.slotItemArr[j]);
        }
    }
    
    /**
     * 获取随机整数
     */
    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    protected onDisable(): void {
        this.stopAllAnimations();
    }
}
