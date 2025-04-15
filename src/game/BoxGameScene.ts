import Phaser from 'phaser'
import { Popup } from '../controls/overlays/Popup'
import { GameConfig } from '../GameConfig'
import { LevelManager } from './LevelManager'
import { SceneHelper } from '../utils/SceneHelper'
import { GameButton } from '../controls/buttons/GameButton'
import { Button } from '../controls/buttons/Button'

/**
 * @description: 推箱子游戏场景
 */
export default class BoxGameScene extends Phaser.Scene {
    // data
    private map!: number[][]
    private gameContainer!: Phaser.GameObjects.Container;
    private walls: Phaser.GameObjects.Sprite[] = [];
    private boxes: Phaser.GameObjects.Sprite[] = [];
    private targets: Phaser.GameObjects.Sprite[] = [];
    private player!: Phaser.GameObjects.Sprite;
    private playerPosition!: { row: number; col: number };

    // ui/resouce
    private bgm!: Phaser.Sound.BaseSound;
    private successSound!: Phaser.Sound.BaseSound;
    private levelManager!: LevelManager;
    private levelText!: Phaser.GameObjects.Text;
    private floor!: Phaser.GameObjects.Graphics;

    //
    private tileSize = 48;
    private titleHeight = 48;
    private bottomHeight = 200;


    //------------------------------------------------------------
    // lifecycle
    //------------------------------------------------------------
    constructor() {
        super('BoxGame')
    }

    /**预加载资源 */
    preload() {
        SceneHelper.showLoading(this);
        this.load.audio('success', 'assets/audio/success.mp3');
        this.load.audio('win', 'assets/audio/win.mp3');
        this.load.audio('bgm', 'assets/audio/bgm.mp3');
        this.load.audio('move', 'assets/audio/move.wav');
        this.load.audio('error', 'assets/audio/error.mp3');
        this.load.audio('clear', 'assets/audio/clear.mp3');
        this.load.image("bg", "assets/images/bg.png")
        this.load.svg('tiles',  'assets/images/tiles.svg');
        this.load.svg('player', 'assets/images/player.svg');
        this.load.svg('box',    'assets/images/box.svg');
        this.load.svg('target', 'assets/images/target.svg');
        this.load.svg('back', 'assets/icons/back.svg');
        this.load.svg('refresh', 'assets/icons/refresh.svg');
    }

    /**创建场景 */
    async create() {
        // 加载资源
        this.successSound = this.sound.add('success');
        this.bgm = this.sound.add('bgm');
        this.bgm.play({ loop: true, volume: 0.3 });
        this.add.image(0, 0, 'bg').setOrigin(0,0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // data
        this.levelManager = await LevelManager.getIntance();

        // 创建游戏元素
        this.createInfoPanel();
        this.initMap();
        this.createGameButtons();
        this.setupKeyEvents();
    }

    //------------------------------------------------------------
    // UI
    //------------------------------------------------------------
    /**创建游戏手柄 */
    private createGameButtons() {
        const size = 60;
        const p = 60;
        const x = this.game.canvas.width / 2;
        const y = this.game.canvas.height - p;
        this.createDirectionButton(x,     y,     size, '↓', 0, 1);
        this.createDirectionButton(x,     y - p, size, '↑', 0, -1);
        this.createDirectionButton(x - p, y,     size, '←', -1, 0);
        this.createDirectionButton(x + p, y,     size, '→', 1, 0);
    }

    /**创建方向按钮 */
    createDirectionButton(x: number, y: number, size: number, text: string, dx:number, dy:number){
        const button = new GameButton(this, x, y, size, size, text, {
                fillColor: 0x4a90e2,
                borderColor: 0xffffff,
                borderWidth: 2,
                borderRadius: size / 2,
                isIcon: false
            }).setOrigin(0.5);
        button.onPress(() => this.movePlayer(dx, dy));
        return button;
    };  

    /**创建右侧游戏信息面板 */
    private createInfoPanel() {
        const width = this.cameras.main.width;
        const infoPanel = this.add.container(0, 0).setSize(this.cameras.main.width, this.titleHeight);

        infoPanel.add(new Button(this, 30, 30, '', {width:40, height:40, radius:20, icon: 'back'}).onClick(()=>{ SceneHelper.goScene(this, 'Welcome') }));
        this.levelText = this.add.text(100, 30, `关卡: ${this.levelManager.getCurrentLevel()?.id}`, {
            fontSize: '24px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 4,
            fontFamily: GameConfig.fonts.title
        }).setOrigin(0, 0.5);
        infoPanel.add(this.levelText);

        //
        var btn = new Button(this, width-40, 30, '', {width:40, height:40, radius:20, icon: 'refresh'})
            .onClick(()=>{
              this.cleanLevel();
              this.initMap();
            }).setOrigin(0.5);
        infoPanel.add(btn);
    }

    /**更新右侧游戏信息面板 */
    updateInfoPanel(){
        this.levelText.setText(`关卡: ${this.levelManager.getCurrentLevel()?.id}`);
    }



    //------------------------------------------------------------
    // game ui
    //------------------------------------------------------------
    /**清理当前关卡 */
    cleanLevel() {
        // 清理所有游戏对象
        this.walls.forEach(wall => wall.destroy());
        this.boxes.forEach(box => box.destroy());
        this.targets.forEach(target => target.destroy());
        this.player.destroy();
        this.floor.clear();
        
        // 重置数组
        this.walls = [];
        this.boxes = [];
        this.targets = [];
    }

    /**初始化地图 */
    private initMap() {
        // level
        const level = this.levelManager.getCurrentLevel();
        this.map = level!.map;

        // tileSize 根据map 大小自动调整
        const maxRow = this.map.length;
        const maxCol = this.map[0].length;
        this.tileSize = Math.min((this.cameras.main.width-40) / maxCol, (this.cameras.main.height-this.titleHeight-this.bottomHeight) / maxRow);

        // container
        var centerX = this.cameras.main.width / 2;
        var centerY = this.cameras.main.height / 2;
        var containerWidth = this.map[0].length * this.tileSize;
        var containerHeight = this.map.length * this.tileSize;
        this.gameContainer = this.add.container(centerX-containerWidth/2, centerY-containerHeight/2);
        this.gameContainer.setSize(containerWidth, containerHeight);
        this.updateInfoPanel();

        // floor
        this.floor = this.add.graphics();
        this.floor.fillStyle(0xf0f0f0);
        this.gameContainer.add(this.floor);

        // 创建地图瓦片和目标点
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[0].length; col++) {
            const x = col * this.tileSize;
            const y = row * this.tileSize;
            var item = this.map[row][col];

            // 创建地板
            if (item != 8) {
                this.floor.fillRect(x, y, this.tileSize, this.tileSize);
            }

            // 创建地板或墙
            if (this.map[row][col] === 1) {
                const wall = this.add.sprite(x, y, 'tiles').setDisplaySize(this.tileSize, this.tileSize).setOrigin(0,0).setDepth(1);
                this.gameContainer.add(wall);
                this.walls.push(wall);
            }
            
            // 创建目标点（设置最底层深度）
            if (this.map[row][col] === 3) {
                const target = this.add.sprite(x, y, 'target').setDisplaySize(this.tileSize, this.tileSize).setOrigin(0, 0).setDepth(2);
                this.gameContainer.add(target);
                this.targets.push(target);
            }
            
            // 创建箱子
            if (this.map[row][col] === 2) {
                const box = this.add.sprite(x, y, 'box').setDisplaySize(this.tileSize, this.tileSize).setOrigin(0, 0).setDepth(3);
                this.gameContainer.add(box);
                this.boxes.push(box);
            }
            }
        }

        // player position
        this.playerPosition = {row: level!.player.row, col: level!.player.col}; // level!.player;  // 引用方式会导致player数据变化
        this.player = this.add.sprite(this.playerPosition.col * this.tileSize, this.playerPosition.row * this.tileSize, 'player')
            .setDisplaySize(this.tileSize, this.tileSize)
            .setOrigin(0,0)
            .setDepth(4)
            ;
        this.gameContainer.add(this.player);
    }

    //------------------------------------------------------------
    // game logic
    //------------------------------------------------------------
  /**设置按键交互 */
  private setupKeyEvents() {
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':    this.movePlayer(0, -1);  break;
        case 'ArrowDown':  this.movePlayer(0, 1);   break;
        case 'ArrowLeft':  this.movePlayer(-1, 0);  break;
        case 'ArrowRight': this.movePlayer(1, 0);   break;
      }
    });
  }


  /**移动玩家精灵 */
  private movePlayer(dx: number, dy: number) {
    // 获取玩家相对于地图起始位置的坐标
    const currentRow = this.playerPosition.row;
    const currentCol = this.playerPosition.col;
    const nextRow = currentRow + dy;
    const nextCol = currentCol + dx;
    
    // 检查是否超出地图边界或撞墙
    if (nextRow < 0 || nextRow >= this.map.length || nextCol < 0 || nextCol >= this.map[0].length || this.map[nextRow][nextCol] === 1) {
      this.sound.play('error');
      return;
    }
    
    // 检查是否推箱子
    const box = this.findBox(nextRow, nextCol);
    if (box) {
      const boxNextRow = nextRow + dy;
      const boxNextCol = nextCol + dx;
      
      // 检查箱子移动位置是否合法
      if (boxNextRow < 0 || boxNextRow >= this.map.length || 
          boxNextCol < 0 || boxNextCol >= this.map[0].length || 
          this.map[boxNextRow][boxNextCol] === 1 || 
          this.existBox(boxNextRow, boxNextCol)) {
        this.sound.play('error');
        return;
      }
      
      // 移动箱子
      box.setPosition(boxNextCol * this.tileSize, boxNextRow * this.tileSize);
      this.checkWinCondition();
    } else {
      this.sound.play('move');
    }
    
    // 更新玩家位置
    this.playerPosition.row = nextRow;
    this.playerPosition.col = nextCol;
    this.player.setPosition(nextCol * this.tileSize, nextRow * this.tileSize);
  }

    /**检查指定位置是否存在箱子 */ 
    private existBox(boxNextRow: number, boxNextCol: number): boolean {
        return this.boxes.some(b => {
            const bRow = Math.floor(b.y / this.tileSize)
            const bCol = Math.floor(b.x / this.tileSize)
            return bRow === boxNextRow && bCol === boxNextCol
        })
    }

    /**查找指定位置的箱子，若存在则返回箱子精灵 */
    private findBox(row: number, col: number) : Phaser.GameObjects.Sprite | undefined{
        return this.boxes.find(box => {
            const boxRow = Math.floor(box.y / this.tileSize)
            const boxCol = Math.floor(box.x / this.tileSize)
            return boxRow === row && boxCol === col
        })
    }



    /**检测是否胜利 */
    private checkWinCondition() {
        // 检查所有箱子是否都在目标点上
        const allBoxesOnTarget = this.boxes.every(box => {
            return this.targets.some(target => {
                return box.x === target.x && box.y === target.y;
            });
        });
        if (allBoxesOnTarget) {
            if (this.levelManager.hasNextLevel())
                this.showLevelWin();
            else
                this.showGameWin();
        }
    }

  /**游戏过关 */
  private showLevelWin() {
    this.successSound.play();
    this.levelManager.unlockNextLevel();

    // 创建胜利弹窗，使用游戏场景中心点
    const sceneWidth = this.cameras.main.width;
    const sceneHeight = this.cameras.main.height;
    const popup = new Popup(this, sceneWidth / 2, sceneHeight / 2, {
      width: 400,
      height: 300,
      backgroundColor: 0xffffff,
      borderRadius: 20,
      modal: true,
      animation: 'scale',
      closeOnClickOutside: false
    });

    // 添加标题文本
    const title = this.add.text(0, -40, '恭喜过关！', {
      fontSize: '32px',
      color: 'black',
      fontFamily: GameConfig.fonts.title
    }).setOrigin(0.5);
    popup.addChild(title);

    // 添加下一关按钮
    var btn = new Button(this, 0, 100, '下一关')
        .setOrigin(0.5)
        .onClick(()=>{
            popup.hide();
            this.levelManager.goNextLevel();
            this.cleanLevel();
            this.initMap();
        });
    popup.addChild(btn);
    popup.show();
  }

  /**游戏通关 */
  private showGameWin() {
    this.sound.play('win');
    const popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
      width: 400,
      height: 300,
      backgroundColor: 0xffffff,
      borderRadius: 20,
      modal: true,
      animation: 'scale'
    });

    const title = this.add.text(0, -40, '恭喜通关！', {
      fontSize: '32px',
      color: '#000000',
      fontFamily: GameConfig.fonts.title
    }).setOrigin(0.5);
    popup.add(title);

    var btn = new Button(this, 0, 100, '重新开始')
      .setOrigin(0.5)
      .onClick(()=>{
        popup.hide();
        this.levelManager.resetToFirstLevel();
        this.cleanLevel();
        this.initMap();
      });
    popup.add(btn);
    popup.show();
  }
}