declare module '@mediapipe/tasks-vision' {
    export interface BaseOptions {
        modelAssetPath: string;
    }

    export interface PoseLandmarkerOptions {
        baseOptions: BaseOptions;
        runningMode: 'VIDEO' | 'IMAGE' | 'LIVE_STREAM';
    }

    export interface PoseLandmark {
        x: number;
        y: number;
        z: number;
        visibility?: number;
        presence?: number;
    }

    export interface PoseLandmarkerResult {
        landmarks: PoseLandmark[][];
        worldLandmarks?: PoseLandmark[][];
        segmentationMasks?: ImageData[];
    }

    export class FilesetResolver {
        static forVisionTasks(wasmFilePath: string): Promise<Vision>;
    }

    export class Vision {}

    export class PoseLandmarker {
        static createFromOptions(vision: Vision, options: PoseLandmarkerOptions): Promise<PoseLandmarker>;
        detectForVideo(video: HTMLVideoElement | HTMLImageElement, timestamp: number): Promise<PoseLandmarkerResult>;
        close(): void;
    }
}