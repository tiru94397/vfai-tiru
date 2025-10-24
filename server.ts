import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const OLLAMA_HOST = process.env.OLLAMA_HOST;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/ollama/status", (req, res) => {
  res.json({ status: "ok", message: "Backend is running ✅" });
});

// Test route
app.post("/api/ollama/generate-test", (req, res) => {
  res.json({ test: "Ollama route works!", received: req.body });
});

// AI generation route
app.post("/api/ollama/generate", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: query,
        stream: false
      }),
    });

    const data = await response.json();
    res.json({ completion: data?.response || "No response from Ollama" });
  } catch (error) {
    console.error("Ollama generate error:", error);
    res.status(500).json({ error: "Failed to connect to Ollama" });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
