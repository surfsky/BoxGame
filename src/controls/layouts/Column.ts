import { GameObjects } from "phaser";
import { Control } from "../Control";

export class Column extends Control {//} GameObjects.Rectangle {
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

    /** 更新布局*/
    public updateLayout(): void {
        let currentX = 0;
        let currentY = 0;
        let maxWidth = 0;
        let columnMaxWidth = 0;

        this.each((child: Phaser.GameObjects.GameObject) => {
            const gameObject = child as any;
            if (!gameObject.width || !gameObject.height) return;

            // 检查是否需要换列
            if (this.autoWrap && currentY + gameObject.height > this.height) {
                currentY = 0;
                currentX += columnMaxWidth + this.gap;
                columnMaxWidth = 0;
            }

            // 设置子控件位置
            gameObject.setPosition(currentX, currentY);

            // 更新当前位置和最大宽度
            currentY += gameObject.height + this.gap;
            columnMaxWidth = Math.max(columnMaxWidth, gameObject.width);
            maxWidth = Math.max(maxWidth, currentX + gameObject.width);
        });

        // 更新容器大小
        this.setSize(maxWidth, this.height);
    }
}