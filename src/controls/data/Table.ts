import Phaser from 'phaser';
import { Control } from '../Control';
import { Theme } from '../Theme';

/**
 * 表格控件配置
 */
export interface TableOptions {
    /** 列宽度 */
    columnWidth?: number;
    /** 行高 */
    rowHeight?: number;
    /** 内边距 */
    padding?: number;
    /** 表头背景色 */
    headerBgColor?: number;
    /** 表头文字颜色 */
    headerTextColor?: string;
    /** 单元格背景色 */
    cellBgColor?: number;
    /** 单元格文字颜色 */
    cellTextColor?: string;
    /** 字体大小 */
    fontSize?: string;
}

/**
 * 表格控件，用于显示JSON数据
 */
export class Table extends Control {
    private options: TableOptions;
    private datas: any[] = [];
    private headers: string[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, options: TableOptions = {}) {
        super(scene, x, y, width, height);

        // 默认配置
        this.options = {
            columnWidth: 200,
            rowHeight: 40,
            padding: 10,
            headerBgColor: this.theme.color.primary,
            headerTextColor: 'white',
            cellBgColor: 0xf0f0f0,
            cellTextColor: '#000000',
            fontSize: '16px',
            ...options
        };
    }

    /**
     * 设置表格数据
     * @param data JSON数据数组
     * @param headers 表头（如果不指定，将使用数据的键作为表头）
     */
    public setDatas(data: any[], headers?: string[]) {
        this.datas = data;
        this.headers = headers || (data[0] ? Object.keys(data[0]) : []);
        this.renderTable();
    }

    /**
     * 渲染表格
     */
    private renderTable() {
        // 清除现有内容
        this.list.forEach(child => child.destroy());

        const { columnWidth, rowHeight, padding, headerBgColor, headerTextColor, cellBgColor, cellTextColor } = this.options;

        // 渲染表头
        let dy = 0;
        this.headers.forEach((header, index) => {
            const block = this.createBlock(
                index * columnWidth!,
                dy,
                columnWidth! - padding!,
                rowHeight!,
                header,
                headerBgColor!,
                headerTextColor!
            );
            this.add(block);
        });

        // 渲染数据行
        dy = rowHeight! + padding!;
        this.datas.forEach((row, rowIndex) => {
            const y = rowIndex * rowHeight! + dy;
            this.headers.forEach((header, colIndex) => {
                const cellValue = row[header] || '';
                const block = this.createBlock(
                    colIndex * columnWidth!,
                    y,
                    columnWidth! - padding!,
                    rowHeight! - padding!,
                    cellValue.toString(),
                    cellBgColor!,
                    cellTextColor!
                );
                this.add(block);
            });
        });
    }

    /**
     * 创建表格单元格
     */
    private createBlock(x: number, y: number, width: number, height: number, text: string, bgColor: number, textColor: string): Phaser.GameObjects.Container {
        const block = new Phaser.GameObjects.Container(this.scene, x, y);
        const rect = new Phaser.GameObjects.Rectangle(this.scene, 0, 0, width, height, bgColor).setOrigin(0);
        const label = new Phaser.GameObjects.Text(this.scene, 10, height/2, text, {
            color: textColor,
            fontSize: this.options.fontSize,
            align: 'left'
        }).setOrigin(0, 0.5);

        block.add(rect);
        block.add(label);
        return block;
    }
}