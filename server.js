// import "dotenv/config";
// import cors from "cors";
// import express from "express";
// import OpenAI from "openai";

// const port = Number(process.env.API_PORT) || 3001;
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
// ];

// if (!process.env.OPENAI_API_KEY) {
//   console.error("Missing OPENAI_API_KEY. Add it to the project .env file.");
//   process.exit(1);
// }

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const app = express();

// app.use(cors({ origin: allowedOrigins }));
// app.use(express.json({ limit: "1mb" }));

// app.get("/api/health", (_request, response) => {
//   response.json({ status: "ok" });
// });

// app.post("/api/chat", async (request, response) => {
//   const { messages } = request.body ?? {};

//   if (
//     !Array.isArray(messages) ||
//     messages.length === 0 ||
//     messages.length > 30
//   ) {
//     return response.status(400).json({ error: "Invalid messages." });
//   }

//   const validMessages = messages.every(
//     (message) =>
//       message &&
//       (message.role === "user" || message.role === "assistant") &&
//       typeof message.content === "string" &&
//       message.content.trim().length > 0 &&
//       message.content.length <= 4000,
//   );

//   if (!validMessages) {
//     return response.status(400).json({ error: "Invalid messages." });
//   }

//   try {
//     const result = await openai.responses.create({
//       model: process.env.OPENAI_MODEL || "gpt-4o-mini",
//       input: messages.map(({ role, content }) => ({
//         role,
//         content: content.trim(),
//       })),
//       max_output_tokens: 500,
//     });

//     return response.json({ reply: result.output_text });
//   } catch (error) {
//     console.error("OpenAI request failed:", error.message);
//     return response
//       .status(502)
//       .json({ error: "The AI service could not complete this request." });
//   }
// });

// app.listen(port, () => {
//   console.log(`API server listening on http://localhost:${port}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in your .env file");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Please send a message.",
      });
    }

    const safeMessages = messages
      .filter(
        (item) =>
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
      )
      .slice(-20)
      .map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content.slice(0, 4000) }],
      }));

    if (
      safeMessages.length === 0 ||
      safeMessages[safeMessages.length - 1].role !== "user"
    ) {
      return res.status(400).json({
        error: "Your latest message is missing.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: safeMessages,
      config: {
        systemInstruction:
          "You are a friendly AI assistant. Answer questions clearly, " +
          "explain things simply, and be respectful.",
      },
    });

    res.json({
      reply:
        response.text ||
        "I couldn't generate a response. Please try again.",
    });
  } catch (error) {
    console.error("Gemini API error:", error.message);

    res.status(500).json({
      error: "The AI request failed. Check the server terminal for details.",
    });
  }
});

app.listen(port, () => {
  console.log(`Gemini AI server running at http://localhost:${port}`);
});
