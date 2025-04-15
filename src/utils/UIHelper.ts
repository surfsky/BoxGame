//import { GameConfig } from '../GameConfig';


export class UIHelper{
    /**
     * 创建加载进度UI
     * @param {Phaser.Scene} scene - 场景实例
     */
    static showLoading(scene: Phaser.Scene): void {
        // 半透明背景
        const bg = scene.add.rectangle(
            0, 0,
            scene.cameras.main.width, scene.cameras.main.height,
            0x000000, 0.8
        ).setOrigin(0);

        // 进度条参数
        const barWidth = scene.cameras.main.width * 0.6;
        const barHeight = 20;
        const barRadius = barHeight / 2;  // 圆角半径等于高度的一半
        const barX = scene.cameras.main.width/2 - barWidth/2;
        const barY = scene.cameras.main.height/2 - barHeight/2;

        // 进度条背景
        const barBg = scene.add.graphics();
        barBg.fillStyle(0x333333, 1);
        barBg.fillRoundedRect(
            barX,
            barY,
            barWidth,
            barHeight,
            barRadius
        );

        // 进度条
        const progressBar = scene.add.graphics();

        // 进度文本
        const progressText = scene.add.text(
            scene.cameras.main.width/2,
            scene.cameras.main.height/2 + 40,
            '加载中... 0%',
            {
                fontSize: '48px',
                //fill: '#ffffff',
                //fontFamily: GAMECONFIG.UI.FONTS.DEFAULT
            }
        ).setOrigin(0.5);

        // 监听加载进度
        scene.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            const progress = Math.min(Math.max(value, 0), 1);
            if (progress > 0) {
                progressBar.fillRoundedRect(
                    barX,
                    barY,
                    barWidth * progress,
                    barHeight,
                    barRadius
                );
            }
            progressText.setText(`加载中... ${Math.floor(progress * 100)}%`);
        });

        // 监听加载完成
        scene.load.on('complete', () => {
            scene.tweens.add({
                targets: [bg, barBg, progressBar, progressText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    bg.destroy();
                    barBg.destroy();
                    progressBar.destroy();
                    progressText.destroy();
                }
            });
        });
    }
    
    
    /**Create scroll container
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} x - x坐标
     * @param {number} y - y坐标
     * @param {number} w - 宽度
     * @param {number} h - 高度
     * @param {number} contentH - 内容区域高度
     * @return {Phaser.GameObjects.Container}
     * @remarks 子元素的坐标是否是相对于该容器的相对坐标？
     **/
    static createScrollContainer(scene: Phaser.Scene, x: number, y: number, w: number, h: number, contentH: number): Phaser.GameObjects.Container {
        // 创建容器，并应用同位置同尺寸遮罩
        const container = scene.add.container(x, y);
        container.setSize(w, h);
        const maskGraphics = scene.add.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(x, y, w, h);
        maskGraphics.setVisible(false);
        container.setMask(new Phaser.Display.Masks.GeometryMask(scene, maskGraphics));

        // 添加拖动逻辑（上下拖动容器，移出遮罩的部分不显示）
        let isDragging = false;
        let lastY = 0;
        scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            isDragging = true;
            lastY = pointer.y;
        });
        scene.input.on('pointerup', () => {
            isDragging = false;
        });
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!isDragging) return;
            const dy = pointer.y - lastY;
            lastY = pointer.y;

            // 计算新的Y位置
            let newY = container.y + dy;
            var minY = y - (contentH - h);
            var maxY = y;
            newY = Phaser.Math.Clamp(newY, minY, maxY);
            container.y = newY;
        });

        return container;
    }


    /** Set gameobject animation - breath
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.GameObject} gameObject 
     * @param {number} [size=1.5] 
     */
    static animBreath(scene: Phaser.Scene, gameObject: Phaser.GameObjects.GameObject, size: number = 1.5): void {
        // 添加呼吸动画
        scene.tweens.add({
            targets: gameObject,
            scale: { from: 1, to: size },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 延迟调用
     * @param {Phaser.Scene} scene - 场景实例
     * @param {number} delay - 延迟时间（毫秒）
     * @param {Function} callback - 回调函数
     * @param {any} callbackContext - 回调函数的上下文
     * @param {any[]} [args] - 回调函数的参数数组
     * @return {Phaser.Time.TimerEvent}
     */
    public static delayCall(scene: Phaser.Scene, delay: number, callback: Function, callbackContext: any, args?: any[]): Phaser.Time.TimerEvent {
        return scene.time.delayedCall(delay, callback, callbackContext, args);
    }
}