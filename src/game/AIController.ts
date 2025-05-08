import Phaser from 'phaser';
import { BoxGameScene, Pos, ItemType } from './BoxGameScene';

// 定义游戏状态接口
export interface GameState {
    player: Pos;
    walls: Pos[];
    ices: Pos[];
    boxes: Pos[];
    targets: Pos[];
    map: number[][];
}

// 定义状态节点
export interface State {
    player: Pos;
    boxes: Pos[];
    path: Pos[];
    priority?: number; // A*算法的优先级
    steps?: number;   // 已走的步数
}


/**
 * 箱子推推看AI控制器
 * 负责计算最佳路径并演示自动过关
 */
export class AIController {
    private scene: BoxGameScene;
    private map: number[][];
    private isRunning: boolean = false;
    private solution: Pos[] = [];
    private currentStep: number = 0;
    private stepTimer: Phaser.Time.TimerEvent | null = null;

    // 方向常量
    private static readonly DIRECTIONS = [
        {dx: 0, dy: -1}, // 上
        {dx: 1, dy: 0},  // 右
        {dx: 0, dy: 1},  // 下
        {dx: -1, dy: 0}  // 左
    ];

    /**
     * 构造函数
     * @param scene BoxGameScene实例
     */
    constructor(scene: BoxGameScene) {
        this.scene = scene;
        this.map = scene.getMap();
    }

    /**
     * 开始AI自动过关演示
     */
    public async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;
        this.scene.showToast('AI正在计算最佳路径...');

        try {
            // 计算解决方案
            await this.calcSolution();

            if (this.solution.length > 0) {
                this.scene.showToast(`找到解决方案，共${this.solution.length}步`);
                this.currentStep = 0;
                this.startDemonstration();
            } else {
                this.scene.showToast('无法找到解决方案');
                this.isRunning = false;
            }
        } catch (error) {
            console.error('AI计算出错:', error);
            this.scene.showToast('AI计算出错');
            this.isRunning = false;
        }
    }

    /**
     * 开始演示解决方案
     */
    private startDemonstration(): void {
        // 设置定时器，每隔一段时间执行一步
        this.stepTimer = this.scene.time.addEvent({
            delay: 500, // 每步间隔500毫秒
            callback: this.executeNextStep,
            callbackScope: this,
            loop: true
        });
    }
    
    /**
     * 执行下一步移动
     */
    private executeNextStep(): void {
        if (this.currentStep >= this.solution.length) {
            // 演示完成
            if (this.stepTimer) {
                this.stepTimer.remove();
                this.stepTimer = null;
            }
            this.isRunning = false;
            this.scene.showToast('AI演示完成');
            return;
        }

        // 获取当前步骤的移动方向，执行移动
        const move = this.solution[this.currentStep];
        this.scene.movePlayer(move.col, move.row);
        this.currentStep++;
    }

    /**
     * 停止AI演示
     */
    public stop(): void {
        if (this.stepTimer) {
            this.stepTimer.remove();
            this.stepTimer = null;
        }
        this.isRunning = false;
        this.scene.showToast('AI演示已停止');
    }

    /**
     * 计算解决方案
     * 使用广度优先搜索(BFS)算法寻找最短路径
     */
    private async calcSolution(): Promise<void> {
        // 为了不阻塞UI，使用Promise包装计算过程
        return new Promise((resolve) => {
            // 在下一帧执行计算，避免UI卡顿
            this.scene.time.delayedCall(10, () => {
                // 获取当前游戏状态
                const gameState = this.scene.getGameState();
                if (!gameState) {
                    console.error('无法获取游戏状态');
                    this.solution = [];
                    resolve();
                    return;
                }

                console.log('开始计算解决方案...');
                console.log('游戏状态:', JSON.stringify({
                    player: gameState.player,
                    walls: gameState.walls,
                    boxes: gameState.boxes,
                    targets: gameState.targets,
                    mapSize: `${gameState.map.length}x${gameState.map[0].length}`
                }));

                // 使用A*搜索算法寻找最优路径
                const startTime = Date.now();
                this.solution = this.findPath(gameState);
                const endTime = Date.now();
                
                console.log(`计算完成，耗时: ${endTime - startTime}ms, 找到路径步数: ${this.solution.length}`);
                if (this.solution.length === 0) {
                    console.log('无法找到解决方案，请检查游戏状态或增加搜索深度');
                }
                
                resolve();
            });
        })
    }

        /**
     * 创建游戏地图的简化表示
     * 1表示墙，0表示空地，2表示箱子
     */
    private createGameMap(map: number[][], boxes: Pos[]): number[][] {
        const gameMap = map.map(row => [...row]);
        
        // 将箱子位置标记为箱子，因为玩家不能直接穿过箱子
        boxes.forEach(box => {
            // 注意：这里不修改原始地图，只是为了寻路算法
            if (box && box.row >= 0 && box.row < gameMap.length && 
                box.col >= 0 && box.col < gameMap[0].length && 
                gameMap[box.row][box.col] !== ItemType.Wall) {
                gameMap[box.row][box.col] = ItemType.Box; // 2表示箱子
            }
        });
        
        return gameMap;
    }
    
    /**
     * 计算状态的优先级（启发式函数）
     * 优先级越低越优先处理
     */
    private calcPriority(state: State, targets: Pos[]): number {
        // 已走步数
        const steps = state.steps || 0;
        
        // 计算所有箱子到最近目标点的曼哈顿距离之和
        let totalDistance = 0;
        state.boxes.forEach(box => {
            if (!box) return;
            
            // 找到距离当前箱子最近的目标点
            let minDistance = Number.MAX_SAFE_INTEGER;
            targets.forEach(target => {
                if (!target) return;
                
                const distance = Math.abs(box.row - target.row) + Math.abs(box.col - target.col);
                minDistance = Math.min(minDistance, distance);
            });
            
            // 如果找不到目标点，给一个很大的惩罚值
            if (minDistance === Number.MAX_SAFE_INTEGER) {
                minDistance = 1000;
            }
            
            totalDistance += minDistance;
        });
        
        // 优先级 = 已走步数 + 启发式距离
        // 这是A*算法的核心：f(n) = g(n) + h(n)
        return steps + totalDistance * 1.5; // 给启发式距离一个权重 (调整权重)
    }

    /**
     * 推箱子寻路算法
     * 使用改进的A*搜索算法寻找最优路径
     */
    private findPath(gameState: GameState): Pos[] {
        // 创建游戏状态的简化表示
        const { player, walls, boxes, targets, map } = gameState;
        const gameMap = this.createGameMap(map, boxes);
        const initState: State = {
            player: player,
            boxes: [...boxes],
            path: [],
            priority: 0, // 优先级（用于A*算法）
            steps: 0     // 已走步数
        };
        initState.priority = this.calcPriority(initState, targets); // 计算初始状态的优先级
        
        // 使用优先队列（模拟）
        const queue: State[] = [initState];
        const visited = new Set<string>();
        const MAX_DEPTH = 10000; // 进一步增加搜索深度以提高找到解决方案的可能性
        let depth = 0;
        console.log(`开始搜索，初始状态：玩家位置(${player.row},${player.col})，箱子数量：${boxes.length}，目标点数量：${targets.length}`);
        
        // A*搜索
        while (queue.length > 0 && depth < MAX_DEPTH) {
            depth++;
            
            // 按优先级排序（模拟优先队列）
            // 取出优先级最高的状态
            queue.sort((a, b) => a.priority! - b.priority!);
            const currState = queue.shift()!;
            const stateKey = this.stateToString(currState);
            // 如果已访问过该状态，跳过
            if (visited.has(stateKey)) 
                continue;
            visited.add(stateKey);
            
            // 每隔50次迭代输出一次调试信息
            if (depth % 50 === 0) {
                console.log(`搜索深度: ${depth}, 队列长度: ${queue.length}, 已访问状态数: ${visited.size}`);
            }
            
            // 检查是否达到目标状态
            if (this.isFinish(currState.boxes, targets)) {
                console.log(`找到解决方案！步数: ${currState.path.length}`);
                // 打印路径
                console.log('路径:', currState.path);
                return currState.path;
            }
            
            // 尝试四个方向的移动
            for (const dir of AIController.DIRECTIONS) {
                const { dx, dy } = dir;
                const newPlayerRow = currState.player.row + dy;
                const newPlayerCol = currState.player.col + dx;
                
                // 检查玩家移动是否有效
                if (!this.isValidMove(newPlayerRow, newPlayerCol, gameMap)) 
                    continue;

                let finalPlayerRow = newPlayerRow;
                let finalPlayerCol = newPlayerCol;
                let finalBoxRow: number | undefined = undefined;
                let finalBoxCol: number | undefined = undefined;
                let movedBoxIndex = -1;

                // 检查是否推箱子
                const boxIndex = currState.boxes.findIndex(
                    box => box && box.row === newPlayerRow && box.col === newPlayerCol
                );

                if (boxIndex >= 0) {
                    // 玩家尝试推箱子
                    let currentBoxRow = newPlayerRow;
                    let currentBoxCol = newPlayerCol;
                    let nextBoxRow = currentBoxRow + dy;
                    let nextBoxCol = currentBoxCol + dx;

                    // 检查箱子移动是否有效 (第一步)
                    if (!this.isValidMove(nextBoxRow, nextBoxCol, gameMap)) 
                        continue;
                    // 检查新位置是否已有其他箱子 (第一步)
                    const hasAnotherBoxInitial = currState.boxes.some(
                        (b, idx) => idx !== boxIndex && b.row === nextBoxRow && b.col === nextBoxCol
                    );
                    if (hasAnotherBoxInitial) 
                        continue;
                    // 检查是否会导致死锁 (第一步)
                    if (this.isDeadlock(nextBoxRow, nextBoxCol, gameMap, targets)) 
                        continue;

                    movedBoxIndex = boxIndex;
                    finalBoxRow = nextBoxRow;
                    finalBoxCol = nextBoxCol;

                    // 如果箱子落在冰块上，模拟滑行
                    if (map[finalBoxRow][finalBoxCol] === ItemType.Ice || map[finalBoxRow][finalBoxCol] === ItemType.BoxOnIce) { // 4 代表冰块
                        let slideBoxR = finalBoxRow;
                        let slideBoxC = finalBoxCol;
                        while (true) {
                            const nextSlideBoxR = slideBoxR + dy;
                            const nextSlideBoxC = slideBoxC + dx;

                            if (!this.isValidMove(nextSlideBoxR, nextSlideBoxC, gameMap)) 
                                break; // 撞墙或出界
                            const collisionWithOtherBox = currState.boxes.some(
                                (b, idx) => idx !== movedBoxIndex && b.row === nextSlideBoxR && b.col === nextSlideBoxC
                            );
                            if (collisionWithOtherBox) 
                                break; // 撞到其他箱子

                            slideBoxR = nextSlideBoxR;
                            slideBoxC = nextSlideBoxC;
                            finalBoxRow = slideBoxR;
                            finalBoxCol = slideBoxC;

                            if (map[slideBoxR][slideBoxC] !== ItemType.Ice && map[slideBoxR][slideBoxC] !== ItemType.BoxOnIce) 
                                break; // 滑到非冰块地面
                        }
                        // 检查滑行后的死锁
                        if (this.isDeadlock(finalBoxRow, finalBoxCol, gameMap, targets)) 
                            continue;
                    }
                    // 推箱子后，玩家位置不变 (即原始位置，因为推的动作算一步)
                    finalPlayerRow = currState.player.row;
                    finalPlayerCol = currState.player.col;

                } else {
                    // 玩家移动，没有推箱子
                    finalPlayerRow = newPlayerRow;
                    finalPlayerCol = newPlayerCol;
                    // 如果玩家落在冰块上，模拟滑行
                    if (map[finalPlayerRow][finalPlayerCol] === ItemType.Ice || map[finalPlayerRow][finalPlayerCol] === ItemType.BoxOnIce) { // 4 代表冰块
                        let slidePlayerR = finalPlayerRow;
                        let slidePlayerC = finalPlayerCol;
                        while (true) {
                            const nextSlidePlayerR = slidePlayerR + dy;
                            const nextSlidePlayerC = slidePlayerC + dx;

                            // 撞墙或出界
                            if (!this.isValidMove(nextSlidePlayerR, nextSlidePlayerC, gameMap)) 
                                break; 

                            // 玩家滑行时不能穿过箱子
                            const collisionWithBox = currState.boxes.some(
                                box => box.row === nextSlidePlayerR && box.col === nextSlidePlayerC
                            );
                            if (collisionWithBox) 
                                break; // 撞到箱子

                            slidePlayerR = nextSlidePlayerR;
                            slidePlayerC = nextSlidePlayerC;
                            finalPlayerRow = slidePlayerR;
                            finalPlayerCol = slidePlayerC;

                            if (map[slidePlayerR][slidePlayerC] !== ItemType.Ice && map[slidePlayerR][slidePlayerC] !== ItemType.BoxOnIce) 
                                break; // 滑到非冰块地面
                        }
                    }
                }

                // 创建新的箱子位置数组
                const newBoxPositions = [...currState.boxes];
                if (movedBoxIndex >= 0 && finalBoxRow !== undefined && finalBoxCol !== undefined) {
                    newBoxPositions[movedBoxIndex] = { name: 'box', row: finalBoxRow, col: finalBoxCol };
                }

                // 创建新状态
                const newState: State = {
                    player: { name: 'player', row: finalPlayerRow, col: finalPlayerCol },
                    boxes: newBoxPositions,
                    path: [...currState.path, { name: 'player', row: dy, col: dx }], // 路径记录的是原始意图的移动
                    steps: currState.steps! + 1,
                    priority: 0
                };

                // 计算新状态的优先级
                newState.priority = this.calcPriority(newState, targets);

                // 加入队列，但要确保状态字符串是基于最终位置的
                const nextStateKey = this.stateToString(newState); // 使用最终状态生成key
                if (!visited.has(nextStateKey)) {
                     queue.push(newState);
                }
            }
        }

        // 如果找不到解决方案，返回空数组
        return [];
    }

    // 将状态转换为字符串用于去重
    private  stateToString(state: State): string {
        const playerStr = `${state.player.row},${state.player.col}`;
        const boxesStr = state.boxes
            .filter(box => box !== undefined && box !== null)
            .map(box => `${box.row},${box.col}`)
            .sort()
            .join('|');
        return `${playerStr}:${boxesStr}`;
    }
    
    /**检查关卡是否通过：箱子数大于等于目标点数，且每个目标点都有箱子 */
    public isFinish(boxes: Pos[], targets: Pos[]): boolean {
        if (boxes.length < targets.length) 
            return false;

        // 检查每个目标点是否都有箱子
        for (const target of targets) {
            if (!target) 
                continue;
            const hasBox = boxes.some(box => box && box.row === target.row && box.col === target.col);
            if (!hasBox) 
                return false;
        }
        return true;
    }
    
    // 检查移动是否有效
    private isValidMove(row: number, col: number, map: number[][]): boolean {
        const rows = map.length;
        const cols = map[0].length;

        // 检查是否在地图范围内且不是墙
        return row >= 0 && row < rows && 
               col >= 0 && col < cols && 
               map[row][col] !== ItemType.Wall;
    }
    
    // 检查箱子是否被推到死角
    private isDeadlock(boxRow: number, boxCol: number, map: number[][], targets: Pos[]): boolean {
        const rows = map.length;
        const cols = map[0].length;

        // 首先检查箱子是否在目标点上，如果在目标点上，则不是死锁
        const onTarget = targets.some(target => 
            target.row === boxRow && target.col === boxCol
        );
        
        // 如果箱子已经在目标点上，则不是死锁
        if (onTarget) return false;
        
        // 检查是否在角落
        // 如果箱子的两个相邻方向都是墙，且不在目标点上，则认为是死锁
        let wallCount = 0;
        let wallDirections = [];
        
        // 检查上下左右四个方向
        for (let i = 0; i < AIController.DIRECTIONS.length; i++) {
            const dir = AIController.DIRECTIONS[i];
            const { dx, dy } = dir;
            const newRow = boxRow + dy;
            const newCol = boxCol + dx;
            
            // 如果是墙或超出边界
            if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols || map[newRow][newCol] === ItemType.Wall) {
                wallCount++;
                wallDirections.push(i);
            }
        }
        
        // 如果至少有两个相邻方向是墙，检查是否形成死角
        if (wallCount >= 2) {
            // 检查是否是水平或垂直方向的两个墙
            const horizontalWalls = wallDirections.includes(1) && wallDirections.includes(3); // 左右
            const verticalWalls =  wallDirections.includes(0) && wallDirections.includes(2); // 上下
            
            // 如果是水平或垂直方向的两个墙，则不一定是死锁
            if (horizontalWalls || verticalWalls) {
                return false;
            }
            
            // 检查是否是角落（两个相邻的墙形成角落）
            const isCorner = 
                (wallDirections.includes(0) && wallDirections.includes(1)) || // 上右
                (wallDirections.includes(0) && wallDirections.includes(3)) || // 上左
                (wallDirections.includes(2) && wallDirections.includes(1)) || // 下右
                (wallDirections.includes(2) && wallDirections.includes(3));   // 下左
            
            return isCorner;
        }
        
        return false;
    }
}