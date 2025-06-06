import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  streak: integer("streak").default(0),
  totalXP: integer("total_xp").default(0),
  level: integer("level").default(1),
  hearts: integer("hearts").default(5),
  dailyGoal: integer("daily_goal").default(15),
  lastActiveDate: text("last_active_date"),
  achievements: text("achievements").array().default([]),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // vocabulary, grammar, phrases, pronunciation
  level: integer("level").default(1),
  xpReward: integer("xp_reward").default(10),
  questions: jsonb("questions").notNull(),
  order: integer("order").notNull(),
  isLocked: boolean("is_locked").default(true),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  score: integer("score").default(0),
  timeSpent: integer("time_spent").default(0),
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  lessonsCompleted: integer("lessons_completed").default(0),
  xpEarned: integer("xp_earned").default(0),
  timeSpent: integer("time_spent").default(0),
});

// Question types for lessons
export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'translation', 'audio', 'matching']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  audioUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  explanation: z.string().optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastAttempt: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  stats: many(userStats),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type Question = z.infer<typeof questionSchema>;
