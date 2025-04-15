import Phaser, { Game } from 'phaser';
import { Button } from '../controls/buttons/Button';
import { DropDownList } from '../controls/forms/DropDownList';
import { ThemeManager } from '../controls/Theme';
import { GameConfig } from '../GameConfig';
import { Label } from '../controls/basic/Label';
import { Switcher } from '../controls/forms/Switcher';
import { Toast } from '../controls/overlays/Toast';

/**测试基础控件场景 */
export class TestScene extends Phaser.Scene {
    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload() {
        this.load.image(GameConfig.icons.back.key, GameConfig.icons.back.key);
        this.load.image(GameConfig.icons.down.key, GameConfig.icons.down.path);
        this.load.image(GameConfig.icons.close.key, GameConfig.icons.close.path);
    }

    create() {
        this.createTitle('Control 示例');
    }

    /**Create a base line */
    public createBaseLine(x:number=100){
        var g = this.add.graphics();
        g.lineStyle(1, 0xa0a0a0);
        g.strokeLineShape(new Phaser.Geom.Line(x, 0, x, this.game.canvas.height));
    }

    /**Create title items */
    public createTitle(title: string) {
        //this.add.text(100, 20, title, { fontSize: '32px', color: '#000' }).setOrigin(0);
        new Label(this, 100, 20, title, 'h1');

        // 添加返回按钮
        const backButton = new Button(this, 30, 30, '', {
            width: 40,
            height: 40,
            radius: 20,
            bgColor: 0x2ecc71,
        }).setOrigin(0.5);
        backButton.setIcon(GameConfig.icons.back.key, 1.4);
        backButton.on('click', () => { this.scene.start('TestIndex'); });


        // 添加主题选择下拉框
        const ddlTheme = new DropDownList(this, {
            x: this.cameras.main.width - 170,
            y: 30,
            width: 160,
            height: 34,
            items: ['Light', 'Dark', 'Green', 'Purple', 'DarkBlue'],
            borderRadius: 17,
        }); //.setDepth(1);
        ddlTheme.onChanged((index: number) => {
            switch(index) {
                case 0: ThemeManager.setTheme(this, ThemeManager.themeLight); break;
                case 1: ThemeManager.setTheme(this, ThemeManager.themeDark); break;
                case 2: ThemeManager.setTheme(this, ThemeManager.themeGreen); break;
                case 3: ThemeManager.setTheme(this, ThemeManager.themePurple); break;
                case 4: ThemeManager.setTheme(this, ThemeManager.themeDarkBlue); break;
            }
        });

        // 添加边框显示切换开关
        const borderSwitcher = new Switcher(this, this.cameras.main.width - 60, 20);
        borderSwitcher.setValue(false);
        borderSwitcher.on('change', (value: boolean) => {
            // 遍历场景中的所有游戏对象
            this.children.list.forEach((child: any) => {
                if (child.showBounds) {
                    child.showBounds(value);
                }
            });
            new Toast(this, value? '显示边框' : '隐藏边框').setDepth(99999).show();
        });
    }
}