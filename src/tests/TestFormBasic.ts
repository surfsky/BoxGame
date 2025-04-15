import Phaser from 'phaser';
import { TestScene } from './TestScene';
import { CheckBox } from '../controls/forms/CheckBox';
import { Switcher } from '../controls/forms/Switcher';
import { RadioBox } from '../controls/forms/RadioBox';
import { GroupButton } from '../controls/forms/GroupButton';
import { Label } from '../controls/basic/Label';
import { ProgressBar } from '../controls/basic/ProgressBar';
import { ListBox } from '../controls/forms/ListBox';

/**测试基础控件场景 */
export class TestFormBasic extends TestScene {
    constructor() {
        super('TestFormBasic');
    }

    create() {
        this.createTitle('Control 示例');
        this.createBaseLine();
        
        // 进度条
        new ProgressBar(this, 100, 100, 300, 10).setProgress(60, true);
        new ProgressBar(this, 100, 120, 300, 10).setBarColor(0xff0000).setProgress(80, true);
        new ProgressBar(this, 100, 140, 300, 10).setBarColor(0x0000ff).setProgress(90, true);

        // 复选框
        new CheckBox(this, 100, 180, 200, 20, '复选框', true);
        new Switcher(this, 100, 220).showBounds(true);

        // 单选框组1
        new RadioBox(this, 100, 300, 200, 20, '选项1', 'group1', true);
        new RadioBox(this, 350, 300, 200, 20, '选项2', 'group1', false);
        new RadioBox(this, 600, 300, 200, 20, '选项3', 'group1', false);

        // 单选框组2
        new RadioBox(this, 100, 350, 200, 20, '类型A', 'group2', true);
        new RadioBox(this, 350, 350, 200, 20, '类型B', 'group2', false);

        // GroupButton示例
        const groupBtn1 = new GroupButton(this, 100, 400, 300, 40, ['选项A', '选项B', '选项C']);
        groupBtn1.on('changed', (index: number, item: string) => {
            console.log(`选中了选项: ${item}`);
        });

        const groupBtn2 = new GroupButton(this, 100, 450, 400, 40, ['简单', '普通', '困难', '地狱']);
        groupBtn2.setSelectedIndex(1);

        // ListBox示例 - 单选模式
        new Label(this, 100, 520, '单选列表：');
        const listBox1 = new ListBox(this, 100, 550, 200, 160)
            .bind(['选项1', '选项2', '选项3', '选项4'])
            .onChanged((indices, items) => {
                console.log('单选列表选中:', items);
            });

        // ListBox示例 - 多选模式
        new Label(this, 350, 520, '多选列表：');
        const listBox2 = new ListBox(this, 350, 550, 200, 160, { multiSelect: true })
            .bind(['苹果', '香蕉', '橙子', '葡萄'])
            .onChanged((indices, items) => {
                console.log('多选列表选中:', items);
            });
    }
}