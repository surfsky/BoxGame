import { Scene } from 'phaser';
import { View } from '../controls/overlays/View';
import { Button } from '../controls/buttons/Button';
import { TestScene } from './TestScene';

export class TestView extends TestScene {
    constructor() {
        super({ key: 'TestView' });
    }

    create() {
        this.createTitle("视图");

        // 创建测试按钮
        const buttons = [
            { text: '基础视图', handler: () => this.showBasicView() },
            { text: '多级视图', handler: () => this.showMultiLevelView() },
            { text: '禁用右滑', handler: () => this.showNoSwipeView() },
        ];

        buttons.forEach((button, index) => {
            const btn = new Button(this, this.cameras.main.centerX, 150 + index * 80, button.text, {
                width: 200,
                height: 50,
                bgColor: 0x6c5ce7
            });
            btn.on('click', button.handler);
        });
    }

    private showBasicView() {
        const view = new View(this, {
            backgroundColor: 0xf8f9fa
        });

        // 添加标题
        const title = this.add.text(this.cameras.main.centerX, 50, '基础视图', {
            fontSize: '32px',
            color: '#000'
        }).setOrigin(0.5);

        // 添加说明文本
        const description = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 
            '这是一个基础视图示例\n向右滑动可以返回', {
            fontSize: '24px',
            color: '#000',
            align: 'center'
        }).setOrigin(0.5);

        view.addChild([title, description]);
        view.show();
    }

    private showMultiLevelView() {
        const createLevelView = (level: number) => {
            const view = new View(this, {
                backgroundColor: 0xf8f9fa
            });

            const title = this.add.text(this.cameras.main.centerX, 50, `第 ${level} 级视图`, {
                fontSize: '32px',
                color: '#000'
            }).setOrigin(0.5);

            const description = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 
                '这是一个多级视图示例\n向右滑动可以返回上一级', {
                fontSize: '24px',
                color: '#000',
                align: 'center'
            }).setOrigin(0.5);

            if (level < 3) {
                const nextButton = new Button(this, this.cameras.main.centerX, this.cameras.main.centerY + 50, 
                    '进入下一级', {
                    width: 200,
                    height: 50,
                    bgColor: 0x6c5ce7
                });
                nextButton.on('click', () => createLevelView(level + 1));
                view.addChild([title, description, nextButton]);
            } else {
                view.addChild([title, description]);
            }

            view.show();
        };

        createLevelView(1);
    }

    private showNoSwipeView() {
        const view = new View(this, {
            backgroundColor: 0xf8f9fa,
            swipeBackEnabled: false
        });

        // 添加标题
        const title = this.add.text(this.cameras.main.centerX, 50, '禁用右滑视图', {
            fontSize: '32px',
            color: '#000'
        }).setOrigin(0.5);

        // 添加说明文本
        const description = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 
            '这个视图禁用了右滑返回功能\n需要通过按钮返回', {
            fontSize: '24px',
            color: '#000',
            align: 'center'
        }).setOrigin(0.5);

        // 添加返回按钮
        const backButton = new Button(this, this.cameras.main.centerX, this.cameras.main.centerY + 50, 
            '返回', {
            width: 200,
            height: 50,
            bgColor: 0x6c5ce7
        });
        backButton.on('click', () => view.hide());

        view.addChild([title, description, backButton]);
        view.show();
    }
}