import { GameObjects } from "phaser";
import { Control } from "../Control";

export class Row extends Control { //} GameObjects.Rectangle {
    private gap: number = 0;
    private autoWrap: boolean = false;
    //private container: GameObjects.Container;

    constructor(scene: Phaser.Scene, x:number=0, y:number= 0, width:number=100, height:number=100, gap:number=0, autoWrap:boolean=false)
    {
        super(scene, x, y, width, height);
        scene.add.existing(this);
        //this.setOrigin(0, 0);
        this.gap = gap;
        this.autoWrap = autoWrap;
        //this.container = scene.add.container(x, y);
    }

    /** 重写destroy方法以清理内部容器*/
    public destroy(fromScene?: boolean): void {
        //this.container.destroy(fromScene);
        super.destroy(fromScene);
    }

    /** Add children*/
    public addChild(child: Phaser.GameObjects.GameObject): this {
        //this.container.add(child);
        this.add(child);
        this.updateLayout();
        return this;
    }

    /** remove children*/
    public removeChild(child: Phaser.GameObjects.GameObject): this {
        //this.container.remove(child);
        this.remove(child);
        this.updateLayout();
        return this;
    }

    /** TODO: 显示*/
    public updateLayout(): void {
        let currentX = 0;
        let currentY = 0;
        let maxHeight = 0;
        let rowMaxHeight = 0;

        this.each((child: Phaser.GameObjects.GameObject) => {
            const gameObject = child as any;
            if (!gameObject.width || !gameObject.height) return;

            // 检查是否需要换行
            if (this.autoWrap && currentX + gameObject.width > this.width) {
                currentX = 0;
                currentY += rowMaxHeight + this.gap;
                rowMaxHeight = 0;
            }

            // 设置子控件位置
            gameObject.setPosition(currentX, currentY);

            // 更新当前位置和最大高度
            currentX += gameObject.width + this.gap;
            rowMaxHeight = Math.max(rowMaxHeight, gameObject.height);
            maxHeight = Math.max(maxHeight, currentY + gameObject.height);
        });

        // 更新容器大小
        this.setSize(this.width, maxHeight);
    }
}