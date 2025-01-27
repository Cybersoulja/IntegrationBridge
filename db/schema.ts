import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// User authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service connections
export const serviceConnections = pgTable("service_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  service: text("service").notNull(), // working-copy, shellfish, textastic
  credentials: jsonb("credentials").notNull(),
  isActive: boolean("is_active").default(true),
  lastCheck: timestamp("last_check"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API logs
export const apiLogs = pgTable("api_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  service: text("service").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  error: text("error"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  service: text("service").notNull(),
  url: text("url").notNull(),
  secret: text("secret"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// File operations
export const fileOperations = pgTable("file_operations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  service: text("service").notNull(),
  operation: text("operation").notNull(), // read, write, delete
  path: text("path").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  connections: many(serviceConnections),
  webhooks: many(webhooks),
  logs: many(apiLogs),
  fileOps: many(fileOperations),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertServiceConnectionSchema = createInsertSchema(serviceConnections);
export const insertWebhookSchema = createInsertSchema(webhooks);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ServiceConnection = typeof serviceConnections.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type ApiLog = typeof apiLogs.$inferSelect;
export type FileOperation = typeof fileOperations.$inferSelect;
