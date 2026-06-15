const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { SECRET, JWT_EXPIRES_IN, authenticate, authorize } = require("../middleware/auth");
const config = require("../config");

const router = express.Router();
const validRoles = ["admin", "director", "operator", "secretaria", "professor", "consulta"];

router.get("/verify", authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

router.post("/register", authenticate, authorize("admin"), (req, res) => {
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

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email e senha são obrigatórios" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error("Erro ao buscar usuário:", err);
      return res.status(500).json({ message: "Erro interno" });
    }

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    bcrypt.compare(password, user.password, (compareErr, valid) => {
      if (compareErr) {
        console.error("Erro ao validar senha:", compareErr);
        return res.status(500).json({ message: "Erro interno" });
      }

      if (!valid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, escola: user.escola || "" },
        SECRET,
        {
          expiresIn: JWT_EXPIRES_IN
        }
      );

      // Set HttpOnly cookie for browser-based auth (safer than localStorage)
      try {
        res.cookie("simgc_token", token, {
          httpOnly: true,
          secure: config.isProduction || false,
          sameSite: "Lax",
          path: "/"
        });
      } catch (cookieErr) {
        console.warn('Failed to set cookie:', cookieErr);
      }

      // Return token for API clients (keeps backward compatibility)
      res.json({ token, role: user.role, escola: user.escola || "" });
    });
  });
});

router.post("/logout", authenticate, (req, res) => {
  res.clearCookie("simgc_token", {
    httpOnly: true,
    secure: config.isProduction || false,
    sameSite: "Lax",
    path: "/"
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
