import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema, insertUserStatsSchema } from "@shared/schema";
import { z } from "zod";

const submitAnswerSchema = z.object({
  lessonId: z.number(),
  questionId: z.string(),
  answer: z.string(),
  timeSpent: z.number().optional(),
});

const completeQuizSchema = z.object({
  lessonId: z.number(),
  score: z.number(),
  totalQuestions: z.number(),
  timeSpent: z.number(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const registerSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      console.log(`Login attempt for username: ${username}`);
      
      const user = await storage.authenticateUser(username, password);

      if (!user) {
        console.log(`Authentication failed for username: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log(`Authentication successful for username: ${username}`);
      // Store user session (simplified - in production use proper session management)
      req.session = { userId: user.id };

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error(`Login error:`, error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);

      // Store user session
      req.session = { userId: user.id };

      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      if (req.session) {
        req.session = null;
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Get current user (check session)
  app.get("/api/user", async (req, res) => {
    try {
      const userId = req.session?.userId || 1; // Fallback for demo
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user data
  app.patch("/api/user", async (req, res) => {
    try {
      const userId = req.session?.userId || 1; // Fallback for demo
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get all lessons
  app.get("/api/lessons", async (req, res) => {
    try {
      const category = req.query.category as string;
      const lessons = category 
        ? await storage.getLessonsByCategory(category)
        : await storage.getAllLessons();

      // Get user progress for each lesson
      const userProgress = await storage.getUserProgress(1);
      const lessonsWithProgress = lessons.map(lesson => {
        const progress = userProgress.find(p => p.lessonId === lesson.id);
        return {
          ...lesson,
          completed: progress?.completed || false,
          score: progress?.score || 0,
          attempts: progress?.attempts || 0
        };
      });

      res.json(lessonsWithProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Get specific lesson
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const progress = await storage.getLessonProgress(1, lessonId);

      res.json({
        ...lesson,
        completed: progress?.completed || false,
        score: progress?.score || 0,
        attempts: progress?.attempts || 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Submit answer for validation
  app.post("/api/lessons/answer", async (req, res) => {
    try {
      const { lessonId, questionId, answer, timeSpent } = submitAnswerSchema.parse(req.body);

      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const questions = lesson.questions as any[];
      const question = questions.find(q => q.id === questionId);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const isCorrect = question.correctAnswer === answer;

      res.json({
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        xpEarned: isCorrect ? 10 : 0
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Complete lesson/quiz
  app.post("/api/lessons/complete", async (req, res) => {
    try {
      const { lessonId, score, totalQuestions, timeSpent } = completeQuizSchema.parse(req.body);

      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const percentage = Math.round((score / totalQuestions) * 100);
      const xpEarned = Math.round((lesson.xpReward || 10) * (percentage / 100));
      const completed = percentage >= 70; // 70% to pass

      // Update lesson progress
      const existingProgress = await storage.getLessonProgress(1, lessonId);
      const attempts = (existingProgress?.attempts || 0) + 1;

      await storage.updateProgress(1, lessonId, {
        completed,
        score: percentage,
        timeSpent,
        attempts
      });

      // Update user stats
      const user = await storage.getUser(1);
      if (user && completed) {
        await storage.updateUser(1, {
          totalXP: (user.totalXP || 0) + xpEarned
        });

        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = await storage.getUserStats(1, today);
        await storage.updateStats(1, today, {
          lessonsCompleted: (dailyStats?.lessonsCompleted || 0) + 1,
          xpEarned: (dailyStats?.xpEarned || 0) + xpEarned,
          timeSpent: (dailyStats?.timeSpent || 0) + timeSpent
        });
      }

      res.json({
        completed,
        score: percentage,
        xpEarned,
        passed: completed,
        attempts
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Get user progress
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(1);
      const overallStats = await storage.getUserOverallStats(1);

      res.json({
        progress,
        ...overallStats
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get daily stats
  app.get("/api/stats/daily", async (req, res) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const stats = await storage.getUserStats(1, date);

      res.json(stats || {
        lessonsCompleted: 0,
        xpEarned: 0,
        timeSpent: 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}