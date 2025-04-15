import Phaser from 'phaser';
import { Button } from '../controls/buttons/Button';
import { Control } from '../controls/Control';
import { Link } from '../controls/basic/Link';
import { Rect } from '../controls/Rect';
import { RectShape } from '../controls/basic/RectShape';
import { Column } from '../controls/layouts/Column';
import { CheckBox } from '../controls/forms/CheckBox';
import { TestScene } from './TestScene';

/**测试基础控件场景 */
export class TestControls extends TestScene {
    constructor() {
        super('TestControls');
    }

    preload() {
        this.load.image('icon-back', 'assets/icons/left.svg');
    }

    create() {
        this.createTitle('Control 示例');
        this.createBaseLine();

        var column = new Column(this, 10, 200, this.game.canvas.width-20, this.game.canvas.height, 20);
        column.setOrigin(0);

        // 创建基础Control示例
        const control = new Control(this, 0, 0, 200, 100);
        control.add(this.add.text(50, 50, 'control-text', {color: '#000'}).setOrigin(0.5));
        column.addChild(control);

        // 创建Rect示例
        const rect = new Rect(this, 0, 0, 200, 100, 10, 0x2ecc71);
        rect.add(this.add.text(75, 40, 'rect-text', {color: '#000'}).setOrigin(0.5));
        column.addChild(rect);
        
        // 创建Link示例
        const link = new Link(this, 0, 0, '点击我', "http://www.baidu.com");
        link.width = 200;
        link.height = 100;
        column.addChild(link);

        // 显示边界
        //column.showBounds();
        //column.showChildrenBounds();
    }
}