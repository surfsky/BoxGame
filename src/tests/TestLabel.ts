import Phaser from 'phaser';
import { TestScene } from './TestScene';
import { CheckBox } from '../controls/forms/CheckBox';
import { Switcher } from '../controls/forms/Switcher';
import { RadioBox } from '../controls/forms/RadioBox';
import { GroupButton } from '../controls/forms/GroupButton';
import { Label } from '../controls/basic/Label';
import { ProgressBar } from '../controls/basic/ProgressBar';

/**测试基础控件场景 */
export class TestLabel extends TestScene {
    constructor() {
        super('TestLabel');
    }

    create() {
        this.createTitle('Label');
        this.createBaseLine();
        
        // Label示例
        new Label(this, 100, 150, '普通文本').setStyle('normal');
        new Label(this, 100, 200, '小号文本').setStyle('small');
        new Label(this, 100, 250, '一级标题').setStyle('h1');
        new Label(this, 100, 300, '二级标题').setStyle('h2');
        new Label(this, 100, 350, '三级标题').setStyle('h3');
        new Label(this, 100, 400, '四级标题').setStyle('h4');
        new Label(this, 100, 450, '五级标题').setStyle('h5');
    }
}