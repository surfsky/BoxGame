import Phaser from 'phaser';
import { Button } from '../controls/buttons/Button';
import { Table } from '../controls/data/Table';
import { TestScene } from './TestScene';

/**
 * 表格控件测试场景
 */
export class TestTable extends TestScene {
    private table: Table | null = null;

    constructor() {
        super('TestTable');
    }

    create() {
        this.createTitle('表格控件测试');

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // 创建表格
        this.table = new Table(this, 10, 200, this.game.canvas.width - 20, this.game.canvas.height - 220);

        // 测试数据
        const testData = [
            { name: '苹果', price: 5, unit: '个' },
            { name: '香蕉', price: 3, unit: '斤' },
            { name: '橙子', price: 4, unit: '个' },
            { name: '葡萄', price: 8, unit: '斤' },
        ];

        // 设置表格数据
        this.table.setData(testData, ['name', 'price', 'unit']);

        // 创建样式切换按钮
        const styleButton = new Button(this, centerX - 100, 120, '切换样式', {
            width: 150,
            height: 40,
        }).on('click', () => {
            this.table?.setDatas(testData, ['name', 'price', 'unit']);
        });

        // 创建数据更新按钮
        const updateButton = new Button(this, centerX + 100, 120, '更新数据', {
            width: 150,
            height: 40,
        }).on('click', () => {
            const newData = [
                { name: '西瓜', price: 2, unit: '斤' },
                { name: '芒果', price: 6, unit: '个' },
            ];
            this.table?.setData(newData);
        });
    }
}