const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Store conversation history (in memory, pode ser melhorado com DB)
const conversationHistory = {};

router.post("/message", authenticate, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ message: "Mensagem vazia" });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ message: "API key não configurada" });
  }

  try {
    // Initialize conversation history for user
    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }

    // Add user message to history
    conversationHistory[userId].push({
      role: "user",
      content: message
    });

    // Keep only last 10 messages
    if (conversationHistory[userId].length > 20) {
      conversationHistory[userId] = conversationHistory[userId].slice(-20);
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um assistente educacional especializado em ajudar com dúvidas sobre educação, alunos, e gestão escolar. Você está integrado no sistema SIMGEC de Angola. Seja útil, conciso e sempre em português."
          },
          ...conversationHistory[userId]
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI Error:", error);
      return res.status(500).json({ message: "Erro ao processar mensagem com ChatGPT" });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Add assistant message to history
    conversationHistory[userId].push({
      role: "assistant",
      content: assistantMessage
    });

    res.json({
      message: assistantMessage,
      conversationId: userId
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Erro ao comunicar com ChatGPT" });
  }
});

// Clear conversation history
router.post("/clear", authenticate, (req, res) => {
  const userId = req.user.userId;
  conversationHistory[userId] = [];
  res.json({ message: "Conversa apagada" });
});

// Get conversation history
router.get("/history", authenticate, (req, res) => {
  const userId = req.user.userId;
  res.json({
    history: conversationHistory[userId] || []
  });
});

module.exports = router;
