import { GameObjects } from "phaser";

/************************************************************
 * Theme config
 ***********************************************************/
export class Theme{
    name               = 'iOSLight';

    // named color
    static namedColor = {
        blue: 0x0000ff,
        green: 0x00ff00,
        red: 0xff0000,
        yellow: 0xffff00,
        black: 0x000000,
        white: 0xffffff,
        gray: 0x808080,
        purple: 0x800080,
        pink: 0xff00ff,
        orange: 0xffa500,
        brown: 0xff00ff,
    }

    // color
    color = {
        primary: 0x007bff,
        secondary: 0x7633d4,
        success: 0x28a745,
        info: 0x17a2b8,
        warning: 0xffc107,
        danger: 0xdc3545,
        bg: 0xffffff,
        bgDark: 0x343a40,
        bgLight: 0xf8f9fa,
    }

    // text
    text = {
        color : 0x000000,// black;
        lightColor : 0xffffff,  // white
        normal: { font: 'Arial', size: 16},
        small: { font: 'Arial', size: 12},
        h1: { font: 'Arial', size: 24, fontWeight: 'bold'},
        h2: { font: 'Arial', size: 22, fontWeight: 'bold'},
        h3: { font: 'Arial', size: 20, fontWeight: 'bold'},
        h4: { font: 'Arial', size: 18, fontWeight: 'bold'},
        h5: { font: 'Arial', size: 16, fontWeight: 'bold'},
    }

    // border
    border = {
        color: 0xcdcdcd,
        width: 1,
        radius: 8,
    }

    // size
    control = {
        width: 120,
        height: 40,
        rowHeight: 48,
    }

    // link
    link = {
        color: 0x0000ff,
        hoverColor: 0xffa500, //0x1010ff,
        visitedColor: 0xffa500, //0xa0a0a0,
    }

    constructor(opt: any) {
        Object.assign(this, opt);
    }

    /**将数字颜色转化为文本颜色 */
    public static toColorText(color: number): string{
        return `#${color.toString(16).padStart(6, '0')}`;
    }

    /**解析颜色字符串 */
    public static parseColor(color: string): number{
        if(color.startsWith('#')){
            return parseInt(color.substring(1), 16);
        }
        else{
            // 改用网页的颜色解析器(未测试)
            return parseInt(window.getComputedStyle(document.body).getPropertyValue(color), 16);
            //return Theme.namedColor[color as keyof typeof Theme.namedColor];
        }
    }
}


/********************************************************************
 * Set theme interface for control.
 *******************************************************************/
export interface ITheme{
    setTheme(theme: Theme): void;
}

/*******************************************************************
 * Theme manager
 * @example ThemeManager.setTheme(scene, ThemeManager.themeLight);
 *******************************************************************/
export class ThemeManager{


    /** Theme light */
    public static themeLight = new Theme({
        name: 'iOSLight',
        color: {
            primary: 0x007bff,
            secondary: 0x7633d4,
            success: 0x28a745,
            info: 0x17a2b8,
            warning: 0xffc107,
            danger: 0xdc3545,
            bg: 0xffffff,
            bgDark: 0x343a40,
            bgLight: 0xf8f9fa
        },
        text: {
            color: 0x000000,
            lightColor: 0xffffff,
            normal: { font: 'Arial', size: 16 },
            small: { font: 'Arial', size: 12 },
            h1: { font: 'Arial', size: 24, fontWeight: 'bold' },
            h2: { font: 'Arial', size: 22, fontWeight: 'bold' },
            h3: { font: 'Arial', size: 20, fontWeight: 'bold' },
            h4: { font: 'Arial', size: 18, fontWeight: 'bold' },
            h5: { font: 'Arial', size: 16, fontWeight: 'bold' }
        },
        border: {
            color: 0xcdcdcd,
            width: 1,
            radius: 8
        },
        control: {
            width: 120,
            height: 40,
            rowHeight: 48
        },
        link: {
            color: 0x0000ff,
            hoverColor: 0xffa500, //0x1010ff,
            visitedColor: 0xa0a0a0,
        }
    });

    /** Theme dark */
    static themeDark = new Theme({
        name: 'MaterialDark',
        color: {
            primary: 0x007bff,
            secondary: 0x7633d4,
            success: 0x28a745,
            info: 0x17a2b8,
            warning: 0xffc107,
            danger: 0xdc3545,
            bg: 0x171717,
            bgDark: 0x343a40,
            bgLight: 0xf8f9fa
        },
        text: {
            color: 0xcccccc,
            lightColor: 0xf0f0f0,
            normal: { font: 'Arial', size: 16 },
            small: { font: 'Arial', size: 12 },
            h1: { font: 'Arial', size: 24, fontWeight: 'bold' },
            h2: { font: 'Arial', size: 22, fontWeight: 'bold' },
            h3: { font: 'Arial', size: 20, fontWeight: 'bold' },
            h4: { font: 'Arial', size: 18, fontWeight: 'bold' },
            h5: { font: 'Arial', size: 16, fontWeight: 'bold' }
        },
        border: {
            color: 0x707070,
            width: 1,
            radius: 8
        },
        control: {
            width: 120,
            height: 40,
            rowHeight: 48
        },
        link: {
            color: 0xff0000,
            hoverColor: 0x00ff00,
            visitedColor: 0xa0a0a0
        }
    });

    /** Theme green */
    static themeGreen = new Theme({
        name: 'Green',
        color: {
            primary: 0x2ecc71,
            secondary: 0x27ae60,
            success: 0x28a745,
            info: 0x17a2b8,
            warning: 0xf1c40f,
            danger: 0xe74c3c,
            bg: 0xecf0f1,
            bgDark: 0x2c3e50,
            bgLight: 0xf8f9fa
        },
        text: {
            color: 0x2c3e50,
            lightColor: 0xffffff,
            normal: { font: 'Arial', size: 16 },
            small: { font: 'Arial', size: 12 },
            h1: { font: 'Arial', size: 24, fontWeight: 'bold' },
            h2: { font: 'Arial', size: 22, fontWeight: 'bold' },
            h3: { font: 'Arial', size: 20, fontWeight: 'bold' },
            h4: { font: 'Arial', size: 18, fontWeight: 'bold' },
            h5: { font: 'Arial', size: 16, fontWeight: 'bold' }
        },
        border: {
            color: 0x95a5a6,
            width: 1,
            radius: 8
        },
        control: {
            width: 120,
            height: 40,
            rowHeight: 48
        },
        link: {
            color: 0x27ae60,
            hoverColor: 0x2ecc71,
            visitedColor: 0x95a5a6
        }
    });

    /** Theme purple */
    static themePurple = new Theme({
        name: 'Purple',
        color: {
            primary: 0x9b59b6,
            secondary: 0x8e44ad,
            success: 0x28a745,
            info: 0x17a2b8,
            warning: 0xf1c40f,
            danger: 0xe74c3c,
            bg: 0xf3e5f5,
            bgDark: 0x4a148c,
            bgLight: 0xfce4ec
        },
        text: {
            color: 0x4a148c,
            lightColor: 0xffffff,
            normal: { font: 'Arial', size: 16 },
            small: { font: 'Arial', size: 12 },
            h1: { font: 'Arial', size: 24, fontWeight: 'bold' },
            h2: { font: 'Arial', size: 22, fontWeight: 'bold' },
            h3: { font: 'Arial', size: 20, fontWeight: 'bold' },
            h4: { font: 'Arial', size: 18, fontWeight: 'bold' },
            h5: { font: 'Arial', size: 16, fontWeight: 'bold' }
        },
        border: {
            color: 0xce93d8,
            width: 1,
            radius: 8
        },
        control: {
            width: 120,
            height: 40,
            rowHeight: 48
        },
        link: {
            color: 0x8e44ad,
            hoverColor: 0x9b59b6,
            visitedColor: 0xce93d8
        }
    });

    /** Theme darkblue */
    static themeDarkBlue = new Theme({
        name: 'DarkBlue',
        color: {
            primary: 0x3498db,
            secondary: 0x2980b9,
            success: 0x28a745,
            info: 0x17a2b8,
            warning: 0xf1c40f,
            danger: 0xe74c3c,
            bg: 0xe3f2fd,
            bgDark: 0x0d47a1,
            bgLight: 0xbbdefb
        },
        text: {
            color: 0x0d47a1,
            lightColor: 0xffffff,
            normal: { font: 'Arial', size: 16 },
            small: { font: 'Arial', size: 12 },
            h1: { font: 'Arial', size: 24, fontWeight: 'bold' },
            h2: { font: 'Arial', size: 22, fontWeight: 'bold' },
            h3: { font: 'Arial', size: 20, fontWeight: 'bold' },
            h4: { font: 'Arial', size: 18, fontWeight: 'bold' },
            h5: { font: 'Arial', size: 16, fontWeight: 'bold' }
        },
        border: {
            color: 0x90caf9,
            width: 1,
            radius: 8
        },
        control: {
            width: 120,
            height: 40,
            rowHeight: 48
        },
        link: {
            color: 0x2980b9,
            hoverColor: 0x3498db,
            visitedColor: 0x90caf9
        }
    });


    /** Global Theme*/
    static current = ThemeManager.themeLight;


    /**
     * Set page theme.
     * @param {Theme} theme 
     */
    public static setTheme(scene: Phaser.Scene, theme: Theme | null = null){
        if (theme != null)
            this.current = theme;

        //
        scene.cameras.main.setBackgroundColor(this.current.color.bg);

        //
        var eles = scene.children.list;
        eles.forEach(ele => {
            if ((ele as any).setTheme != undefined)
              (ele as any).setTheme(this.current);
        });
    }


}