import Phaser from 'phaser';
import { Control } from '../Control';

/**图片按钮控件配置选项 */
export interface ImageButtonOptions {
    /** 按钮宽度 */
    width?: number;
    /** 按钮高度 */
    height?: number;
    /** 图片缩放比例 */
    imageScale?: number;
    /** 文本大小 */
    fontSize?: string;
    /** 文本颜色 */
    textColor?: string;
    /** 文本与图片的间距 */
    spacing?: number;
    /** 文本位置，可选值：'top' | 'bottom' */
    textPosition?: string;
    /** 禁用状态下的透明度 */
    disabledAlpha?: number;
    /** 是否激活交互 */
    active?: boolean;
}

/*********************************************************
 * 图片按钮控件，支持图片和文本的组合显示
 *********************************************************/
export class ImageButton extends Control {
    private static readonly DEFAULT_OPTIONS: ImageButtonOptions = {
        width: 100,
        height: 100,
        imageScale: 1,
        fontSize: '16px',
        textColor: '#ffffff',
        spacing: 5,
        textPosition: 'bottom',
        disabledAlpha: 0.5,
        active: true
    };

    private options: ImageButtonOptions;
    private text: string;
    private label?: Phaser.GameObjects.Text;
    private image?: Phaser.GameObjects.Image;
    private isEnabled: boolean = true;
    private isPressed: boolean = false;

    /**
     * 创建图片按钮
     * @param scene 场景实例
     * @param x 按钮x坐标
     * @param y 按钮y坐标
     * @param imageKey 图片资源键
     * @param text 按钮文本
     * @param options 按钮配置选项
     */
    constructor(scene: Phaser.Scene, x: number, y: number, imageKey: string, text: string = '', options: ImageButtonOptions = {}) {
        super(scene, x, y, options.width ?? ImageButton.DEFAULT_OPTIONS.width!, options.height ?? ImageButton.DEFAULT_OPTIONS.height!);
        this.options = { ...ImageButton.DEFAULT_OPTIONS, ...options };
        this.text = text;

        // 创建图片作为背景
        this.image = this.scene.add.image(this.width/2, this.height/2, imageKey)
            .setOrigin(0.5)
            .setDisplaySize(this.width, this.height)
            ;
        this.add(this.image);
        this.image.setDepth(0); // 设置图片为最底层

        // 创建文本并显示在最上层
        if (text) {
            this.label = this.scene.add.text(this.width/2, this.height/2, text, {
                fontSize: this.options.fontSize,
                color: this.options.textColor,
                align: 'center'
            }).setOrigin(0.5);
            this.add(this.label);
            this.label.setDepth(1); // 设置文本为最上层
        }

        this.updateLayout();

        // 设置交互事件
        if (this.options.active) {
            this.setEvents();
        }
    }

    /**更新布局 */
    private updateLayout(): void {
        if (!this.image) return;

        // 确保图片始终填充整个按钮区域
        this.image.setDisplaySize(this.width, this.height);
        this.image.setPosition(this.width/2, this.height/2);

        // 文本始终显示在中间
        if (this.label) {
            this.label.setPosition(this.width/2, this.height/2);
        }
    }

    //----------------------------------------------------------
    // 事件处理
    //----------------------------------------------------------
    private setEvents(): void {
        this.setInteractive({ cursor: 'pointer',
            hitArea: new Phaser.Geom.Rectangle(this.width/2, this.height/2, this.width, this.height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains
         });
        this.on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            .on('pointerdown', this.onPointerDown, this)
            .on('pointerup', this.onPointerUp, this);
    }

    private onPointerOver(): void {
        if (!this.isEnabled) return;
        this.setScale(1.05);
    }

    private onPointerOut(): void {
        if (!this.isEnabled) return;
        this.setScale(1);
        if (this.isPressed) {
            this.isPressed = false;
        }
    }

    private onPointerDown(): void {
        if (!this.isEnabled) return;
        this.isPressed = true;
        this.setScale(0.95);
        this.emit('click');
    }

    private onPointerUp(): void {
        if (!this.isEnabled || !this.isPressed) return;
        this.isPressed = false;
        this.setScale(1);
    }

    /**
     * 添加点击事件监听器
     * @param callback 回调函数
     * @param context 上下文
     */
    public onClick(callback: Function, context?: any): this {
        this.on('click', callback, context);
        return this;
    }

    //----------------------------------------------------------
    // 公共方法
    //----------------------------------------------------------
    /**
     * 设置按钮文本
     * @param text 文本内容
     */
    public setText(text: string): this {
        this.text = text;
        if (!this.label) {
            this.label = this.scene.add.text(0, 0, text, {
                fontSize: this.options.fontSize,
                color: this.options.textColor,
                align: 'center'
            }).setOrigin(0.5);
            this.add(this.label);
        } else {
            this.label.setText(text);
        }
        this.updateLayout();
        return this;
    }

    /**
     * 设置按钮图片
     * @param key 图片资源键
     */
    public setImage(key: string): this {
        if (this.image) {
            this.image.setTexture(key);
            this.updateLayout();
        }
        return this;
    }

    /**
     * 设置按钮启用状态
     * @param enabled 是否启用
     */
    public setEnabled(enabled: boolean): this {
        this.isEnabled = enabled;
        this.alpha = enabled ? 1 : this.options.disabledAlpha!;
        return this;
    }

    /**
     * 获取按钮启用状态
     */
    public getEnabled(): boolean {
        return this.isEnabled;
    }
}