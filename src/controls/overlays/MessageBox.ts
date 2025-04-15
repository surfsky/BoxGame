import { Scene } from 'phaser';
import { Dialog } from './Dialog';
import { DialogResult } from './DialogResult';
import { Button } from '../buttons/Button';

export interface MessageBoxOptions {
    title?: string;
    message?: string;
    showCancel?: boolean;
    okText?: string;
    cancelText?: string;
    width?: number;
    height?: number;
}

/**
 * 消息对话框组件
 * @example
 * ```ts
 * // 基本使用
 * const result = await MessageBox.show(scene, {
 *     message: '是否确认此操作？'
 * });
 * if (result === DialogResult.OK) {
 *     // 用户点击确定
 * }
 * 
 * // 自定义选项
 * const result = await MessageBox.show(scene, {
 *     title: '提示',
 *     message: '确认删除这条记录吗？',
 *     showCancel: true,
 *     okText: '删除',
 *     cancelText: '取消'
 * });
 * ```
 */
export class MessageBox extends Dialog {
    private options: MessageBoxOptions;

    /**
     * 静态方法显示消息对话框
     * @param scene 场景实例
     * @param options 对话框选项
     * @returns 对话框结果（OK或Cancel）
     */
    public static async show(scene: Scene, title:string, message:string, options?: MessageBoxOptions): Promise<DialogResult> {
        const dialog = new MessageBox(scene, title, message, options);
        return await dialog.show();
    }


    constructor(scene: Scene, title:string, message:string, options?: MessageBoxOptions) {
        super(scene, '', options?.width || 400, options?.height || 200);
        this.options = {
            title: title,
            message: message,
            showCancel: false,
            okText: '确定',
            cancelText: '取消',
            width: 400,
            height: 300,
            ...options
        };
        this.initializeComponents();
    }

    private initializeComponents() {
        // 创建标题（如果有）
        if (this.options.title) {
            const title = this.scene.add.text(this.width / 2, 30, this.options.title, {
                fontSize: '24px',
                color: '#000000',
                align: 'center'
            }).setOrigin(0.5);
            this.add(title);
        }

        // 创建消息文本
        const message = this.scene.add.text(this.width / 2, this.height / 2 - 20, this.options.message!, {
            fontSize: '20px',
            color: '#333333',
            align: 'center',
            wordWrap: { width: this.width - 40 }
        }).setOrigin(0.5);
        this.add(message);

        // 创建按钮容器
        const buttonY = this.height - 50;
        
        // 确定按钮
        const okButton = new Button(this.scene, this.width / 2 + (this.options.showCancel ? 70 : 0), buttonY, 
            this.options.okText || '确定', {
                width: 100,
                fontSize: '18px',
                bgColor: 0x4CAF50,
                padding: 20
            }).setOrigin(0.5).on('click', () => this.close(DialogResult.Ok));
        this.add(okButton);

        // 取消按钮（如果需要）
        if (this.options.showCancel) {
            const cancelButton = new Button(this.scene, this.width / 2 - 70, buttonY,
                this.options.cancelText || '取消', {
                    width: 100,
                    fontSize: '18px',
                    bgColor: 0xf44336,
                    padding: 20
                }).setOrigin(0.5).on('click', () => this.close(DialogResult.Cancel));
            this.add(cancelButton);
        }
    }

}