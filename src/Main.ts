import 'phaser';
import { MessageScene } from './controls/overlays/MessageScene';
import { AboutScene } from './AboutScene';
import { BoxGameScene } from './game/BoxGameScene';
import { WelcomeScene } from './game/WelcomeScene';


const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game',
    backgroundColor: '#ffffff',
    scene: [
        WelcomeScene,
        BoxGameScene,
        MessageScene,
        AboutScene
    ]
};

new Phaser.Game(config);