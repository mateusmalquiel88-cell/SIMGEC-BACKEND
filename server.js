const express = require("express");
const cors = require("cors");
const path = require("path");
const events = require("./events");
const alunosRoutes = require("./routes/alunos");
const authRoutes = require("./routes/auth").router;
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");
const escolasRoutes = require("./routes/escolas");
const chatRoutes = require("./routes/chat");
const { verifyPageToken } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

const { authenticate } = require("./middleware/auth");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", verifyPageToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
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

// Registrar rotas de API ANTES de static files
app.use("/auth", authRoutes);
app.use("/alunos", alunosRoutes);
console.log('Mounted /alunos');
app.use("/escolas", escolasRoutes);
console.log('Mounted /escolas');
app.use("/analytics", analyticsRoutes);
console.log('Mounted /analytics');
app.use("/auth", authRoutes);
app.use("/alunos", alunosRoutes);
app.use("/escolas", escolasRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/admin-api", adminRoutes);
app.use("/chat-api", chatRoutes);
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
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

app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Erro interno:", err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});