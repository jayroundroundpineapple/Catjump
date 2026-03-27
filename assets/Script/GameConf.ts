export const enum JarType{
    Orange = 0,
    Pink = 1,
    Green = 2
}
export class GameConf{
    /**slot列数 */
    public static SlotColumnNum = 3

    /**slot的行数 */
    public static SlotRowNum = 5

    /**slot显示行数 */
    public static SlotShowRowNum = 3

    /**slot每个item的宽度 */
    public static SlotItemWidth = 120

    /**slot每个item的高度 */
    public static SlotItemHeight = 150

    /**每个slot之间的间隔 */
    public static SlotItemGap = 150

    /**第1个slot的Y坐标 */
    public static SlotFirstY = 300

    /**最后1个slot的Y坐标 */
    public static SlotLastY = -450
}

window['GameConf'] = GameConf