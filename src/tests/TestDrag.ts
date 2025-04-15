import { Scene } from 'phaser';
import { Img } from '../controls/basic/Img';
import { TestScene } from './TestScene';

export class TestDrag extends TestScene {
    private image!: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'TestDrag' });
    }

    preload(): void {
        this.load.image('bg1', 'assets/images/bg1.png');
    }

    create() {
        super.createTitle('Drag Image');
        this.image = this.add.image(0, 0, 'bg1');
        this.add.existing(this.image);

        // 记录拖拽状态
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        this.image.setInteractive();
        this.image.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            isDragging = true;
            dragStartX = pointer.x - this.image.x;
            dragStartY = pointer.y - this.image.y;
            console.log('pointerdown', pointer.x, pointer.y, this.image.x, this.image.y, dragStartX, dragStartY);
        });

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (isDragging) {
                this.image.x = pointer.x - dragStartX;
                this.image.y = pointer.y - dragStartY;
                console.log('pointermove', pointer.x, pointer.y, this.image.x, this.image.y, dragStartX, dragStartY);
            }
        });

        this.input.on('pointerup', () => {
            isDragging = false;
        });
    }
}