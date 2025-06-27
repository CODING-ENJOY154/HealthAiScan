import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const healthReports = pgTable("health_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  wellnessScore: integer("wellness_score").notNull(),
  heartRate: integer("heart_rate").notNull(),
  oxygenLevel: integer("oxygen_level").notNull(),
  bloodSugar: integer("blood_sugar").notNull(),
  stressLevel: text("stress_level").notNull(),
  energyLevel: text("energy_level").notNull(),
  detectedMood: text("detected_mood").notNull(),
  moodConfidence: integer("mood_confidence").notNull(),
  faceImageData: text("face_image_data"),
  scanDuration: integer("scan_duration").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  darkMode: boolean("dark_mode").default(false),
  language: text("language").default("en"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  autoLogoutMinutes: integer("auto_logout_minutes").default(10),
});

export const healthBadges = pgTable("health_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeType: text("badge_type").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  healthReports: many(healthReports),
  preferences: one(userPreferences),
  badges: many(healthBadges),
}));

export const healthReportsRelations = relations(healthReports, ({ one }) => ({
  user: one(users, {
    fields: [healthReports.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const healthBadgesRelations = relations(healthBadges, ({ one }) => ({
  user: one(users, {
    fields: [healthBadges.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const insertHealthReportSchema = createInsertSchema(healthReports).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHealthReport = z.infer<typeof insertHealthReportSchema>;
export type HealthReport = typeof healthReports.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type HealthBadge = typeof healthBadges.$inferSelect;
