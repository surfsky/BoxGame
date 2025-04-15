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
  private currentLevel: number = 1;
  private levels: Level[] = [];
  private readonly STORAGE_KEY = 'boxgame_progress';

  //
  private static instance: LevelManager;
  public static async getIntance() : Promise<LevelManager>{
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
      await LevelManager.instance.loadLevels();
    }
    return LevelManager.instance;
  };

  //
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

  getCurrentLevel(): Level | undefined {
    return this.levels.find(level => level.id === this.currentLevel);
  }

  hasNextLevel(): boolean {
    return this.currentLevel < this.levels.length;
  }

  goNextLevel(): Level | undefined {
    if (this.currentLevel < this.levels.length) {
      this.currentLevel++;
      return this.getCurrentLevel();
    }
    return undefined;
  }

  resetToFirstLevel(): void {
    this.currentLevel = 1;
  }

  setLevel(levelId: number): Level | undefined {
    if (levelId > 0 && levelId <= this.levels.length) {
      this.currentLevel = levelId;
      return this.getCurrentLevel();
    }
    return undefined;
  }

  getLevels(): Level[] {
    return this.levels;
  }

  setCurrentLevel(index: number): void {
    if (index >= 0 && index < this.levels.length) {
      this.currentLevel = this.levels[index].id;
    }
  }

  unlockNextLevel(): void {
    const currentIndex = this.levels.findIndex(level => level.id === this.currentLevel);
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