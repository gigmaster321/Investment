import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const chatConversationsTable = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversation_id: integer("conversation_id")
    .notNull()
    .references(() => chatConversationsTable.id, { onDelete: "cascade" }),
  sender_type: text("sender_type").$type<"user" | "admin">().notNull(),
  sender_id: integer("sender_id").notNull(),
  message: text("message").notNull(),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type ChatConversation = typeof chatConversationsTable.$inferSelect;
export type InsertChatConversation = typeof chatConversationsTable.$inferInsert;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type InsertChatMessage = typeof chatMessagesTable.$inferInsert;
