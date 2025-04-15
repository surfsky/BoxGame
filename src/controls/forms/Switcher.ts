import Phaser from 'phaser';
import { Control } from '../Control';
import { Painter } from '../Painter';

/**
 * 开关控件
 */
export class Switcher extends Control {
    private track: Phaser.GameObjects.Graphics;
    private thumb: Phaser.GameObjects.Graphics;
    private isOn: boolean = false;

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, width: number = 50, height: number = 30) {
        super(scene, x, y, width, height);
        
        // 创建轨道
        this.track = scene.add.graphics();
        this.add(this.track);

        // 创建滑块
        this.thumb = scene.add.graphics();
        this.add(this.thumb);

        // 设置交互
        this.setSize(width, height);
        this.setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(width/2, height/2, width, height), hitAreaCallback: Phaser.Geom.Rectangle.Contains });
        this.on('pointerdown', this.onPointerDown, this);

        // 初始绘制
        this.draw();
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
        // 仅处理左键点击
        if (pointer.leftButtonDown()) {
            this.toggle();
        }
    }

    public toggle() {
        this.isOn = !this.isOn;

        // 计算目标位置和颜色
        const thumbSize = this.height - 4;
        const targetX = this.isOn ? this.width - thumbSize - 2 : 2;
        //const targetColor = this.isOn ? 0x34c759 : 0xe5e5ea;
        //const currentColor = !this.isOn ? 0x34c759 : 0xe5e5ea;
        const targetColor  = this.isOn  ? this.mainColor : this.theme.border.color;
        const currentColor = !this.isOn ? this.mainColor : this.theme.border.color;

        // 创建滑块移动动画
        this.scene.tweens.add({targets: this.thumb, x: targetX, duration: 200, ease: 'Power2'});

        // 创建背景色渐变动画
        let progress = 0;
        this.scene.tweens.add({
            targets: {},
            progress: 1,
            duration: 200,
            ease: 'Power2',
            onUpdate: (tween) => {
                progress = tween.progress;
                const r = Phaser.Math.Linear((currentColor >> 16) & 0xFF, (targetColor >> 16) & 0xFF, progress);
                const g = Phaser.Math.Linear((currentColor >> 8) & 0xFF, (targetColor >> 8) & 0xFF, progress);
                const b = Phaser.Math.Linear(currentColor & 0xFF, targetColor & 0xFF, progress);
                const interpolatedColor = (r << 16) | (g << 8) | b;
                
                this.track.clear();
                Painter.drawRoundRect(this.track, 0, 0, this.width, this.height, this.height / 2, interpolatedColor);
            }
        });

        this.emit('change', this.isOn);
    }

    protected draw() {
        super.draw();

        // 清除之前的绘制
        this.track.clear();
        this.thumb.clear();

        // 绘制轨道
        const trackColor = this.isOn ? this.mainColor : this.theme.border.color; //0x34c759 : 0xe5e5ea;
        const trackRadius = this.height / 2;
        Painter.drawRoundRect(this.track, 0, 0, this.width, this.height, trackRadius, trackColor);

        // 绘制滑块
        const thumbSize = this.height - 4;
        const thumbX = this.isOn ? this.width - thumbSize - 2 : 2;
        this.thumb.x = thumbX;
        this.thumb.y = 2;
        Painter.drawRoundRect(this.thumb, 0, 0, thumbSize, thumbSize, thumbSize / 2, 0xffffff);
    }

    public getValue(): boolean {
        return this.isOn;
    }

    public setValue(value: boolean): Switcher {
        if (this.isOn !== value) {
            this.isOn = value;
            this.draw();
        }
        return this;
    }
}