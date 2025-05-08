import Phaser from 'phaser';
import { Control } from '../Control';
import { Painter } from '../Painter';

/**按钮控件配置选项 */
export interface ButtonOptions {
    /** 按钮宽度 */
    width?: number;
    /** 按钮高度 */
    height?: number;
    /** 内边距 */
    padding?: number;

    /**类型：纯文本，边框，实心 */
    mode?: 'text' | 'frame' | 'fill';

    /** 文本大小 */
    fontSize?: string;
    /** 文本颜色 */
    textColor?: number;

    /** 背景颜色 */
    bgColor?: number;
    /** 悬停时的背景颜色 */
    hoverColor?: number;

    /** 圆角半径 */
    radius?: number;
    /** 边框颜色 */
    borderColor?: number;
    /** 边框宽度 */
    borderWidth?: number;

    /** 图标资源键 */
    icon?: string;
    /** 图标宽度 */
    iconWidth?: number;
    /** 图标高度 */
    iconHeight?: number;
    /** 图标与文本的间距 */
    iconSpacing?: number;
    /** 图标位置，可选值：'left' | 'right' | 'top' | 'bottom' */
    iconPosition?: string;

    /** 禁用状态下的透明度 */
    disabledAlpha?: number;
    /** 是否启用 */
    enable?: boolean;
}

/*********************************************************
 * 按钮控件，支持文本和图标的组合显示。默认 origin(0, 0)
 *********************************************************/
export class Button extends Control {
    // options
    private options: ButtonOptions;
    private text: string;

    // ui
    private label?: Phaser.GameObjects.Text;
    private icon?: Phaser.GameObjects.Image;

    // state
    private isEnabled: boolean = true;
    private isPressed: boolean = false; 

    /**
     * 创建按钮
     * @param scene 场景实例
     * @param x 按钮x坐标
     * @param y 按钮y坐标
     * @param text 按钮文本
     * @param options 按钮配置选项
     */
    constructor(scene: Phaser.Scene, x: number, y: number, text: string='', options: ButtonOptions = {}) {
        super(scene, x, y);
        this.options = {
            width: 200,
            height: 60,
            radius: 10,
            fontSize: '24px',
            padding: 10,
            mode: 'fill',
            //textColor: 0xffffff,
            //bgColor: this.theme.color.primary, // 0x4a90e2,
            //hoverColor: 0x5ba1f3,
            //borderColor: 0x4a90e2,
            //borderWidth: 0,
            iconWidth: 18,
            iconHeight: 18,
            iconSpacing: 5,
            iconPosition: 'right',
            disabledAlpha: 0.5,
            enable: true
            , ...options   // 会覆盖默认配置
        };
        this.setSize(this.options.width!, this.options.height!);
        this.text = text;
        this.draw();

        // events
        if (this.options.enable)
            this.setEvents();
    }

    /**获取主题配置选项 */
    getThemeOptions() : ButtonOptions {
        if (this.options.mode == 'text')
            return {
                ...this.options,
                bgColor:     undefined,
                textColor:   this.options.textColor  ?? this.theme.color.primary,
            }
        else if (this.options.mode == 'frame')
            return {
               ...this.options,
                bgColor:     undefined,
                textColor:   this.options.textColor  ?? this.theme.color.primary,
                borderColor: this.options.borderColor?? this.theme.color.primary,
                borderWidth: this.options.borderWidth?? this.theme.border.width,
            }
        else
            return {
                ...this.options,
                bgColor:     this.options.bgColor     ?? this.theme.color.primary,
                textColor:   this.options.textColor   ?? 0xffffff, // this.theme.color.textContrast,
            };
    }

    /**绘制背景 */
    override draw(): void {
        super.draw();
        const o = this.getThemeOptions();

        // bg color
        if (o.bgColor){
            this.graphics.fillStyle(o.bgColor!, 1);
            this.graphics.fillRoundedRect(0, 0, o.width!, o.height!, o.radius!);
        }

        // border
        if (o.borderWidth) {
            this.graphics.lineStyle(o.borderWidth!, o.borderColor!, 1);
            this.graphics.strokeRoundedRect(0, 0, o.width!, o.height!, o.radius!);
        }

        // 创建文本
        if (!this.label) {
            this.label = this.scene.add.text(o.width!/2, o.height!/2, this.text, {
                fontSize: this.options.fontSize,
                color: Painter.toColorText(o.textColor!),
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);
            this.add(this.label);
        }
        this.label.setText(this.text!);
        this.label.setColor(Painter.toColorText(o.textColor!));

        // 如果提供了图标，创建图标
        if (o.icon) {
            this.setIcon(o.icon, o.iconWidth!, o.iconHeight!);
            if (this.icon && (o.iconWidth || o.iconHeight)) {
                const width = o.iconWidth || o.width;
                const height = o.iconHeight || o.height;
                this.icon.setDisplaySize(width!, height!);
            }
        }
    }

    //----------------------------------------------------------
    // 事件处理
    //----------------------------------------------------------
    private setEvents(): void {
        //this.setSize(this.width, this.height);
        this.setInteractive({ 
            cursor: 'pointer', 
            hitArea: new Phaser.Geom.Rectangle(this.width/2, this.height/2, this.width, this.height),
            //useHandCursor: true,
            //draggable: false,
            //pixelPerfect: true,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains, 
        });
        this
            .on('pointerdown', this.onPointerDown, this)
            .on('pointerup', this.onPointerUp, this)
            .on('pointerover', this.onPointerOver, this)
            .on('pointerout', this.onPointerOut, this)
            ;
    }
    private onPointerDown(): void {
        if (!this.isEnabled) return;
        this.isPressed = true;
        this.setScale(0.9);
    }

    private onPointerUp(): void {
        if (!this.isEnabled || !this.isPressed) return;
        this.isPressed = false;
        this.setScale(1);
        this.emit('click');  // 触发点击事件
    }

    private onPointerOut(): void {
        if (!this.isEnabled) return;
        if (this.isPressed) {
            this.isPressed = false;
            this.setScale(1);
        }
    }

    private onPointerOver(): void {
        if (!this.isEnabled) return;
        this.graphics.clear();
        this.graphics.fillStyle(this.options.hoverColor!, 1);
        this.draw();
    }


    /**
     * 添加点击事件监听器
     * @param callback 回调函数
     * @param data 数据
     */
    public onClick(callback: Function, data?: any): this {
        this.on('click', callback, data);
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
        if (!this.label) {
            this.label = this.scene.add.text(this.width/2, this.height/2, text, {
                fontSize: this.options.fontSize,
                color: Painter.toColorText(this.options.textColor!),
                align: 'center'
            }).setOrigin(0.5);
            this.add(this.label);
        } else {
            this.label.setText(text);
        }
        this.relayout();
        return this;
    }

    /**
     * 设置按钮图标
     * @param key 图标资源键
     */
    public setIcon(key: string, width:number, height?:number): this {
        height = height ?? width;
        if (!this.icon) {
            this.icon = this.scene.add.image(this.width/2, this.height/2, key)
                .setDisplaySize(width, height)
                .setOrigin(0.5);
            this.add(this.icon);
        } else {
            this.icon.setTexture(key);
        }
        this.relayout();
        return this;
    }

    /**设置动画效果 */
    public setAnimate(): this {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        return this;
    }

    /**
     * 更新布局
     */
    private relayout(): void {
        if (!this.icon && !this.label) return;

        if (this.icon && this.label && this.text != '') {
            // 同时存在图标和文本时的布局
            const width = this.width;
            const height = this.height;
            const spacing = this.options.iconSpacing!;
            const iconWidth = this.icon.width;
            const iconHeight = this.icon.height;
            const lebelWidth = this.label.width;
            const labelHeight = this.label.height;
            switch (this.options.iconPosition) {
                case 'left':
                    this.label.setPosition(width/2, height/2).setOrigin(0.5, 0.5);  // 文本始终局中
                    this.icon.setPosition(spacing, height/2).setOrigin(0, 0.5);
                    break;
                case 'right':
                    this.label.setPosition(width/2, height/2).setOrigin(0.5, 0.5);  // 文本始终局中
                    this.icon.setPosition(width - spacing - iconWidth, height/2).setOrigin(0, 0.5);
                    break;
                case 'top':
                    this.icon.setPosition(width/2, spacing).setOrigin(0.5, 0);
                    this.label.setPosition(width/2, spacing*2 + iconHeight).setOrigin(0.5, 0);
                    break;
                case 'bottom':
                    this.label.setPosition(width/2, spacing).setOrigin(0.5, 0);
                    this.icon.setPosition(width/2, spacing*2 + labelHeight).setOrigin(0.5, 0);
                    break;
            }
        } else {
            // 只有图标或只有文本时，居中显示
            if (this.icon)  this.icon.setPosition(this.width/2, this.height/2).setOrigin(0.5, 0.5);
            if (this.label) this.label.setPosition(this.width/2, this.height/2).setOrigin(0.5, 0.5);
        }
    }

    /**
     * 设置按钮启用状态
     * @param value 是否启用
     */
    public setEnabled(value: boolean): this {
        this.isEnabled = value;
        // 若不可用显示为灰色，且不响应事件
        if (!value) {
            this.setInteractive({ cursor: 'default' });
            this.alpha = this.options.disabledAlpha!;
        }
        else {
            this.setInteractive({ cursor: 'pointer' });
            this.alpha = 1;
        }
        return this;
    }

    /**
     * 获取按钮启用状态
     */
    public isButtonEnabled(): boolean {
        return this.isEnabled;
    }

}