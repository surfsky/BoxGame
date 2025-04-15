import Phaser from 'phaser';
import { TextBox, TextType } from '../controls/forms/TextBox';
import { TestScene } from './TestScene';

/**测试表单控件场景 */
export class TestInput extends TestScene {
    constructor() {
        super('TestInput');
    }

    preload() {
        // 预加载按钮图片
        this.load.image('icon-test', 'assets/icons/down.svg');
    }

    create() {
        this.createTitle("Form");
        this.createBaseLine();
        
        // 使用TextType的输入校验文本框
        const textbox1 = new TextBox(this, 100, 100, {
            type: TextType.text,
            placeholder: '普通文本输入',
            width: 500
        });

        const textbox2 = new TextBox(this, 100, 160, {
            type: TextType.number,
            placeholder: '仅数字输入',
            width: 500
        });

        const textbox3 = new TextBox(this, 100, 220, {
            type: TextType.chinese,
            placeholder: '仅中文输入',
            width: 500
        });

        const textbox4 = new TextBox(this, 100, 280, {
            type: TextType.email,
            placeholder: '邮箱格式：example@domain.com',
            width: 500
        });

        const textbox5 = new TextBox(this, 100, 340, {
            type: TextType.phone,
            placeholder: '手机号码：13xxxxxxxxx',
            width: 500
        });

        // 使用自定义正则表达式的输入校验文本框
        const textbox6 = new TextBox(this, 100, 400, {
            regex: '^[A-Z]{2}\\d{4}$',
            placeholder: '产品编号格式：AB1234',
            width: 500
        });

        const textbox7 = new TextBox(this, 100, 460, {
            regex: '^#[0-9a-fA-F]{6}$',
            placeholder: 'HEX颜色值：#FF0000',
            width: 500
        });

        const textbox8 = new TextBox(this, 100, 520, {
            regex: '^(\\+\\d{1,3})?\\s?\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4}$',
            placeholder: '国际电话：+1 (123) 456-7890',
            width: 500
        });

        // 多行文本框示例
        const textbox9 = new TextBox(this, 100, 580, {
            multiline: true,
            rows: 3,
            placeholder: '请输入多行文本...',
            width: 500,
            maxLength: 500
        });
    }
}
