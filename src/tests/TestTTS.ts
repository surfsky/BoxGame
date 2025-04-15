import Phaser from 'phaser';
import { Button } from '../controls/buttons/Button';
import { GameButton } from '../controls/buttons/GameButton';
import { TestBlock } from './TestBlock';
import { MessageScene } from '../controls/overlays/MessageScene';
import { TestScene } from './TestScene';
import { MessageBox } from '../controls/overlays/MessageBox';

/**测试表单控件场景 */
export class TestTTS extends TestScene {
    speaker = window.speechSynthesis;

    constructor() {
        super('TestTTS');
    }

    preload() {
        // 预加载按钮图片
        this.load.image('icon-test', 'assets/icons/down.svg');
        this.load.image('icon-back', 'assets/icons/left.svg');
    }

    create() {
        this.createTitle("TTS");


        var centerX = this.cameras.main.centerX;
        var centerY = this.cameras.main.centerY;

        // 基础按钮测试
        const btn = new Button(this, centerX, centerY, '说人话').setOrigin(0.5);
        btn.onClick(()=>{
            try{
                this.speaker.speak(new SpeechSynthesisUtterance('你好。Hello world!'));
            }
            catch(e: any){
                MessageBox.show(this, '错误', '浏览器不支持语音合成。' + e.message);
            }
        });
        

    }
}

