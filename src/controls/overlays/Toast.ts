import { Scene } from 'phaser';
import { Control } from '../Control';

interface ToastOptions {
    duration?: number;
    backgroundColor?: number;
    textColor?: string;
    fontSize?: string;
    padding?: number;
    borderRadius?: number;
}

export class Toast extends Control {
    private static activeToasts: Toast[] = [];
    private static readonly MARGIN_TOP = 20;
    private static readonly MARGIN_BETWEEN = 10;

    private text: Phaser.GameObjects.Text;
    private options: ToastOptions;
    private tween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Scene, message: string, options: ToastOptions = {}) {
        super(scene, 0, 0);

        this.options = {
            duration: 2000,
            backgroundColor: 0x333333,
            textColor: '#ffffff',
            fontSize: '16px',
            padding: 16,
            borderRadius: 8,
            ...options
        };

        // 创建文本
        this.text = scene.add.text(0, 0, message, {
            fontSize: this.options.fontSize,
            color: this.options.textColor,
            align: 'center'
        }).setOrigin(0.5);

        // 设置容器大小
        const width = this.text.width + (this.options.padding! * 2);
        const height = this.text.height + (this.options.padding! * 2);
        this.setSize(width, height);

        // 添加到容器
        this.add(this.text);

        // 设置初始位置
        this.x = scene.cameras.main.centerX;
        this.y = -this.height;
    }

    protected draw() {
        super.draw();

        // 绘制圆角矩形背景
        this.graphics.clear();
        this.graphics.fillStyle(this.options.backgroundColor!, 1);
        //this.graphics.lineStyle(0);
        this.graphics.fillRoundedRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height,
            this.options.borderRadius!
        );
    }


    public show() {
        this.draw();
        var targetY = Toast.MARGIN_TOP + Toast.activeToasts.length * (this.height + Toast.MARGIN_BETWEEN);
        this.tween = this.scene.add.tween({
            targets: this,
            y: targetY,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                this.scene.time.delayedCall(this.options.duration!, () => this.hide(), [], this);
            }
        });
        Toast.activeToasts.push(this);
        return this;
    }

    public hide() {
        if (this.tween) {
            this.tween.stop();
        }
        this.tween = this.scene.add.tween({
            targets: this,
            y: -this.height,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                const index = Toast.activeToasts.indexOf(this);
                if (index > -1) {
                    Toast.activeToasts.splice(index, 1);
                }
                //this.updateToastPositions();
                this.destroy();
            }
        });
    }
}