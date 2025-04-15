import Phaser from 'phaser';
import { TitleBar } from '../controls/mobile/TitleBar';
import { TabBar } from '../controls/mobile/TabBar';
import { IconBar } from '../controls/mobile/IconBar';
import { GameConfig } from '../GameConfig';
import { Panel } from '../controls/Panel';
import { Label } from '../controls/basic/Label';

export class TestMobile extends Phaser.Scene {
    private contentPanel!: Panel;
    private titleBar!: TitleBar;
    private tabBar!: TabBar;
    private iconBar!: IconBar;
    private contentLabel!: Label;

    constructor() {
        super({ key: 'TestMobile' });
    }

    preload() {
        // 预加载图标资源
        this.load.image(GameConfig.icons.back.key, GameConfig.icons.back.path);
        this.load.image(GameConfig.icons.home.key, GameConfig.icons.home.path);
        this.load.image(GameConfig.icons.refresh.key, GameConfig.icons.refresh.path);
        this.load.image(GameConfig.icons.search.key, GameConfig.icons.search.path);
        this.load.image(GameConfig.icons.setting.key, GameConfig.icons.setting.path);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 创建标题栏
        this.titleBar = new TitleBar(this, 0, 0, {
            title: '移动端控件测试',
            onBack: () => this.scene.start('TestIndex'),
            rightButton: {
                icon: GameConfig.icons.refresh.key,
                onClick: () => this.scene.restart()
            }
        });
        this.add.existing(this.titleBar);

        // 创建底部标签栏
        this.tabBar = new TabBar(this, 0, height - 50, {
            tabs: [
                { key: 'home', text: '首页', icon: GameConfig.icons.home.key },
                { key: 'search', text: '搜索', icon: GameConfig.icons.search.key },
                { key: 'setting', text: '设置', icon: GameConfig.icons.setting.key }
            ],
            onChange: (index, tab) => {
                this.contentLabel.setText(`当前选中: ${tab.text}`);
            }
        });
        this.add.existing(this.tabBar);

        // 创建图标工具栏
        this.iconBar = new IconBar(this, 0, this.titleBar.height, {
            icons: [
                { key: 'home', icon: GameConfig.icons.home.key, text: '首页' },
                { key: 'search', icon: GameConfig.icons.search.key, text: '搜索' },
                { key: 'setting', icon: GameConfig.icons.setting.key, text: '设置' }
            ],
            itemWidth: 60,
            spacing: 10
        });
        this.add.existing(this.iconBar);

        // 创建内容面板
        const contentY = this.titleBar.height + this.iconBar.height;
        const contentHeight = height - contentY - this.tabBar.height;
        this.contentPanel = new Panel(this, 0, contentY, width, contentHeight);
        this.add.existing(this.contentPanel);

        // 添加内容标签
        this.contentLabel = new Label(this, width / 2, contentHeight / 2, '移动端控件展示', 'h1');
        //this.contentLabel.setOrigin(0.5, 0.5);
        this.contentPanel.add(this.contentLabel);
    }
}