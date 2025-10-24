import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/ollama/status", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running fine ✅" });
});

// Test route
app.post("/api/ollama/generate-test", (req, res) => {
  res.json({ test: "Ollama route works!", received: req.body });
});

// Real AI generation
interface OllamaResponse {
  response?: string;
}

app.post("/api/ollama/generate", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const ollamaApiUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/generate";

    const response = await fetch(ollamaApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "llama3.2:latest",
        prompt: query,
        stream: false
      })
    });

    const data: OllamaResponse = await response.json();
    res.json({ completion: data.response || "No response from Ollama" });
  } catch (error) {
    console.error("Ollama generate error:", error);
    res.status(500).json({ error: "Failed to connect to Ollama" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
