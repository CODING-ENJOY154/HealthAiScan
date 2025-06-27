import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertHealthReportSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Health Reports API
  app.get("/api/health-reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const reports = await storage.getUserHealthReports(req.user!.id, limit);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching health reports:", error);
      res.status(500).json({ message: "Failed to fetch health reports" });
    }
  });

  app.get("/api/health-reports/latest", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const report = await storage.getLatestHealthReport(req.user!.id);
      res.json(report || null);
    } catch (error) {
      console.error("Error fetching latest health report:", error);
      res.status(500).json({ message: "Failed to fetch latest health report" });
    }
  });

  app.post("/api/health-reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertHealthReportSchema.parse(req.body);
      const report = await storage.createHealthReport({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating health report:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid health report data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create health report" });
      }
    }
  });

  // User Preferences API
  app.get("/api/user/preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const preferences = await storage.getUserPreferences(req.user!.id);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.put("/api/user/preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const preferences = await storage.createOrUpdateUserPreferences(req.user!.id, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // Health Badges API
  app.get("/api/user/badges", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const badges = await storage.getUserBadges(req.user!.id);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Air Quality API (using OpenWeatherMap)
  app.get("/api/air-quality", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const apiKey = process.env.OPENWEATHERMAP_API_KEY || process.env.WEATHER_API_KEY || "demo_key";
      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Weather API responded with status ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching air quality:", error);
      res.status(500).json({ message: "Failed to fetch air quality data" });
    }
  });

  // Daily Tips API
  app.get("/api/daily-tip", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const tips = [
      "Take a 15-minute walk outside to boost your mood and energy levels!",
      "Drink at least 8 glasses of water today for optimal hydration.",
      "Practice deep breathing for 5 minutes to reduce stress levels.",
      "Get 7-9 hours of quality sleep for better overall health.",
      "Include more fruits and vegetables in your meals today.",
      "Take regular breaks from screen time to protect your eyes.",
      "Do some light stretching to improve flexibility and reduce tension.",
      "Practice gratitude by writing down 3 things you're thankful for.",
    ];
    
    const today = new Date().getDate();
    const tipIndex = today % tips.length;
    
    res.json({ tip: tips[tipIndex] });
  });

  const httpServer = createServer(app);
  return httpServer;
}
