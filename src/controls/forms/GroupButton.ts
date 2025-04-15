import { Control } from "../Control";

export class GroupButton extends Control {
    private items: string[] = [];
    private selectedIndex: number = 0;
    private itemWidth: number = 0;
    private itemHeight: number = 0;
    private padding: number = 1;
    private radius: number = 20;

    public changed: Phaser.Events.EventEmitter;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, items: string[] = []) {
        super(scene, x, y, width, height);
        this.items = items;
        this.itemHeight = height;
        this.updateItemWidth();
        this.changed = new Phaser.Events.EventEmitter();
        this.setSize(width, height);
        //this.setInteractive();
        //this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.setInteractive(new Phaser.Geom.Rectangle(width/2, height/2, width, height), Phaser.Geom.Rectangle.Contains);
        this.on('pointerdown', this.onPointerDown, this);
        this.draw();
    }

    private updateItemWidth() {
        if (this.items.length > 0) {
            this.itemWidth = (this.width - (this.items.length + 1) * this.padding) / this.items.length;
        }
    }

    public setItems(items: string[]) {
        this.items = items;
        this.updateItemWidth();
        this.draw();
        return this;
    }

    public getSelectedIndex(): number {
        return this.selectedIndex;
    }

    public getSelectedItem(): string {
        return this.items[this.selectedIndex];
    }

    public setSelectedIndex(index: number) {
        if (index >= 0 && index < this.items.length) {
            this.selectedIndex = index;
            this.draw();
            this.changed.emit('changed', this.selectedIndex, this.items[this.selectedIndex]);
        }
        return this;
    }

    private onPointerDown(pointer: Phaser.Input.Pointer) {
        console.log('pointerdown', pointer.x, pointer.y, this.x, this.y);
        const localX = pointer.x - this.x;
        const index = Math.floor((localX - this.padding) / (this.itemWidth + this.padding));
        if (index >= 0 && index < this.items.length) {
            this.setSelectedIndex(index);
        }
    }

    private texts: Phaser.GameObjects.Text[] = [];

    private drawItem(i: number, x: number, isSelected: boolean, animate: boolean = false) {
        const targetColor = isSelected ? this.mainColor : 0xffffff;
        const targetTextColor = isSelected ? '#ffffff' : '#000000';

        // Draw capsule background
        this.graphics.lineStyle(1, this.mainColor);
        this.graphics.fillStyle(targetColor);

        if (i === 0) {
            // left capsule
            var r = {tl:this.radius, tr:0, br:0, bl:this.radius};
            this.graphics.fillRoundedRect(x, 0, this.itemWidth, this.itemHeight, r);
            this.graphics.strokeRoundedRect(x, 0, this.itemWidth, this.itemHeight, r);
        } else if (i === this.items.length - 1) {
            // Right capsule
            var r = {tl:0, tr:this.radius, br:this.radius, bl:0};
            this.graphics.fillRoundedRect(x, 0, this.itemWidth, this.itemHeight, r);
            this.graphics.strokeRoundedRect(x, 0, this.itemWidth, this.itemHeight, r);
        } else {
            // Middle rectangle
            this.graphics.fillRect(x, 0, this.itemWidth, this.itemHeight);
            this.graphics.strokeRect(x, 0, this.itemWidth, this.itemHeight);
        }

        // Draw text
        const text = new Phaser.GameObjects.Text(this.scene, 
            x + this.itemWidth / 2, 
            this.itemHeight / 2, 
            this.items[i], 
            { 
                color: targetTextColor,
                fontSize: '16px',
                align: 'center'
            }
        );
        text.setOrigin(0.5);
        this.add(text);
        this.texts.push(text);

        if (animate) {
            // Add background color transition
            const graphics = this.graphics;
            this.scene.tweens.add({
                targets: {},
                duration: 200,
                ease: 'Power2',
                onUpdate: (tween) => {
                    const progress = tween.progress;
                    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                        Phaser.Display.Color.ValueToColor(isSelected ? 0xffffff : this.mainColor),
                        Phaser.Display.Color.ValueToColor(targetColor),
                        100,
                        progress * 100
                    );
                    graphics.fillStyle(color.color, 1);
                    if (i === 0) {
                        graphics.fillRoundedRect(x, 0, this.itemWidth, this.itemHeight, r);
                    } else if (i === this.items.length - 1) {
                        graphics.fillRoundedRect(x, 0, this.itemWidth, this.itemHeight, r);
                    } else {
                        graphics.fillRect(x, 0, this.itemWidth, this.itemHeight);
                    }
                }
            });

            // Add text color transition
            this.scene.tweens.add({
                targets: text,
                alpha: { from: 0.5, to: 1 },
                duration: 200,
                ease: 'Power2'
            });
        }
    }

    protected draw() {
        super.draw();
        this.graphics.clear();
        this.texts.forEach(text => text.destroy());
        this.texts = [];

        // Draw background
        if (this.items.length > 0) {
            for (let i = 0; i < this.items.length; i++) {
                const x = this.padding + i * (this.itemWidth + this.padding);
                const isSelected = i === this.selectedIndex;
                this.drawItem(i, x, isSelected, isSelected);
            }
        }
    }
}