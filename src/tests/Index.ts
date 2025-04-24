import Phaser from 'phaser';
import { GameConfig } from '../GameConfig';
import { MessageScene } from '../controls/overlays/MessageScene';
import { Button } from '../controls/buttons/Button';
import { TestBlock } from './TestBlock';
import { TestLayout } from './TestLayout';
import { TestInput } from './TestInput';
import { TestButton } from './TestButton';
import { TestTTS } from './TestTTS';
import { TestExcel } from './TestExcel';
import { TestControls } from './TestControls';
import { TestFormBasic } from './TestFormBasic';
import { TestPopup } from './TestPopup';
import { TestTooltip } from './TestTooltip';
import { TestTag } from './TestTag';
import { TestImage } from './TestImage';
import { TestDrag } from './TestDrag';
import { TestResize } from './TestResize';
import { TestTable } from './TestTable';
import { TestScene } from './TestScene';
import { TestView } from './TestView';
import { TestDialog } from './TestDialog';
import { Tag } from '../controls/basic/Tag';
import { Panel } from '../controls/Panel';
import { Label } from '../controls/basic/Label';
import { TestLabel } from './TestLabel';
import { TestTree } from './TestTree';
import { TestMobile } from './TestMobile';

//--------------------------------------------------------
// 入口页面
//--------------------------------------------------------
/**测试场景列表 */
export class Index extends Phaser.Scene {
    constructor() {
        super({ key: 'TestIndex' });
    }

    preload() {
        // 预加载资源
        this.load.image(GameConfig.icons.back.key, GameConfig.icons.back.path); //'icon-back', 'assets/icons/left.svg');
        this.load.image(GameConfig.icons.down.key, GameConfig.icons.down.path);
    }

    create() {
        var centerX = this.cameras.main.width / 2;
        var contentHeight = 0;

        // 创建Panel容器
        const panel = new Panel(this, 0, 0, this.cameras.main.width, this.cameras.main.height, 2400, 0, 0xffffff);

        // 创建标题
        const title = this.add.text(centerX, 50, 'Phaser UI 测试', {
            fontSize: '32px',
            color: '#000',
        }).setOrigin(0.5);
        panel.add(title);
        contentHeight = title.y + title.height + 30;

        // 定义测试场景列表
        const scenes = [
            { group: 'Basic', key: 'TestButton', title: '按钮', status: 'ok' },
            { group: 'Basic', key: 'TestTag', title: 'Tag' , status: 'ok' },
            { group: 'Basic', key: 'TestImage', title: 'Image' , status: 'ok' },
            { group: 'Basic', key: 'TestLabel', title: 'Label' , status: 'ok' },
            { group: 'Basic', key: 'TestControls', title: 'Controls' , status: 'fail' },

            { group: 'Form', key: 'TestFormBasic', title: '基本表单控件', status: 'ok'  },
            { group: 'Form', key: 'TestInput', title: '输入控件' , status: 'ok' },

            { group: 'Layout', key: 'TestLayout', title: '布局' , status: 'ok' },

            { group: 'data', key: 'TestTable', title: 'Table' , status: 'ok' },
            { group: 'data', key: 'TestTree', title: 'Tree' , status: 'fail' },

            { group: 'overlay', key: 'TestTooltip', title: 'Tooltip' , status: 'ok' },
            { group: 'overlay', key: 'TestPopup', title: 'Popup' , status: 'ok' },
            { group: 'overlay', key: 'TestDialog', title: '对话框' , status: 'ok' },

            { group: 'view', key: 'TestView', title: '视图' , status: 'fail' },

            { group: 'Event', key: 'TestDrag', title: 'Drag' , status: 'ok' },
            { group: 'Event', key: 'TestResize', title: 'Resize' , status: 'fail' },


            { group: 'App', key: 'TestBlock', title: 'Game BLOCK' , status: 'ok' },
            { group: 'App', key: 'TestTTS', title: 'TTS' , status: 'fail' },
            { group: 'App', key: 'TestExcel', title: 'Excel导入' , status: 'ok' },
            
            { group: 'Mobile', key: 'TestMobile', title: '移动端控件' , status: 'fail' },

        ];

        // 按group对场景进行分组
        const groupedScenes = scenes.reduce((groups: { [key: string]: typeof scenes }, scene) => {
            const group = scene.group;
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(scene);
            return groups;
        }, {});

        // 创建分组场景按钮
        const columnWidth = 220; // 列宽（包含按钮间距）
        let currentY = 90; // 起始Y坐标

        // 遍历每个分组
        Object.entries(groupedScenes).forEach(([groupName, groupScenes]) => {
            // 添加分组标题
            const groupTitle = this.add.text(centerX, currentY, groupName, {
                fontSize: '20px',
                color: '#444',
                fontStyle: 'bold',
            }).setOrigin(0.5, 0.5);
            panel.add(groupTitle);
            currentY += 50;

            // 创建该分组的按钮
            groupScenes.forEach((scene, index) => {
                const column = index % 2; // 0为左列，1为右列
                const x = centerX + (column === 0 ? -columnWidth : 0);
                const y = currentY;

                // 创建按钮
                const button = new Button(this, x, y, scene.title, {
                    width: 180,
                    height: 50,
                    bgColor: 0x6c5ce7
                }); //.setOrigin(0.5, 0.5);
                panel.add(button);

                // 添加状态标签
                const tagColor = scene.status === 'ok' ? 0x2ecc71 : 0xe74c3c;
                const tag = new Tag(this, x + 170, y+20, scene.status, {
                    bgColor: tagColor,
                    height: 20,
                    radius: 10,
                    textStyle: {
                        fontSize: '11px'
                    },
                });
                panel.add(tag);

                button.on('click', () => {
                    this.scene.start(scene.key);
                });

                // 如果是该行的最后一个按钮，增加Y坐标
                if (column === 1 || index === groupScenes.length - 1) {
                    currentY += 80;
                }
            });

            // 分组之间添加间距
            currentY += 20;
        });

        // 更新Panel的内容高度
        panel.resetContentHeight();
    }
}

//--------------------------------------------------------
// 游戏入口
//--------------------------------------------------------
const game = new Phaser.Game({
    backgroundColor: '#ffffff',
    type: Phaser.CANVAS,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        width: '100%',
        height: '100%',
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Index, MessageScene, 
        TestBlock, TestLayout, TestInput, TestButton, 
        TestTTS, TestExcel, TestControls, TestFormBasic, 
        TestPopup, TestTooltip, TestTag, TestImage,
        TestDrag, TestResize, TestTable, TestScene,
        TestView, TestDialog, TestLabel, TestTree,
        TestMobile,
    ]
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
    game.scale.refresh();
});