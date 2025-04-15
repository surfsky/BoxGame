import { Popup, PopupOptions } from './Popup';

export interface ViewOptions extends PopupOptions {
    swipeBackEnabled?: boolean;
    swipeBackThreshold?: number;
    x?: number;
    y?: number;
}

/**
 * 全屏视图控件，支持右滑返回
 */
export class View extends Popup {
    private swipeStartX: number = 0;
    private swipeStartY: number = 0;
    private isSwiping: boolean = false;
    private opts: ViewOptions;

    constructor(scene: Phaser.Scene, options: ViewOptions = {}) {
        // 设置默认选项
        const defaultOptions: ViewOptions = {
            width: scene.cameras.main.width,
            height: scene.cameras.main.height,
            x: scene.cameras.main.centerX,
            y: scene.cameras.main.centerY,
            backgroundColor: 0xffffff,
            backgroundAlpha: 1,
            borderRadius: 0,
            padding: 0,
            modal: true,
            modalAlpha: 0,
            animation: 'slideRight',
            animationDuration: 300,
            closeOnClickOutside: false,
            dragable: false,
            swipeBackEnabled: true,
            swipeBackThreshold: 100
        };

        super(scene, defaultOptions.x!, defaultOptions.y!, { ...defaultOptions, ...options });
        this.opts = { ...defaultOptions, ...options };

        if (this.opts.swipeBackEnabled) {
            this.setupSwipeBack();
        }

        // 监听窗口大小变化
        scene.scale.on('resize', this.handleResize, this);
    }

    private setupSwipeBack(): void {
        this.background.setInteractive();

        this.background.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.swipeStartX = pointer.x;
            this.swipeStartY = pointer.y;
            this.isSwiping = true;
        });

        this.background.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.isSwiping) return;

            const deltaX = pointer.x - this.swipeStartX;
            const deltaY = Math.abs(pointer.y - this.swipeStartY);

            // 如果水平滑动距离大于垂直滑动，且方向为右滑
            if (deltaX > 0 && deltaX > deltaY) {
                this.x = this.opts.x! + deltaX;
                if (this.modalBackground) {
                    this.modalBackground.alpha = Math.max(0, this.opts.modalAlpha! - (deltaX / this.scene.cameras.main.width));
                }
            }
        });

        this.background.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.isSwiping) return;

            const deltaX = pointer.x - this.swipeStartX;
            const deltaY = Math.abs(pointer.y - this.swipeStartY);

            // 如果右滑距离超过阈值，且水平滑动大于垂直滑动
            if (deltaX > this.opts.swipeBackThreshold! && deltaX > deltaY) {
                this.hide();
            } else {
                // 恢复原位
                this.scene.tweens.add({
                    targets: this,
                    x: this.opts.x!,
                    duration: 200,
                    ease: 'Power2'
                });
                if (this.modalBackground) {
                    this.scene.tweens.add({
                        targets: this.modalBackground,
                        alpha: this.opts.modalAlpha!,
                        duration: 200
                    });
                }
            }

            this.isSwiping = false;
        });

        this.background.on('pointerout', () => {
            if (this.isSwiping) {
                this.isSwiping = false;
                // 恢复原位
                this.scene.tweens.add({
                    targets: this,
                    x: this.opts.x!,
                    duration: 200,
                    ease: 'Power2'
                });
                if (this.modalBackground) {
                    this.scene.tweens.add({
                        targets: this.modalBackground,
                        alpha: this.opts.modalAlpha!,
                        duration: 200
                    });
                }
            }
        });
    }

    private handleResize(): void {
        // 更新视图大小和位置
        this.opts.width = this.scene.cameras.main.width;
        this.opts.height = this.scene.cameras.main.height;
        this.opts.x = this.scene.cameras.main.centerX;
        this.opts.y = this.scene.cameras.main.centerY;

        // 重新创建背景
        this.background.clear();
        this.background.fillStyle(this.opts.backgroundColor!, this.opts.backgroundAlpha);
        this.background.fillRect(
            -this.opts.width! / 2,
            -this.opts.height! / 2,
            this.opts.width!,
            this.opts.height!
        );

        // 更新模态背景
        if (this.modalBackground) {
            this.modalBackground.clear();
            this.modalBackground.fillStyle(0x000000, this.opts.modalAlpha!);
            this.modalBackground.fillRect(
                -this.scene.cameras.main.width,
                -this.scene.cameras.main.height,
                this.scene.cameras.main.width * 2,
                this.scene.cameras.main.height * 2
            );
        }

        // 更新位置
        this.setPosition(this.opts.x!, this.opts.y!);
    }

    destroy(): void {
        this.scene.scale.off('resize', this.handleResize, this);
        super.destroy();
    }
}