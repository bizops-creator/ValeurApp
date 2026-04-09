import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory state for 3C Plus stats
  let stats3c = {
    callsToday: 0,
    activeCalls: 0,
    dailyGoal: 150,
    goalReached: 0,
    lastUpdate: new Date().toISOString(),
    lastEvent: 'Aguardando primeiro evento...',
    recentEvents: [] as any[],
    hourlyData: Array.from({ length: 12 }, (_, i) => ({ hour: `${i + 8}h`, calls: 0 })) // 8h to 19h
  };

  // Simulate real-time updates every 10 seconds (Optional: can be removed once real data flows)
  /*
  setInterval(() => {
    const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    stats3c.activeCalls = Math.max(0, Math.min(15, stats3c.activeCalls + change));
    stats3c.goalReached = Math.min(100, Math.floor((stats3c.callsToday / 150) * 100));
    stats3c.lastUpdate = new Date().toISOString();
  }, 10000);
  */

  // API Routes
  app.get("/api/3c/stats", (req, res) => {
    res.json(stats3c);
  });

  app.post("/api/3c/goal", (req, res) => {
    const { goal } = req.body;
    if (typeof goal === 'number' && goal > 0) {
      stats3c.dailyGoal = goal;
      stats3c.goalReached = Math.min(100, Math.floor((stats3c.callsToday / stats3c.dailyGoal) * 100));
      res.json({ status: "success", dailyGoal: stats3c.dailyGoal });
    } else {
      res.status(400).json({ error: "Invalid goal value" });
    }
  });

  // Webhook endpoint for 3C Plus
  app.post("/api/3c/webhook", (req, res) => {
    const { event, data } = req.body;
    
    console.log("3C Plus Webhook received:", event, data);

    // Update stats based on 3C Plus specific events
    stats3c.lastEvent = event;
    stats3c.lastUpdate = new Date().toISOString();
    
    // Keep last 5 events
    stats3c.recentEvents = [{ event, timestamp: new Date().toISOString() }, ...stats3c.recentEvents].slice(0, 5);
    
    if (event === "call-history-was-created") {
      // A call was finished and added to history
      stats3c.callsToday += 1;
      
      // Update hourly data
      const currentHour = new Date().getHours();
      const hourLabel = `${currentHour}h`;
      const hourIndex = stats3c.hourlyData.findIndex(d => d.hour === hourLabel);
      if (hourIndex !== -1) {
        stats3c.hourlyData[hourIndex].calls += 1;
      }

      // Decrement active calls if it was tracked
      stats3c.activeCalls = Math.max(0, stats3c.activeCalls - 1);
      stats3c.lastUpdate = new Date().toISOString();
    } else if (event === "call-was-connected") {
      // A new call is now active
      stats3c.activeCalls += 1;
      stats3c.lastUpdate = new Date().toISOString();
    }

    // Recalculate goal percentage
    stats3c.goalReached = Math.min(100, Math.floor((stats3c.callsToday / stats3c.dailyGoal) * 100));

    res.status(200).json({ status: "received" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
