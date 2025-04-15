import { Control } from "./Control";

/**可拖动滚动面板 */
export class Panel extends Control{ // Phaser.GameObjects.Container {
    private contentH: number = 0;
    private contentMask: Phaser.GameObjects.Graphics;
    private bg: Phaser.GameObjects.Rectangle;

    /**
     * 创建一个可滚动的面板
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - 面板的x坐标
     * @param {number} y - 面板的y坐标
     * @param {number} w - 面板的宽度
     * @param {number} h - 面板的可视高度
     * @param {number} contentH - 内容的实际高度
     */
    constructor(scene: Phaser.Scene, 
        x: number, y: number, w: number, h: number, 
        contentH?: number, radius: number = 0,
        bgColor: number = 0xffffff, bgAlpha: number = 0.8,
        handerColor: number = 0xffffff, handerAlpha: number = 0.2,
    ) {
        super(scene, x, y);
        this.setSize(w, h);
        scene.add.existing(this);
        this.contentH = contentH || h*2; // this.calcContentHeight();

        // 创建遮罩（显示区域）
        this.contentMask = this.createRoundRect(scene, x, y, w, h, radius, 0xffffff, 1).setVisible(false);
        this.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.contentMask));

        // 创建背景
        //this.bg = this.createRoundRect(scene, 0, 0, w, contentH, radius, bgColor, bgAlpha);
        this.bg = scene.add.rectangle(0, 0, w, this.contentH, bgColor, bgAlpha).setOrigin(0, 0).setDepth(this.depth - 1);
        this.add(this.bg);

        // 创建滚动轴
        this.setScrollbar(handerColor, handerAlpha);
    }

    /**添加子元素并更新内容高度 */
    //public override add(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]): this {
    //    super.add(child);
    //    this.resetContentHeight();
    //    return this;
    //}

    /**重新计算内容高度并更新滚动条 */
    public resetContentHeight(): void {
        this.contentH = this.contentH || this.calcContentHeight();
        this.contentMask.clear();
        this.contentMask.fillRoundedRect(this.x, this.y, this.width, this.height, 10);
        this.setScrollbar();
    }

    /**设置深度（将背景层的层次也提高 */
    override setDepth(value: number): this {
        this.bg.setDepth(value - 1);
        return super.setDepth(value);
    }

    /**设置滚动轴滑块 */
    private setScrollbar(handerColor: number = 0xffffff, handerAlpha: number = 0.5) {
        var scene = this.scene;
        var w = this.width;
        var h = this.height;
        var contentH = this.contentH;
        if (contentH <= h) return;
        // 创建滑块(滑块的高度是根据内容的实际高度和面板的可视高度来计算的)
        const scrollBar = this.createRoundRect(scene, this.x + w - 10, this.y, 8, h / contentH * h, 5, handerColor, handerAlpha).setDepth(999);
        scrollBar.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.contentMask));
        this.setDragEvents(scene, scrollBar);
    }

    /**设置定位方式 */
    setOrigin(x: number, y: number): this {
        this.x = this.x - this.width * x;
        this.y = this.y - this.height * y;
        this.setScrollbar();
        return this;
    }

    /**计算所有子元素的总高度 */
    private calcContentHeight(): number {
        let maxHeight = 0;
        this.list.forEach(child => {
            const gameObject = child as Phaser.GameObjects.GameObject;
            if ('y' in gameObject && 'height' in gameObject) {
                const bottom = (gameObject as any).y + (gameObject as any).height;
                maxHeight = Math.max(maxHeight, bottom);
            }
        });
        return Math.max(maxHeight, this.height);
    }


    /**设置实际内容高度 */
    //public setContentHeight(contentH?: number) {
    //}

    /**设置拖拽逻辑 */
    private setDragEvents(scene: Phaser.Scene, scrollBar: Phaser.GameObjects.Graphics) {
        var contentH = this.contentH;
        var y = this.y;
        var h = this.height;
        let isDragging = false;
        let lastY = 0;
        let lastTime = 0;
        let velocityY = 0;
        let velocities: number[] = [];

        // scene.input
        this.bg.setInteractive();
        this.bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            isDragging = true;
            lastY = pointer.y;
            lastTime = Date.now();
            velocities = [];
            // 如果有正在进行的动画，停止它
            scene.tweens.killTweensOf(this);
            scene.tweens.killTweensOf(scrollBar);
            pointer.event.stopPropagation();  // 阻止事件穿透到下面
            //console.log('pointerdown', pointer.x, pointer.y, this.x, this.y);
        });
        this.bg.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            isDragging = false;
            if (velocities.length > 0) {
                // 计算平均速度
                const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
                //console.log('avgVelocity', avgVelocity);
                if (Math.abs(avgVelocity) > 0.1) { // 速度阈值
                    // 计算惯性滑动的目标位置
                    const momentum = avgVelocity * 150; // 惯性系数
                    let targetY = this.y + momentum;
                    const minY = y - (contentH - h);
                    const maxY = y;
                    targetY = Phaser.Math.Clamp(targetY, minY, maxY);

                    // 创建惯性滑动动画
                    scene.tweens.add({
                        targets: this,
                        y: targetY,
                        duration: 500,
                        ease: 'Cubic.out',
                        onUpdate: () => {
                            // 同步更新滚动条位置
                            scrollBar.y = y - (this.y - y);
                        }
                    });
                }
            }
        });
        this.bg.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!isDragging) return;
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            var dy = pointer.y - lastY;

            if (deltaTime > 0) {
                // 计算当前速度（像素/毫秒）
                velocityY = dy / deltaTime;
                velocities.push(velocityY);
                // 只保留最近的5个速度值
                if (velocities.length > 5) velocities.shift();
                //console.log('velocityY', velocityY);
            }

            lastY = pointer.y;
            lastTime = currentTime;

            // 计算新的Y实际位置
            let newY = this.y + dy;
            var minY = y - (contentH - h);
            var maxY = y;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            dy = newY - y; // 计算实际移动距离

            // 更新容器和滑块位置
            this.y = newY;
            scrollBar.y = y - dy;
        });

        // 添加鼠标滚轮事件支持
        this.bg.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            // 计算滚动距离，deltaY为正表示向下滚动，为负表示向上滚动
            const scrollSpeed = 0.5;
            const dy = -deltaY * scrollSpeed;

            // 计算新的Y实际位置
            let newY = this.y + dy;
            var minY = y - (contentH - h);
            var maxY = y;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            const actualDy = newY - this.y;

            // 更新容器和滑块位置
            this.y = newY;
            scrollBar.y = scrollBar.y - actualDy;
            //pointer.event.stopPropagation();  // 阻止事件穿透到下面
        });
    }

    /**创建一个圆角矩形*/
    createRoundRect(scene:Phaser.Scene, x:number, y:number, w:number, h:number, radius:number, bgColor:number, bgAlpha=1, borderColor=-1, borderWidth=1, borderAlpha=1) : Phaser.GameObjects.Graphics{
        const graphics = scene.add.graphics();
        graphics.fillStyle(bgColor, bgAlpha);
        graphics.fillRoundedRect(x, y, w, h, radius);
        if (borderColor != -1){
            graphics.lineStyle(borderWidth, borderColor, borderAlpha);
            graphics.strokeRoundedRect(x, y, w, h, radius);
        }
        return graphics;
    }

    /**
     * 销毁滚动面板
     */
    public destroy(): void {
        this.contentMask.destroy();
        this.list.forEach(child => child.destroy());
        super.destroy();
    }
}