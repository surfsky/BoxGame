import Phaser from 'phaser';
import { Control } from './Control';

/**
 * 矩形控件
 */
export class Rect extends Control {
    radius: number;
    bgColor: number;
    bgAlpha: number;
    borderColor: number;
    borderWidth: number;
    borderAlpha: number;

    constructor(scene: Phaser.Scene, 
        x: number = 0, y: number = 0, w: number = 0, h: number = 0, radius: number = 0, 
        bgColor: number = 0xffffff, bgAlpha: number = 1,
        borderColor: number = 0xf0f0f0, borderWidth: number = 1, borderAlpha: number = 1,
    ){
        super(scene, x, y);
        this.setSize(w, h);
        this.radius = radius;
        this.bgColor = bgColor;
        this.bgAlpha = bgAlpha;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.borderAlpha = borderAlpha;
    }

    override draw(){
        super.draw();
        this.drawRect(this.bgColor, this.bgAlpha, 0, 0, this.width, this.height, this.radius, this.borderColor, this.borderWidth, this.borderAlpha);
    }

    private drawRect(bgColor: number, bgAlpha: number, x: number, y: number, w: number, h: number, radius: number, borderColor: number, borderWidth: number, borderAlpha: number) {
        this.graphics.fillStyle(bgColor, bgAlpha);
        this.graphics.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1) {
            this.graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            this.graphics.strokeRoundedRect(x, y, w, h, radius);
        }
    }
}
