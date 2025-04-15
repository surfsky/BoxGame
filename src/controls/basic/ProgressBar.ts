import { Control } from '../Control';
import { Painter } from '../Painter';

export class ProgressBar extends Control {
    private progress: number = 0;
    private barColor?: number; // 0x00ff00;
    private backgroundColor: number = 0xdddddd;
    private cornerRadius: number = 5;
    private isAnimating: boolean = false;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, width: number = 200, height: number = 20) {
        super(scene, x, y, width, height);
        this.draw();
    }

    /**
     * 设置进度值（0-100）
     */
    public setProgress(value: number, animate: boolean = false): ProgressBar {
        const targetProgress = Math.max(0, Math.min(100, value));
        
        if (animate) {
            if (!this.isAnimating) {
                this.isAnimating = true;
                this.scene.tweens.add({
                    targets: this,
                    progress: targetProgress,
                    duration: 500,
                    ease: 'Power2',
                    onUpdate: () => {
                        this.draw();
                    },
                    onComplete: () => {
                        this.isAnimating = false;
                    }
                });
            }
        } else {
            this.progress = targetProgress;
            this.draw();
        }
        return this;
    }

    /**
     * 设置进度条颜色
     */
    public setBarColor(color: number): ProgressBar {
        this.barColor = color;
        this.draw();
        return this;
    }

    /**
     * 设置背景颜色
     */
    public setBackgroundColor(color: number): ProgressBar {
        this.backgroundColor = color;
        this.draw();
        return this;
    }

    /**
     * 设置圆角半径
     */
    //public setCornerRadius(radius: number): ProgressBar {
    //    this.cornerRadius = radius;
    //    this.draw();
    //    return this;
    //}

    protected draw() {
        super.draw();
        this.graphics.clear();
        var barColor = this.barColor ?? this.theme.color.primary;

        // 绘制背景
        Painter.drawRoundRect(this.graphics, 0, 0, this.width, this.height, this.height/2, this.backgroundColor);

        // 绘制进度条
        if (this.progress > 0) {
            const progressWidth = (this.width * this.progress) / 100;
            Painter.drawRoundRect(this.graphics, 0, 0, progressWidth, this.height, this.height/2, barColor);
        }
    }
}