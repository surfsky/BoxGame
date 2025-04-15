import { GameConfig } from '../../GameConfig.ts';
import { DialogResult } from './DialogResult.ts';
import { Button } from '../buttons/Button.ts';
import { Panel } from '../Panel.ts';


export class MessageScene extends Phaser.Scene {
    private title: string = "";
    private content: string = "";
    private parentScene: string = "";
    private boxWidth: number = 800;
    private boxHeight: number = 800;
    private showCancel = true;
    private onConfirm?: () => void;
    private onCancel?: () => void;

    constructor() {
        super({ key: 'MessageBoxScene' });
    }

    /**
     * Show module messagebox
     * @param {Phaser.Scene} scene 
     * @param {string} title 
     * @param {string} content 
     * @param {boolean} showCancel
     * @returns {Promise<DialogResult>} 
     */
    static async show(scene:Phaser.Scene, title:string, content:string, showCancel:boolean=false): Promise<DialogResult> {
        return new Promise<DialogResult>((resolve) => {
            scene.scene.pause();
            scene.scene.launch('MessageBoxScene', {
                title: title,
                content: content,
                parentScene: scene.scene.key,
                width: scene.cameras.main.width * 0.95,
                height: scene.cameras.main.height * 0.60,
                showCancel: showCancel,
                onConfirm: () => {
                    resolve(DialogResult.Ok);
                },
                onCancel: () => {
                    resolve(DialogResult.Cancel);
                }
            });
        });
    }


    init(data: {title:string, content:string, parentScene:string, width:number, height:number, showCancel:boolean, onConfirm?:()=>void, onCancel?:()=>void}) {
        this.title = data.title;
        this.content = data.content;
        this.parentScene = data.parentScene;
        this.onConfirm = data.onConfirm;
        this.onCancel = data.onCancel;
        // 允许调用者设置尺寸，同时提供默认值
        this.boxWidth = data.width || this.cameras.main.width * 0.95;  // 加大默认宽度
        this.boxHeight = data.height || this.cameras.main.height * 0.85;  // 加大默认高度
        this.showCancel = data.showCancel;
    }

    create() {
        // 半透明背景
        this.add.rectangle(
            0, 0,
            this.cameras.main.width, this.cameras.main.height,
            0x000000, 0.7
        ).setOrigin(0);

        // 消息框背景和边框（居中数据）
        const boxX = this.cameras.main.width/2 - this.boxWidth/2;
        const boxY = this.cameras.main.height/2 - this.boxHeight/2;

        // 主背景（深色背景 + 白色边框）
        this.add.graphics()
            .fillStyle(0x222222, 1)
            .fillRoundedRect(boxX, boxY, this.boxWidth, this.boxHeight, 20)
            .lineStyle(2, 0xFFFFFF, 0.5)  // 改为白色细边框
            .strokeRoundedRect(boxX, boxY, this.boxWidth, this.boxHeight, 20);

        // 标题
        this.add.text(
            this.cameras.main.width/2,
            boxY + 60,
            this.title,
            {
                color: '#ffff00',
                fontSize: '54px',
                fontFamily: GameConfig.fonts.default,
            }
        ).setOrigin(0.5);

        // 内容区域
        const contentPadding = 20;
        const contentWidth = this.boxWidth - contentPadding * 2;
        const contentHeight = Math.max(300, this.boxHeight - 240 - contentPadding * 2);  // 设置最小高度

        // 创建可滚动文本
        const area = new Panel(this, boxX, boxY+130, contentWidth, contentHeight, contentHeight*2, 0, 0x000000); 
        //const area = UIHelper.createScrollContainer(this, boxX, boxY+130, contentWidth, contentHeight, contentHeight*2);
        var text = this.add.text(
            boxX + contentPadding,
            20,
            this.content,
            {
                fontSize: '36px',
                color: '#ffffff',
                fontFamily: GameConfig.fonts.default,
                lineSpacing: 15,
                align: 'left',
                wordWrap: {
                    width: contentWidth-40,
                    useAdvancedWrap: true
                },
                padding: {
                    x: 10,
                    y: 10
                }
            }
        ).setOrigin(0, 0);
        area.add(text);

        // 按钮区域
        const buttonY = boxY + this.boxHeight - 80;
        const buttonSpacing = 80;

        // 确认按钮
        var buttonX = this.showCancel ? this.cameras.main.width/2 - buttonSpacing : this.cameras.main.width/2;
        new Button(this, buttonX, buttonY, '确认', {width:140, height:60, radius:30, fontSize: '32px', bgColor:0x4a90e2})
            .onClick(() => {
                if (this.onConfirm) {
                    this.onConfirm();
                }
                this.hideScene();
            });

        // 取消按钮
        if (this.showCancel) {
            new Button(this, this.cameras.main.width/2 + buttonSpacing, buttonY, '取消', {width:140, height:60, radius:30, fontSize: '32px', bgColor:0xe74c3c})
               .onClick(() => {
                if (this.onCancel)
                    this.onCancel();
                this.hideScene();
           })
        }
    }

    private hideScene() {
        if (this.parentScene) {
            this.scene.resume(this.parentScene);
        }
        this.scene.stop();
    }
}
