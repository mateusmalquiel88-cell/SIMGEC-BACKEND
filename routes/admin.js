const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const validRoles = ["admin", "director", "operator", "secretaria", "professor", "consulta"];

// Endpoint para listar todos os utilizadores (admin only)
router.get("/users", authenticate, authorize("admin"), (req, res) => {
  db.all("SELECT id, email, role, escola, created_at FROM users", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar utilizadores:", err);
      return res.status(500).json({ message: "Erro ao buscar utilizadores" });
    }

    res.json(rows || []);
  });
});

// Endpoint para criar utilizador (admin only)
router.post("/users", authenticate, authorize("admin"), (req, res) => {
  const { email, password, role = "operator", escola = "" } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios" });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Role inválido" });
  }

  if (["director", "operator"].includes(role) && !escola.trim()) {
    return res.status(400).json({ message: "Escola é obrigatória para director e operator" });
  }

  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error("Erro ao hashear senha:", hashErr);
      return res.status(500).json({ message: "Erro interno" });
    }

    db.run(
      "INSERT INTO users (email, password, role, escola) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, role, escola.trim() || ""],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ message: "Email já registado" });
          }

          console.error("Erro ao criar usuário:", err);
          return res.status(500).json({ message: "Erro interno" });
        }

        res.status(201).json({
          message: "Usuário criado com sucesso",
          userId: this.lastID
        });
      }
    );
  });
});

// Endpoint para eliminar utilizador (admin only)
router.delete("/users/:id", authenticate, authorize("admin"), (req, res) => {
  const userId = parseInt(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }

  // Evitar eliminar o próprio utilizador
  if (userId === req.user.userId) {
    return res.status(403).json({ message: "Não pode eliminar a sua própria conta" });
  }

  db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
    if (err) {
      console.error("Erro ao eliminar utilizador:", err);
      return res.status(500).json({ message: "Erro ao eliminar utilizador" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    res.json({ message: "Utilizador eliminado com sucesso" });
  });
});

// Endpoint para auditoria de atividades (admin only)
router.get("/audit", authenticate, authorize("admin"), (req, res) => {
  db.all(
    `SELECT id, user_email, action, resource, timestamp FROM audit_log 
     ORDER BY timestamp DESC LIMIT 500`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Erro ao buscar auditoria:", err);
        return res.status(500).json({ message: "Erro ao buscar auditoria" });
      }

      res.json(rows || []);
    }
  );
});

// Endpoint para estatísticas detalhadas (admin only)
router.get("/stats", authenticate, authorize(["admin", "director"]), (req, res) => {
  const schoolClause = req.user.role === "admin" ? "" : " WHERE escola = ?";
  const params = req.user.role === "admin" ? [] : [req.user.escola];

  db.get(`SELECT COUNT(1) AS totalAlunos FROM alunos${schoolClause}`, params, (err, alunoCount) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao calcular estatísticas" });
    }

    db.all(
      `SELECT turma, COUNT(1) AS total, AVG(idade) AS idadeMedia 
       FROM alunos${schoolClause} GROUP BY turma ORDER BY turma`,
      params,
      (err2, turmaStats) => {
        if (err2) {
          return res.status(500).json({ message: "Erro ao calcular por turma" });
        }

        db.all(
          `SELECT COUNT(1) AS total, role FROM users GROUP BY role`,
          [],
          (err3, userStats) => {
            if (err3) {
              return res.status(500).json({ message: "Erro ao calcular utilizadores" });
            }

            res.json({
              totalAlunos: alunoCount.totalAlunos,
              turmaStats: turmaStats || [],
              userStats: userStats || []
            });
          }
        );
      }
    );
  });
});

module.exports = router;
