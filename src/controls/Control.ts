import Phaser from 'phaser';
import {Painter} from './Painter';
import { ITheme, Theme, ThemeManager } from './Theme';

/**
 * 控件基类（实现定位、大小、样式等基础属性）
 * 默认基于 (0, 0) 定位
 */
export class Control extends Phaser.GameObjects.Container
    implements ITheme
{
    protected graphics : Phaser.GameObjects.Graphics;
    private isShowBounds: boolean = false;
    private isFocused: boolean = false;
    private _x: number;
    private _y: number;


    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
        super(scene, x, y);
        this._x = x;
        this._y = y;
        this.graphics = this.scene.add.graphics();
        this.add(this.graphics);

        this.setSize(width, height);
        scene.add.existing(this);
    }

    //------------------------------------------------
    // Theme
    //------------------------------------------------
    protected themeCls: string = 'default';
    protected theme: Theme = ThemeManager.current;
    public setTheme(theme: Theme): void {
        this.theme = theme;
        this.draw();
    }
    public setThemeClass(themeCls: string): void {
        this.themeCls = themeCls;
        this.draw();
    }
    protected get mainColor(): number {
        return this.getColor(this.themeCls);
    }

    /**
     * Get color from theme by class name.
     * @param themeCls Theme class name.
     * @returns Color.
     */ 
    public getColor(themeCls: string): number {
        switch (themeCls){
            case "bg":        return this.theme.color.bg;          break;
            case "primary":   return this.theme.color.primary;     break;
            case "secondary": return this.theme.color.secondary;   break;
            case "success":   return this.theme.color.success;     break;
            case "info":      return this.theme.color.info;        break;
            case "warning":   return this.theme.color.warning;     break;
            case "danger":    return this.theme.color.danger;      break;
            default:          return this.theme.color.primary;     break;
        }
    }

    //------------------------------------------------
    // Draw
    //------------------------------------------------
    /**draw control ui */
    protected draw() {
        this.graphics.clear();
        if (this.isShowBounds){
            this.drawBounds();
        }
    }

    /**show bounds */
    public showBounds(value: boolean) : Control {
        this.isShowBounds = value;
        this.draw();
        return this;
    }

    /**draw bounds */
    protected drawBounds(options: { lineColor?: number, lineWidth?: number, dashLength?:number, gapLength?:number } = {}): void {
        const bounds = this.getBounds();
        const lineColor = options.lineColor ?? 0xa0a0a0;
        const lineWidth = options.lineWidth ?? 1;
        const dashLength = options.dashLength?? 3;
        const gapLength = options.gapLength?? 3;
        
        Painter.drawDashedRectangle(this.graphics, 0, 0, bounds.width, bounds.height, dashLength, gapLength, lineWidth, lineColor);
    }

    //------------------------------------------------
    // Layout
    //------------------------------------------------
    /**获取容器边界 */
    public getBounds(): Phaser.Geom.Rectangle {
        const bounds = super.getBounds();
        bounds.x = this.x;
        bounds.y = this.y;
        bounds.width = this.width;
        bounds.height = this.height;
        return bounds;
    }

    /**Set control origin layout 
     * @param px Origin x, 0.0-1.0
     * @param py Origin y, 0.0-1.0
    */
    public setOrigin(px: number, py?: number): this {
        if (py === undefined) py = px;
        this.x = this._x - (this.width * px);
        this.y = this._y - (this.height * py);
        return this;
    }
}


