import { Mask } from './Mask';

export class Loading {
    private static mask: Mask | null = null;
    private static text: Phaser.GameObjects.Text | null = null;

    /**
     * 显示全屏加载提示
     * @param {Phaser.Scene} scene - 场景实例
     * @param {string} [text='加载中...'] - 显示的文本
     */
    public static show(scene: Phaser.Scene, text: string = '加载中...'): void {
        // 如果已经存在，先移除
        if (Loading.mask) {
            Loading.hide();
        }

        // 创建遮罩
        Loading.mask = new Mask(scene, {
            color: 0x000000,
            alpha: 0.5,
            interactive: true
        });

        // 创建文本
        Loading.text = scene.add.text(
            scene.cameras.main.width / 2,
            scene.cameras.main.height / 2,
            text,
            {
                fontSize: '24px',
                align: 'center'
            }
        ).setOrigin(0.5);

        // 显示遮罩
        Loading.mask.show();
    }

    /**
     * 隐藏加载提示
     */
    public static hide(): void {
        if (Loading.mask) {
            Loading.mask.hide().then(() => {
                if (Loading.mask) {
                    Loading.mask.destroy();
                    Loading.mask = null;
                }
            });
        }

        if (Loading.text) {
            Loading.text.destroy();
            Loading.text = null;
        }
    }
}