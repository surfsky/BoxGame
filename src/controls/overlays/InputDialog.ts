import { Popup, PopupOptions } from './Popup';
import { TextBox, TextBoxOptions, TextType } from '../forms/TextBox';
import { Button } from '../buttons/Button';
import { DialogResult } from './DialogResult';
import { Anchor } from '../Anchor';

export interface InputDialogOptions {
    title?: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    textType?: TextType;
    validator?: (value: string) => boolean | string;
    textboxOptions?: TextBoxOptions;
    width?: number;
    height?: number;
}

/**
 * 输入对话框控件
 * 允许用户输入一个文本，包含输入提示文本、输入框、确定取消按钮
 */
export class InputDialog extends Popup {
    private textBox!: TextBox;
    private resultPromise!: { resolve: (value: DialogResult) => void };
    private value: string = '';
    private errorText!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, options: InputDialogOptions = {}) {
        const opt: InputDialogOptions = {
            width: 400,
            height: 250,
            title: '请输入',
            message: '',
            placeholder: '',
            defaultValue: '',
            textType: TextType.text,
            ...options
        };
        super(scene, x, y, {
            width: opt.width,
            height: opt.height,
            modal: true,
            anchor: Anchor.center,
            dragable: false,
            closeOnClickOutside: false,
        });

        this.createContent(opt);
    }

    private createContent(opt: InputDialogOptions) {
        // 标题
        const title = this.scene.add.text(0, -this.height/2 + 30, opt.title!, {
            fontSize: '24px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        // 提示消息
        const message = this.scene.add.text(0, -this.height/4, opt.message!, {
            fontSize: '18px',
            color: '#666666',
            align: 'center',
            wordWrap: { width: this.width - 40 }
        }).setOrigin(0.5);

        // 输入框
        this.textBox = new TextBox(this.scene, 0, 0, {
            width: this.width - 40,
            placeholder: opt.placeholder,
            value: opt.defaultValue,
            type: opt.textType,
            ...opt.textboxOptions
        }).setOrigin(0.5);
        //this.textBox.setOrigin(0.5);

        // 错误提示文本
        this.errorText = this.scene.add.text(0, 40, '', {
            fontSize: '14px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5).setVisible(false);

        // 按钮容器
        const buttonContainer = this.scene.add.container(0, this.height/2 - 50);
        
        // 确认按钮
        const confirmButton = new Button(this.scene, -70, 0, '确认', {
            width: 100,
            fontSize: '20px',
            bgColor: 0x4CAF50,
            padding: 20
        }).setOrigin(0.5).on('click', () => this.confirm());

        // 取消按钮
        const cancelButton = new Button(this.scene, 70, 0, '取消', {
            width: 100,
            fontSize: '20px',
            bgColor: 0xf44336,
            padding: 20
        }).setOrigin(0.5).on('click', () => this.cancel());

        buttonContainer.add([confirmButton, cancelButton]);
        this.addChild([title, message, this.textBox, this.errorText, buttonContainer]);
    }

    /**
     * 显示输入对话框
     * @returns Promise<DialogResult>
     */
    async show(): Promise<DialogResult> {
        return new Promise((resolve) => {
            this.resultPromise = { resolve };
            super.show();
            this.textBox.focus();
        });
    }

    /**
     * 获取输入的值
     */
    getValue(): string {
        return this.textBox.getValue();
    }

    private confirm() {
        const value = this.getValue();
        const options = this.options as InputDialogOptions;

        if (options.validator) {
            const result = options.validator(value);
            if (result !== true) {
                this.showError(typeof result === 'string' ? result : '输入格式不正确');
                return;
            }
        }

        this.value = value;
        this.hide();
        this.resultPromise.resolve(DialogResult.Ok);
    }

    private cancel() {
        this.hide();
        this.resultPromise.resolve(DialogResult.Cancel);
    }

    private showError(message: string) {
        this.errorText.setText(message);
        this.errorText.setVisible(true);
    }
}