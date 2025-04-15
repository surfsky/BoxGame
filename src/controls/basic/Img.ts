import { Control } from '../Control';

export interface ImgOptions {
    src?: string;
    width?: number;
    height?: number;
    scale?: number;
    origin?: { x: number; y: number };
}

/**
 * 图片控件
 */
export class Img extends Control {
    private image: Phaser.GameObjects.Image | null = null;
    private options: ImgOptions;
    private isLoading: boolean = false;
    private loadError: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, options: ImgOptions = {}) {
        super(scene, x, y);
        scene.add.existing(this);

        this.options = {
            scale: 1,
            origin: { x: 0, y: 0 },
            ...options
        };

        if (this.options.src) {
            this.loadImage(this.options.src);
        }
    }

    /**
     * 加载图片
     * @param src 图片路径
     */
    public loadImage(src: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.isLoading) return;
            this.isLoading = true;
            this.loadError = false;

            const key = `img_${Date.now()}`;
            console.log(`load image, key=${key}, src=${src}`);
            
            this.scene.load.once('filecomplete-image-' + key, () => {
                this.createImage(key);
                this.isLoading = false;
                resolve(key);
            });

            this.scene.load.once('loaderror', () => {
                this.isLoading = false;
                this.loadError = true;
                reject(new Error('Failed to load image: ' + src));
            });

            this.scene.load.image(key, src);
            this.scene.load.start();
        });
    }

    /**
     * 创建图片对象
     */
    private createImage(key: string): void {
        if (this.image) {
            this.image.destroy();
        }
        this.image = this.scene.add.image(0, 0, key);
        this.add(this.image);

        if (this.options.width) {
            this.image.displayWidth = this.options.width;
        }
        if (this.options.height) {
            this.image.displayHeight = this.options.height;
        }

        this.image.setScale(this.options.scale!);
        this.image.setOrigin(this.options.origin!.x, this.options.origin!.y);
    }

    /**
     * 设置图片源
     */
    public setSrc(value: string) : Img {
        this.loadImage(value);
        return this;
    }

    /**
     * 获取图片源
     */
    public get src(): string {
        return this.options.src || '';
    }

    /**
     * 设置图片宽度
     */
    public setWidth(value: number): Img {
        this.options.width = value;
        if (this.image) {
            this.image.displayWidth = value;
        }
        return this;
    }

    /**
     * 设置图片高度
     */
    public setHeight(value: number) : Img {
        this.options.height = value;
        if (this.image) {
            this.image.displayHeight = value;
        }
        return this;
    }

    /**
     * 设置图片尺寸
     */
    public override setSize(w: number, h: number): this {
        //this.options.width = w;
        //this.options.height = h;
        if (this.image) {
            this.image.setSize(w, h);
        }
        return this;
    }

    /**
     * 设置原点
     */
    public setOrigin(x: number, y: number) : Img {
        this.options.origin = {x:x, y:y};
        if (this.image) {
            this.image.setOrigin(x, y);
        }
        return this;
    }

    /**
     * 销毁图片
     */
    public destroy(): void {
        if (this.image) {
            this.image.destroy();
        }
        super.destroy();
    }

    public override draw(){
        super.draw();

    }
}