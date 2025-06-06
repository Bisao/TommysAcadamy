CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"level" integer DEFAULT 1,
	"xp_reward" integer DEFAULT 10,
	"questions" jsonb NOT NULL,
	"order" integer NOT NULL,
	"is_locked" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"lesson_id" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"score" integer DEFAULT 0,
	"time_spent" integer DEFAULT 0,
	"attempts" integer DEFAULT 0,
	"last_attempt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" text NOT NULL,
	"lessons_completed" integer DEFAULT 0,
	"xp_earned" integer DEFAULT 0,
	"time_spent" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"streak" integer DEFAULT 0,
	"total_xp" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"daily_goal" integer DEFAULT 15,
	"last_active_date" text,
	"achievements" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
