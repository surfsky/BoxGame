import 'phaser';
import { MessageScene } from './controls/overlays/MessageScene';
import { AboutScene } from './AboutScene';
import BoxGameScene from './game/BoxGameScene';
import { WelcomeScene } from './game/WelcomeScene';

// 检测是否为移动设备
const isMobile = () => {
  return window.innerWidth < 800;
};


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
  ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x:0 },
      debug: false
    }
  }
};

new Phaser.Game(config);