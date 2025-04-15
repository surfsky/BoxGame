import { Scene } from 'phaser';
import { Button } from '../controls/buttons/Button';
import { TestScene } from './TestScene';
import { Tooltip } from '../controls/overlays/Tooltip';

export class TestTooltip extends TestScene {
    constructor() {
        super({ key: 'TestTooltip' });
    }

    create() {
        this.createTitle("Tooltip提示");

        // 创建四个按钮来测试不同位置的Tooltip
        const positions = ['top', 'bottom', 'left', 'right'];
        const buttonSize = { width: 120, height: 40 };
        const spacing = 150;

        positions.forEach((pos, index) => {
            const button = new Button(this, 
                this.cameras.main.centerX + (index % 2 === 0 ? -spacing : spacing),
                this.cameras.main.centerY + (index < 2 ? -spacing : spacing),
                pos,
                {
                    width: buttonSize.width,
                    height: buttonSize.height,
                    bgColor: 0x3498db
                }
            );

            // 创建固定位置的Tooltip
            const tooltip = new Tooltip(this, 0, 0, `这是一个${pos}位置的Tooltip`, {
                position: pos,
                target: button
            });
            tooltip.hide();

            // 添加鼠标事件
            button.setInteractive();
            button.on('pointerover', () => tooltip.show());
            button.on('pointerout', () => tooltip.hide());
        });

        // 创建一个测试自动定位的按钮
        const autoButton = new Button(this, 
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Auto',
            {
                width: buttonSize.width,
                height: buttonSize.height,
                bgColor: 0xe74c3c
            }
        );

        // 创建自动定位的Tooltip
        const autoTooltip = new Tooltip(this, 0, 0, '这是一个自动定位的Tooltip', {
            position: 'auto',
            target: autoButton
        });
        autoTooltip.hide();

        // 添加鼠标事件
        autoButton.setInteractive();
        autoButton.on('pointerover', () => autoTooltip.show());
        autoButton.on('pointerout', () => autoTooltip.hide());
    }
}