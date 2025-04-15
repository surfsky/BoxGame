import { Scene } from 'phaser';
import { Control } from '../Control';
import { Theme } from '../Theme';
import { Painter } from '../Painter';

export interface ListBoxOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    itemHeight?: number;
    items?: any[];
    textField?: string;
    valueField?: string;
    fontSize?: string;
    textColor?: string;
    backgroundColor?: number;
    hoverColor?: number;
    selectedColor?: number;
    borderRadius?: number;
    multiSelect?: boolean;
}

/**
 * ListBox控件
 * @example
 * var lb = new ListBox(scene, 0, 0, 200, 300).bind(['选项1', '选项2', '选项3']);
 * lb.onChanged((indices, items) => console.log('selected:', indices));
 */
export class ListBox extends Control {
    protected options: ListBoxOptions;
    protected items: any[] = [];
    protected selectedIndices: number[] = [];
    protected itemContainers: Phaser.GameObjects.Container[] = [];

    //-----------------------------------------------------------
    // 事件
    //-----------------------------------------------------------
    protected changedCallback?: (indices: number[], items: any[]) => void;
    public onChanged(callback: (indices: number[], items: any[]) => void): ListBox {
        this.changedCallback = callback;
        return this;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, width: number = 200, height: number = 300, options: ListBoxOptions) {
        super(scene, x, y, width, height);

        // 默认选项
        this.options = {
            itemHeight: 36,
            items: [],
            textField: 'text',
            valueField: 'value',
            fontSize: '16px',
            hoverColor: 0xf5f5f5,
            //textColor: '#333333',
            //backgroundColor: 0xffffff,
            //selectedColor: '#e8f0fe',
            borderRadius: 6,
            multiSelect: false,
            ...options
        };

        this.draw();
        return this;
    }

    /**绘制控件 */
    protected override draw() {
        super.draw();
        const g = this.graphics;
        var bgColor = this.options.backgroundColor?? this.theme.color.bg;
        var borderColor = this.theme.border.color;        

        // 绘制背景
        g.clear();
        g.fillStyle(bgColor, 1);
        g.fillRoundedRect(0, 0, this.width, this.height, this.options.borderRadius);
        g.lineStyle(1, borderColor);
        g.strokeRoundedRect(0, 0, this.width, this.height, this.options.borderRadius);

        // 更新选项
        this.drawItems();
    }

    /**绘制选项 */
    protected drawItems() {
        // 清除旧的选项
        this.itemContainers.forEach(container => container.destroy());
        this.itemContainers = [];
        var selectedColor = this.options.selectedColor ?? this.theme.color.primary;
        var textColor = this.options.textColor?? Theme.toColorText(this.theme.text.color);

        // 创建新的选项
        this.items.forEach((item, index) => {
            const container = this.scene.add.container(0, index * this.options.itemHeight!);
            const text = this.scene.add.text(
                16,
                this.options.itemHeight! / 2,
                typeof item === 'string' ? item : item[this.options.textField!],
                {
                    fontSize: this.options.fontSize,
                    color: textColor,
                    fontFamily: 'Arial, sans-serif'
                }
            );
            text.setOrigin(0, 0.5);

            const bg = this.scene.add.rectangle(
                0,
                0,
                this.width,
                this.options.itemHeight,
                this.selectedIndices.includes(index) ? selectedColor : 0xffffff,
                this.selectedIndices.includes(index) ? 1 : 0
            ).setOrigin(0, 0);

            container.add([bg, text]);
            container.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.options.itemHeight), Phaser.Geom.Rectangle.Contains);

            // 事件处理
            container.on('pointerover', () => {
                if (!this.selectedIndices.includes(index)) {
                    bg.setFillStyle(this.options.hoverColor!, 1);
                }
                text.setColor('#000000');
            });

            container.on('pointerout', () => {
                if (!this.selectedIndices.includes(index)) {
                    bg.setFillStyle(0xffffff, 0);
                }
                text.setColor(textColor);
            });

            container.on('pointerdown', () => {
                this.toggleSelection(index);
            });

            this.itemContainers.push(container);
            this.add(container);
        });
    }

    /**切换选中状态 */
    protected toggleSelection(index: number) {
        const container = this.itemContainers[index];
        const bg = container.list[0] as Phaser.GameObjects.Rectangle;
        var selectedColor = this.options.selectedColor ?? this.theme.color.primary;
        var textColor = this.options.textColor?? Theme.toColorText(this.theme.text.color);

        if (this.options.multiSelect) {
            const idx = this.selectedIndices.indexOf(index);
            if (idx === -1) {
                this.selectedIndices.push(index);
                // 添加选中动画
                this.scene.tweens.add({
                    targets: bg,
                    fillColor: { from: 0xffffff, to: selectedColor },
                    fillAlpha: { from: 0, to: 1 },
                    duration: 200,
                    ease: 'linear'
                });
            } else {
                this.selectedIndices.splice(idx, 1);
                // 取消选中动画
                this.scene.tweens.add({
                    targets: bg,
                    fillColor: { from: selectedColor, to: 0xffffff },
                    fillAlpha: { from: 1, to: 0 },
                    duration: 200,
                    ease: 'Power2'
                });
            }
        } else {
            // 清除之前选中项的动画
            this.selectedIndices.forEach(oldIndex => {
                if (oldIndex !== index) {
                    const oldContainer = this.itemContainers[oldIndex];
                    const oldBg = oldContainer.list[0] as Phaser.GameObjects.Rectangle;
                    this.scene.tweens.add({
                        targets: oldBg,
                        fillColor: { from: selectedColor, to: 0xffffff },
                        fillAlpha: { from: 1, to: 0 },
                        duration: 200,
                        ease: 'Power2'
                    });
                }
            });

            this.selectedIndices = [index];
            // 新选中项动画
            this.scene.tweens.add({
                targets: bg,
                fillColor: { from: 0xffffff, to: selectedColor },
                fillAlpha: { from: 0, to: 1 },
                duration: 200,
                ease: 'Power2'
            });
        }

        // 触发事件
        if (this.changedCallback) {
            const selectedItems = this.selectedIndices.map(i => this.items[i]);
            this.changedCallback(this.selectedIndices, selectedItems);
        }
    }

    /**绑定数据 */
    public bind(items: any[], valueField?: string, textField?: string): ListBox {
        this.items = items;
        if (textField) this.options.textField = textField;
        if (valueField) this.options.valueField = valueField;
        this.selectedIndices = [];
        this.draw();
        return this;
    }

    /**设置多选模式 */
    public setMultiSelect(value: boolean): ListBox {
        this.options.multiSelect = value;
        return this;
    }

    /**获取选中项 */
    public getSelectedItems(): any[] {
        return this.selectedIndices.map(i => this.items[i]);
    }

    /**获取选中索引 */
    public getSelectedIndices(): number[] {
        return [...this.selectedIndices];
    }

    /**清除选择 */
    public clearSelection(): ListBox {
        this.selectedIndices = [];
        this.draw();
        return this;
    }
}