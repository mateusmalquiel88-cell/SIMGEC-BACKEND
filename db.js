const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const config = require("./config");

const dbPath = config.databasePath;

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao abrir a base de dados SQLite:", err);
    process.exit(1);
  }
});

function ensureColumn(table, columnDefinition) {
  db.run(`ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`, (err) => {
    if (err && !/duplicate column name/i.test(err.message)) {
      console.error(`Erro ao adicionar coluna ${columnDefinition} em ${table}:`, err);
    }
  });
}

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      idade INTEGER NOT NULL,
      turma TEXT NOT NULL,
      escola TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      escola TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS escolas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      provincia TEXT,
      municipio TEXT,
      comuna TEXT,
      uor_codigo TEXT,
      diretor TEXT,
      subdiretor_pedagogico TEXT,
      subdiretor_administrativo TEXT,
      total_subdirectores INTEGER,
      chefe_secretaria TEXT,
      nivel_ensino TEXT,
      classes_leccionadas TEXT,
      num_areas_saber INTEGER,
      areas_saber TEXT,
      curso_basico TEXT,
      cursos_ministrados TEXT,
      zona_geografica TEXT,
      num_salas INTEGER,
      num_turmas INTEGER,
      num_turnos INTEGER,
      num_alunos_salas INTEGER,
      total_alunos INTEGER,
      num_decreto_executivo TEXT,
      coordenadores_classe_disciplina INTEGER,
      total_coordenadores INTEGER,
      pessoal_docente INTEGER,
      pessoal_administrativo INTEGER,
      pessoal_auxiliar INTEGER,
      total_trabalhadores INTEGER,
      coordenador_turno TEXT,
      coordenador_educacao_fisica TEXT,
      coordenador_curso TEXT,
      carreira_enfermagem INTEGER,
      tecnico_terapeutico INTEGER,
      pessoal_tecnico INTEGER,
      bairro TEXT,
      endereco TEXT,
      telefone TEXT,
      email TEXT,
      num_professores INTEGER,
      estado TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  );

  ensureColumn("alunos", "escola TEXT");
  ensureColumn("users", "escola TEXT");
  
  // Migração de novos campos para a tabela escolas
  ensureColumn("escolas", "provincia TEXT");
  ensureColumn("escolas", "uor_codigo TEXT");
  ensureColumn("escolas", "classes_leccionadas TEXT");
  ensureColumn("escolas", "num_areas_saber INTEGER");
  ensureColumn("escolas", "areas_saber TEXT");
  ensureColumn("escolas", "curso_basico TEXT");
  ensureColumn("escolas", "cursos_ministrados TEXT");
  ensureColumn("escolas", "zona_geografica TEXT");
  ensureColumn("escolas", "num_turmas INTEGER");
  ensureColumn("escolas", "num_turnos INTEGER");
  ensureColumn("escolas", "num_alunos_salas INTEGER");
  ensureColumn("escolas", "num_decreto_executivo TEXT");
  ensureColumn("escolas", "total_subdirectores INTEGER");
  ensureColumn("escolas", "chefe_secretaria TEXT");
  ensureColumn("escolas", "coordenadores_classe_disciplina INTEGER");
  ensureColumn("escolas", "total_coordenadores INTEGER");
  ensureColumn("escolas", "pessoal_docente INTEGER");
  ensureColumn("escolas", "pessoal_administrativo INTEGER");
  ensureColumn("escolas", "pessoal_auxiliar INTEGER");
  ensureColumn("escolas", "total_trabalhadores INTEGER");
  ensureColumn("escolas", "coordenador_turno TEXT");
  ensureColumn("escolas", "coordenador_educacao_fisica TEXT");
  ensureColumn("escolas", "coordenador_curso TEXT");
  ensureColumn("escolas", "carreira_enfermagem INTEGER");
  ensureColumn("escolas", "tecnico_terapeutico INTEGER");
  ensureColumn("escolas", "pessoal_tecnico INTEGER");
  ensureColumn("escolas", "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");

  db.get("SELECT COUNT(1) AS count FROM users", (err, row) => {
    if (err) {
      return console.error("Erro ao verificar usuário padrão:", err);
    }

    if (!row || row.count === 0) {
      bcrypt.hash("M@iqueias318565", 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          return console.error("Erro ao criar senha padrão:", hashErr);
        }

        db.run(
          "INSERT INTO users (email, password, role, escola) VALUES (?, ?, ?, ?)",
          ["marotheus.mora", hashedPassword, "admin", "Todas"],
          (insertErr) => {
            if (insertErr) {
              return console.error("Erro ao criar usuário padrão:", insertErr);
            }

            console.log("Usuário padrão criado: marotheus.mora / M@iqueias318565");
          }
        );
      });
    }
  });
});

module.exports = db;