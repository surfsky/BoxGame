import { Scene } from 'phaser';
import { TestScene } from './TestScene';
import { Tag } from '../controls/basic/Tag';

export class TestTag extends TestScene {
    constructor() {
        super({ key: 'TestTag' });
    }

    create() {
        this.createTitle("Tag标签");
        this.createBaseLine();

        // 垂直布局显示标签
        const startY = 150;
        const spacing = 50;

        new Tag(this, 100, startY + (0 * spacing), "默认标签", {});
        new Tag(this, 100, startY + (1 * spacing), "成功", { bgColor: 0x2ecc71, radius: 6 });
        new Tag(this, 100, startY + (2 * spacing), "警告", { bgColor: 0xf1c40f, radius: 8 });
        new Tag(this, 100, startY + (3 * spacing), "错误", { bgColor: 0xe74c3c, textStyle: { fontSize: '16px' } });
        new Tag(this, 100, startY + (4 * spacing), "自定义", {
            bgColor: 0x9b59b6,
            textColor: 0xffd700,
            radius: 10,
            textStyle: { fontSize: '18px', fontStyle: 'bold' }
        });
        new Tag(this, 100, startY + (5 * spacing), "99", {
            bgColor: 0xff0000,
            textColor: 0xffffff,
            height: 20,
            radius: 10,
            textStyle: { fontSize: '12px', fontStyle: 'bold' }
        });
        new Tag(this, 100, startY + (6 * spacing), "8", {
            bgColor: 0xff0000,
            textColor: 0xffffff,
            height: 20,
            radius: 10,
            textStyle: { fontSize: '12px', fontStyle: 'bold' }
        });



        /*
        // 创建不同样式的标签
        const tags = [
            { text: "默认标签", options: {} },
            { text: "成功", options: { bgColor: 0x2ecc71, radius: 6 } },
            { text: "警告", options: { bgColor: 0xf1c40f, radius: 8 } },
            { text: "错误", options: { bgColor: 0xe74c3c, textStyle: { fontSize: '16px' } } },
            { text: "自定义", options: { 
                bgColor: 0x9b59b6,
                textColor: 0xffd700,
                radius: 10,
                padding: 12,
                textStyle: { fontSize: '18px', fontStyle: 'bold' }
            }},
            { text: "99", options: { 
                bgColor: 0xff0000,
                textColor: 0xffffff,
                height: 20,
                radius: 10,
                padding: 4,
                textStyle: { fontSize: '12px', fontStyle: 'bold' }
            }}
        ];

        tags.forEach((tagConfig, index) => {
            const tag = new Tag(
                this,
                100,
                startY + (index * spacing),
                tagConfig.text,
                tagConfig.options
            );
        });
        /*/
    }
}