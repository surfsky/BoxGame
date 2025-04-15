import { Scene } from 'phaser';
import { TestScene } from './TestScene';

export class TestBlock extends TestScene {
    private cntX = 20;
    private cntY = 40;
    private blockSize: number = 20;
    private blockX: number = 40;
    private blockY: number = 0;
    private blockSpeed: number = 2;
    private graphics!: Phaser.GameObjects.Graphics;

    constructor() {
        super('TestBlock');
    }

    create() {
        this.createTitle("Block");
        this.graphics = this.add.graphics();
        console.log('TestScene创建完成，初始方块位置:', { x: this.blockX, y: this.blockY });
        this.drawGame();
    }

    update() {
        // 更新方块位置
        this.blockY += this.blockSpeed;

        // 边界检测
        if (this.blockY > this.game.canvas.height - this.blockSize) {
            this.blockY = this.game.canvas.height - this.blockSize;
            console.log('方块到达底部边界');
        }

        // 绘制
        this.drawGame();
    }

    // 绘图
    private drawGame() {
        this.graphics.clear();
        this.drawGrid();
        this.drawBlock();
        this.drawBoard();
    }

    // 绘制外框
    private drawBoard() {
        this.graphics.lineStyle(1, 0xff0000);
        this.graphics.strokeRect(0, 0, this.blockSize * this.cntX, this.blockSize * this.cntY);
    }
    
    // 绘制背景网格
    private drawGrid() {
        this.graphics.lineStyle(1, 0xcccccc);
        for (let x = 0; x <= this.game.canvas.width; x += this.blockSize) {
            this.graphics.beginPath();
            this.graphics.moveTo(x, 0);
            this.graphics.lineTo(x, this.game.canvas.height);
            this.graphics.strokePath();
        }
        for (let y = 0; y <= this.game.canvas.height; y += this.blockSize) {
            this.graphics.beginPath();
            this.graphics.moveTo(0, y);
            this.graphics.lineTo(this.game.canvas.width, y);
            this.graphics.strokePath();
        }
    }

    // 绘制方块
    private drawBlock() {
        this.graphics.fillStyle(0xff0000);
        this.graphics.fillRect(
            this.blockX,
            this.blockY,
            this.blockSize,
            this.blockSize
        );
    }
}