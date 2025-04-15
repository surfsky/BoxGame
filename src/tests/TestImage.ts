import { Scene } from 'phaser';
import { Img } from '../controls/basic/Img';
import { TestScene } from './TestScene';

export class TestImage extends TestScene {
    constructor() {
        super({ key: 'TestImage' });
    }

    create() {
        super.createTitle('Image');
        this.createBaseLine();

        // 测试本地图片加载
        const localImg = new Img(this, 100, 100, {
            src: 'assets/images/bg1.png',
            width: 100,
            height: 100
        }).setOrigin(0,0);

        // 测试网络图片加载
        const remoteImg = new Img(this, 100, 200, {
            src: 'https://picsum.photos/200/300',
            scale: 0.8
        }).setOrigin(0,0);

        // 测试动态修改图片属性
        const dynamicImg = new Img(this, 100, 300).setOrigin(0, 0);
        setTimeout(() => {
            dynamicImg.setSrc('assets/images/bg3.png').setSize(100, 100);
        }, 1000);
    }
}