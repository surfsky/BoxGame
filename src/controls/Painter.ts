import Phaser, { Scene } from 'phaser';
import { Control } from './Control';
import { get } from 'http';

/**
 * 绘画辅助类
 */
export class Painter{
    /**获取亮一点的色彩 */
    public static getLightColor(color:number, alpha:number=0.5) : number{
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        // 根据alpha增加RGB值来实现变亮效果
        const lightR = Math.min(255, r + Math.floor((255 - r) * alpha));
        const lightG = Math.min(255, g + Math.floor((255 - g) * alpha));
        const lightB = Math.min(255, b + Math.floor((255 - b) * alpha));

        return Phaser.Display.Color.GetColor(lightR, lightG, lightB);
    }

    /** 获取暗一点的色彩 */
    public static getDarkColor(color:number, alpha:number=0.5) : number{
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        // 根据alpha减少RGB值来实现变暗效果
        const darkR = Math.max(0, r - Math.floor(r * alpha));
        const darkG = Math.max(0, g - Math.floor(g * alpha));
        const darkB = Math.max(0, b - Math.floor(b * alpha));

        return Phaser.Display.Color.GetColor(darkR, darkG, darkB);
    }

    /** 获取灰度色彩 */
    public static getGrayColor(color:number, alpha:number=0.5) : number{
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;

        // 计算RGB的平均值来实现灰度效果
        const gray = Math.floor((r + g + b) / 3);
        const finalGray = Math.floor(gray * alpha + ((r + g + b) / 3) * (1 - alpha));

        return Phaser.Display.Color.GetColor(finalGray, finalGray, finalGray);
    }


    /** 加载src网络图片，并显示在指定位置 */
    public static async drawImage(scene:Scene, src:string, x:number, y:number, w:number, h:number) : Promise<Phaser.GameObjects.Image>{
        var key = await Painter.loadImage(scene, src);
        var image = scene.add.image(0, 0, key);
        scene.add.existing(image);
        return image;
    }

    /**
     * 加载图片
     * @param src 图片路径
     * @returns 图片key
     */
    public static loadImage(scene: Scene, src: string): Promise<string> {
        var isLoading = false;
        return new Promise((resolve, reject) => {
            if (isLoading) return;
            isLoading = true;
            const key = `img_${Date.now()}`;
            console.log(`load image, key=${key}, src=${src}`);
            
            scene.load.once('filecomplete-image-' + key, () => {
                isLoading = false;
                resolve(key);
            });

            scene.load.once('loaderror', () => {
                isLoading = false;
                reject(new Error('Failed to load image: ' + src));
            });

            scene.load.image(key, src);
            scene.load.start();
        });
    }


    /**创建一个圆角矩形*/
    public static drawRoundRect(
        graphics: Phaser.GameObjects.Graphics, 
        x:number, y:number, w:number, h:number, radius:number, 
        bgColor:number, bgAlpha=1, 
        borderColor=-1, borderWidth=1, borderAlpha=1
    ) : Phaser.GameObjects.Graphics{
        graphics.fillStyle(bgColor, bgAlpha);
        graphics.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1){
            graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            graphics.strokeRoundedRect(x, y, w, h, radius);
        }
        return graphics;
    }

    /**创建一个圆角矩形*/
    public static drawRect(
        graphics: Phaser.GameObjects.Graphics, 
        x:number, y:number, w:number, h:number, radius:number[], 
        bgColor:number, bgAlpha=1, 
        borderColor=-1, borderWidth=1, borderAlpha=1
    ) : Phaser.GameObjects.Graphics{

        var r = {tl:radius[0], tr:radius[1], br:radius[2], bl:radius[3]};
        graphics.fillStyle(bgColor, bgAlpha);
        graphics.fillRoundedRect(x, y, w, h, r);
        if (borderColor != -1){
            graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            graphics.strokeRoundedRect(x, y, w, h, r);
        }
        return graphics;
    }


    /**绘制虚线*/
    public static drawDashedLine(graphics: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, 
        dashLength: number = 5, gapLength: number = 5, lineWidth: number = 1, lineColor: number = 0xa0a0a0
    ): Phaser.GameObjects.Graphics {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dashCount = Math.floor(distance / (dashLength + gapLength));
        const stepX = dx / dashCount;
        const stepY = dy / dashCount;

        graphics.lineStyle(lineWidth, lineColor);
        for (let i = 0; i < dashCount; i++) {
            const startX = x1 + i * (stepX);
            const startY = y1 + i * (stepY);
            const endX = startX + stepX * (dashLength / (dashLength + gapLength));
            const endY = startY + stepY * (dashLength / (dashLength + gapLength));
            graphics.beginPath();
            graphics.moveTo(startX, startY);
            graphics.lineTo(endX, endY);
            graphics.strokePath();
        }
        return graphics;
    }

    /**绘制虚线矩形*/
    public static drawDashedRectangle(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, 
        dashLength: number = 5, gapLength: number = 5, lineWidth: number = 1, lineColor: number = 0xa0a0a0
    ): Phaser.GameObjects.Graphics {
        // 绘制四条虚线边
        this.drawDashedLine(graphics, x, y, x + width, y, dashLength, gapLength, lineWidth, lineColor);
        this.drawDashedLine(graphics, x + width, y, x + width, y + height, dashLength, gapLength, lineWidth, lineColor);
        this.drawDashedLine(graphics, x + width, y + height, x, y + height, dashLength, gapLength, lineWidth, lineColor);
        this.drawDashedLine(graphics, x, y + height, x, y, dashLength, gapLength, lineWidth, lineColor);
        return graphics;
    }
    
}
