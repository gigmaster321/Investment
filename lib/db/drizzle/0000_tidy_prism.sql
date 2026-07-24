CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"account_status" text DEFAULT 'active' NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_deposit" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_withdrawal" numeric(15, 2) DEFAULT '0' NOT NULL,
	"current_plan" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "email_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deposit_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" text,
	"plan_name" text,
	"amount" numeric(15, 2) NOT NULL,
	"approved_amount" numeric(15, 2),
	"payment_method" text DEFAULT 'BTC' NOT NULL,
	"transaction_id" text,
	"screenshot_data" text,
	"status" text DEFAULT 'Pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"description" text,
	"reference_id" text,
	"status" text DEFAULT 'Completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"deposit_request_id" integer,
	"plan_id" text,
	"plan_name" text NOT NULL,
	"plan_execution_cycle" text DEFAULT '30 Days' NOT NULL,
	"investment_amount" numeric(15, 2) NOT NULL,
	"profit_percentage" numeric(8, 4) DEFAULT '100' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"total_profit" numeric(15, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_otps" ADD CONSTRAINT "email_otps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposit_requests" ADD CONSTRAINT "deposit_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_deposit_request_id_deposit_requests_id_fk" FOREIGN KEY ("deposit_request_id") REFERENCES "public"."deposit_requests"("id") ON DELETE set null ON UPDATE no action;