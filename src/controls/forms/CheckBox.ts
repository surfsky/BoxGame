import Phaser from 'phaser';
import { Control } from '../Control';
import { Theme } from '../Theme';

/*********************************************************
 * CheckBox 控件
 * @example 
 * var cb = new CheckBox(scene, 0, 0, '测试', true).onChanged(() => {console.log('checked')});
 * var v = cb.getValue();
 *********************************************************/
export class CheckBox extends Control {
    protected checked: boolean;
    protected text: string;
    protected label?: Phaser.GameObjects.Text;
    protected innerRect?: Phaser.GameObjects.Rectangle;

    /**获取选中状态*/
    getValue(){
        return this.checked;
    }
    setValue(value: boolean){
        this.checked = value;
        if (this.checked) {
            this.innerRect?.setAlpha(0);
            this.scene.tweens.add({
                targets: this.innerRect,
                alpha: 1,
                duration: 200,
                ease: 'Linear'
            });
        } else {
            this.scene.tweens.add({
                targets: this.innerRect,
                alpha: 0,
                duration: 200,
                ease: 'Linear'
            });
        }
        this.draw();
        return this;
    }

    /**
     * 创建按钮
     * @param scene 场景实例
     * @param x 按钮x坐标
     * @param y 按钮y坐标
     * @param text 按钮文本
     */
    constructor(scene: Phaser.Scene, x: number, y: number, w:number, h:number, text: string, checked:boolean) {
        super(scene, x, y);
        this.setSize(w, h);
        this.checked = checked;
        this.text = text;
        this.draw();
        this.setEvents();
        return this;
    }

    /**绘制 */
    protected override draw(){
        super.draw();

        //
        var d = this.height;
        var g = this.graphics;

        // 矩形外框
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, d, d);
        g.lineStyle(1, 0x000000, 1);
        g.strokeRect(0, 0, d, d);

        // 内实心矩形
        if (!this.innerRect) {
            this.innerRect = this.scene.add.rectangle(d*0.5, d*0.5, d*0.8, d*0.8, this.mainColor);
            this.innerRect.setAlpha(this.checked ? 1 : 0);
            this.add(this.innerRect);
        }
        this.innerRect.fillColor = this.mainColor;

        // 右侧附上文本
        if (!this.label){
            this.label = this.scene.add.text(d*1.4, 0, this.text, {
                fontSize: '24px',
                color: Theme.toColorText(this.theme.text.color), // '#000000',
            });
            this.label.setOrigin(0, 0);
            this.add(this.label);
        }
        this.label.setText(this.text);
        this.label.style.setColor(Theme.toColorText(this.theme.text.color));
    }


    /**设置事件 */
    protected setEvents(){
        this.setInteractive({ 
            cursor: 'pointer', 
            hitArea: new Phaser.Geom.Rectangle(this.width / 2, this.height / 2, this.width, this.height), 
            hitAreaCallback: Phaser.Geom.Rectangle.Contains 
        });
        this.on('pointerdown', () => {
            this.setValue(!this.checked);
            //this.draw();
            if (this.changedCallback){
                this.changedCallback();
            }
        });
    }

    /**设置值变更事件 */
    protected changedCallback?: ()=>{};
    public onChanged(callback: ()=>{}){
        this.changedCallback = callback;
        return this;
    }
}