import { users, healthReports, userPreferences, healthBadges, type User, type InsertUser, type HealthReport, type InsertHealthReport, type UserPreferences, type InsertUserPreferences, type HealthBadge } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createHealthReport(report: InsertHealthReport & { userId: number }): Promise<HealthReport>;
  getUserHealthReports(userId: number, limit?: number): Promise<HealthReport[]>;
  getLatestHealthReport(userId: number): Promise<HealthReport | undefined>;
  
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createOrUpdateUserPreferences(userId: number, preferences: InsertUserPreferences): Promise<UserPreferences>;
  
  getUserBadges(userId: number): Promise<HealthBadge[]>;
  awardBadge(userId: number, badgeType: string): Promise<HealthBadge>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create default preferences for new user
    await db.insert(userPreferences).values({
      userId: user.id,
      darkMode: false,
      language: "en",
      notificationsEnabled: true,
      autoLogoutMinutes: 10,
    });
    
    return user;
  }

  async createHealthReport(report: InsertHealthReport & { userId: number }): Promise<HealthReport> {
    const [healthReport] = await db
      .insert(healthReports)
      .values(report)
      .returning();
    
    // Check for badge eligibility
    await this.checkAndAwardBadges(report.userId);
    
    return healthReport;
  }

  async getUserHealthReports(userId: number, limit = 10): Promise<HealthReport[]> {
    return await db
      .select()
      .from(healthReports)
      .where(eq(healthReports.userId, userId))
      .orderBy(desc(healthReports.createdAt))
      .limit(limit);
  }

  async getLatestHealthReport(userId: number): Promise<HealthReport | undefined> {
    const [report] = await db
      .select()
      .from(healthReports)
      .where(eq(healthReports.userId, userId))
      .orderBy(desc(healthReports.createdAt))
      .limit(1);
    return report || undefined;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async createOrUpdateUserPreferences(userId: number, preferences: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set(preferences)
        .where(eq(userPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ ...preferences, userId })
        .returning();
      return created;
    }
  }

  async getUserBadges(userId: number): Promise<HealthBadge[]> {
    return await db
      .select()
      .from(healthBadges)
      .where(eq(healthBadges.userId, userId))
      .orderBy(desc(healthBadges.earnedAt));
  }

  async awardBadge(userId: number, badgeType: string): Promise<HealthBadge> {
    // Check if user already has this badge
    const [existing] = await db
      .select()
      .from(healthBadges)
      .where(and(eq(healthBadges.userId, userId), eq(healthBadges.badgeType, badgeType)));
    
    if (existing) {
      return existing;
    }
    
    const [badge] = await db
      .insert(healthBadges)
      .values({ userId, badgeType })
      .returning();
    
    return badge;
  }

  private async checkAndAwardBadges(userId: number): Promise<void> {
    const reports = await this.getUserHealthReports(userId, 30);
    
    // Health Beginner - first scan
    if (reports.length === 1) {
      await this.awardBadge(userId, "health_beginner");
    }
    
    // Consistency Pro - 7 consecutive days
    if (reports.length >= 7) {
      const last7Days = reports.slice(0, 7);
      const consecutive = this.checkConsecutiveDays(last7Days);
      if (consecutive) {
        await this.awardBadge(userId, "consistency_pro");
      }
    }
    
    // Wellness Master - 30 days with average score > 80
    if (reports.length >= 30) {
      const avgScore = reports.reduce((sum, r) => sum + r.wellnessScore, 0) / reports.length;
      if (avgScore > 80) {
        await this.awardBadge(userId, "wellness_master");
      }
    }
  }

  private checkConsecutiveDays(reports: HealthReport[]): boolean {
    if (reports.length < 7) return false;
    
    const dates = reports.map(r => new Date(r.createdAt).toDateString());
    const uniqueDates = [...new Set(dates)];
    
    if (uniqueDates.length < 7) return false;
    
    // Check if dates are consecutive
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffTime = Math.abs(current.getTime() - next.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays !== 1) return false;
    }
    
    return true;
  }
}

export const storage = new DatabaseStorage();
