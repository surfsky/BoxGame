/**
 * 遮罩控件
 * 提供一个可自定义的全屏遮罩层，支持背景颜色、透明度设置和显示/隐藏动画
 */
export class Mask extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    private isVisible: boolean = false;
    private onClickCallback: Function | null = null;
    /**
     * 点击事件回调函数
     * @param {Function} callback - 回调函数
     */
    public onClick(callback: Function): void {
        this.onClickCallback = callback;
    }

    /**
     * 创建遮罩控件
     * @param {Phaser.Scene} scene - 场景实例
     * @param {object} [config] - 配置项
     * @param {number} [config.color=0x000000] - 背景颜色
     * @param {number} [config.alpha=0.5] - 透明度
     * @param {boolean} [config.interactive=true] - 是否可交互
     */
    constructor(scene: Phaser.Scene, config: {
        depth?: number,
        color?: number,
        alpha?: number,
        interactive?: boolean
    } = {}) {
        super(scene, 0, 0);
        scene.add.existing(this);
        const { color = 0x000000, alpha = 0.5, interactive = true, depth=-1 } = config;

        // 创建全屏背景
        this.bg = scene.add.rectangle(0, 0, scene.cameras.main.width, scene.cameras.main.height, color, alpha);
        this.bg.setOrigin(0);
        this.add(this.bg);

        // depth
        if (depth !== -1) {
            this.setDepth(depth);
        }

        // 设置交互
        if (interactive) {
            this.bg.setInteractive();  // 该语句就会阻止事件穿透到下层
            this.bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                //pointer.event.stopPropagation();
                if (this.onClickCallback) {
                    this.onClickCallback();
                }
            });
        }

        // 初始化为隐藏状态
        this.setVisible(false);
        this.setAlpha(0);
    }

    /**
     * 显示遮罩
     * @param {number} [duration=200] - 动画持续时间（毫秒）
     * @returns {Promise<void>}
     */
    public show(duration: number = 200): Promise<void> {
        return new Promise((resolve) => {
            if (this.isVisible) {
                resolve();
                return;
            }
            this.isVisible = true;
            this.setVisible(true);
            this.scene.tweens.add({
                targets: this,
                alpha: 1,
                duration: duration,
                onComplete: () => resolve()
            });
        });
    }

    /**
     * 隐藏遮罩
     * @param {number} [duration=200] - 动画持续时间（毫秒）
     * @returns {Promise<void>}
     */
    public hide(duration: number = 200): Promise<void> {
        return new Promise((resolve) => {
            if (!this.isVisible) {
                resolve();
                return;
            }
            this.isVisible = false;
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: duration,
                onComplete: () => {
                    this.setVisible(false);
                    resolve();
                }
            });
        });
    }

    /**
     * 设置背景颜色
     * @param {number} color - 颜色值
     */
    public setColor(color: number): void {
        this.bg.setFillStyle(color);
    }

    /**
     * 设置背景透明度
     * @param {number} alpha - 透明度值（0-1）
     */
    public setBackgroundAlpha(alpha: number): void {
        this.bg.setAlpha(alpha);
    }

    /**
     * 销毁遮罩
     */
    public destroy(): void {
        this.bg.destroy();
        super.destroy();
    }
}