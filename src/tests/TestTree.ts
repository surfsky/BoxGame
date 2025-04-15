import { Tree } from "../controls/data/Tree";
import { TestScene } from "./TestScene";

export class TestTree extends TestScene {
    private tree!: Tree;

    constructor() {
        super('TestTree');
    }

    create() {
        super.createTitle('Tree');
        super.createBaseLine();

        // 创建测试数据
        const testData = {
            name: "Root",
            children: [
                {
                    name: "Group 1",
                    type: "folder",
                    items: [1, 2, 3]
                },
                {
                    name: "Group 2",
                    type: "folder",
                    config: {
                        enabled: true,
                        visible: false
                    }
                },
                {
                    name: "Items",
                    list: [
                        { id: 1, value: "Item 1" },
                        { id: 2, value: "Item 2" },
                        { id: 3, value: "Item 3" }
                    ]
                }
            ]
        };

        // 创建树控件
        this.tree = new Tree(this, 100, 50, 300, 400)
            .setData(testData)
            .onItemClick((node) => {
                console.log('Clicked node:', node);
            });
    }
}