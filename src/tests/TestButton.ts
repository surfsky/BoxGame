import Phaser from 'phaser';
import { Button } from '../controls/buttons/Button';
import { GameButton } from '../controls/buttons/GameButton';
import { TestBlock } from './TestBlock';
import { TestScene } from './TestScene';
import { ImageButton } from '../controls/buttons/ImageButton';

/**测试表单控件场景 */
export class TestButton extends TestScene {
    constructor() {
        super('TestButton');
    }

    preload() {
        // 预加载按钮图片
        this.load.image('icon-test', 'assets/icons/down.svg');
        this.load.image('icon-back', 'assets/icons/left.svg');
        this.load.image('icon-home', 'assets/icons/home.svg');
        this.load.image('icon-settings', 'assets/icons/settings.svg');
        
        // 预加载按钮背景图片
        this.load.image('btn-circle', 'assets/images/btn-circle.svg');
        this.load.image('btn-rect', 'assets/images/btn-rect.svg');
    }

    create() {
        this.createTitle("Button");
        this.createBaseLine(100);

        // 基础按钮测试
        const basicButton = new Button(this, 100, 100, '基础按钮').setOrigin(0);
        
        // 带图标的按钮
        const iconButton = new Button(this, 100, 200, '图标按钮', {
            iconPosition: 'left',
            width: 200,
            height: 60,
            bgColor: 0x6c5ce7,
            icon: 'icon-test'
        });

        // 禁用状态按钮
        const disabledButton = new Button(this, 100, 300, '禁用按钮', {
            bgColor: 0xe74c3c
        });
        disabledButton.setEnabled(false);

        // 自定义样式按钮
        const customButton = new Button(this, 100, 400, '自定义样式', {
            width: 200,
            height: 60,
            radius: 30,
            fontSize: '24px',
            bgColor: 0x2ecc71,
            hoverColor: 0x27ae60,
            borderColor: 0x2ecc71,
            borderWidth: 3
        });


        // 圆形背景的图片按钮
        const circleImageBtn = new ImageButton(this, 400, 100, 'btn-circle', '图像按钮', {
            width: 100,
            height: 100,
            fontSize: '16px',
            textColor: '#ffffff'
        });

        // 方形背景的图片按钮
        const rectImageBtn = new ImageButton(this, 400, 250, 'btn-rect', '图像按钮', {
            width: 200,
            height: 60,
            fontSize: '20px',
            textColor: '#ffffff'
        });

        // 组合图标和背景的按钮
        const combinedImageBtn = new ImageButton(this, 400, 400, 'btn-circle', '', {
            width: 80,
            height: 80
        }).setText('设置').setEnabled(false);
 
    }
}

