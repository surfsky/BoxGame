import Phaser from 'phaser';

/**圆角矩形基类 */
export class RectShape extends Phaser.GameObjects.Graphics
{
    constructor(
        scene: Phaser.Scene, 
        x: number = 0, y: number = 0, w: number = 0, h: number = 0, radius: number = 0, 
        bgColor: number = 0xffffff, bgAlpha: number = 1,
        borderColor: number = -1, borderWidth: number = 0, borderAlpha: number = 1,
    ) {
        super(scene);
        super.fillStyle(bgColor, bgAlpha);
        super.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1){
            super.lineStyle(borderWidth, borderColor, borderAlpha);
            super.strokeRoundedRect(x, y, w, h, radius);
        }

        scene.add.existing(this);
    }
}

