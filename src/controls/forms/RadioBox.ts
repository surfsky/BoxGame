import Phaser from 'phaser';
import { Control } from '../Control';
import { Theme } from '../Theme';

/*********************************************************
 * RadioBox 控件
 * @example 
 * var rb = new RadioBox(scene, 0, 0, '选项1', 'group1', true).onChanged(() => {console.log('checked')});
 * var v = rb.getValue();
 *********************************************************/
export class RadioBox extends Control {
    private group: string;
    protected checked: boolean;
    protected text: string;
    protected label?: Phaser.GameObjects.Text;
    protected changedCallback?: () => void;
    protected innerCircle?: Phaser.GameObjects.Arc;

    /**
     * 创建单选按钮
     * @param scene 场景实例
     * @param x 按钮x坐标
     * @param y 按钮y坐标
     * @param text 按钮文本
     * @param group 分组名称，同组互斥
     * @param checked 是否选中
     */
    constructor(scene: Phaser.Scene, x: number, y: number, w:number, h:number, text: string, group: string, checked:boolean) {
        super(scene, x, y, w, h);
        this.text = text;
        this.group = group;
        this.checked = checked;
        this.draw();
        this.setEvents();
        return this;
    }

    /**绘制圆形单选框 */
    override draw() {
        super.draw();

        var d = this.height;
        var g = this.graphics;

        // 圆形外框
        g.fillStyle(0xffffff, 1);
        g.fillCircle(d/2, d/2, d/2);
        g.lineStyle(1, 0x000000, 1);
        g.strokeCircle(d/2, d/2, d/2);

        // 内实心圆形
        if (!this.innerCircle) {
            this.innerCircle = this.scene.add.circle(d/2, d/2, d*0.4, this.mainColor);
            this.innerCircle.setAlpha(this.checked ? 1 : 0);
            this.add(this.innerCircle);
        }
        this.innerCircle.fillColor = this.mainColor;

        // 右侧附上文本
        if (!this.label){
            this.label = this.scene.add.text(d*1.4, 0, this.text, {
                fontSize: '24px',
                color: '#000000',
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
            if (this.checked){
                this.setOtherValues(false);
            }
            if (this.changedCallback){
                this.changedCallback!();
            }
        });
    }    


    /**设置状态改变事件 */
    public onChanged(callback: () => void): RadioBox {
        this.changedCallback = callback;
        return this;
    }

    /**遍历场景中所有其它 RadioBox 并设置*/
    private setOtherValues(b: boolean) {
        this.scene.children.list.forEach((child) => {
            if (child instanceof RadioBox && child !== this && child.group === this.group) {
                child.setValue(b);
            }
        });
    }

    /**设置选中状态 */
    public setValue(value: boolean){
        if (value && !this.checked) {
            this.setOtherValues(false);
        }
        this.checked = value;
        if (this.checked) {
            this.innerCircle?.setAlpha(0);
            this.scene.tweens.add({
                targets: this.innerCircle,
                alpha: 1,
                duration: 200,
                ease: 'Linear'
            });
        } else {
            this.scene.tweens.add({
                targets: this.innerCircle,
                alpha: 0,
                duration: 200,
                ease: 'Linear'
            });
        }
        this.draw();
        return this;
    }

    /**获取选中状态 */
    public getValue(): boolean {
        return this.checked;
    }
}