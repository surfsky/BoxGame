import 'phaser';
import { Row } from '../controls/layouts/Row';
import { Grid } from '../controls/layouts/Grid';
import { Column } from '../controls/layouts/Column';
import { TestScene } from './TestScene';

export class TestLayout extends TestScene {
    constructor() {
        super('TestLayout');
    }

    preload() {
        // 预加载背景图
        this.load.image('sky', 'assets/images/bg1.png');
    }

    create() {
        this.createTitle("Layout");
        this.createBaseLine();
        
        this.testRow();
        this.testColumn();
        this.testGrid();
    }

    /** Row */ 
    private testRow() {
        var w = this.game.canvas.width;
        const row = new Row(this, 100, 100, w-20, 200, 5, true);
        for (let i = 0; i < 20; i++) {
            const item = this.add.rectangle(0, 0, 20, 20, 0xff0000).setOrigin(0);;
            row.addChild(item);
        }
    }

    /** Column */
    private testColumn() {
        const column = new Column(this, 100, 200, 100, 400, 10, true);
        for (let i = 0; i < 20; i++) {
            const item = this.add.rectangle(0, 0, 20, 20, 0x00ff00).setOrigin(0);
            column.addChild(item);
        }
    }

    /** Grid */
    private testGrid() {
        const grid = new Grid(this, 400, 200, {
            columnCount: 3,
            cellWidth: 20,
            cellHeight: 20,
            gapH: 10,
            gapV: 10,
            alignH: 'left',
            alignV: 'top'
        });
        for (let i = 0; i < 20; i++) {
            const item = this.add.rectangle(0, 0, 20, 20, 0x0000ff).setOrigin(0);
            grid.addChild(item);
        }
    }
}
