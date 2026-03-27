import { GameConf } from "./GameConf";
import GameUI from "./GameUI";

export interface BoxItem {
   boxType:number,
   capacity:number,
   nowIndex:number,
   isFull:boolean,
   posArr:cc.Vec3[],
   isLock:boolean
}
export interface floorData {
    
}
export let mGame:GameUI = null
export class GameModel {
    public boxData: BoxItem[] = []
    public mGame:GameUI = null

    public initBoxData() {
        let lockArr = [false,false,true]
        for (let i = 0; i < GameConf.BoxNum; i++) {
            if (!this.boxData[i]) {
                this.boxData[i] = {
                    boxType: i,
                    capacity: GameConf.BoxCapacity,
                    nowIndex: 0,
                    isFull: false,
                    posArr: [cc.v3(GameConf.BoxJarX, GameConf.BoxJarY),
                    cc.v3(GameConf.BoxJarX + GameConf.BoxJarXGap, GameConf.BoxJarY),
                    cc.v3(GameConf.BoxJarX, GameConf.BoxJarY - GameConf.BoxJarYGap),
                    cc.v3(GameConf.BoxJarX + GameConf.BoxJarXGap, GameConf.BoxJarY - GameConf.BoxJarYGap),
                    cc.v3(GameConf.BoxJarX, GameConf.BoxJarY - 2 * GameConf.BoxJarYGap),
                    cc.v3(GameConf.BoxJarX + GameConf.BoxJarXGap, GameConf.BoxJarY - 2 * GameConf.BoxJarYGap),
                    ],
                    isLock:lockArr[i]
                }
            }
        }
        return this.boxData
    }

    getData(){
        return this.boxData
    }
}