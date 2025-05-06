import { GameObjects, Scene } from 'phaser';

interface Level {
  id: number;
  difficulty: string;
  map: number[][];
  player: { row: number; col: number; }
  unlocked?: boolean
}

interface LevelData {
  levels: Level[];
}

export class LevelManager {
  private currLevelId: number = 1;
  private levels: Level[] = [];
  private readonly STORAGE_KEY = 'boxgame_progress';

  // sigleton
  private static instance: LevelManager;
  public static async getIntance() : Promise<LevelManager>{
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
      await LevelManager.instance.loadLevels();
    }
    return LevelManager.instance;
  };

  // load level data
  async loadLevels() {
    try {
      const response = await fetch('assets/levels/levels.json');
      const data = await response.json() as LevelData;
      this.levels = data.levels;
      
      // 初始化关卡解锁状态
      const savedProgress = localStorage.getItem(this.STORAGE_KEY);
      if (savedProgress) {
        const unlockedLevels = JSON.parse(savedProgress);
        this.levels.forEach((level, index) => {
          level.unlocked = unlockedLevels.includes(level.id);
        });
      } else {
        // 默认解锁第一关
        this.levels[0].unlocked = true;
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  }

  getCurrLevel(): Level | undefined {
    return this.levels.find(level => level.id === this.currLevelId);
  }

  hasNextLevel(): boolean {
    return this.currLevelId < this.levels.length;
  }

  goNextLevel(): Level | undefined {
    if (this.currLevelId < this.levels.length) {
      this.currLevelId++;
      return this.getCurrLevel();
    }
    return undefined;
  }

  resetToFirstLevel(): void {
    this.currLevelId = 1;
  }

  setLevel(levelId: number): Level | undefined {
    if (levelId > 0 && levelId <= this.levels.length) {
      this.currLevelId = levelId;
      return this.getCurrLevel();
    }
    return undefined;
  }

  getLevels(): Level[] {
    return this.levels;
  }

  setCurrentLevel(index: number): void {
    if (index >= 0 && index < this.levels.length) {
      this.currLevelId = this.levels[index].id;
    }
  }

  unlockNextLevel(): void {
    const currentIndex = this.levels.findIndex(level => level.id === this.currLevelId);
    if (currentIndex >= 0 && currentIndex + 1 < this.levels.length) {
      this.levels[currentIndex + 1].unlocked = true;
      
      // 保存解锁进度
      const unlockedLevels = this.levels
        .filter(level => level.unlocked)
        .map(level => level.id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unlockedLevels));
    }
  }
}