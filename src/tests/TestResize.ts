import { Scene } from 'phaser';
import { Img } from '../controls/basic/Img';
import { TestScene } from './TestScene';

export class TestResize extends TestScene {
    private image!: Phaser.GameObjects.Image;
    private pointers: Map<number, Phaser.Input.Pointer>;
    private initialDistance!: number;
    private initialScale!: number;

    constructor() {
        super({ key: 'TestResize' });
        this.pointers = new Map();
    }

    preload(): void {
        this.load.image('bg1', 'assets/images/bg1.png');
    }

    create() {
        super.createTitle('Resize Image');
        this.image = this.add.image(0, 0, 'bg1');
        this.add.existing(this.image);
        this.image.setInteractive();

        // 启用多点触控支持
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        this.input.addPointer(2);
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.pointers.set(pointer.pointerId, pointer);

            // 如果有两个触点，开始处理缩放
            if (this.pointers.size === 2) {
                const pointers = Array.from(this.pointers.values());
                this.initialDistance = Phaser.Math.Distance.Between(
                    pointers[0].x, pointers[0].y,
                    pointers[1].x, pointers[1].y
                );
                this.initialScale = this.image.scale;
            }
            if (this.pointers.size === 1) {
                isDragging = true;
                dragStartX = pointer.x - this.image.x;
                dragStartY = pointer.y - this.image.y;    
            }
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.pointers.has(pointer.pointerId)) {
                this.pointers.set(pointer.pointerId, pointer);

                // 处理双指缩放
                if (this.pointers.size === 2) {
                    const pointers = Array.from(this.pointers.values());
                    const currentDistance = Phaser.Math.Distance.Between(
                        pointers[0].x, pointers[0].y,
                        pointers[1].x, pointers[1].y
                    );

                    // 计算缩放比例
                    const scale = (currentDistance / this.initialDistance) * this.initialScale;
                    this.image.setScale(scale);

                    // 计算缩放中心点
                    const centerX = (pointers[0].x + pointers[1].x) / 2;
                    const centerY = (pointers[0].y + pointers[1].y) / 2;
                    this.image.setPosition(centerX, centerY);
                }
                // 单指拖动
                else if (this.pointers.size === 1 && isDragging) {
                    this.image.x = pointer.x - dragStartX;
                    this.image.y = pointer.y - dragStartY;    
                    //this.image.setPosition(pointer.x, pointer.y);
                }
            }
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.pointers.delete(pointer.pointerId);
        });

        this.input.on('pointerout', (pointer: Phaser.Input.Pointer) => {
            this.pointers.delete(pointer.pointerId);
        });
    }
}