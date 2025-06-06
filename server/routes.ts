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
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/guest", async (req, res) => {
    try {
      // Generate a unique guest username
      const timestamp = Date.now();
      const guestUsername = `guest_${timestamp}`;
      
      // Create a temporary guest user
      const guestUser = await storage.createUser({
        username: guestUsername,
        email: `${guestUsername}@guest.local`,
        password: "guest_password_" + timestamp
      });

      // Store user session
      req.session = { userId: guestUser.id };

      res.json({ user: { ...guestUser, password: undefined } });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Failed to create guest account" });
    }
  });

  // Update user profile data in real-time
  app.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = req.session?.userId || 1;
      const updates = req.body;
      
      // Only allow certain fields to be updated
      const allowedFields = ['username', 'email', 'dailyGoal'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const user = await storage.updateUser(userId, filteredUpdates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Force streak update (for daily check-ins)
  app.post("/api/user/checkin", async (req, res) => {
    try {
      const userId = req.session?.userId || 1;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = user.lastActiveDate;
      let newStreak = user.streak || 0;
      
      if (!lastActiveDate || lastActiveDate !== today) {
        if (lastActiveDate) {
          const lastDate = new Date(lastActiveDate);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Consecutive day
            newStreak += 1;
          } else if (diffDays > 1) {
            // Streak broken
            newStreak = 1;
          }
        } else {
          // First activity
          newStreak = 1;
        }

        const updatedUser = await storage.updateUser(userId, {
          streak: newStreak,
          lastActiveDate: today
        });

        res.json({ 
          streak: newStreak, 
          lastActiveDate: today,
          user: { ...updatedUser, password: undefined }
        });
      } else {
        res.json({ 
          streak: newStreak, 
          lastActiveDate: today,
          user: { ...user, password: undefined }
        });
      }
    } catch (error) {
      console.error("Error updating check-in:", error);
      res.status(500).json({ message: "Failed to update check-in" });
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
      const userId = req.session?.userId || 1;

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
      const xpEarned = isCorrect ? 10 : 0;

      // Update user XP, level, and streak in real-time if answer is correct
      if (isCorrect && xpEarned > 0) {
        const user = await storage.getUser(userId);
        if (user) {
          const newTotalXP = (user.totalXP || 0) + xpEarned;
          const newLevel = Math.max(1, Math.floor(newTotalXP / 100) + 1);
          
          // Update streak and last active date
          const today = new Date().toISOString().split('T')[0];
          const lastActiveDate = user.lastActiveDate;
          let newStreak = user.streak || 0;
          
          if (!lastActiveDate || lastActiveDate !== today) {
            if (lastActiveDate) {
              const lastDate = new Date(lastActiveDate);
              const todayDate = new Date(today);
              const diffTime = todayDate.getTime() - lastDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
              } else if (diffDays > 1) {
                // Streak broken
                newStreak = 1;
              }
            } else {
              // First activity
              newStreak = 1;
            }
            
            await storage.updateUser(userId, {
              totalXP: newTotalXP,
              level: newLevel,
              streak: newStreak,
              lastActiveDate: today
            });
          } else {
            // Same day, just update XP and level
            await storage.updateUser(userId, {
              totalXP: newTotalXP,
              level: newLevel
            });
          }
        }

        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = await storage.getUserStats(userId, today);
        await storage.updateStats(userId, today, {
          xpEarned: (dailyStats?.xpEarned || 0) + xpEarned
        });
      }

      res.json({
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        xpEarned
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Complete lesson/quiz
  app.post("/api/lessons/complete", async (req, res) => {
    try {
      const { lessonId, score, totalQuestions, timeSpent } = completeQuizSchema.parse(req.body);
      const userId = req.session?.userId || 1;

      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const percentage = Math.round((score / totalQuestions) * 100);
      const completed = percentage >= 70; // 70% to pass

      // Update lesson progress
      const existingProgress = await storage.getLessonProgress(userId, lessonId);
      const attempts = (existingProgress?.attempts || 0) + 1;
      const wasAlreadyCompleted = existingProgress?.completed || false;

      await storage.updateProgress(userId, lessonId, {
        completed,
        score: percentage,
        timeSpent,
        attempts,
        lastAttempt: new Date()
      });

      // Calculate XP based on attempts (decrementing system)
      let xpEarned = 0;
      if (completed) {
        const baseXP = lesson.xpReward || 25;
        
        if (!wasAlreadyCompleted) {
          // First completion: full XP based on score
          xpEarned = Math.round(baseXP * (percentage / 100));
        } else {
          // Repeated completions: decreasing XP (2 less per previous completion, minimum 1)
          const completedAttempts = existingProgress?.attempts || 0;
          const decreaseAmount = 2 * completedAttempts;
          const minXP = 1;
          xpEarned = Math.max(minXP, baseXP - decreaseAmount);
        }

        // Update user XP, level, and streak in real-time
        const user = await storage.getUser(userId);
        if (user) {
          const newTotalXP = (user.totalXP || 0) + xpEarned;
          const newLevel = Math.max(1, Math.floor(newTotalXP / 100) + 1);
          
          // Update streak logic
          const today = new Date().toISOString().split('T')[0];
          const lastActiveDate = user.lastActiveDate;
          let newStreak = user.streak || 0;
          
          if (!lastActiveDate || lastActiveDate !== today) {
            if (lastActiveDate) {
              const lastDate = new Date(lastActiveDate);
              const todayDate = new Date(today);
              const diffTime = todayDate.getTime() - lastDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
              } else if (diffDays > 1) {
                // Streak broken
                newStreak = 1;
              }
            } else {
              // First activity
              newStreak = 1;
            }
          }

          await storage.updateUser(userId, {
            totalXP: newTotalXP,
            level: newLevel,
            streak: newStreak,
            lastActiveDate: today
          });
        }

        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = await storage.getUserStats(userId, today);
        await storage.updateStats(userId, today, {
          lessonsCompleted: !wasAlreadyCompleted ? (dailyStats?.lessonsCompleted || 0) + 1 : (dailyStats?.lessonsCompleted || 0),
          xpEarned: (dailyStats?.xpEarned || 0) + xpEarned,
          timeSpent: (dailyStats?.timeSpent || 0) + timeSpent
        });
      }

      res.json({
        completed,
        score: percentage,
        xpEarned,
        passed: completed,
        attempts,
        isRepeat: wasAlreadyCompleted
      });
    } catch (error) {
      console.error("Error completing lesson:", error);
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