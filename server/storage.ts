import { 
  users, 
  lessons, 
  userProgress, 
  userStats,
  type User, 
  type InsertUser, 
  type Lesson, 
  type InsertLesson,
  type UserProgress,
  type InsertUserProgress,
  type UserStats,
  type InsertUserStats,
  type Question
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Lesson methods
  getAllLessons(): Promise<Lesson[]>;
  getLessonsByCategory(category: string): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined>;
  updateProgress(userId: number, lessonId: number, progress: Partial<UserProgress>): Promise<UserProgress>;
  
  // Stats methods
  getUserStats(userId: number, date: string): Promise<UserStats | undefined>;
  updateStats(userId: number, date: string, stats: Partial<UserStats>): Promise<UserStats>;
  getUserOverallStats(userId: number): Promise<{totalXP: number, lessonsCompleted: number, streak: number}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lessons: Map<number, Lesson>;
  private userProgress: Map<string, UserProgress>;
  private userStats: Map<string, UserStats>;
  private currentUserId: number;
  private currentLessonId: number;
  private currentProgressId: number;
  private currentStatsId: number;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.userProgress = new Map();
    this.userStats = new Map();
    this.currentUserId = 1;
    this.currentLessonId = 1;
    this.currentProgressId = 1;
    this.currentStatsId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "learner",
      email: "learner@cartoonlingo.com",
      streak: 7,
      totalXP: 1250,
      level: 5,
      hearts: 3,
      dailyGoal: 15,
      lastActiveDate: new Date().toISOString().split('T')[0],
      achievements: ["first_lesson", "week_warrior", "vocabulary_master"],
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create sample lessons
    const sampleLessons: Lesson[] = [
      {
        id: 1,
        title: "Basic Greetings",
        description: "Learn how to say hello and introduce yourself",
        category: "vocabulary",
        level: 1,
        xpReward: 15,
        order: 1,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'Hello' mean?",
            options: ["Olá", "Adeus", "Por favor", "Obrigado"],
            correctAnswer: "Olá",
            explanation: "'Hello' is a common greeting that means 'Olá' in Portuguese."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "How do you say 'Good morning'?",
            options: ["Good night", "Good morning", "Good evening", "Good afternoon"],
            correctAnswer: "Good morning",
            explanation: "'Good morning' is used to greet someone in the morning."
          }
        ] as Question[]
      },
      {
        id: 2,
        title: "Family Members",
        description: "Learn words for family relationships",
        category: "vocabulary",
        level: 1,
        xpReward: 20,
        order: 2,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'Mother' mean?",
            options: ["Mãe", "Pai", "Irmã", "Avó"],
            correctAnswer: "Mãe",
            explanation: "'Mother' means 'Mãe' in Portuguese."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "What does 'Father' mean?",
            options: ["Mãe", "Pai", "Irmão", "Avô"],
            correctAnswer: "Pai",
            explanation: "'Father' means 'Pai' in Portuguese."
          }
        ] as Question[]
      },
      {
        id: 3,
        title: "Colors",
        description: "Learn basic color names in English",
        category: "vocabulary",
        level: 1,
        xpReward: 15,
        order: 3,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'Red' mean?",
            options: ["Vermelho", "Azul", "Verde", "Amarelo"],
            correctAnswer: "Vermelho",
            explanation: "'Red' means 'Vermelho' in Portuguese."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "What does 'Blue' mean?",
            options: ["Vermelho", "Azul", "Verde", "Amarelo"],
            correctAnswer: "Azul",
            explanation: "'Blue' means 'Azul' in Portuguese."
          }
        ] as Question[]
      }
    ];

    sampleLessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson);
    });
    this.currentLessonId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      streak: 0,
      totalXP: 0,
      level: 1,
      hearts: 5,
      dailyGoal: 15,
      lastActiveDate: null,
      achievements: []
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order);
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.category === category)
      .sort((a, b) => a.order - b.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = { ...insertLesson, id };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    const key = `${userId}-${lessonId}`;
    return this.userProgress.get(key);
  }

  async updateProgress(userId: number, lessonId: number, progressUpdates: Partial<UserProgress>): Promise<UserProgress> {
    const key = `${userId}-${lessonId}`;
    const existing = this.userProgress.get(key);
    
    const progress: UserProgress = existing ? 
      { ...existing, ...progressUpdates } :
      {
        id: this.currentProgressId++,
        userId,
        lessonId,
        completed: false,
        score: 0,
        timeSpent: 0,
        attempts: 0,
        lastAttempt: new Date(),
        ...progressUpdates
      };

    this.userProgress.set(key, progress);
    return progress;
  }

  async getUserStats(userId: number, date: string): Promise<UserStats | undefined> {
    const key = `${userId}-${date}`;
    return this.userStats.get(key);
  }

  async updateStats(userId: number, date: string, statsUpdates: Partial<UserStats>): Promise<UserStats> {
    const key = `${userId}-${date}`;
    const existing = this.userStats.get(key);
    
    const stats: UserStats = existing ?
      { ...existing, ...statsUpdates } :
      {
        id: this.currentStatsId++,
        userId,
        date,
        lessonsCompleted: 0,
        xpEarned: 0,
        timeSpent: 0,
        ...statsUpdates
      };

    this.userStats.set(key, stats);
    return stats;
  }

  async getUserOverallStats(userId: number): Promise<{totalXP: number, lessonsCompleted: number, streak: number}> {
    const user = await this.getUser(userId);
    const userProgressList = await this.getUserProgress(userId);
    
    const lessonsCompleted = userProgressList.filter(p => p.completed).length;
    
    return {
      totalXP: user?.totalXP || 0,
      lessonsCompleted,
      streak: user?.streak || 0
    };
  }
}

export const storage = new MemStorage();
