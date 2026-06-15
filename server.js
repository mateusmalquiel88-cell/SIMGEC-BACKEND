const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config");
const logger = require("./logger");
const db = require("./db");
const events = require("./events");
const alunosRoutes = require("./routes/alunos");
const authRoutes = require("./routes/auth");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");
const escolasRoutes = require("./routes/escolas");
const chatRoutes = require("./routes/chat");
const { verifyPageToken } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.requestLogger);

const { authenticate } = require("./middleware/auth");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", verifyPageToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Servir explicitamente a mockup do dashboard (acesso direto)
app.get("/UI-Dashboard-Mockup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "UI-Dashboard-Mockup.html"));
});

app.get(["/mockup", "/mockup/"], (req, res) => {
  res.sendFile(path.join(__dirname, "public", "UI-Dashboard-Mockup.html"));
});

app.get("/admin", verifyPageToken, (req, res) => {
  console.log("📍 GET /admin chamado");
  if (req.user.role !== "admin") {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/registrar-aluno", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "registrar-aluno.html"));
});

app.get("/chat", verifyPageToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

app.get("/health", (req, res) => {
  db.get("SELECT 1 AS ok", [], (err, row) => {
    if (err) {
      console.error("Health check database error:", err);
      return res.status(503).json({ status: "fail", database: "unavailable" });
    }
    res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString(), database: row && row.ok === 1 ? "ok" : "unknown" });
  });
});

// Registrar rotas de API ANTES de static files
app.use("/auth", authRoutes);
app.use("/alunos", alunosRoutes);
app.use("/escolas", escolasRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/admin-api", adminRoutes);
app.use("/chat-api", chatRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.get("/events/alunos", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write("retry: 10000\n\n");

  const sendUpdate = (payload) => {
    res.write(`event: alunos\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  events.on("alunos", sendUpdate);

  req.on("close", () => {
    events.off("alunos", sendUpdate);
  });
});

app.get("/events", (req, res) => {
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(`/events/alunos${query}`);
});

app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Erro interno:", err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

const PORT = config.port;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Servidor a correr na porta ${PORT} e disponível em 0.0.0.0`);
  });
}

module.exports = app;