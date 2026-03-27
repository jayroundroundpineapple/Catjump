import Utils from "./Utils";

/**
 * 文本动态变化类
 */
export default class MoneyChange {
    /**绑定的文本 */
    public lable: cc.Label;
    /**数量 */
    public count: number;
    public name: string;
    isValid: boolean;
    /**金币前缀 */
    private _prefix: string = "";
    private decimal: boolean = false;

    public maxCount: number;
    public constructor(lable: cc.Label, decimal: boolean = false, count = 0) {
        this.lable = lable;
        this.count = count;
        this.decimal = decimal;
    }

    public setData(maxCount: number): void {
        this.maxCount = maxCount;
    }


    public get num(): number {
        return 0;
    }

    /**
     * 动态设置金币增长
     */
    public set num(value: number) {
        // if (!this.lable) {
        //     return;
        // }

        // let cha: number = this.maxCount - this.count;
        // let num: number = Utils.getFloatNum(cha,value);
        // if(this.decimal){
        //     this.lable.string = this._prefix + ((this.count + num)).toFixed(2);
        // }else{
        //     this.lable.string = this._prefix + (Math.floor(this.count + num))
        // }
        // if (value == 1) {
        //     this.count = this.maxCount;
        // }

        if (!this.lable) return;

        // 限制进度不超过100%
        const progress = Math.min(value, 1.0);
        const cha = this.maxCount - this.count;
        const increment = Utils.getFloatNum(cha, progress);
        const currentVal = this.count + increment;

        // 更新显示
        if (this.decimal) {
            this.lable.string = this._prefix + currentVal.toFixed(2);
        } else {
            this.lable.string = this._prefix + Math.floor(currentVal);
        }

        // 完成时同步当前值
        if (progress >= 1.0) {
            this.count = this.maxCount;
        }
    }

    /**设置前缀 */
    public set prefix(string: string) {
        if (string) {
            this._prefix = string;
        }
    }

    public get prefix(): string {
        return this._prefix;
    }


    private tween: cc.Tween;
    /**播放金币增长动画 */
    public play(count: number, time: number, callBack?: Function, thisObj?: any) {
        // this.maxCount = count;
        // if (this.tween) {
        //     this.tween.stop();
        // }
        // this.tween = cc.tween(this).to(time, { num: 1.23 }).start();
        // setTimeout(() => {
        //     callBack && callBack()
        // }, time * 1000)

        this.maxCount = count;
        if (this.tween) this.tween.stop();

        // 计算目标值，使动画在指定时间结束
        const targetValue = 1.23;
        const actualTime = time * (1.0 / targetValue); // 调整实际动画时间

        this.tween = cc.tween(this)
            .to(actualTime, { num: targetValue })
            .call(() => {
                this.count = this.maxCount;
                callBack?.();
            })
            .start();
    }

    /**销毁 */
    public destroy(): boolean {
        if (this.tween) {
            this.tween.stop();
        }
        this.lable = null;
        this.count = null;
        this.maxCount = null;
        return
    }

}