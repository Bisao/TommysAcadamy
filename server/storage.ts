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
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { calculateRealisticUserData, getLastActiveDate } from "./user-utils";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  authenticateUser(username: string, password: string): Promise<User | undefined>;
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
      password: "password123",
      streak: 7,
      totalXP: 1250,
      level: 5,
      dailyGoal: 15,
      lastActiveDate: new Date().toISOString().split('T')[0],
      achievements: ["first_lesson", "week_warrior", "vocabulary_master"],
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create lessons based on NYT materials
    const sampleLessons: Lesson[] = [
      {
        id: 1,
        title: "Food Trends 2021 - Simple Present",
        description: "Learn about food trends and master Simple Present tense",
        category: "grammar",
        level: 1,
        xpReward: 25,
        order: 1,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'trend' mean?",
            options: ["tendência", "garrafa", "verão", "mundo"],
            correctAnswer: "tendência",
            explanation: "A 'trend' is a tendência - a general direction in which something is developing or changing."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Complete with Simple Present: Most forecasters _____ that the pandemic will affect food trends.",
            options: ["agree", "agreed", "agreeing", "will agree"],
            correctAnswer: "agree",
            explanation: "We use Simple Present for facts and general truths. 'Most forecasters agree' is correct."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'forecast' mean?",
            options: ["previsão", "rolha", "inverno", "onda"],
            correctAnswer: "previsão",
            explanation: "A 'forecast' means previsão - a prediction about future events."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct emphatic form: I _____ like coffee (emphatic).",
            options: ["do like", "am like", "like", "will like"],
            correctAnswer: "do like",
            explanation: "We use 'do' + verb for emphasis in positive sentences: 'I do like coffee.'"
          }
        ] as Question[]
      },
      {
        id: 2,
        title: "Tom Hanks Movie - Simple Past",
        description: "Learn about acting and master Simple Past tense",
        category: "grammar",
        level: 2,
        xpReward: 25,
        order: 2,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'challenge' mean?",
            options: ["desafio", "criança", "teatro", "diálogo"],
            correctAnswer: "desafio",
            explanation: "A 'challenge' means desafio - something that requires effort and skill."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Complete with Simple Past: The director _____ the film last year.",
            options: ["made", "make", "makes", "making"],
            correctAnswer: "made",
            explanation: "Simple Past of 'make' is 'made'. We use it for completed actions in the past."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What is the past form of 'see'?",
            options: ["saw", "seen", "sawed", "seeing"],
            correctAnswer: "saw",
            explanation: "'See' is irregular: see-saw-seen. The simple past is 'saw'."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct negative: She _____ go to the theater yesterday.",
            options: ["did not", "does not", "will not", "is not"],
            correctAnswer: "did not",
            explanation: "For Simple Past negative, we use 'did not' + base verb: 'She did not go'."
          }
        ] as Question[]
      },
      {
        id: 3,
        title: "Travel Planning - Simple Future",
        description: "Learn about travel and master Simple Future tense",
        category: "grammar",
        level: 3,
        xpReward: 25,
        order: 3,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'suitcase' mean?",
            options: ["mala", "estrada", "corredor", "enquete"],
            correctAnswer: "mala",
            explanation: "A 'suitcase' means mala - a bag used for carrying clothes when traveling."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Complete with Simple Future: I _____ unpack my suitcase tomorrow.",
            options: ["will", "am", "do", "have"],
            correctAnswer: "will",
            explanation: "Simple Future uses 'will' + base verb: 'I will unpack'."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'psychiatrist' mean?",
            options: ["psiquiatra", "viajante", "marido", "escolha"],
            correctAnswer: "psiquiatra",
            explanation: "A 'psychiatrist' means psiquiatra - a medical doctor who treats mental health."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct negative future: They _____ leave early.",
            options: ["will not", "do not", "are not", "did not"],
            correctAnswer: "will not",
            explanation: "Future negative uses 'will not' (won't): 'They will not leave early'."
          }
        ] as Question[]
      },
      {
        id: 4,
        title: "Kitchen Organization - Articles",
        description: "Learn about cooking and master Articles (a/an/the)",
        category: "grammar",
        level: 2,
        xpReward: 20,
        order: 4,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'tidy' mean?",
            options: ["arrumado", "regra", "padaria", "gaveta"],
            correctAnswer: "arrumado",
            explanation: "'Tidy' means arrumado - neat and organized."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Choose the correct article: I work in ___ professional kitchen.",
            options: ["a", "an", "the", "no article"],
            correctAnswer: "a",
            explanation: "We use 'a' before consonant sounds. 'Professional' starts with /p/ sound."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'perishable' mean?",
            options: ["perecível", "molho", "lixo", "bandeja"],
            correctAnswer: "perecível",
            explanation: "'Perishable' means perecível - food that goes bad quickly."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct article: ___ capital of France is Paris.",
            options: ["The", "A", "An", "No article"],
            correctAnswer: "The",
            explanation: "We use 'the' when talking about something specific and unique: 'The capital'."
          }
        ] as Question[]
      },
      {
        id: 5,
        title: "DNA Technology - Demonstratives",
        description: "Learn about science and master This/That/These/Those",
        category: "grammar",
        level: 3,
        xpReward: 30,
        order: 5,
        isLocked: false,
        questions: [
          {
            id: "1",
            type: "multiple_choice",
            question: "What does 'sample' mean?",
            options: ["amostra", "traço", "culpado", "assassino"],
            correctAnswer: "amostra",
            explanation: "A 'sample' means amostra - a small part taken for analysis."
          },
          {
            id: "2",
            type: "multiple_choice",
            question: "Choose the correct demonstrative: ___ technology is very advanced (close to speaker).",
            options: ["This", "That", "These", "Those"],
            correctAnswer: "This",
            explanation: "We use 'this' (singular) for things close to the speaker."
          },
          {
            id: "3",
            type: "multiple_choice",
            question: "What does 'accurate' mean?",
            options: ["preciso", "suficiente", "cabelo", "imagem"],
            correctAnswer: "preciso",
            explanation: "'Accurate' means preciso - correct and exact."
          },
          {
            id: "4",
            type: "multiple_choice",
            question: "Choose the correct demonstrative: Can you see ___ birds over there? (far, plural)",
            options: ["those", "these", "that", "this"],
            correctAnswer: "those",
            explanation: "We use 'those' (plural) for things far from the speaker."
          }
        ] as Question[]
      }
    ];

    sampleLessons.forEach(lesson => {
      this.lessons.set(lesson.id, lesson);
    });
    this.currentLessonId = 6;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      streak: 0,
      totalXP: 0,
      level: 1,
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
    const lesson: Lesson = { 
      ...insertLesson, 
      id,
      level: insertLesson.level ?? 1,
      xpReward: insertLesson.xpReward ?? 10,
      isLocked: insertLesson.isLocked ?? false
    };
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

// rewrite MemStorage to DatabaseStorage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;

    // Calcular dados realistas baseado na data de criação e progresso
    const progress = await this.getUserOverallStats(id);
    const realisticData = calculateRealisticUserData(
      user.createdAt || new Date(), 
      progress
    );

    // Atualizar dados realistas se necessário
    if (
      user.totalXP !== realisticData.totalXP ||
      user.level !== realisticData.level ||
      user.streak !== realisticData.streak ||
      JSON.stringify(user.achievements) !== JSON.stringify(realisticData.achievements)
    ) {
      const [updatedUser] = await db
        .update(users)
        .set({
          totalXP: realisticData.totalXP,
          level: realisticData.level,
          streak: realisticData.streak,
          achievements: realisticData.achievements,
          lastActiveDate: getLastActiveDate(user.createdAt || new Date())
        })
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    }

    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async authenticateUser(username: string, password: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(and(eq(users.username, username), eq(users.password, password)));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        totalXP: 0,
        level: 1,
        streak: 0,
        achievements: [],
        lastActiveDate: new Date().toISOString().split('T')[0]
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons).orderBy(lessons.order);
  }

  async getLessonsByCategory(category: string): Promise<Lesson[]> {
    return await db.select().from(lessons)
      .where(eq(lessons.category, category))
      .orderBy(lessons.order);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values(insertLesson)
      .returning();
    return lesson;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress)
      .where(eq(userProgress.userId, userId));
  }

  async getLessonProgress(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)));
    return progress || undefined;
  }

  async updateProgress(userId: number, lessonId: number, progressUpdates: Partial<UserProgress>): Promise<UserProgress> {
    const existing = await this.getLessonProgress(userId, lessonId);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set(progressUpdates)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          lessonId,
          completed: false,
          score: 0,
          timeSpent: 0,
          attempts: 0,
          ...progressUpdates
        })
        .returning();
      return created;
    }
  }

  async getUserStats(userId: number, date: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats)
      .where(and(eq(userStats.userId, userId), eq(userStats.date, date)));
    return stats || undefined;
  }

  async updateStats(userId: number, date: string, statsUpdates: Partial<UserStats>): Promise<UserStats> {
    const existing = await this.getUserStats(userId, date);
    
    if (existing) {
      const [updated] = await db
        .update(userStats)
        .set(statsUpdates)
        .where(and(eq(userStats.userId, userId), eq(userStats.date, date)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userStats)
        .values({
          userId,
          date,
          lessonsCompleted: 0,
          xpEarned: 0,
          timeSpent: 0,
          ...statsUpdates
        })
        .returning();
      return created;
    }
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

export const storage = new DatabaseStorage();
