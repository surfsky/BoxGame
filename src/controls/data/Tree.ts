import { Control } from "../Control";
import { Panel } from "../Panel";

interface TreeNode {
    key: string;
    label: string;
    children?: TreeNode[];
    expanded?: boolean;
    data?: any;
}

export class Tree extends Control {
    private panel: Panel;
    private datas: TreeNode[] = [];
    private nodeHeight: number = 30;
    private indentWidth: number = 20;
    private expandIconSize: number = 12;
    private nodes: Map<string, Phaser.GameObjects.Container> = new Map();
    private itemClicked: Phaser.Events.EventEmitter;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y, width, height);
        
        // 创建滚动面板
        this.panel = new Panel(scene, 0, 0, width, height, height*2, 0, 0xffffff);
        this.add(this.panel);

        // 初始化事件发射器
        this.itemClicked = new Phaser.Events.EventEmitter();
    }

    public setData(data: any) {
        this.datas = this.transformData(data);
        this.draw();
        return this;
    }

    private transformData(data: any, parentKey: string = ''): TreeNode[] {
        if (!data) return [];
        
        if (Array.isArray(data)) {
            return data.map((item, index) => ({
                key: `${parentKey}${index}`,
                label: Array.isArray(item) ? `[${index}]` : typeof item === 'object' ? '{...}' : String(item),
                children: Array.isArray(item) || (typeof item === 'object' && item !== null) ? this.transformData(item, `${parentKey}${index}-`) : undefined,
                expanded: false,
                data: item
            }));
        } else if (typeof data === 'object' && data !== null) {
            return Object.entries(data).map(([key, value], index) => ({
                key: `${parentKey}${key}`,
                label: `${key}: ${Array.isArray(value) ? '[...]' : typeof value === 'object' ? '{...}' : String(value)}`,
                children: Array.isArray(value) || (typeof value === 'object' && value !== null) ? this.transformData(value, `${parentKey}${key}-`) : undefined,
                expanded: false,
                data: value
            }));
        }
        return [];
    }

    protected override draw() {
        super.draw();
        this.panel.list.forEach((t)=> t.destroy()); //.clear();
        this.nodes.clear();
        
        let y = 0;
        this.drawNodes(this.datas, 0, y);
    }

    private drawNodes(nodes: TreeNode[], level: number, startY: number): number {
        let y = startY;
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const container = new Phaser.GameObjects.Container(this.scene, level * this.indentWidth, y);
            this.nodes.set(node.key, container);
            
            // 绘制连接线
            const lineGraphics = this.scene.add.graphics();
            lineGraphics.lineStyle(1, this.mainColor);
            
            // 绘制水平连接线
            if (level > 0) {
                lineGraphics.lineBetween(-this.indentWidth + this.expandIconSize, this.nodeHeight/2, 0, this.nodeHeight/2);
            }
            
            // 绘制垂直连接线（从当前节点到下一个同级节点）
            if (level > 0 && i < nodes.length - 1) {
                lineGraphics.lineBetween(-this.indentWidth + this.expandIconSize, this.nodeHeight/2, -this.indentWidth + this.expandIconSize, this.nodeHeight);
            }
            
            // 如果是父节点的最后一个子节点，绘制从父节点延伸下来的垂直线
            if (level > 0 && i === 0) {
                lineGraphics.lineBetween(-this.indentWidth + this.expandIconSize, 0, -this.indentWidth + this.expandIconSize, this.nodeHeight/2);
            }
            
            container.add(lineGraphics);
            
            // 绘制展开/折叠图标
            if (node.children && node.children.length > 0) {
                const expandIcon = this.scene.add.graphics();
                expandIcon.lineStyle(1, this.mainColor);
                expandIcon.strokeRect(0, 0, this.expandIconSize, this.expandIconSize);
                expandIcon.lineBetween(2, this.expandIconSize/2, this.expandIconSize-2, this.expandIconSize/2);
                if (!node.expanded) {
                    expandIcon.lineBetween(this.expandIconSize/2, 2, this.expandIconSize/2, this.expandIconSize-2);
                }
                expandIcon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.expandIconSize, this.expandIconSize), Phaser.Geom.Rectangle.Contains)
                    .on('pointerdown', () => this.toggleNode(node));
                container.add(expandIcon);
            }

            // 绘制节点文本
            const text = this.scene.add.text(
                node.children ? this.expandIconSize + 5 : 0,
                0,
                node.label,
                { fontSize: '14px', color: '#000000' }
            );
            text.setOrigin(0, 0);
            
            // 设置文本交互
            text.setInteractive()
                .on('pointerdown', () => {
                    this.itemClicked.emit('itemClick', node);
                });
            
            container.add(text);
            this.panel.add(container);
            
            y += this.nodeHeight;
            
            // 如果节点展开且有子节点，则递归绘制子节点
            if (node.expanded && node.children && node.children.length > 0) {
                y = this.drawNodes(node.children, level + 1, y);
            }
        }
        
        return y;
    }

    private toggleNode(node: TreeNode) {
        if (node.children && node.children.length > 0) {
            node.expanded = !node.expanded;
            this.draw();
        }
    }

    public onItemClick(callback: (node: TreeNode) => void) {
        this.itemClicked.on('itemClick', callback);
        return this;
    }
}