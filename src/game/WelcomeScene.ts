import Phaser from 'phaser'
import { Panel } from '../controls/Panel'
import { Button } from '../controls/buttons/Button'
import { GameConfig } from '../GameConfig'
import { LevelManager } from './LevelManager'
import { SceneHelper } from '../utils/SceneHelper'

/**
 * @description: 游戏欢迎场景
 */
export class WelcomeScene extends Phaser.Scene {
    private levelManager!: LevelManager;
    constructor() {
        super('WelcomeScene')
    }

    /**预加载资源 */
    preload() {
        SceneHelper.showLoading(this);
        this.load.image('bg', 'assets/images/bg.png')
        this.load.svg('lock', 'assets/icons/lock.svg')
    }

    //------------------------------------------------------------
    // UI
    //------------------------------------------------------------
    /**创建场景 */
    async create() {
        // 加载关卡数据
        this.levelManager = await LevelManager.getIntance();

        // 背景
        this.add.image(0, 0, 'bg')
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)

        // UI
        this.createTitle();
        this.createLevelPanel();
        this.createCopyright();
    }

    /**创建标题 */
    private createTitle() {
        this.add.text(this.cameras.main.centerX, 40, '箱子推推看', {
            fontSize: '36px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 6,
            fontFamily: GameConfig.fonts.title
        }).setOrigin(0.5)
    }

  /**创建版权信息 */
  createCopyright() {
      const lblCopyright = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.height - 30,
        '© 2025 箱子推推看',
        {
            fontSize: '14px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 4,
            fontFamily: GameConfig.fonts.title
        }
      ).setOrigin(0.5).setInteractive().on('pointerdown', () => {
          this.scene.start('AboutScene');
      });
  }

  /**创建关卡选择面板 */
  private createLevelPanel() {
      const panelWidth = this.game.canvas.width - 40;// 600
      const panelHeight = this.game.canvas.height - 180; //400
      const panel = new Panel(
        this,
        20,
        100,
        panelWidth,
        panelHeight,
        panelHeight * 2,
        10
      );

      // 计算起始位置
      const buttonSize = 40;
      const spacing = 10;
      const columns = panelWidth / (buttonSize + spacing*2) | 0;
      const startX = spacing;
      const startY = spacing * 1.5;

      // 创建关卡按钮
      const levels = this.levelManager.getLevels();
      levels.forEach((level, index) => {
          const col = index % columns;
          const row = Math.floor(index / columns);
          const x = startX + col * (buttonSize + spacing) + buttonSize/2;
          const y = startY + row * (buttonSize + spacing) + buttonSize/2;

          // 创建按钮
          const button = new Button(this, x, y, (index + 1).toString(), {
            width: buttonSize,
            height: buttonSize,
            bgColor: level.unlocked ? 0x4a90e2 : 0x95a5a6,
            radius: 10
          }).setOrigin(0, 0);  // todo

          // 如果关卡未解锁，添加锁定图标
          if (!level.unlocked) {
              const lock = this.add.image(x, y, 'lock').setDisplaySize(24, 24).setOrigin(0.5);
              panel.add(lock);
          }

          // 添加点击事件
          if (level.unlocked) {
            button.onClick(() => {
                this.levelManager.setCurrentLevel(index);
                this.scene.start('BoxGameScene');
            })
          }

          panel.add(button);
      });
  }
}