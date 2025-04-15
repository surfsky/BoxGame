import Phaser from 'phaser';
import { Control } from '../Control';

/**超链接，可下载文件 */
export class Link extends Control {
    private text: Phaser.GameObjects.Text;
    private linkUrl: string;
    private fileName: string;

    constructor(
        scene: Phaser.Scene,
        x: number = 0,
        y: number = 0,
        text: string,
        linkUrl: string,
        fileName = '',
    ) {
        super(scene, x, y);

        this.linkUrl = linkUrl;
        this.fileName = fileName;

        // 创建文本对象
        this.text = scene.add.text(0, 0, text, {
            fontSize: this.theme.text.normal.size + 'px',
            fontFamily: this.theme.text.normal.font,
            color: '#' + this.theme.link.color.toString(16).padStart(6, '0')
        });
        this.add(this.text);

        // 设置控件大小
        this.setSize(this.text.width, this.text.height);

        // 交互事件
        this.setInteractive({ 
            useHandCursor: true,
            hitArea: new Phaser.Geom.Rectangle(this.width/2, this.height/2, this.width, this.height),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
         });
        this.on('pointerover', this.onPointerOver, this);
        this.on('pointerout', this.onPointerOut, this);
        this.on('pointerdown', this.onPointerDown, this);
    }

    private onPointerOver(): void {
        this.text.setStyle({
            color: '#' + this.theme.link.hoverColor.toString(16).padStart(6, '0')
        });
    }

    private onPointerOut(): void {
        this.text.setStyle({
            color: '#' + this.theme.link.color.toString(16).padStart(6, '0')
        });
    }

    private onPointerDown(): void {
        const link = document.createElement('a');
        link.href = this.linkUrl;
        link.download = this.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    protected draw(): void {
        super.draw();
        // 更新文本样式
        this.text.setStyle({
            fontSize: this.theme.text.normal.size + 'px',
            fontFamily: this.theme.text.normal.font,
            color: '#' + this.theme.link.color.toString(16).padStart(6, '0')
        });
    }
}

