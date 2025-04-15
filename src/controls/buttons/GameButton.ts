import Phaser from 'phaser';
import { Control } from '../Control';

/**定制的游戏按钮控件，可响应点按长按等逻辑 */
export class GameButton extends Control { //} Phaser.GameObjects.Container {
    //private graphics: Phaser.GameObjects.Graphics;
    private label?: Phaser.GameObjects.Text;
    private icon?: Phaser.GameObjects.Image;
    private pressTime?: Date;
    private options: {
        fillColor: number,
        borderColor: number,
        borderWidth: number,
        borderRadius: number,
        isIcon?: boolean
    };

    /**创建文本按钮 */
    constructor(
        scene: Phaser.Scene, 
        x: number, y: number, width: number, height: number, textOrIconKey: string, 
        options: { fillColor: number, borderColor: number, borderWidth: number, borderRadius: number, isIcon?: boolean }
    ) {
        super(scene, x, y);
        this.setSize(width, height);
        this.options = options;

        // 创建背景
        this.draw();

        // 根据isIcon选项创建文本或图标
        if (options.isIcon) {
            // 创建图标
            this.icon = scene.add.image(width / 2, height / 2, textOrIconKey)
                .setOrigin(0.5)
                .setDisplaySize(width * 0.6, height * 0.6);
            this.add(this.icon);
        } else {
            // 创建文本
            this.label = scene.add.text(width / 2, height / 2, textOrIconKey, { fontSize: '24px', color: '#FFF' });
            this.label.setOrigin(0.5);
            this.add(this.label);
        }
    }

    /**draw */
    override draw() {
        super.draw();
        this.graphics.fillStyle(this.options.fillColor, 1);
        this.graphics.lineStyle(this.options.borderWidth, this.options.borderColor, 1);
        this.graphics.fillRoundedRect(0, 0, this.width, this.height, this.options.borderRadius);
        this.graphics.strokeRoundedRect(0, 0, this.width, this.height, this.options.borderRadius);
    }

    /**Set interractive */
    public setActive(){
        this.setInteractive({ cursor: 'pointer', hitArea: new Phaser.Geom.Rectangle(this.width / 2, this.height / 2, this.width, this.height), hitAreaCallback: Phaser.Geom.Rectangle.Contains });
        return this;
    }


    /**Button click event. Trigged once when key up. 
     * @param shortClick trigger function when short time click.
     * @param longClick trigger function when long time click.
    */
    public onClick(shortClick: () => void, longClick?: () => void) {
        //this.setInteractive({ cursor: 'pointer', hitArea: new Phaser.Geom.Rectangle(this.width / 2, this.height / 2, this.width, this.height), hitAreaCallback: Phaser.Geom.Rectangle.Contains })
        this.setActive()
            .on('pointerdown', () => {
                this.setScale(0.9);
                this.pressTime = new Date();
            })
            .on('pointerup', () => {
                this.setScale(1.0);
                if (longClick != null && this.pressTime && new Date().getTime() - this.pressTime.getTime() > 300) {
                    longClick();
                    return;
                }
                else {
                    shortClick();
                }
            });
        return this;
    }

    /**Button press event. Trigged when key down */
    private timer?: Phaser.Time.TimerEvent;

    /**Button press event. Trigged interval when interval notequal -1. 
     * @param [interval=-1] trigger interval in ms.
     * @param func trigger function.
    */
    public onPress(func: () => void, interval: number = -1) {
        this.setActive();
        if (interval == -1){
            this.on('pointerdown', () => {this.setScale(0.9); func();})
                .on('pointerup',   () => {this.setScale(1.0);})
                ;
        }
        else{
            this.on('pointerdown', () => {
                this.setScale(0.9);
                func();
                this.deleteTimer();
                this.timer = this.scene.time.addEvent({
                    delay: interval,
                    callback: () => func(),
                    loop: true
                });
                //this.timer.delay = interval;   // readonly
                //console.log('create press timer');
            })
            .on('pointerup', () => {
                this.setScale(1.0);
                this.deleteTimer();
            });
        }
        //this.setInteractive({ cursor: 'pointer', hitArea: new Phaser.Geom.Rectangle(this.width / 2, this.height / 2, this.width, this.height), hitAreaCallback: Phaser.Geom.Rectangle.Contains })
            
        return this;
    }

    private deleteTimer() {
        if (this.timer) {
            this.timer.remove();
            //this.timer.destroy();
            //this.timer = undefined;
            //console.log('destory press timer');
        }
    }
}