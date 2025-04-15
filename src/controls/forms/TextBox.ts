import { Control } from '../Control';
import { Theme } from '../Theme';
import { ThemeManager } from '../Theme';

export interface TextBoxOptions {
    width?: number;
    height?: number;
    fontSize?: string;
    bgColor?: number;
    borderColor?: number;
    focusColor?: number;
    placeholder?: string;
    maxLength?: number;
    type?: TextType;
    regex?: string;
    value?: string;
    multiline?: boolean;
    rows?: number;
}

/**文本类型 */
export enum TextType{
    text = '^.*$',
    number = '^\\d*$',
    decimal = '^[0-9]+(.[0-9]+)?$',
    integer = '^[0-9]*$',
    chinese = '^[\u4e00-\u9fa5]{0,}$',
    english = '^[a-zA-Z]{0,}$',
    password = '^[a-zA-Z0-9]{6,20}$',
    date = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
    time = '^[0-9]{2}:[0-9]{2}:[0-9]{2}$',
    datetime = '^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$',
    email = '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$',
    url = '^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+',
    phone = '^1[3456789]\\d{9}$',
    idcard = '^[1-9]\\d{5}[1-9]\\d{3}((0\\d)|(1[0-2]))(([0|1|2]\\d)|3[0-1])\\d{3}([0-9]|X)$'
}

export class TextBox extends Control {
    private text!: Phaser.GameObjects.Text;
    private background!: Phaser.GameObjects.Graphics;
    private placeholder!: Phaser.GameObjects.Text;
    private cursor!: Phaser.GameObjects.Graphics;
    private cursorTween!: Phaser.Tweens.Tween;
    private options: TextBoxOptions;
    private focused: boolean = false;
    private value: string = '';

    constructor(scene: Phaser.Scene, x: number, y: number, options: TextBoxOptions = {}) {
        const {
            width = 200,
            height = 40
        } = options;

        super(scene, x, y, width, height);
        this.options = {
            fontSize: '24px',
            bgColor: 0xffffff,
            borderColor: ThemeManager.current.border.color, // 0x4a90e2,
            focusColor: Theme.namedColor.black, // 0x5ba1f3,
            placeholder: '',
            maxLength: 100,
            type: TextType.text,
            value: '',
            multiline: false,
            rows: 1,
            ...options
        };

        if (this.options.multiline && this.options.rows && this.options.rows > 1) {
            this.height = this.options.rows * 40;
        }

        this.value = this.options.value || '';
        this.createBackground();
        this.createPlaceholder();
        this.createMasker();
        this.createText();
        this.createCursor();
        this.setupInteractive();
    }

    private createBackground() {
        this.background = this.scene.add.graphics();
        this.drawBackground();
        this.add(this.background);
    }

    private createPlaceholder() {
        this.placeholder = this.scene.add.text(5, this.height/2, this.options.placeholder||'', {
            fontSize: this.options.fontSize,
            color: '#999999'
        }).setOrigin(0, 0.5);
        this.add(this.placeholder);
        this.placeholder.setMask(this.masker);
        this.updatePlaceholderVisibility();
    }

    private masker!: Phaser.Display.Masks.GeometryMask;
    private createMasker(){
        var g  = this.scene.add.graphics();
        g.fillStyle(0xff0000);
        g.fillRect(this.x+5, this.y, this.width - 10, this.options.multiline ? this.height - 10 : this.height).setVisible(false);  // masker 必须基于场景创建
        this.masker = new Phaser.Display.Masks.GeometryMask(this.scene, g);
    }

    private createText() {
        this.text = this.scene.add.text(5, this.options.multiline ? 5 : this.height/2, this.value, {
            fontSize: this.options.fontSize,
            color: '#000000',
            wordWrap: { width: this.width - 10, useAdvancedWrap: true }
        }).setOrigin(0, this.options.multiline ? 0 : 0.5);
        this.add(this.text);
        this.text.setMask(this.masker);
    }

    private createCursor() {
        this.cursor = this.scene.add.graphics();
        this.cursor.lineStyle(2, Theme.namedColor.red);
        this.cursor.lineBetween(5, 4, 5, this.height-8);
        this.cursor.setVisible(false);
        this.cursor.setMask(this.masker);
        this.add(this.cursor);

        this.cursorTween = this.scene.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
            paused: true
        });
    }

    private updateCursorPosition() {
        if (!this.options.multiline) {
            const textWidth = this.text.width;
            this.cursor.setPosition(5 + textWidth, 4);
        } else {
            const lines = this.value.split('\n');
            let currentHeight = 0;
            let totalWidth = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const lineMetrics = this.scene.game.canvas.getContext('2d')?.measureText(lines[i]);
                if (i < lines.length - 1) {
                    currentHeight += 30;
                } else {
                    totalWidth = lineMetrics!.width;
                }
            }
            
            this.cursor.setPosition(5 + totalWidth, 4 + currentHeight);
        }
    }

    private drawBackground(errorState: boolean = false) {
        this.background.clear();
        let color = this.focused ? (this.options.focusColor || 0x5ba1f3) : (this.options.borderColor || 0x4a90e2);
        if (errorState) {
            color = 0xff0000; // 错误状态使用红色边框
        }
        this.background.lineStyle(2, color);
        this.background.fillStyle(this.options.bgColor || 0xffffff);
        this.background.fillRect(0, 0, this.width, this.height);
        this.background.strokeRect(0, 0, this.width, this.height);
    }

    private hiddenInput!: HTMLInputElement | HTMLTextAreaElement;

    private setupInteractive() {
        this.setInteractive(new Phaser.Geom.Rectangle(this.width/2, this.height/2, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        
        // 创建隐藏的input元素
        this.hiddenInput = document.createElement(this.options.multiline ? 'textarea' : 'input');
        this.hiddenInput.style.position = 'absolute';
        this.hiddenInput.style.opacity = '0';
        this.hiddenInput.style.pointerEvents = 'none';
        document.body.appendChild(this.hiddenInput);

        this.hiddenInput.addEventListener('input', (e) => {
            this.updateValue(this.hiddenInput.value, false);
        });

        this.hiddenInput.addEventListener('keydown', ((e: KeyboardEvent) => {
            if (e.key === 'Enter' && this.options.multiline) {
                e.preventDefault();
                const cursorPos = this.hiddenInput.selectionStart || 0;
                const value = this.hiddenInput.value;
                const newValue = value.slice(0, cursorPos) + '\n' + value.slice(cursorPos);
                this.updateValue(newValue, false);
            }
        }) as EventListener);

        this.on('pointerdown', () => {
            this.focus();
        });

        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.getBounds().contains(pointer.x, pointer.y)) {
                this.blur();
            }
        });
    }

    private updateValue(newValue: string, addNew: boolean) {
        // 检查长度限制
        if (this.value.length + newValue.length > (this.options.maxLength || 100)) return;

        let finalValue = addNew ? this.value + newValue : newValue;
        
        this.value = finalValue;
        this.text.setText(this.value);
        this.updatePlaceholderVisibility();
        this.updateCursorPosition();
        this.emit('change', this.value);

        // 重置边框颜色
        if (this.focused) {
            this.drawBackground();
        }
    }

    private updatePlaceholderVisibility() {
        this.placeholder.setVisible(this.value.length === 0);
    }

    private getBasicCharRegex(type: TextType): RegExp | null {
        switch(type) {
            case TextType.email:
                return /^[a-zA-Z0-9@._-]*$/; // 邮箱基本字符
            case TextType.phone:
                return /^[0-9]*$/; // 手机号基本字符
            case TextType.url:
                return /^[a-zA-Z0-9:/.?&=_-]*$/; // URL基本字符
            case TextType.chinese:
                return /^[一-龥]*$/; // 中文字符
            case TextType.english:
                return /^[a-zA-Z]*$/; // 英文字符
            case TextType.password:
                return /^[a-zA-Z0-9]*$/; // 密码基本字符
            case TextType.date:
            case TextType.time:
            case TextType.datetime:
                return /^[0-9:-\s]*$/; // 日期时间基本字符
            default:
                return null; // 其他类型不做基本字符验证
        }
    }

    public focus() {
        this.focused = true;
        this.drawBackground();
        this.cursor.setVisible(true);
        this.cursorTween.resume();
        this.placeholder.setVisible(false);
        this.hiddenInput.focus();
        //this.cursor.setAlpha(1);
        //this.updateCursorPosition();
        //this.cursorTween.restart();
        //this.emit('focus');
    }

    public blur() {
        this.focused = false;
        this.cursor.setVisible(false);
        this.cursorTween.pause();
        if (this.value.length === 0) {
            this.placeholder.setVisible(true);
            this.drawBackground(false);
            return;
        }

        // 在失去焦点且有输入内容时进行验证
        let isValid = true;
        if (this.options.regex && !this.options.multiline) {
            const regex = new RegExp(this.options.regex);
            isValid = regex.test(this.value);
        } else if (this.options.type && !this.options.multiline) {
            const regex = new RegExp(this.options.type);
            isValid = regex.test(this.value);
        }

        if (!isValid) {
            this.drawBackground(true);
            this.emit('error', '输入格式不正确');
        } else {
            this.drawBackground(false);
        }

        this.emit('blur');
    }

    public setValue(value: string) {
        this.value = value;
        this.text.setText(value);
        this.updatePlaceholderVisibility();
        return this;
    }

    public getValue(): string {
        return this.value;
    }

    public setPlaceholder(text: string) {
        this.options.placeholder = text;
        this.placeholder.setText(text);
        return this;
    }

    public destroy() {
        if (this.cursorTween) {
            this.cursorTween.destroy();
        }
        if (this.hiddenInput) {
            this.hiddenInput.remove();
        }
        this.scene.input.keyboard!.off('keydown');
        super.destroy();
    }
}