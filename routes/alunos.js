const express = require("express");
const router = express.Router();
const Joi = require("joi");
const db = require("../db");
const events = require("../events");
const { authenticate, authorize } = require("../middleware/auth");

const alunoSchema = Joi.object({
  nome: Joi.string().min(3).max(100).required().messages({
    "string.base": '"nome" deve ser um texto',
    "string.empty": '"nome" não pode estar vazio',
    "string.min": '"nome" length must be at least 3 characters long',
    "string.max": '"nome" length must be at most 100 characters long',
    "any.required": '"nome" é obrigatório'
  }),
  idade: Joi.number().integer().min(5).max(100).required().messages({
    "number.base": '"idade" deve ser um número',
    "number.integer": '"idade" deve ser um inteiro',
    "number.min": '"idade" must be at least 5',
    "number.max": '"idade" must be at most 100',
    "any.required": '"idade" é obrigatório'
  }),
  turma: Joi.string().min(2).max(20).required().messages({
    "string.base": '"turma" deve ser um texto',
    "string.empty": '"turma" não pode estar vazia',
    "string.min": '"turma" length must be at least 2 characters long',
    "string.max": '"turma" length must be at most 20 characters long',
    "any.required": '"turma" é obrigatório'
  }),
  escola: Joi.string().min(2).max(100).messages({
    "string.base": '"escola" deve ser um texto',
    "string.empty": '"escola" não pode estar vazia',
    "string.min": '"escola" length must be at least 2 characters long',
    "string.max": '"escola" length must be at most 100 characters long'
  })
});

function getSchoolFilter(req) {
  if (req.user.role === "admin") {
    return { where: "", params: [] };
  }

  const userSchool = (req.user.escola || "").trim();
  return { where: " WHERE escola = ?", params: [userSchool] };
}

function getSchoolIdFilter(req) {
  if (req.user.role === "admin") {
    return { sql: "SELECT * FROM alunos WHERE id = ?", params: [req.alunoId] };
  }

  const userSchool = (req.user.escola || "").trim();
  return { sql: "SELECT * FROM alunos WHERE id = ? AND escola = ?", params: [req.alunoId, userSchool] };
}

function requireUserSchool(req, res) {
  if (req.user.role === "admin") {
    return true;
  }

  if (!req.user.escola || !req.user.escola.trim()) {
    res.status(403).json({ message: "Escola do utilizador não definida" });
    return false;
  }

  return true;
}

function getAlunoSchool(req) {
  if (req.user.role === "admin") {
    return (req.body.escola || "").trim();
  }

  return (req.user.escola || "").trim();
}

function buildAlunoSchoolClause(req, baseSql) {
  if (req.user.role === "admin") {
    return { sql: baseSql, params: [] };
  }

  const userSchool = (req.user.escola || "").trim();
  return { sql: `${baseSql} AND escola = ?`, params: [userSchool] };
}

function canModifyAluno(req) {
  return req.user.role === "admin" || req.user.role === "director";
}

function isBasicRegistrationUser(req) {
  return req.user.role === "operator";
}

function adminOrDirector(req, res, next) {
  if (!canModifyAluno(req)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  if (!requireUserSchool(req, res)) {
    return;
  }
  next();
}

function adminOperatorDirector(req, res, next) {
  if (!["admin", "operator", "director"].includes(req.user.role)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  if (!requireUserSchool(req, res)) {
    return;
  }
  next();
}

function adminDirector(req, res, next) {
  if (!canModifyAluno(req)) {
    return res.status(403).json({ message: "Acesso negado" });
  }
  if (!requireUserSchool(req, res)) {
    return;
  }
  next();
}

function authorizeRequiredRoles(requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    next();
  };
}

function validateAlunoSchool(req, res, next) {
  if (req.user.role === "admin") {
    if (!req.body.escola || !req.body.escola.trim()) {
      return res.status(400).json({ message: "Escola é obrigatória para admin ao registar aluno" });
    }
  }
  next();
}

function validarAluno(req, res, next) {
  console.log("🔥 VALIDANDO ALUNO...");

  const { error } = alunoSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    console.log("❌ Erro de validação:", messages);
    return res.status(400).json({ message: messages.join("; ") });
  }

  console.log("✅ Validação OK");
  next();
}

function validarId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }

  req.alunoId = id;
  next();
}

router.get("/", authenticate, authorize(["admin", "operator", "director"]), (req, res) => {
  const filter = getSchoolFilter(req);
  db.all(`SELECT * FROM alunos${filter.where} ORDER BY created_at DESC`, filter.params, (err, rows) => {
    if (err) {
      console.error("Erro a buscar alunos:", err);
      return res.status(500).json({ message: "Erro a ler alunos" });
    }

    res.json(rows);
  });
});

router.get("/:id", authenticate, authorize(["admin", "operator", "director"]), validarId, (req, res) => {
  const filter = getSchoolIdFilter(req);

  db.get(filter.sql, filter.params, (err, row) => {
    if (err) {
      console.error("Erro a buscar aluno:", err);
      return res.status(500).json({ message: "Erro a ler aluno" });
    }

    if (!row) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }

    res.json(row);
  });
});

router.post("/", authenticate, authorize(["admin", "operator", "director"]), validarAluno, validateAlunoSchool, (req, res) => {
  const { nome, idade, turma } = req.body;
  const escola = getAlunoSchool(req);

  if (!escola) {
    return res.status(400).json({ message: "Escola é obrigatória para registrar aluno" });
  }

  db.run(
    "INSERT INTO alunos (nome, idade, turma, escola) VALUES (?, ?, ?, ?)",
    [nome, idade, turma, escola],
    function (err) {
      if (err) {
        console.error("Erro a inserir aluno:", err);
        return res.status(500).json({ message: "Erro a criar aluno" });
      }

      const aluno = {
        id: this.lastID,
        nome,
        idade,
        turma,
        escola
      };

      events.emit("alunos", { action: "created", aluno });

      res.status(201).json({
        message: "Aluno criado com sucesso",
        aluno
      });
    }
  );
});

router.put("/:id", authenticate, authorize(["admin", "director"]), validarId, validarAluno, (req, res) => {
  const { nome, idade, turma } = req.body;
  const schoolClause = req.user.role === "admin" ? "" : " AND escola = ?";
  const params = [nome, idade, turma, req.alunoId];
  if (req.user.role !== "admin") {
    params.push(req.user.escola);
  }

  db.run(
    `UPDATE alunos SET nome = ?, idade = ?, turma = ? WHERE id = ?${schoolClause}`,
    params,
    function (err) {
      if (err) {
        console.error("Erro a atualizar aluno:", err);
        return res.status(500).json({ message: "Erro a atualizar aluno" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Aluno não encontrado" });
      }

      const resultFilter = getSchoolIdFilter(req);
      db.get(resultFilter.sql, resultFilter.params, (getErr, row) => {
        if (getErr) {
          console.error("Erro a buscar aluno atualizado:", getErr);
          return res.status(500).json({ message: "Erro a ler aluno" });
        }

        events.emit("alunos", { action: "updated", aluno: row });

        res.json({
          message: "Aluno atualizado com sucesso",
          aluno: row
        });
      });
    }
  );
});

router.delete("/:id", authenticate, authorize(["admin", "director"]), validarId, (req, res) => {
  const resultFilter = getSchoolIdFilter(req);

  db.get(resultFilter.sql, resultFilter.params, (getErr, row) => {
    if (getErr) {
      console.error("Erro a buscar aluno:", getErr);
      return res.status(500).json({ message: "Erro a ler aluno" });
    }

    if (!row) {
      return res.status(404).json({ message: "Aluno não encontrado" });
    }

    const deleteClause = req.user.role === "admin" ? "" : " AND escola = ?";
    const deleteParams = [req.alunoId];
    if (req.user.role !== "admin") {
      deleteParams.push(req.user.escola);
    }

    db.run(`DELETE FROM alunos WHERE id = ?${deleteClause}`, deleteParams, function (err) {
      if (err) {
        console.error("Erro a apagar aluno:", err);
        return res.status(500).json({ message: "Erro a apagar aluno" });
      }

      events.emit("alunos", { action: "deleted", aluno: row });

      res.json({
        message: "Aluno removido com sucesso",
        aluno: row
      });
    });
  });
});

module.exports = router;