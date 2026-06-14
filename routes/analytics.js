const express = require("express");
const db = require("../db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", authenticate, authorize(["admin", "director", "operator"]), (req, res) => {
  const schoolClause = req.user.role === "admin" ? "" : " WHERE escola = ?";
  const params = req.user.role === "admin" ? [] : [req.user.escola];

  db.get(`SELECT COUNT(1) AS totalAlunos FROM alunos${schoolClause}`, params, (err, alunoCount) => {
    if (err) {
      console.error("Erro a calcular estatísticas:", err);
      return res.status(500).json({ message: "Erro interno" });
    }

    db.all(`SELECT turma, COUNT(1) AS total FROM alunos${schoolClause} GROUP BY turma ORDER BY turma`, params, (err2, turmaRows) => {
      if (err2) {
        console.error("Erro a calcular estatísticas por turma:", err2);
        return res.status(500).json({ message: "Erro interno" });
      }

      res.json({
        totalAlunos: alunoCount.totalAlunos,
        alunosPorTurma: turmaRows || []
      });
    });
  });
});

// Novo endpoint para analytics detalhado
router.get("/detailed", authenticate, authorize(["admin", "director", "operator"]), (req, res) => {
  const schoolClause = req.user.role === "admin" ? "" : " WHERE escola = ?";
  const params = req.user.role === "admin" ? [] : [req.user.escola];

  db.get(`SELECT COUNT(1) AS totalAlunos, AVG(idade) AS idadeMedia, MIN(idade) AS idadeMinima, MAX(idade) AS idadeMaxima FROM alunos${schoolClause}`, params, (err, stats) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao calcular estatísticas" });
    }

    db.all(`SELECT turma, COUNT(1) AS total, AVG(idade) AS idadeMedia FROM alunos${schoolClause} GROUP BY turma ORDER BY turma`, params, (err2, turmaStats) => {
      if (err2) {
        return res.status(500).json({ message: "Erro ao calcular por turma" });
      }

      res.json({
        totalAlunos: stats.totalAlunos,
        idadeMedia: stats.idadeMedia ? stats.idadeMedia.toFixed(1) : 0,
        idadeMinima: stats.idadeMinima || 0,
        idadeMaxima: stats.idadeMaxima || 0,
        turmaStats: turmaStats || []
      });
    });
  });
});

// Endpoint para distribuição por faixa etária
router.get("/age-distribution", authenticate, authorize(["admin", "director", "operator"]), (req, res) => {
  const schoolFilter = req.user.role === "admin" ? "" : " WHERE escola = ?";
  const params = req.user.role === "admin" ? [] : [req.user.escola];

  db.all(
    `SELECT 
      CASE 
        WHEN idade <= 10 THEN '5-10'
        WHEN idade <= 14 THEN '11-14'
        WHEN idade <= 18 THEN '15-18'
        ELSE '18+'
      END as faixa,
      COUNT(1) as total
    FROM alunos${schoolFilter}
    GROUP BY faixa
    ORDER BY faixa`,
    params,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao calcular distribuição" });
      }
      res.json(rows || []);
    }
  );
});

module.exports = router;
