import Phaser from 'phaser'
import { Popup } from '../controls/overlays/Popup'
import { GameConfig } from '../GameConfig'
import { LevelManager } from './LevelManager'
import { SceneHelper } from '../utils/SceneHelper'
import { GameButton } from '../controls/buttons/GameButton'
import { Button } from '../controls/buttons/Button'
import { PoseController } from './PoseController'
import { Toast } from '../controls/overlays/Toast'
import { MessageBox } from '../controls/overlays/MessageBox'
import { DialogResult } from '../controls/overlays/DialogResult'

/**
 * @description: 推箱子游戏场景
 */
export class BoxGameScene extends Phaser.Scene {
    // data & game spirits
    private levelManager!: LevelManager;
    private map!: number[][]
    private gameContainer!: Phaser.GameObjects.Container;
    private player!: Phaser.GameObjects.Sprite;
    private isPlayerSliding: boolean = false;

    // todo: 计划合并这几个数组，用name区分
    private floorGraphics!: Phaser.GameObjects.Graphics;
    private walls: Phaser.GameObjects.Sprite[] = [];
    private boxes: Phaser.GameObjects.Sprite[] = [];
    private targets: Phaser.GameObjects.Sprite[] = [];
    private ices: Phaser.GameObjects.Sprite[] = [];

    // controls
    private poseController?: PoseController;
    private isPoseEnable: boolean = false;
    private arrowButtons: { [key: string]: GameButton } = {};

    // ui/resouce
    private sndBg!: Phaser.Sound.BaseSound;
    private sndSuccess!: Phaser.Sound.BaseSound;
    private lblLevel!: Phaser.GameObjects.Text;
    private btnPose!: Button
    private popup!: Popup

    // const
    private tileSize = 48;
    private titleHeight = 48;
    private bottomHeight = 200;


    //------------------------------------------------------------
    // lifecycle
    //------------------------------------------------------------
    constructor() {
        super('BoxGameScene')
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
        this.load.image('player', 'assets/images/bunny.png');
        this.load.svg('wall',  'assets/images/wall.svg');
        this.load.svg('box',    'assets/images/box.svg');
        this.load.svg('target', 'assets/images/target.svg');
        this.load.svg('ice',    'assets/images/ice.svg'); // 加载冰块地面图片
        this.load.svg('back', 'assets/icons/back.svg');
        this.load.svg('refresh', 'assets/icons/refresh.svg');
        this.load.svg('human', 'assets/icons/human.svg'); // 新的人体图标, 请确保该文件存在
    }

    /**创建场景 */
    async create() {
        // 加载资源
        this.sndSuccess = this.sound.add('success');
        this.sndBg = this.sound.add('bgm');
        this.sndBg.play({ loop: true, volume: 0.3 });
        this.add.image(0, 0, 'bg').setOrigin(0,0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // data
        this.levelManager = await LevelManager.getIntance();

        // 创建游戏元素
        this.createTitle();
        this.initMap();
        this.createArrowPad();
        this.setupKeyEvents();
    }

    //------------------------------------------------------------
    // UI
    //------------------------------------------------------------
    /**创建右侧游戏信息面板 */
    private createTitle() {
        const width = this.cameras.main.width;
        const panel = this.add.container(0, 0).setSize(this.cameras.main.width, this.titleHeight);

        // 返回按钮
        var btnBack = new Button(this, 30, 30, '', {width:40, height:40, radius:20, icon:'back', iconWidth:30, iconHeight:30})
            .onClick(()=>{this.scene.start('WelcomeScene');}).setOrigin(0, 0.5);
        panel.add(btnBack);

        // 等级文本
        this.lblLevel = this.add.text(100, 30, `关卡 ${this.levelManager.getCurrLevel()?.id}`, {
            fontSize: '24px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 4,
            fontFamily: GameConfig.fonts.title
        }).setOrigin(0, 0.5);
        panel.add(this.lblLevel);

        // 重置按钮
        var btn = new Button(this, width-40, 30, '', {width:40, height:40, radius:20, icon: 'refresh', iconWidth:30, iconHeight:30})
            .onClick(()=>{
                this.cleanLevel();
                this.initMap();
            }).setOrigin(0.5);
        panel.add(btn);

        // 添加体感控制按钮
        this.btnPose = new Button(this, width-90, 30, '', {width:40, height:40, radius:20, icon: 'human', iconWidth:25, iconHeight:25})
            .setOrigin(0.5)
            .onClick(async ()=>{ 
                this.isPoseEnable = !this.isPoseEnable;
                await this.enablePose(this.isPoseEnable);
            });
        panel.add(this.btnPose);
    }


    /**更新右侧游戏信息面板 */
    updateTitle(){
        this.lblLevel.setText(`关卡 ${this.levelManager.getCurrLevel()?.id}`);
    }



    //------------------------------------------------------------
    // game scene
    //------------------------------------------------------------
    /**清理当前关卡 */
    cleanLevel() {
        // 清理所有游戏对象
        this.walls.forEach(wall => wall.destroy());
        this.boxes.forEach(box => box.destroy());
        this.targets.forEach(target => target.destroy());
        this.ices.forEach(ice => ice.destroy());
        this.player.destroy();
        this.floorGraphics.clear();
        
        // 重置数组
        this.walls = [];
        this.boxes = [];
        this.targets = [];
        this.ices = [];
        this.isPlayerSliding = false;
    }

    /**初始化地图 */
    private initMap() {
        // level
        const level = this.levelManager.getCurrLevel();
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
        this.updateTitle();

        // floor
        this.floorGraphics = this.add.graphics();
        this.floorGraphics.fillStyle(0xf0f0f0);
        this.gameContainer.add(this.floorGraphics);

        // 创建地图瓦片和目标点
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[0].length; col++) {
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                var v = this.map[row][col];

                // 先贴上地板（8表示空地不贴地板）
                if (v != 8) {
                    this.floorGraphics.fillRect(x, y, this.tileSize, this.tileSize);
                }

                // 创建冰块地面
                if (v === 4) {
                    const ice = this.add.sprite(x, y, 'ice').setDisplaySize(this.tileSize, this.tileSize).setOrigin(0,0).setDepth(0);
                    this.gameContainer.add(ice);
                    this.ices.push(ice);
                }

                // 创建墙
                if (v === 1) {
                    const wall = this.add.sprite(x, y, 'wall').setDisplaySize(this.tileSize, this.tileSize).setOrigin(0,0).setDepth(1);
                    this.gameContainer.add(wall);
                    this.walls.push(wall);
                }
                
                // 创建目标点（设置最底层深度）
                if (v === 3) {
                    const target = this.add.sprite(x, y, 'target').setDisplaySize(this.tileSize, this.tileSize).setOrigin(0, 0).setDepth(2);
                    this.gameContainer.add(target);
                    this.targets.push(target);
                }
                
                // 创建箱子
                if (v === 2) {
                    const box = this.add.sprite(x, y, 'box').setDisplaySize(this.tileSize, this.tileSize).setOrigin(0, 0).setDepth(4);
                    box.setName('box').setDataEnabled().setData('pos', { row: row, col: col });  // 可将行列数据保存在spirit中
                    this.gameContainer.add(box);
                    this.boxes.push(box);
                }
            }
        }

        // player position
        var playerPos = {row: level!.player.row, col: level!.player.col}; // level!.player;  // 不能用引用方式，会导致player数据变化
        this.player = this.add.sprite(playerPos.col * this.tileSize, playerPos.row * this.tileSize, 'player')
            .setDisplaySize(this.tileSize, this.tileSize)
            .setOrigin(0,0)
            .setDepth(4)
            .setDataEnabled()
            .setData('pos', { row: playerPos.row, col: playerPos.col});
        this.gameContainer.add(this.player);
    }


    //------------------------------------------------------------
    // 游戏操作控制（虚拟按键、键盘、体感）
    //------------------------------------------------------------
    /**创建游戏虚拟按钮 */
    private createArrowPad() {
        const size = 60;
        const p = 60;
        const x = this.game.canvas.width / 2;
        const y = this.game.canvas.height - p;
        this.createArrowButton(x,     y,     size, '↓', 0,  1);
        this.createArrowButton(x,     y - p, size, '↑', 0, -1);
        this.createArrowButton(x - p, y,     size, '←', -1, 0);
        this.createArrowButton(x + p, y,     size, '→', 1,  0);
    }

    /**创建方向按钮 */
    createArrowButton(x: number, y: number, size: number, text: string, dx:number, dy:number){
        const direction = dx === 0 ? (dy === 1 ? 'down' : 'up') : (dx === 1 ? 'right' : 'left');
        const button = new GameButton(this, x, y, size, size, text, {
            fillColor: 0x4a90e2,
            borderColor: 0xffffff,
            borderWidth: 2,
            borderRadius: size / 2,
            isIcon: false
        }).setOrigin(0.5).onPress(() => this.movePlayer(dx, dy));
        this.arrowButtons[direction] = button;
        return button;
    };  


    /**设置按键交互 */
    private setupKeyEvents() {
        this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowUp':    this.movePlayer(0, -1);  break;
                case 'ArrowDown':  this.movePlayer(0, 1);   break;
                case 'ArrowLeft':  this.movePlayer(-1, 0);  break;
                case 'ArrowRight': this.movePlayer(1, 0);   break;
                case 'Enter':      this.closePopup();       break;
            }
        });
    }

    /**设置体感控制 */
    private async enablePose(open: boolean) {
        this.btnPose.setEnabled(false);

        // 关闭体感控制
        if (!open){
            this.btnPose.setEnabled(true);
            this.poseController?.stop();
            this.poseController = undefined;
            Toast.show(this, '体感控制已关闭');
            return;
        }

        // 开启体感控制
        try {
            Toast.show(this, '体感控制开启中...')
            if (!this.poseController) {
                this.poseController = new PoseController(this)
                    .onInit(()=>Toast.show(this, '体感初始化成功'))
                    .onPose((direction: string)=>{
                        this.setArrowButtonTint(direction);
                        switch (direction) {
                            case 'up':     this.movePlayer(0, -1); break;
                            case 'down':   this.movePlayer(0, 1);  break;
                            case 'left':   this.movePlayer(-1, 0); break;
                            case 'right':  this.movePlayer(1, 0);  break;
                            case 'ok':     this.closePopup();      break;
                        }
                    });
            }
            await this.poseController.init();
            await this.poseController.start();
            this.btnPose.setEnabled(true);
        } catch (error) {
            console.error("启动体感控制失败:", error)
            this.poseController = undefined
            this.btnPose.setEnabled(true)
        }
    }

    /**设置方向按钮颜色 */
    private setArrowButtonTint(direction: string) {
        const button = this.arrowButtons[direction]
        if (button) {
            button.setTint(0x00ff00)
            this.time.delayedCall(200, () => button.clearTint())
        }
    }

    //------------------------------------------------------------
    // 游戏逻辑
    //------------------------------------------------------------
    /**移动玩家精灵 */
    private movePlayer(dx: number, dy: number) {
        if (this.isPlayerSliding) return;

        // 获取玩家相对于地图起始位置的坐标
        const currPos = this.player.getData('pos') as { row: number, col: number };
        const nextRow = currPos.row + dy;
        const nextCol = currPos.col + dx;
        
        // 检查是否超出地图边界或撞墙
        if (nextRow < 0 || nextRow >= this.map.length 
            || nextCol < 0 || nextCol >= this.map[0].length 
            || this.map[nextRow][nextCol] === 1
        ) {
            this.sound.play('error');
            return;
        }
        
        // 检查是否推箱子
        const box = this.findBox(nextRow, nextCol);
        if (!box){
            this.sound.play('move');
            // 更新玩家位置，并检查是否在冰面上，如果是则继续滑行
            this.player.setPosition(nextCol * this.tileSize, nextRow * this.tileSize);
            this.player.setData('pos', { row: nextRow, col: nextCol });
            if (this.map[nextRow][nextCol] === 4) {
                this.slidePlayerOnIce(nextRow, nextCol, dx, dy);
            }
        }
        else {
            const boxNextRow = nextRow + dy;
            const boxNextCol = nextCol + dx;
            
            // 检查箱子移动位置是否合法
            if (boxNextRow < 0 || boxNextRow >= this.map.length || 
                boxNextCol < 0 || boxNextCol >= this.map[0].length || 
                this.map[boxNextRow][boxNextCol] === 1 || 
                this.findBox(boxNextRow, boxNextCol)
            ) {
                this.sound.play('error');
                return;
            }
            
            // 移动箱子，并检查箱子是否在冰面上，如果是则继续滑行
            box.setPosition(boxNextCol * this.tileSize, boxNextRow * this.tileSize);
            box.setData('pos', { row: boxNextRow, col: boxNextCol });
            this.sound.play('move');
            if (this.map[boxNextRow][boxNextCol] === 4) {
                this.slideBoxOnIce(box, boxNextRow, boxNextCol, dx, dy);
            }

            //
            this.checkWinCondition();
        }
    }


    /**查找指定位置的箱子，若存在则返回箱子精灵 */
    private findBox(row: number, col: number) : Phaser.GameObjects.Sprite | undefined{
        return this.boxes.find(box => {
            var pos = box.getData('pos') as {row:number, col:number};
            return pos.row === row && pos.col === col;
        })
    }

    /**玩家在冰面上滑行 */
    private slidePlayerOnIce(row: number, col: number, dx: number, dy: number) {
        const nextRow = row + dy;
        const nextCol = col + dx;
        
        // 检查是否可以继续滑行
        if (nextRow < 0 || nextRow >= this.map.length || 
            nextCol < 0 || nextCol >= this.map[0].length || 
            this.map[nextRow][nextCol] === 1 || 
            this.findBox(nextRow, nextCol)
        ) {
            this.isPlayerSliding = false;
            return; // 遇到障碍物停止滑行
        }
        
        // 用 Tween 来实现平滑的动画
        this.isPlayerSliding = true;
        this.sound.play('move');
        this.tweens.add({
            targets: this.player,
            x: nextCol * this.tileSize,
            y: nextRow * this.tileSize,
            duration: 200, // 滑行时间
            ease: 'Linear', // 线性缓动
            onComplete: () => {
                // 如果下一个位置仍然是冰面，继续滑行
                this.player.setData('pos', { row: nextRow, col: nextCol });
                if (this.map[nextRow][nextCol] === 4) {
                    this.slidePlayerOnIce(nextRow, nextCol, dx, dy);
                }
                else
                    this.isPlayerSliding = false;
            }
        });
    }
    
    /**箱子在冰面上滑行 */
    private slideBoxOnIce(box: Phaser.GameObjects.Sprite, row: number, col: number, dx: number, dy: number) {
        const nextRow = row + dy;
        const nextCol = col + dx;
        
        // 检查是否可以继续滑行
        if (nextRow < 0 || nextRow >= this.map.length || 
            nextCol < 0 || nextCol >= this.map[0].length || 
            this.map[nextRow][nextCol] === 1 || 
            this.findBox(nextRow, nextCol)
        ) {
            return; // 遇到障碍物停止滑行
        }
        
        // 用 Tween 来实现平滑的动画
        box.setDepth(9999);  // 为什么无效？始终在冰块下面？
        this.sound.play('move');
        this.tweens.add({
            targets: box,
            x: nextCol * this.tileSize,
            y: nextRow * this.tileSize,
            duration: 200, // 滑行时间
            ease: 'Linear', // 线性缓动
            onComplete: () => {
                // 如果下一个位置仍然是冰面，继续滑行
                box.setData('pos', { row: nextRow, col: nextCol });
                if (this.map[nextRow][nextCol] === 4) {
                    this.slideBoxOnIce(box, nextRow, nextCol, dx, dy);
                }
                this.checkWinCondition();
            }
        });
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
            if (this.levelManager.hasNextLevel()){
                this.sndSuccess.play();
                this.levelManager.unlockNextLevel();
                this.time.delayedCall(500, () => {this.showMessage('恭喜过关！', '下一关', ()=>{ this.goNextLevel();})});
            }
            else{
                this.sound.play('win');
                this.time.delayedCall(500, () => {this.showMessage('恭喜通关！', '重新开始', ()=>{ this.goFirstLevel();})});
            }
        }
    }

    /**显示一个对话框，包含一个标题和一个按钮 */
    private showMessage(title: string, btnText: string, func: () => void) {
        this.popup = new Popup(this, this.cameras.main.centerX, this.cameras.main.centerY, {
            width: 400,
            height: 300,
            backgroundColor: 0xffffff,
            borderRadius: 20,
            modal: true,
            animation: 'scale'
        })

        const lblTitle = this.add.text(0, -40, title, {
            fontSize: '32px',
            color: '#000000',
            fontFamily: GameConfig.fonts.title
        }).setOrigin(0.5)
        this.popup.add(lblTitle)

        var btn = new Button(this, 0, 100, btnText)
            .setOrigin(0.5)
            .onClick(func)
        this.popup.add(btn)
        this.popup.show()
    }


    /**关闭对话框 */
    private closePopup(){
        if (this.popup.visible){
            if (this.levelManager.hasNextLevel())
                this.goNextLevel();
            else
                this.goFirstLevel();
        }
    }

    /**下一关 */
    private goNextLevel() {
        if (this.popup.visible){
            this.popup.hide();
            this.levelManager.goNextLevel();
            this.cleanLevel();
            this.initMap();
        }
    }

    /**重新开始 */
    private goFirstLevel() {
        this.popup.hide()
        this.levelManager.resetToFirstLevel()
        this.cleanLevel()
        this.initMap()
    }
}