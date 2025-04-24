import Phaser from 'phaser';
import { Button } from '../controls/buttons/Button';
import { GameButton } from '../controls/buttons/GameButton';
import { TestBlock } from './TestBlock';
import { MessageScene } from '../controls/overlays/MessageScene';
import { TestScene } from './TestScene';
import { MessageBox } from '../controls/overlays/MessageBox';

/**测试表单控件场景 */
export class TestTTS extends TestScene {
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
        const btn = new Button(this, centerX, centerY, '说人话').setOrigin(0.5);
        btn.onClick(()=>{
            //var speaker = window.speechSynthesis;
            //speaker.speak(new SpeechSynthesisUtterance('你好。Hello world!'));
            speak('你好。Hello world!');
        });
    }
}

/**Speak */
function speak(text: string) {
    var synth = window.speechSynthesis;
    if (text !== '') {
        console.log('speak init');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        console.log('speak init ok');
        console.log(synth);
        console.log(utterance);
        synth.speak(utterance);
        console.log('speak finished');
    }
}

