import Phaser from 'phaser';
import { Control } from '../Control';
import { Bounds } from 'matter';

/**
 * Tooltip控件配置项
 */
export interface TooltipOptions {
    /** 背景颜色 */
    bgColor?: number;
    /** 文本颜色 */
    textColor?: string;
    /** 字体大小 */
    fontSize?: string;
    /** 内边距 */
    padding?: number;
    /** 圆角半径 */
    radius?: number;
    /** 箭头大小 */
    arrowSize?: number;
    /** 显示位置，可选值：'auto' | 'top' | 'bottom' | 'left' | 'right' */
    position?: string;
    /** 目标控件（当position为auto时使用） */
    target?: Phaser.GameObjects.GameObject;
}

/**
 * Tooltip控件 - 提供文本提示功能
 */
export class Tooltip extends Control {
    private text: Phaser.GameObjects.Text;
    private options: TooltipOptions;
    private defaultOptions: TooltipOptions = {
        bgColor: 0x333333,
        textColor: '#ffffff',
        fontSize: '14px',
        padding: 8,
        radius: 4,
        arrowSize: 6,
        position: 'auto'
    };

    constructor(scene: Phaser.Scene, x: number, y: number, content: string, options: TooltipOptions = {}) {
        super(scene, x, y);
        this.options = { ...this.defaultOptions, ...options };

        // 创建文本
        this.text = scene.add.text(0, 0, content, {
            fontSize: this.options.fontSize,
            color: this.options.textColor,
            padding: { x: this.options.padding, y: this.options.padding }
        });
        this.add(this.text);

        // 设置容器大小
        this.setSize(this.text.width + this.options.padding! * 2, 
                    this.text.height + this.options.padding! * 2);

        // 绘制背景
        this.draw();

        // 设置深度确保显示在其他控件上方
        this.setDepth(9999);

        // 如果指定了目标控件，则自动计算位置
        if (this.options.target && this.options.position === 'auto') {
            this.updatePosition();
        }
    }

    protected override draw() {
        super.draw();
        this.graphics.clear();

        // 绘制背景
        this.graphics.fillStyle(this.options.bgColor!, 1);
        this.graphics.fillRoundedRect(0, 0, this.width, this.height, this.options.radius);

        // 根据位置绘制箭头
        if (this.options.target) {
            this.drawArrow();
        }
    }

    private drawArrow() {
        const arrowSize = this.options.arrowSize!;
        this.graphics.beginPath();

        switch (this.options.position) {
            case 'top':
                this.graphics.moveTo(this.width / 2 - arrowSize, this.height);
                this.graphics.lineTo(this.width / 2, this.height + arrowSize);
                this.graphics.lineTo(this.width / 2 + arrowSize, this.height);
                break;
            case 'bottom':
                this.graphics.moveTo(this.width / 2 - arrowSize, 0);
                this.graphics.lineTo(this.width / 2, -arrowSize);
                this.graphics.lineTo(this.width / 2 + arrowSize, 0);
                break;
            case 'left':
                this.graphics.moveTo(this.width, this.height / 2 - arrowSize);
                this.graphics.lineTo(this.width + arrowSize, this.height / 2);
                this.graphics.lineTo(this.width, this.height / 2 + arrowSize);
                break;
            case 'right':
                this.graphics.moveTo(0, this.height / 2 - arrowSize);
                this.graphics.lineTo(-arrowSize, this.height / 2);
                this.graphics.lineTo(0, this.height / 2 + arrowSize);
                break;
        }

        this.graphics.closePath();
        this.graphics.fillPath();
    }

    /**
     * 更新Tooltip位置
     */
    private updatePosition() {
        if (!this.options.target) return;

        var targetBounds : Phaser.Geom.Rectangle;
        if (!(this.options.target as any).getBounds){
            return;
        }
        targetBounds = (this.options.target as any).getBounds() as Phaser.Geom.Rectangle;

        const positions = ['top', 'bottom', 'left', 'right'];
        let bestPosition = 'top';
        let maxSpace = 0;

        // 计算每个方向的可用空间
        positions.forEach(pos => {
            let space = 0;
            switch (pos) {
                case 'top':
                    space = targetBounds.y;
                    break;
                case 'bottom':
                    space = this.scene.cameras.main.height - (targetBounds.y + targetBounds.height);
                    break;
                case 'left':
                    space = targetBounds.x;
                    break;
                case 'right':
                    space = this.scene.cameras.main.width - (targetBounds.x + targetBounds.width);
                    break;
            }
            if (space > maxSpace) {
                maxSpace = space;
                bestPosition = pos;
            }
        });

        // 设置最佳位置
        this.options.position = bestPosition;

        // 根据位置更新坐标
        switch (bestPosition) {
            case 'top':
                this.setPosition(
                    targetBounds.x + targetBounds.width / 2 - this.width / 2,
                    targetBounds.y - this.height - this.options.arrowSize!
                );
                break;
            case 'bottom':
                this.setPosition(
                    targetBounds.x + targetBounds.width / 2 - this.width / 2,
                    targetBounds.y + targetBounds.height + this.options.arrowSize!
                );
                break;
            case 'left':
                this.setPosition(
                    targetBounds.x - this.width - this.options.arrowSize!,
                    targetBounds.y + targetBounds.height / 2 - this.height / 2
                );
                break;
            case 'right':
                this.setPosition(
                    targetBounds.x + targetBounds.width + this.options.arrowSize!,
                    targetBounds.y + targetBounds.height / 2 - this.height / 2
                );
                break;
        }

        this.draw();
    }

    /**
     * 显示Tooltip
     */
    public show() {
        this.setVisible(true);
        return this;
    }

    /**
     * 隐藏Tooltip
     */
    public hide() {
        this.setVisible(false);
        return this;
    }
}