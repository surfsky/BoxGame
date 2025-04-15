import Phaser from 'phaser';
import { Button, ButtonOptions } from './Button';

/**文件选择器 */
export class FileButton extends Button
{
    private fileInput: HTMLInputElement;
    private callback = (files: FileList|null, input: HTMLInputElement) => {};

    constructor(scene: Phaser.Scene, x: number, y: number, text?: string, accept?: string, options: ButtonOptions = {}) {
        super(scene, x, y, text, options);
        scene.add.existing(this);

        // file input
        //var accept = '.xlsx,.xls';
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = accept ?? "";
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);

        // events
        this.on('click', () => this.fileInput.click());
        this.fileInput.onchange = (e: Event) => {
            const input = e.target as HTMLInputElement;
            this.callback(input.files, input);
        };
    }

    /**
     * 设置文件选择回调
     * @param callback 回调函数
     */
    public onFileSelected(callback: (files:FileList|null, input:HTMLInputElement)=>{}): this {
        this.callback = callback;
        return this;
    }
}

