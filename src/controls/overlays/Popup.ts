import { Control } from '../Control';
import { GameConfig } from '../../GameConfig';
import { Anchor } from '../Anchor';

export interface PopupOptions {
    width?: number;
    height?: number;
    backgroundColor?: number;
    backgroundAlpha?: number;
    borderRadius?: number | number[];
    padding?: number;
    modal?: boolean;
    modalAlpha?: number;
    animation?: 'fade' | 'scale' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'none';
    showCloseButton?: boolean;
    closeButtonStyle?: {
        x?: number;
        y?: number;
        size?: number;
        color?: number;
    };
    shadow?: {
        color?: number;
        blur?: number;
        offsetX?: number;
        offsetY?: number;
        alpha?: number;
    };
    animationDuration?: number;
    closeOnClickOutside?: boolean;
    dragable?: boolean;
    anchor?: Anchor;
}


/**
 * 弹窗控件. origin base (0.5, 0.5)
 */
export class Popup extends Control {
    protected background!: Phaser.GameObjects.Graphics;
    protected modalBackground: Phaser.GameObjects.Graphics | null = null;
    private contentContainer!: Phaser.GameObjects.Container;
    protected options: PopupOptions;
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private isShowing: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, options: PopupOptions = {}) {
        super(scene, x, y);
        scene.add.existing(this);

        // 设置默认选项
        this.options = {
            width: 400,
            height: 300,
            backgroundColor: 0xffffff,
            backgroundAlpha: 1,
            borderRadius: 10,
            padding: 20,
            modal: true,
            modalAlpha: 0.5,
            animation: 'fade',
            animationDuration: 200,
            closeOnClickOutside: true,
            dragable: false,
            anchor: Anchor.center,
            shadow: {
                color: 0x000000,
                blur: 10,
                offsetX: 0,
                offsetY: 4,
                alpha: 0.3
            },
            ...options
        };

        this.setSize(this.options.width!, this.options.height!);
        this.createPopup();
        this.setVisible(false);
    }

    /**Create popup items: bgmask, bg, closebutton, ... */
    private createPopup(): void {
        // 创建模态背景
        if (this.options.modal) {
            this.modalBackground = this.scene.add.graphics();
            this.modalBackground.fillStyle(0x000000, this.options.modalAlpha);
            this.modalBackground.fillRect(
                -this.scene.cameras.main.width,
                -this.scene.cameras.main.height,
                this.scene.cameras.main.width * 2,
                this.scene.cameras.main.height * 2
            );
            this.modalBackground.setDepth(this.depth - 1);
            this.add(this.modalBackground);
            this.modalBackground.setInteractive(new Phaser.Geom.Rectangle(
                -this.scene.cameras.main.width,
                -this.scene.cameras.main.height,
                this.scene.cameras.main.width * 2,
                this.scene.cameras.main.height * 2
            ), Phaser.Geom.Rectangle.Contains);
            this.modalBackground.on('pointerdown', () => {
                if (this.options.closeOnClickOutside) {
                    this.hide()
                }
            });
        }

        // 创建弹窗背景
        this.background = this.scene.add.graphics();
        var r = this.options.borderRadius;

        // 绘制阴影
        if (this.options.shadow) {
            const shadow = this.options.shadow;
            this.background.fillStyle(shadow.color || 0x000000, shadow.alpha || 0.3);
            this.background.fillRoundedRect(
                -this.options.width! / 2 + (shadow.offsetX || 0),
                -this.options.height! / 2 + (shadow.offsetY || 0),
                this.options.width!,
                this.options.height!,
                Array.isArray(r) 
                    ? {tl: r[0], tr: r[1], bl: r[3], br: r[2]}
                    : r
            );

            // 模拟阴影模糊效果
            const blur = shadow.blur || 0;
            for (let i = 1; i <= blur; i++) {
                const alpha = (shadow.alpha || 0.3) * (1 - i / blur) * 0.2;
                this.background.fillStyle(shadow.color || 0x000000, alpha);
                this.background.fillRoundedRect(
                    -this.options.width! / 2 + (shadow.offsetX || 0) - i,
                    -this.options.height! / 2 + (shadow.offsetY || 0) - i,
                    this.options.width! + i * 2,
                    this.options.height! + i * 2,
                    Array.isArray(r) ? {tl: r[0] + i, tr: r[1] + i, bl: r[3] + i, br: r[2] + i} : r! + i
                );
            }
        }

        // 绘制背景
        this.background.fillStyle(this.options.backgroundColor!, this.options.backgroundAlpha);
        this.background.fillRoundedRect(
            -this.options.width! / 2,
            -this.options.height! / 2,
            this.options.width!,
            this.options.height!,
            Array.isArray(r) ? {tl: r[0], tr: r[1], bl: r[3], br: r[2]} : {tl: r, tr: r, bl: r, br: r}
        );
        this.add(this.background);

        // 设置背景的交互区域和事件屏蔽
        this.background.setInteractive(new Phaser.Geom.Rectangle(
            -this.options.width! / 2,
            -this.options.height! / 2,
            this.options.width,
            this.options.height
        ), Phaser.Geom.Rectangle.Contains);
        this.background.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
        });

        // 创建关闭按钮
        if (this.options.showCloseButton) {
            const closeStyle = {
                x: this.options.width! / 2 - 20,
                y: -this.options.height! / 2 + 20,
                size: 24,
                color: 0xffffff,
                ...this.options.closeButtonStyle
            };
            
            const closeButton = this.scene.add.image(
                closeStyle.x,
                closeStyle.y,
                GameConfig.icons.close.key
            ).setOrigin(0.5).setScale(0.8).setTint(closeStyle.color);
            
            closeButton.setInteractive({ useHandCursor: true });
            closeButton.on('pointerdown', (event: Phaser.Input.Pointer) => {
                //event.stopPropagation();
                this.hide();
            });
            this.add(closeButton);
        }


        // 设置拖拽功能
        if (this.options.dragable) {
            this.background.setInteractive(new Phaser.Geom.Rectangle(
                -this.options.width! / 2,
                -this.options.height! / 2,
                this.options.width,
                this.options.height
            ), Phaser.Geom.Rectangle.Contains);

            this.background.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                this.isDragging = true;
                this.dragStartX = pointer.x - this.x;
                this.dragStartY = pointer.y - this.y;
            });

            this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
                if (this.isDragging) {
                    this.x = pointer.x - this.dragStartX;
                    this.y = pointer.y - this.dragStartY;
                }
            });

            this.scene.input.on('pointerup', () => {
                this.isDragging = false;
            });
        }

        // 创建内容容器
        this.contentContainer = this.scene.add.container(0, 0);
        this.contentContainer.setSize(this.options.width! - this.options.padding! * 2, this.options.height! - this.options.padding! * 2);
        this.add(this.contentContainer);
    }

    public getBounds(): Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(
            this.x - this.options.width! / 2,
            this.y - this.options.height! / 2,
            this.options.width!,
            this.options.height!
        )
    }

    /**
     * Get anchor position of popup
     */
    private getAnchorPosition(): { x: number; y: number } {
        const camera = this.scene.cameras.main;
        let x = this.x;
        let y = this.y;

        switch (this.options.anchor) {
            case Anchor.left:
                x = this.options.width! / 2;
                y = camera.height / 2;
                break;
            case Anchor.right:
                x = camera.width - this.options.width! / 2;
                y = camera.height / 2;
                break;
            case Anchor.top:
                x = camera.width / 2;
                y = this.options.height! / 2;
                break;
            case Anchor.bottom:
                x = camera.width / 2;
                y = camera.height - this.options.height! / 2;
                break;
            case Anchor.topLeft:
                x = this.options.width! / 2;
                y = this.options.height! / 2;
                break;
            case Anchor.topRight:
                x = camera.width - this.options.width! / 2;
                y = this.options.height! / 2;
                break;
            case Anchor.bottomLeft:
                x = this.options.width! / 2;
                y = camera.height - this.options.height! / 2;
                break;
            case Anchor.bottomRight:
                x = camera.width - this.options.width! / 2;
                y = camera.height - this.options.height! / 2;
                break;
            case Anchor.center:
            default:
                x = camera.width / 2;
                y = camera.height / 2;
                break;
        }

        return { x, y };
    }

    /**Show popup with animation */
    public show(): void {
        if (this.isShowing) return;
        this.isShowing = true;
        this.setVisible(true);

        const anchorPos = this.getAnchorPosition();
        const originalX = anchorPos.x;
        const originalY = anchorPos.y;
        this.x = originalX;
        this.y = originalY;
        
        switch (this.options.animation) {
            case 'fade':
                this.alpha = 0;
                this.scene.tweens.add({
                    targets: this,
                    alpha: 1,
                    duration: this.options.animationDuration
                });
                break;
            case 'scale':
                this.setScale(0);
                this.scene.tweens.add({
                    targets: this,
                    scale: 1,
                    duration: this.options.animationDuration,
                    ease: 'Back.out'
                });
                break;
            case 'slideLeft':
                this.x = -this.options.width! - this.scene.cameras.main.width;
                this.scene.tweens.add({
                    targets: this,
                    x: originalX,
                    duration: this.options.animationDuration,
                    ease: 'Power2.out'
                });
                break;
            case 'slideRight':
                this.x = this.scene.cameras.main.width + this.options.width!;
                this.scene.tweens.add({
                    targets: this,
                    x: originalX,
                    duration: this.options.animationDuration,
                    ease: 'Power2.out'
                });
                break;
            case 'slideUp':
                this.y = this.scene.cameras.main.height + this.options.height!;
                this.scene.tweens.add({
                    targets: this,
                    y: originalY,
                    duration: this.options.animationDuration,
                    ease: 'Power2.out'
                });
                break;
            case 'slideDown':
                this.y = -this.options.height!;
                this.scene.tweens.add({
                    targets: this,
                    y: originalY,
                    duration: this.options.animationDuration,
                    ease: 'Power2.out'
                });
                break;
        }
    }

    /**
     * 隐藏弹窗
     */
    public hide(): void {
        if (!this.isShowing) return;

        const onComplete = () => {
            this.isShowing = false;
            this.setVisible(false);
        };

        switch (this.options.animation) {
            case 'fade':
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: this.options.animationDuration,
                    onComplete
                });
                break;
            case 'scale':
                this.scene.tweens.add({
                    targets: this,
                    scale: 0,
                    duration: this.options.animationDuration,
                    ease: 'Back.in',
                    onComplete
                });
                break;
            case 'slideLeft':
                this.scene.tweens.add({
                    targets: this,
                    x: -this.options.width! - this.scene.cameras.main.width,
                    duration: this.options.animationDuration,
                    ease: 'Power2.in',
                    onComplete
                });
                break;
            case 'slideRight':
                this.scene.tweens.add({
                    targets: this,
                    x: this.scene.cameras.main.width + this.options.width!,
                    duration: this.options.animationDuration,
                    ease: 'Power2.in',
                    onComplete
                });
                break;
            case 'slideUp':
                this.scene.tweens.add({
                    targets: this,
                    y: -this.options.height!,
                    duration: this.options.animationDuration,
                    ease: 'Power2.in',
                    onComplete
                });
                break;
            case 'slideDown':
                this.scene.tweens.add({
                    targets: this,
                    y: this.scene.cameras.main.height + this.options.height!,
                    duration: this.options.animationDuration,
                    ease: 'Power2.in',
                    onComplete
                });
                break;
            default:
                onComplete();
        }
    }

    /**
     * 添加内容到弹窗
     * @param {Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]} items - 要添加的游戏对象或对象数组
     */
    public addChild(items: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]): Popup {
        this.contentContainer.add(items);
        return this;
    }

    /**
     * 清除弹窗内容
     */
    public clear(): Popup {
        this.contentContainer.removeAll();
        return this;
    }

    /**
     * 销毁弹窗
     */
    public destroy(): void {
        if (this.modalBackground) {
            this.modalBackground.destroy();
        }
        this.background.destroy();
        this.contentContainer.destroy();
        super.destroy();
    }
}