import { Scene } from 'phaser';
import { Button } from '../controls/buttons/Button';
import { DialogResult } from '../controls/overlays/DialogResult';
import { TestScene } from './TestScene';
import { MessageBox } from '../controls/overlays/MessageBox';
import { InputDialog } from '../controls/overlays/InputDialog';
import { TextType } from '../controls/forms/TextBox';
import { Toast } from '../controls/overlays/Toast';

export class TestDialog extends TestScene {
    constructor() {
        super({ key: 'TestDialog' });
    }

    create() {
        super.createTitle('MessageBox');
        this.createBaseLine();


        // 基本消息对话框
        new Button(this, this.cameras.main.centerX, 150, '基本消息对话框').onClick(async () => {
            const result = await MessageBox.show(this, '', '这是一个基本的消息对话框');
            console.log('对话框结果：', result);
        });

        // 确认对话框
        new Button(this, this.cameras.main.centerX, 220, '确认对话框').onClick(async () => {
            const result = await MessageBox.show(this, '确认操作', '是否确认执行此操作？', { showCancel: true});
            if (result === DialogResult.Ok) {
                console.log('用户确认了操作');
            } else {
                console.log('用户取消了操作');
            }
        });

        // 自定义按钮文本的对话框
        new Button(this, this.cameras.main.centerX, 290, '自定义按钮对话框').onClick(async () => {
            const result = await MessageBox.show(this, '删除确认', '确认要删除这条记录吗？', {
                showCancel: true,
                okText: '删除',
                cancelText: '返回'
            });
            if (result === DialogResult.Ok) {
                console.log('用户确认删除');
            }
        });

        // 自定义尺寸的对话框
        new Button(this, this.cameras.main.centerX, 360, '自定义尺寸对话框').onClick(async () => {
            const result = await MessageBox.show(this, '提示', '这是一个较大尺寸的对话框，可以显示更多的内容。\n支持多行文本显示，并会自动换行。',{
                width: 500,
                height: 300,
                showCancel: true
            });
            console.log('对话框结果：', result);
        });

        // 输入对话框
        new Button(this, this.cameras.main.centerX, 430, '输入对话框').onClick(async () => {
            await this.showInputDialog();
        });
    }


    async showInputDialog() {
        const inputDialog = new InputDialog(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            title: '用户信息',
            message: '请输入您的姓名（2-10个字符）',
            placeholder: '请输入姓名',
            defaultValue: '',
            textType: TextType.text,
            validator: (value: string) => {
                if (value.length < 2 || value.length > 10) {
                    return '姓名长度必须在2-10个字符之间';
                }
                return true;
            }
        });

        const result = await inputDialog.show();
        if (result === DialogResult.Ok) {
            new Toast(this, `您输入的姓名是：${inputDialog.getValue()}`).show();
        }
    }
}