import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ CHAT API (Groq Cloud API with Streaming)
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message missing" });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }],
        stream: true 
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    response.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
             return res.end();
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || "";
            res.write(content); 
          } catch (e) { }
        }
      }
    });

  } catch (error) {
    console.log("❌ controlend.ai Error:", error.message);
    res.status(500).write("System error. Check Groq API Key.");
    res.end();
  }
});

// ✅ HISTORY API (Temporary Empty Array)
app.get("/history", (req, res) => {
  res.json([]); // Database illathathaala empty-ah anuprom
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 controlend.ai Server running on port ${PORT}`);
});