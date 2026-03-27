import { LanguageFont } from "./language/LanguageFont";

const { ccclass, property } = cc._decorator;
enum FontType {
    Medium = 0,
    MuseoSansRounded900 = 1
}
@ccclass
export default class NodeAutoSetup extends cc.Component {
    @property({
        type: cc.Enum(FontType),
        tooltip: CC_DEV && '选择显示文本的字体类型',
        displayName: '字体类型'
    })
    fontIndex: FontType = FontType.Medium;

    @property({
        tooltip: '节点名称前缀，例如"lb"'
    })
    nodePrefix: string = 'lb';

    onLoad() {
        // 在场景加载完成后执行自动设置
        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.setupLanguageComponents, this);
    }

    start() {
        this.setupLanguageComponents();
    }

    setupLanguageComponents() {
        const root = cc.director.getScene();
        this.findAndSetupNodes(root);
    }

    findAndSetupNodes(parent: cc.Node) {
        parent.children.forEach(node => {
            if (node.name.startsWith(this.nodePrefix)) {
                if (!node.getComponent(LanguageFont)) {
                    node.addComponent(LanguageFont);
                    let item = node.getComponent(LanguageFont)
                    item.initFont(this.fontIndex)
                }
            }
            
            // 递归处理子节点
            this.findAndSetupNodes(node);
        });
    }
}
