CREATE TABLE "withdrawal_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"method" text DEFAULT 'Crypto Withdrawal' NOT NULL,
	"crypto" text NOT NULL,
	"wallet_address" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"approved_amount" numeric(15, 2),
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
