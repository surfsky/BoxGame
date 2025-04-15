/**
 * TTS语音合成工具类
 * 封装Web Speech API的语音合成功能
 */
export class TTS {
    private static instance: TTS;
    private synth: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private selectedVoice: SpeechSynthesisVoice | null = null;
    private volume: number = 1.0;

    private constructor() {
        this.synth = window.speechSynthesis;
        this.initVoices();
    }

    /**
     * 获取TTS实例（单例模式）
     */
    public static getInstance(): TTS {
        if (!TTS.instance) {
            TTS.instance = new TTS();
        }
        return TTS.instance;
    }

    /**
     * 初始化可用的语音列表
     */
    private async initVoices(): Promise<void> {
        // 获取可用的语音列表
        const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
            return new Promise((resolve) => {
                const voices = this.synth.getVoices();
                if (voices.length !== 0) {
                    resolve(voices);
                } else {
                    this.synth.onvoiceschanged = () => {
                        resolve(this.synth.getVoices());
                    };
                }
            });
        };

        // 获取并过滤英语语音
        this.voices = (await getVoices()).filter(voice => voice.lang.startsWith('en'));
        if (this.voices.length > 0) {
            // 优先选择美式英语语音
            this.selectedVoice = this.voices.find(voice => voice.lang === 'en-US') || this.voices[0];
        }
    }

    /**
     * 设置语音
     * @param voiceName 语音名称
     */
    public setVoice(voiceName: string): void {
        const voice = this.voices.find(v => v.name === voiceName);
        if (voice) {
            this.selectedVoice = voice;
        }
    }

    /**
     * 设置音量
     * @param volume 音量值（0-1）
     */
    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 朗读文本
     * @param text 要朗读的文本
     */
    public speak(text: string): void {
        if (!text) return;

        // 创建语音合成请求
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.selectedVoice?.lang || 'en-US';
        utterance.volume = this.volume;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // 设置选中的语音
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }

        // 开始朗读
        this.synth.speak(utterance);
    }

    /**
     * 获取可用的语音列表
     */
    public getVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    /**
     * 停止朗读
     */
    public stop(): void {
        this.synth.cancel();
    }
}