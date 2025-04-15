import { Control } from '../Control';
import { Button } from '../buttons/Button';
import { Label } from '../basic/Label';
import { GameConfig } from '../../GameConfig';

export interface TitleBarOptions {
    width?: number;
    height?: number;
    title?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    rightButton?: {
        text?: string;
        icon?: string;
        onClick?: () => void;
    };
}

/**
 * 移动端标题栏组件
 * 包含返回按钮、标题文本和可选的右侧操作按钮
 */
export class TitleBar extends Control {
    private backButton?: Button;
    private titleLabel: Label;
    private rightButton?: Button;

    constructor(scene: Phaser.Scene, x: number, y: number, options: TitleBarOptions = {}) {
        super(scene, x, y);

        const {
            width = scene.cameras.main.width,
            height = 44,
            title = '',
            showBackButton = true,
            onBack,
            rightButton
        } = options;

        // 设置背景
        this.setSize(width, height);
        //this.setBackground(0xffffff);

        // 创建返回按钮
        if (showBackButton) {
            this.backButton = new Button(scene, 0, 0, '', {
                width: height,
                height: height,
                icon: GameConfig.icons.back.key,
                iconWidth: 24,
                iconHeight: 24,
                bgColor: 0x00000000
            });
            this.add(this.backButton);
            if (onBack) {
                this.backButton.on('click', onBack);
            }
        }

        // 创建标题文本
        this.titleLabel = new Label(scene, width / 2, height / 2, title, 'h1');
        //this.titleLabel.setOrigin(0.5, 0.5);
        this.add(this.titleLabel);

        // 创建右侧按钮
        if (rightButton) {
            this.rightButton = new Button(scene, width - height, 0, rightButton.text || '', {
                width: height,
                height: height,
                icon: rightButton.icon,
                iconWidth: 24,
                iconHeight: 24,
                iconPosition: 'left',
                bgColor: 0x00000000,
                fontSize: '14px',
                textColor: '#000000',
            });
            this.add(this.rightButton);
            if (rightButton.onClick) {
                this.rightButton.on('click', rightButton.onClick);
            }
        }
    }

    /**
     * 设置标题文本
     * @param title 标题文本
     */
    setTitle(title: string) {
        this.titleLabel.setText(title);
        return this;
    }

    /**
     * 设置右侧按钮文本
     * @param text 按钮文本
     */
    setRightButtonText(text: string) {
        if (this.rightButton) {
            this.rightButton.setText(text);
        }
        return this;
    }
}