import { Control } from "../Control";
import { Theme } from "../Theme";

export class Label extends Control {
    private text: Phaser.GameObjects.Text;
    private _style: 'normal' | 'small' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' = 'normal';

    constructor(scene: Phaser.Scene, x: number, y: number, text: string = '', style?: 'normal' |'small' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5') {
        super(scene, x, y);
        this._style = style || 'normal';
        this.text = scene.add.text(0, 0, text).setOrigin(0);
        this.add(this.text);
        this.setSize(this.text.width, this.text.height);  // 如何获取文本的实际宽度和高度？
        this.draw();
    }

    override draw() {
        super.draw();
        this.setStyle(this._style);
    }

    /**
     * 设置文本内容
     * @param text 文本内容
     */
    setText(text: string) {
        this.text.setText(text);
        this.setSize(this.text.width, this.text.height);
        return this;
    }

    /**
     * 设置文本样式
     * @param style 样式类型
     */
    setStyle(style: 'normal' | 'small' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5') {
        this._style = style;
        const textStyle = this.theme.text[this._style];
        this.text.setStyle({
            color: Theme.toColorText(this.theme.text.color),
            fontFamily: textStyle.font,
            fontSize: textStyle.size,
            align: 'left',
            lineSpacing: 10,
        });
        this.setSize(this.text.width, this.text.height);
        return this;
    }

}