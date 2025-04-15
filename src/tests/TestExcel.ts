import Phaser from 'phaser';
import { Button } from '../controls/buttons/Button';
import { Panel } from '../controls/Panel';
import * as XLSX from 'xlsx';
import { Loading } from '../controls/overlays/Loading';
import { TestScene } from './TestScene';

/**测试Excel导入场景 */
export class TestExcel extends TestScene {
    private table : Panel | null = null;

    constructor() {
        super('TestExcel');
    }

    preload() {
        this.load.image('icon-back', 'assets/icons/left.svg');
    }

    create() {
        this.createTitle("Excel导入测试");

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // 创建隐藏的文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx,.xls';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // 创建文件选择按钮
        const importButton = new Button(this, centerX, 120, '选择Excel文件', {
            width: 200,
            height: 50,
            bgColor: 0x6c5ce7
            }).setOrigin(0.5).on('click', () => {
                Loading.show(this);
                fileInput.click();
            });
        
        // 监听文件选择变化
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                const file = target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
                    // 显示表格数据
                    this.displayTable(jsonData);
                    Loading.hide();
                };
        
                reader.readAsArrayBuffer(file);
            } else {
                Loading.hide();
            }
        };
    }


    /**
     * 显示表格数据
     * @param data Excel数据
     */
    private displayTable(data: any[]) {
        const startX = 10;
        const startY = 200;
        const columnWidth = 200;
        const rowHeight = 40;
        const padding = 10;

        //
        if(!this.table)
            this.table = new Panel(this, startX, startY, this.game.canvas.width-startX*2, this.game.canvas.height-startY-padding, 2000, 0, 0xffffff);
        else
            this.table.list.forEach(child => child.destroy());

        // 绘制表头
        var dy = 0;
        const headers = ['英文', '中文', '词根'];
        headers.forEach((header, index) => {
            var block = this.createBlock(index * columnWidth, dy, columnWidth - padding, rowHeight, header, 0x6c5ce7, 'white');
            this.table?.add(block);
        });

        // 绘制数据行
        dy = dy + rowHeight + padding;
        data.forEach((row, rowIndex) => {
            const y = rowIndex * rowHeight + dy;
            headers.forEach((header, colIndex) => {
                const cellValue = row[header] || '';
                var block = this.createBlock(colIndex * columnWidth, y, columnWidth - padding, rowHeight - padding, cellValue.toString(), 0xf0f0f0, '0x000000');
                this.table?.add(block);
            });
        });
    }

    /**
     * 创建一个表格块
     * @param x 位置X
     * @param y 位置Y
     * @param width 宽度
     * @param height 高度
     * @param text 文本
     * @param bgColor 背景颜色
     */
    private createBlock(x:number, y:number, width:number, height:number, text:string, bgColor:number, textColor: string):Phaser.GameObjects.Container{
        const block = new Phaser.GameObjects.Container(this, x, y);
        var rect = new Phaser.GameObjects.Rectangle(this, 0, 0, width, height, bgColor).setOrigin(0);
        var label = new Phaser.GameObjects.Text(this, 10, height/2, text, {
            color: textColor,
            fontSize: '16px',
            align: 'center'
        }).setOrigin(0, 0.5);  // 水平居左，垂直居中
        block.add(rect);
        block.add(label);
        return block;
    }

}