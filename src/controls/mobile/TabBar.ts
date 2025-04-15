import { Control } from '../Control';
import { Button } from '../buttons/Button';

export interface TabItem {
    key: string;
    text: string;
    icon?: string;
}

export interface TabBarOptions {
    width?: number;
    height?: number;
    tabs: TabItem[];
    activeIndex?: number;
    onChange?: (index: number, tab: TabItem) => void;
}

/**
 * 移动端底部标签栏组件
 * 支持多个标签页切换，每个标签可以包含图标和文本
 */
export class TabBar extends Control {
    private tabs: TabItem[];
    private buttons: Button[] = [];
    private activeIndex: number;
    private onChange?: (index: number, tab: TabItem) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, options: TabBarOptions) {
        super(scene, x, y);

        const {
            width = scene.cameras.main.width,
            height = 50,
            tabs = [],
            activeIndex = 0,
            onChange
        } = options;

        this.tabs = tabs;
        this.activeIndex = activeIndex;
        this.onChange = onChange;

        // 设置背景
        this.setSize(width, height);
        //this.setBackground(0xffffff);

        // 创建标签按钮
        const tabWidth = width / tabs.length;
        tabs.forEach((tab, index) => {
            const button = new Button(scene, tabWidth * index, 0, tab.text, {
                width: tabWidth,
                height: height,
                icon: tab.icon,
                iconWidth: 24,
                iconHeight: 24,
                iconPosition: 'top',
                bgColor: 0x00000000,
                textColor: '#666666',
                fontSize: '12px',
                padding: 4
            });

            button.on('click', () => this.setActiveIndex(index));
            this.buttons.push(button);
            this.add(button);
        });

        // 设置初始激活状态
        this.setActiveIndex(activeIndex);
    }

    /**
     * 设置当前激活的标签索引
     * @param index 标签索引
     */
    setActiveIndex(index: number) {
        if (index === this.activeIndex) return;

        // 更新按钮样式
        this.buttons.forEach((button, i) => {
            const isActive = i === index;
            if (button.label) {
                button.label.setStyle({
                    color: isActive ? '#000000' : '#666666',
                    fontWeight: isActive ? 'bold' : 'normal'
                });
            }
        });

        this.activeIndex = index;
        if (this.onChange) {
            this.onChange(index, this.tabs[index]);
        }

        return this;
    }

    /**
     * 获取当前激活的标签索引
     */
    getActiveIndex(): number {
        return this.activeIndex;
    }

    /**
     * 获取当前激活的标签项
     */
    getActiveTab(): TabItem {
        return this.tabs[this.activeIndex];
    }
}