export const GameConfig = {
    colors: {
        primary: 0x4a90e2,
        success: 0x00ff00,
        contrast: 0xf8961e,
        error: 0xff0000,
        hover: 0x5ba1f3,
    },
    bgs: [
        { key: 'bg1',     path: './assets/images/bg1.png' },
        { key: 'bg2',     path: './assets/images/bg2.png' },
        { key: 'bg3',     path: './assets/images/bg3.png' },
        { key: 'bg4',     path: './assets/images/bg4.png' },
        { key: 'bg5',     path: './assets/images/bg5.png' },
    ],
    sounds: {
        bgm:    { key: 'bgm',     path: './assets/audio/bgm.mp3' },
        click:  { key: 'click',   path: './assets/audio/click.wav' },
        move:   { key: 'move',    path: './assets/audio/move.wav' },
        rotate: { key: 'rotate',  path: './assets/audio/rotate.wav' },
        drop:   { key: 'drop',    path: './assets/audio/drop.wav' },
        clear:  { key: 'clear',   path: './assets/audio/clear.mp3' },
        success: {key: 'success', path: 'assets/audio/success.mp3'},
        error:   {key: 'error',   path: 'assets/audio/error.mp3'},
        win:     {key: 'win',     path: 'assets/audio/win.mp3'},
    },
    icons: {
        back: { key: 'back', path: 'assets/icons/back.svg' },
        left: { key: 'left', path: 'assets/icons/left.svg' },
        right: { key: 'right', path: 'assets/icons/right.svg' },
        rotate: { key: 'rotate', path: 'assets/icons/rotate.svg' },
        drop: { key: 'drop', path: 'assets/icons/drop.svg' },
        volume: { key: 'volume', path: 'assets/icons/volume.svg' },
        down: { key: 'down', path: 'assets/icons/down.svg' },
        close: { key: 'close', path: 'assets/icons/close.svg' },
        home: { key: 'home', path: 'assets/icons/home.svg' },
        setting: { key: 'setting', path: 'assets/icons/setting.svg' },
        refresh: { key: 'refresh', path: 'assets/icons/refresh.svg' },
        search: { key:'search', path: 'assets/icons/search.svg' },
    },
    fonts: {
        default: '"仿宋", "SF Pro SC", "SF Pro Text", "SF Pro Icons", "PingFang SC", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
        title: 'AlimamaDaoLiTi'
    },
    depths: {
        bg: -1,
        game: 100,
        ui: 200,
        dialog: 300,
        popup: 400,
        top: 900
    },
};