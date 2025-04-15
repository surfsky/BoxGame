import { Control } from '../Control';
import { Button } from '../buttons/Button';

export interface IconItem {
    key: string;
    text?: string;
    icon: string;
    onClick?: () => void;
}

export interface IconBarOptions {
    width?: number;
    height?: number;
    icons: IconItem[];
    itemWidth?: number;
    itemHeight?: number;
    spacing?: number;
}

/**
 * 移动端图标工具栏组件
 * 可横向排列多个图标按钮
 */
export class IconBar extends Control {
    private buttons: Button[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, options: IconBarOptions) {
        super(scene, x, y);

        const {
            width = scene.cameras.main.width,
            height = 44,
            icons = [],
            itemWidth = 44,
            itemHeight = height,
            spacing = 0
        } = options;

        // 设置背景
        this.setSize(width, height);
        //this.setBackground(0xffffff);

        // 创建图标按钮
        let currentX = 0;
        icons.forEach(icon => {
            const button = new Button(scene, currentX, 0, icon.text || '', {
                width: itemWidth,
                height: itemHeight,
                icon: icon.icon,
                iconWidth: 24,
                iconHeight: 24,
                bgColor: 0x00000000,
                //textStyle: {
                //    fontSize: '12px',
                //    color: '#000000'
                //},
                //layout: icon.text ? 'vertical' : 'center',
                padding: 4
            });

            if (icon.onClick) {
                button.on('click', icon.onClick);
            }

            this.buttons.push(button);
            this.add(button);

            currentX += itemWidth + spacing;
        });
    }

    /**
     * 获取指定键值的按钮
     * @param key 按钮键值
     */
    getButton(key: string): Button | undefined {
        const index = this.buttons.findIndex((_, i) => key === this.buttons[i].name);
        return index >= 0 ? this.buttons[index] : undefined;
    }

    /**
     * 设置指定按钮的文本
     * @param key 按钮键值
     * @param text 按钮文本
     */
    setButtonText(key: string, text: string) {
        const button = this.getButton(key);
        if (button) {
            button.setText(text);
        }
        return this;
    }

    /**
     * 设置指定按钮的图标
     * @param key 按钮键值
     * @param icon 图标键值
     */
    setButtonIcon(key: string, icon: string) {
        const button = this.getButton(key);
        if (button) {
            button.setIcon(icon);
        }
        return this;
    }
}