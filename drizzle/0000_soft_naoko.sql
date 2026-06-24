CREATE TYPE "public"."user_role" AS ENUM('admin', 'customer');--> statement-breakpoint
CREATE TYPE "public"."user_tier" AS ENUM('free', 'pro');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"role" "user_role" NOT NULL,
	"tier" "user_tier" NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"owner_id" varchar(64) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"name" varchar NOT NULL,
	"bot_id" varchar(64),
	"chat_id" varchar NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"project_id" varchar(64),
	"session_id" varchar NOT NULL,
	"is_received" boolean DEFAULT false NOT NULL,
	"message" varchar NOT NULL,
	"metadata" jsonb NOT NULL,
	"is_system" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bots" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"token" varchar NOT NULL,
	"lastSeenUpdateId" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bots_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "project_owner_id" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "chat_session_id" ON "chats" USING btree ("session_id");