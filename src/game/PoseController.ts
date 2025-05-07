import { FilesetResolver, PoseLandmarker, PoseLandmark } from '@mediapipe/tasks-vision';
import { Scene } from 'phaser';

/**
 * @description: 体感控制器
 * @author: surfsky
 * @date: 2023-09-15
 */
export class PoseController {
    private scene: Scene;
    private poseLandmarker!: PoseLandmarker;
    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private isRunning: boolean = false;
    private onPoseFunc?: (direction: string) => void;
    private onInitFunc?: () => void;

    //
    private lastPose: string | null = null;
    private lastTime: number = 0;
    private readonly detectMs: number = 500; // 500ms 内不重复发送相同指令

    //
    private guideBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };


    //------------------------------------------------------------
    // Life Cycle
    //------------------------------------------------------------
    constructor(scene: Scene) {
        this.scene = scene;
        
        // 创建视频元素
        this.video = document.createElement('video');
        this.video.style.position = 'absolute';
        this.video.style.top = '0px';
        this.video.style.left = '0px';
        this.video.style.transform = 'scaleX(-1)';
        this.video.style.display = 'none';
        document.body.appendChild(this.video);

        // 创建画布元素
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);

        // 设置引导框位置和大小
        this.guideBox = {
            x: 0.2,
            y: 0.2,
            width: 0.6,
            height: 0.8
        };
    }

    /**设置初始化结束事件 */
    public onInit(func: () => void) : this {
        this.onInitFunc = func;
        return this;
    }

    /**设置姿势检测事件 */
    public onPose(func: (direction: string) => void) : this {
        this.onPoseFunc = func;
        return this;
    }

    /**初始化姿势识别模型 */
    async init() {
        try {
            // 初始化视觉任务
            // 创建姿态识别器
            const vision = await FilesetResolver.forVisionTasks("https://unpkg.com/@mediapipe/tasks-vision/wasm");
            this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"},
                runningMode: "VIDEO"
            });
            console.log("姿态识别模型加载成功");
            this.onInitFunc && this.onInitFunc();
        } catch (error) {
            console.error("初始化姿态识别模型失败:", error);
        }
    }

    /**开始体感控制*/
    async start() {
        if (this.isRunning) return;

        try {
            // 请求摄像头权限
            var w = window.innerWidth;  // 640
            var h = window.innerHeight; // 480
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: w, height: h }
            });

            // 设置视频流
            this.video.srcObject = stream;
            await this.video.play();
            this.video.style.width   = `${w}px`;  //'640px';
            this.video.style.height  = `${h}px`;  //'480px';
            this.canvas.style.width  = `${w}px`;  //'640px';
            this.canvas.style.height = `${h}px`;  //'480px';

            // 开始检测
            this.isRunning = true;
            console.log("姿态检测中...");
            this.detectPose();
        } catch (error) {
            console.error("启动摄像头失败:", error);
        }
    }

    /**停止体感控制*/
    stop() {
        if (!this.isRunning) return;

        // 停止视频流
        const stream = this.video.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        this.video.srcObject = null;

        // 停止检测
        this.isRunning = false;
        console.log("体感控制已停止");
    }

    //------------------------------------------------------------
    // 检测姿态
    //------------------------------------------------------------
    /**检测姿态*/
    private async detectPose() {
        if (!this.isRunning || !this.poseLandmarker) return;

        try {
            // 获取姿态关键点
            const results = await this.poseLandmarker.detectForVideo(this.video, performance.now());
            if (results.landmarks.length > 0) {
                const marks = results.landmarks[0];  // 第一个人的所有点
                if (!this.isAllPointsVisible(marks, 11, 13, 23, 25)) {
                    this.showGuide(marks);
                }
                else{
                    this.hideGuide();
                    this.analyzePose(marks);
                }
            } else {
                this.showGuide(undefined);
            }

            // 继续下一帧检测
            requestAnimationFrame(() => this.detectPose());
        } catch (error) {
            console.log("姿态检测失败:", error);
        }
    }


    /**所有关键点是否都可见 */
    isAllPointsVisible(marks: PoseLandmark[], ...ids: number[]): boolean {
        for (let id of ids) {
            if (marks[id].visibility! < 0.5) {
                return false;
            }
        }
        return true;
    }


    //------------------------------------------------------------
    // 绘制检测图
    //------------------------------------------------------------
    /**显示引导框和视频*/
    private showGuide(landmarks?: PoseLandmark[]) {
        this.video.style.display = 'block';
        this.canvas.style.display = 'block';
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制矩形引导框，提示文字
        this.drawGuideBox(ctx);
        this.drawGuideText(ctx);

        // 绘制关键点和连线
        if (landmarks && landmarks.length > 0) {
            this.drawConnections(ctx, landmarks);
            this.drawKeypoints(ctx, landmarks);
        }
    }

    /** 绘制引导框 */
    private drawGuideBox(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            this.guideBox.x * this.canvas.width,
            this.guideBox.y * this.canvas.height,
            this.guideBox.width * this.canvas.width,
            this.guideBox.height * this.canvas.height
        );
    }

    /** 绘制提示文字 */
    private drawGuideText(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#ff0000';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('请站到摄像头前', this.canvas.width / 2, 30);
    }

    /** 绘制关键点 */
    private drawKeypoints(ctx: CanvasRenderingContext2D, landmarks: PoseLandmark[]) {
        ctx.fillStyle = '#00ff00'; // Green color for keypoints
        ctx.strokeStyle = '#ffffff';
        landmarks.forEach(landmark => {
            // 反转x坐标以匹配镜像视频
            const x = (1 - landmark.x) * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            // TODO: 改为绘制圆形关键点
            ctx.fillRect(x - 2, y - 2, 4, 4);
            ctx.strokeRect(x - 2, y - 2, 5, 5);
        });
    }

    /** 绘制骨骼连线 */
    private drawConnections(ctx: CanvasRenderingContext2D, landmarks: PoseLandmark[]) {
        ctx.strokeStyle = '#ffffff'; // White color for connections
        ctx.lineWidth = 2;

        const connections: [number, number][] = [
            // Torso
            [11, 12], [11, 23], [23, 24], [24, 12],
            // Left Arm
            [11, 13], [13, 15],
            // Right Arm
            [12, 14], [14, 16],
            // Left Leg
            [23, 25], [25, 27],
            // Right Leg
            [24, 26], [26, 28],
            // Left Hand (Triangle)
            [15, 17], [17, 19], [19, 15], [15, 21],
            // Right Hand (Triangle)
            [16, 18], [18, 20], [20, 16], [16, 22],
            // Left Foot (Triangle)
            [27, 29], [29, 31], [31, 27],
            // Right Foot (Triangle)
            [28, 30], [30, 32], [32, 28],
        ];

        connections.forEach(([startIdx, endIdx]) => {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];

            if (start && end) {
                // 反转x坐标以匹配镜像视频
                const startX = (1 - start.x) * this.canvas.width;
                const startY = start.y * this.canvas.height;
                const endX = (1 - end.x) * this.canvas.width;
                const endY = end.y * this.canvas.height;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        });
    }

    /**隐藏引导框和视频*/
    private hideGuide() {
        this.video.style.display = 'none';
        this.canvas.style.display = 'none';
        // 隐藏视频
        //this.video.pause();
    }


    //------------------------------------------------------------
    // 姿态分析
    // Y轴朝下，以下判定统一将：下部的器官节点放在不等式左侧。
    //------------------------------------------------------------
    /**分析姿态并触发相应动作*/
    private analyzePose(landmarks: PoseLandmark[]) {
        const now = performance.now();

        // 获取关键点坐标：https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker?hl=zh-cn
        const leftShoulder = landmarks[11];  // 左肩
        const rightShoulder = landmarks[12]; // 右肩
        const leftElbow = landmarks[13];  // 左手肘
        const rightElbow = landmarks[14]; // 右手肘
        const leftWrist = landmarks[15];  // 左手腕
        const rightWrist = landmarks[16]; // 右手腕
        const leftHip = landmarks[23];    // 左髋
        const rightHip = landmarks[24];   // 右髋
        const leftKnee = landmarks[25];   // 左膝
        const rightKnee = landmarks[26];  // 右膝
        const leftAnkle = landmarks[27];  // 左踝
        const rightAnkle = landmarks[28]; // 右踝

        // 判断姿势 - 优先判断站立
        if (this.isStanding(leftShoulder, rightShoulder, leftElbow, rightElbow, leftHip, rightHip, leftKnee, rightKnee)) {
            //this.trySendPose('stand', now);
        }
        else if (this.isHandsUp(leftShoulder, rightShoulder, leftElbow, rightElbow)) {
            this.trySendPose('up', now);
        }
        else if (this.isSquatting(leftHip, rightHip, leftKnee, rightKnee)) {
            this.trySendPose('down', now);
        }
        else if (this.isLeftArmOut(leftShoulder, rightShoulder, leftElbow, rightElbow)) {
            this.trySendPose('left', now);
        }
        else if (this.isRightArmOut(rightShoulder, rightShoulder, leftElbow, rightElbow)) {
            this.trySendPose('right', now);
        }
        else if (this.isSalute(rightShoulder, rightElbow, rightWrist)){
            this.trySendPose('ok', now);
        }
        else if (this.isOutman(rightElbow, rightWrist, leftElbow, leftWrist)){
            this.trySendPose('ok', now);
        }
    }

    /**尝试发送姿态检测结果，并进行节流处理*/
    private trySendPose(pose: string, currentTime: number) {
        // 节流处理
        if (currentTime < this.lastTime + this.detectMs) {
            if (pose === this.lastPose) {
                return; // 短时间内姿势相同，忽略该消息，不重复发送
            }
            // 如果之前的动作是上举，现监测到左手平举或右手平举，则忽略该消息。因为是手从头上放下来的原因。
            if (this.lastPose === 'up' && (pose === 'left' || pose === 'right')) {
                return;
            }
        }
        console.warn(`检测到姿势: ${pose}`);
        this.onPoseFunc && this.onPoseFunc(pose);
        this.lastPose = pose;
        this.lastTime = currentTime;
    }

    //------------------------------------------------------------
    //------------------------------------------------------------
    /**判断是否站立*/
    private isStanding(
        leftShoulder: PoseLandmark, rightShoulder: PoseLandmark, 
        leftElbow: PoseLandmark, rightElbow: PoseLandmark, 
        leftHip: PoseLandmark, rightHip: PoseLandmark, 
        leftKnee: PoseLandmark, rightKnee: PoseLandmark
    ) : boolean {
        const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipY = (leftHip.y + rightHip.y) / 2;
        const kneeY = (leftKnee.y + rightKnee.y) / 2;
        const elbowY = (leftElbow.y + rightElbow.y) / 2;

        // 肩肘臀膝判定
        const isLegsStraight = kneeY > hipY + 0.1;      // 膝明显低于臀。Y 轴朝下
        const isElbowDown = elbowY > shoulderY + 0.1;   // 肘明显低于肩。
        return isLegsStraight && isElbowDown;
    }


    /**判断是否下蹲 (臀部略高于膝盖)*/
    private isSquatting(leftHip: PoseLandmark, rightHip: PoseLandmark, leftKnee: PoseLandmark, rightKnee: PoseLandmark): boolean {
        return leftKnee.y <= leftHip.y + 0.1 && rightKnee.y <= rightHip.y + 0.1;
        //return leftHip.y >= leftKnee.y - 0.1 || rightHip.y >= rightKnee.y - 0.1;
    }

    /*** 判断是否双手举过头顶 (左右手肘都高过肩膀)*/
    private isHandsUp(leftShoulder: PoseLandmark, rightShoulder: PoseLandmark, leftElbow: PoseLandmark, rightElbow: PoseLandmark): boolean {
        return leftShoulder.y > leftElbow.y + 0.05 && rightShoulder.y > rightElbow.y + 0.05;
        //return leftElbow.y < leftShoulder.y - 0.05 && rightElbow.y < rightShoulder.y - 0.05;
    }

    /**判断是否左臂向外侧平举 (左肩与左肘大致水平，右肘无平举动作，避免与上举冲突)*/
    private isLeftArmOut(leftShoulder: PoseLandmark, rightShoulder: PoseLandmark, leftElbow: PoseLandmark, rightElbow: PoseLandmark): boolean {
        var d = 0.10;  // 0.15
        const isLeftArmLevel  = this.between(leftElbow.y,  leftShoulder.y+d,  leftShoulder.y-d);
        const isRightArmLevel = this.between(rightElbow.y, rightShoulder.y+d, rightShoulder.y-d);
        return isLeftArmLevel && !isRightArmLevel;
    }

    /**判断是否右臂向外侧平举 (右肩与右肘大致水平，左肘无平举动作，避免与上举冲突)*/
    private isRightArmOut(leftShoulder: PoseLandmark, rightShoulder: PoseLandmark, leftElbow: PoseLandmark, rightElbow: PoseLandmark): boolean {
        var d = 0.10;  // 0.15
        const isLeftArmLevel  = this.between(leftElbow.y,  leftShoulder.y+d,  leftShoulder.y-d);
        const isRightArmLevel = this.between(rightElbow.y, rightShoulder.y+d, rightShoulder.y-d);
        return isRightArmLevel && !isLeftArmLevel;
    }

    /**判断是否是奥特曼姿势（右手弯肘竖立，左手平举掌放在右肘处，） */
    private isOutman(rightElbow: PoseLandmark, rightWrist: PoseLandmark, leftElbow: PoseLandmark, leftWrist: PoseLandmark): boolean {
        var d = 0.10;
        const isRightElbowUp  = rightElbow.y > rightWrist.y + d;
        const isLeftHandLevel = this.between(leftWrist.y, leftElbow.y - d, leftElbow.y + d);
        return isRightElbowUp && isLeftHandLevel;
    }

    /**判断是否是敬礼姿势（右肘水平于右肩，右手腕位于右肩上方 */
    private isSalute(rightShoulder: PoseLandmark, rightElbow: PoseLandmark, rightWrist: PoseLandmark): boolean {
        var d = 0.10;
        const isRightElbowLevel = this.between(rightElbow.y, rightShoulder.y - d, rightShoulder.y + d);
        const isRightWristAbove = rightShoulder.y > rightWrist.y + 0.05  && this.between(rightWrist.x, rightShoulder.x - d, rightShoulder.x + d);
        return isRightElbowLevel && isRightWristAbove;
    }

    /**判断值是否处于中间 */
    private between(value: number, min: number, max: number): boolean {
        return value >= min && value <= max;
    }

}