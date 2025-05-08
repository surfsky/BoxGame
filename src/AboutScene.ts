import { GameConfig} from './GameConfig.ts';
import { SceneHelper } from './utils/SceneHelper.js';
import { UIHelper } from './utils/UIHelper.js';
import { Button } from './controls/buttons/Button.js';
import { Panel } from './controls/Panel.js';
import { ThemeManager } from './controls/Theme.ts';

export class AboutScene extends Phaser.Scene {
    private scrollPanel!: Panel; // Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'AboutScene' });
    }
    
    preload() {
        this.load.image('arrow-left', 'assets/icons/left.svg');
        this.load.image('code', 'assets/images/code.png');
        this.load.image(GameConfig.icons.back.key, GameConfig.icons.back.path);
    }

    create() {
        // 背景
        SceneHelper.setBgColor(this, 0x000000);

        // 标题
        this.add.text(
            this.cameras.main.width/2,
            20,
            '关于',
            {
                color: '#ffff00',
                fontSize: 52,
                fontFamily: GameConfig.fonts.title,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 4,
                    fill: true
                }
            }
        ).setOrigin(0.5, 0);

        // 文本
        this.scrollPanel = new Panel(this, 0, 100, this.game.canvas.width, this.game.canvas.height, this.game.canvas.height*2, 0, 0x000000);
        var txt = this.add.text(
            this.cameras.main.width/2,
            50,
            [
                '箱子推推看',
                '版本：1.0.0',
                `
                - 经典推箱子游戏改版；
                - 增加冰块地面，物体和角色会滑行；
                - 支持AI自动过关演示;
                - 支持键盘、虚拟按键操作；
                - 支持摄像头体感操作：
                    右：右手平举
                    左：左手平举
                    上：双手上举
                    下：下蹲至地
                `,
                '作者：程建和',
                '联系：微信 surfsky',
                '版权所有 © 2025',
            ].join('\n'),
            {
                fontSize: 24,
                color: '#ffffff',
                fontFamily: GameConfig.fonts.default,
                align: 'center',
                lineSpacing: 20,
                wordWrap: {
                    width: this.cameras.main.width - 40,
                    useAdvancedWrap: true
                },
                padding: {
                    x: 20,
                    y: 20
                }
            }
        ).setOrigin(0.5, 0);
        this.scrollPanel.add([txt]);
        this.scrollPanel.resetContentHeight();
        this.scrollPanel.scrollToEnd(10000);


        // 返回按钮
        new Button(this, 30, 30, '', {width:40, height:40, radius:20, icon:'back', iconWidth:30, iconHeight:30})
            .setOrigin(0, 0).setAnimate()
            .onClick(()=>{SceneHelper.goScene(this, 'WelcomeScene');})
            ;
    }
}
