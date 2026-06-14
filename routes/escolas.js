const express = require("express");
const Joi = require("joi");
const db = require("../db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

const escolaSchema = Joi.object({
  codigo: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": '"codigo" deve ser um texto',
    "string.empty": '"codigo" não pode estar vazio',
    "string.min": '"codigo" deve ter pelo menos 2 caracteres',
    "string.max": '"codigo" deve ter no máximo 50 caracteres',
    "any.required": '"codigo" é obrigatório'
  }),
  nome: Joi.string().trim().min(3).max(200).required().messages({
    "string.base": '"nome" deve ser um texto',
    "string.empty": '"nome" não pode estar vazio',
    "string.min": '"nome" deve ter pelo menos 3 caracteres',
    "string.max": '"nome" deve ter no máximo 200 caracteres',
    "any.required": '"nome" é obrigatório'
  }),
  provincia: Joi.string().trim().allow(""),
  municipio: Joi.string().trim().allow(""),
  comuna: Joi.string().trim().allow(""),
  uor_codigo: Joi.string().trim().allow(""),
  diretor: Joi.string().trim().allow(""),
  subdiretor_pedagogico: Joi.string().trim().allow(""),
  subdiretor_administrativo: Joi.string().trim().allow(""),
  total_subdirectores: Joi.number().integer().min(0).allow(null),
  chefe_secretaria: Joi.string().trim().allow(""),
  nivel_ensino: Joi.string().trim().allow(""),
  classes_leccionadas: Joi.string().trim().allow(""),
  num_areas_saber: Joi.number().integer().min(0).allow(null),
  areas_saber: Joi.string().trim().allow(""),
  curso_basico: Joi.string().trim().allow(""),
  cursos_ministrados: Joi.string().trim().allow(""),
  zona_geografica: Joi.string().trim().allow(""),
  num_salas: Joi.number().integer().min(0).allow(null),
  num_turmas: Joi.number().integer().min(0).allow(null),
  num_turnos: Joi.number().integer().min(0).allow(null),
  num_alunos_salas: Joi.number().integer().min(0).allow(null),
  total_alunos: Joi.number().integer().min(0).allow(null),
  num_decreto_executivo: Joi.string().trim().allow(""),
  coordenadores_classe_disciplina: Joi.number().integer().min(0).allow(null),
  total_coordenadores: Joi.number().integer().min(0).allow(null),
  pessoal_docente: Joi.number().integer().min(0).allow(null),
  pessoal_administrativo: Joi.number().integer().min(0).allow(null),
  pessoal_auxiliar: Joi.number().integer().min(0).allow(null),
  total_trabalhadores: Joi.number().integer().min(0).allow(null),
  coordenador_turno: Joi.string().trim().allow(""),
  coordenador_educacao_fisica: Joi.string().trim().allow(""),
  coordenador_curso: Joi.string().trim().allow(""),
  carreira_enfermagem: Joi.number().integer().min(0).allow(null),
  tecnico_terapeutico: Joi.number().integer().min(0).allow(null),
  pessoal_tecnico: Joi.number().integer().min(0).allow(null),
  bairro: Joi.string().trim().allow(""),
  endereco: Joi.string().trim().allow(""),
  telefone: Joi.string().trim().allow(""),
  email: Joi.string().email().allow(""),
  num_professores: Joi.number().integer().min(0).allow(null),
  estado: Joi.string().trim().allow(""),
});

function validarEscola(req, res, next) {
  const { error } = escolaSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message);
    return res.status(400).json({ message: messages.join("; ") });
  }

  next();
}

router.get("/", authenticate, authorize(["admin", "director", "secretaria", "professor", "consulta"]), (req, res) => {
  let query = `SELECT * FROM escolas WHERE 1=1`;
  const params = [];

  // Filtros de texto (busca geral)
  if (req.query.q) {
    const searchTerm = `%${req.query.q.trim()}%`;
    query += ` AND (codigo LIKE ? OR nome LIKE ? OR municipio LIKE ? OR comuna LIKE ? OR provincia LIKE ? OR uor_codigo LIKE ?)`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Filtros específicos por campo
  if (req.query.provincia) {
    query += ` AND provincia = ?`;
    params.push(req.query.provincia);
  }
  if (req.query.municipio) {
    query += ` AND municipio = ?`;
    params.push(req.query.municipio);
  }
  if (req.query.comuna) {
    query += ` AND comuna = ?`;
    params.push(req.query.comuna);
  }
  if (req.query.nivel_ensino) {
    query += ` AND nivel_ensino = ?`;
    params.push(req.query.nivel_ensino);
  }
  if (req.query.zona_geografica) {
    query += ` AND zona_geografica = ?`;
    params.push(req.query.zona_geografica);
  }
  if (req.query.estado) {
    query += ` AND estado = ?`;
    params.push(req.query.estado);
  }
  if (req.query.diretor) {
    query += ` AND diretor LIKE ?`;
    params.push(`%${req.query.diretor}%`);
  }
  if (req.query.chefe_secretaria) {
    query += ` AND chefe_secretaria LIKE ?`;
    params.push(`%${req.query.chefe_secretaria}%`);
  }
  if (req.query.num_salas_min) {
    query += ` AND num_salas >= ?`;
    params.push(Number(req.query.num_salas_min));
  }
  if (req.query.num_salas_max) {
    query += ` AND num_salas <= ?`;
    params.push(Number(req.query.num_salas_max));
  }
  if (req.query.total_alunos_min) {
    query += ` AND total_alunos >= ?`;
    params.push(Number(req.query.total_alunos_min));
  }
  if (req.query.total_alunos_max) {
    query += ` AND total_alunos <= ?`;
    params.push(Number(req.query.total_alunos_max));
  }

  // Ordenação
  const sortBy = req.query.sortBy || "nome";
  const validSortFields = ["codigo", "nome", "provincia", "municipio", "comuna", "nivel_ensino", "created_at", "updated_at"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "nome";
  const sortOrder = req.query.sortOrder === "DESC" ? "DESC" : "ASC";
  query += ` ORDER BY ${sortField} ${sortOrder}`;

  // Paginação
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Erro a listar escolas:", err);
      return res.status(500).json({ message: "Erro ao listar escolas" });
    }

    // Contar total de registros para paginação
    let countQuery = `SELECT COUNT(*) as total FROM escolas WHERE 1=1`;
    const countParams = [];

    if (req.query.q) {
      const searchTerm = `%${req.query.q.trim()}%`;
      countQuery += ` AND (codigo LIKE ? OR nome LIKE ? OR municipio LIKE ? OR comuna LIKE ? OR provincia LIKE ? OR uor_codigo LIKE ?)`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (req.query.provincia) {
      countQuery += ` AND provincia = ?`;
      countParams.push(req.query.provincia);
    }
    if (req.query.municipio) {
      countQuery += ` AND municipio = ?`;
      countParams.push(req.query.municipio);
    }
    if (req.query.comuna) {
      countQuery += ` AND comuna = ?`;
      countParams.push(req.query.comuna);
    }
    if (req.query.nivel_ensino) {
      countQuery += ` AND nivel_ensino = ?`;
      countParams.push(req.query.nivel_ensino);
    }
    if (req.query.zona_geografica) {
      countQuery += ` AND zona_geografica = ?`;
      countParams.push(req.query.zona_geografica);
    }
    if (req.query.estado) {
      countQuery += ` AND estado = ?`;
      countParams.push(req.query.estado);
    }
    if (req.query.diretor) {
      countQuery += ` AND diretor LIKE ?`;
      countParams.push(`%${req.query.diretor}%`);
    }
    if (req.query.chefe_secretaria) {
      countQuery += ` AND chefe_secretaria LIKE ?`;
      countParams.push(`%${req.query.chefe_secretaria}%`);
    }
    if (req.query.num_salas_min) {
      countQuery += ` AND num_salas >= ?`;
      countParams.push(Number(req.query.num_salas_min));
    }
    if (req.query.num_salas_max) {
      countQuery += ` AND num_salas <= ?`;
      countParams.push(Number(req.query.num_salas_max));
    }
    if (req.query.total_alunos_min) {
      countQuery += ` AND total_alunos >= ?`;
      countParams.push(Number(req.query.total_alunos_min));
    }
    if (req.query.total_alunos_max) {
      countQuery += ` AND total_alunos <= ?`;
      countParams.push(Number(req.query.total_alunos_max));
    }

    db.get(countQuery, countParams, (countErr, countRow) => {
      if (countErr) {
        console.error("Erro ao contar escolas:", countErr);
        return res.status(500).json({ message: "Erro ao contar escolas" });
      }

      const total = countRow ? countRow.total : 0;
      res.json({
        data: rows || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    });
  });
});

router.get("/:id", authenticate, authorize(["admin", "director", "secretaria", "professor", "consulta"]), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }

  db.get("SELECT * FROM escolas WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Erro a buscar escola:", err);
      return res.status(500).json({ message: "Erro ao buscar escola" });
    }
    if (!row) {
      return res.status(404).json({ message: "Escola não encontrada" });
    }
    res.json(row);
  });
});

router.post("/", authenticate, authorize("admin"), validarEscola, (req, res) => {
  const {
    codigo,
    nome,
    provincia,
    municipio,
    comuna,
    uor_codigo,
    diretor,
    subdiretor_pedagogico,
    subdiretor_administrativo,
    total_subdirectores,
    chefe_secretaria,
    nivel_ensino,
    classes_leccionadas,
    num_areas_saber,
    areas_saber,
    curso_basico,
    cursos_ministrados,
    zona_geografica,
    num_salas,
    num_turmas,
    num_turnos,
    num_alunos_salas,
    total_alunos,
    num_decreto_executivo,
    coordenadores_classe_disciplina,
    total_coordenadores,
    pessoal_docente,
    pessoal_administrativo,
    pessoal_auxiliar,
    total_trabalhadores,
    coordenador_turno,
    coordenador_educacao_fisica,
    coordenador_curso,
    carreira_enfermagem,
    tecnico_terapeutico,
    pessoal_tecnico,
    bairro,
    endereco,
    telefone,
    email,
    num_professores,
    estado
  } = req.body;

  db.run(
    `INSERT INTO escolas (
      codigo, nome, provincia, municipio, comuna, uor_codigo, diretor, subdiretor_pedagogico, subdiretor_administrativo, total_subdirectores, chefe_secretaria, nivel_ensino, classes_leccionadas, num_areas_saber, areas_saber, curso_basico, cursos_ministrados, zona_geografica, num_salas, num_turmas, num_turnos, num_alunos_salas, total_alunos, num_decreto_executivo, coordenadores_classe_disciplina, total_coordenadores, pessoal_docente, pessoal_administrativo, pessoal_auxiliar, total_trabalhadores, coordenador_turno, coordenador_educacao_fisica, coordenador_curso, carreira_enfermagem, tecnico_terapeutico, pessoal_tecnico, bairro, endereco, telefone, email, num_professores, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      codigo,
      nome,
      provincia || "",
      municipio || "",
      comuna || "",
      uor_codigo || "",
      diretor || "",
      subdiretor_pedagogico || "",
      subdiretor_administrativo || "",
      total_subdirectores || null,
      chefe_secretaria || "",
      nivel_ensino || "",
      classes_leccionadas || "",
      num_areas_saber || null,
      areas_saber || "",
      curso_basico || "",
      cursos_ministrados || "",
      zona_geografica || "",
      num_salas || null,
      num_turmas || null,
      num_turnos || null,
      num_alunos_salas || null,
      total_alunos || null,
      num_decreto_executivo || "",
      coordenadores_classe_disciplina || null,
      total_coordenadores || null,
      pessoal_docente || null,
      pessoal_administrativo || null,
      pessoal_auxiliar || null,
      total_trabalhadores || null,
      coordenador_turno || "",
      coordenador_educacao_fisica || "",
      coordenador_curso || "",
      carreira_enfermagem || null,
      tecnico_terapeutico || null,
      pessoal_tecnico || null,
      bairro || "",
      endereco || "",
      telefone || "",
      email || "",
      num_professores || null,
      estado || ""
    ],
    function (err) {
      if (err) {
        console.error("Erro ao criar escola:", err);
        return res.status(500).json({ message: "Erro ao criar escola" });
      }

      res.status(201).json({ message: "Escola criada com sucesso", id: this.lastID });
    }
  );
});

router.put("/:id", authenticate, authorize("admin"), validarEscola, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const {
    codigo,
    nome,
    provincia,
    municipio,
    comuna,
    uor_codigo,
    diretor,
    subdiretor_pedagogico,
    subdiretor_administrativo,
    total_subdirectores,
    chefe_secretaria,
    nivel_ensino,
    classes_leccionadas,
    num_areas_saber,
    areas_saber,
    curso_basico,
    cursos_ministrados,
    zona_geografica,
    num_salas,
    num_turmas,
    num_turnos,
    num_alunos_salas,
    total_alunos,
    num_decreto_executivo,
    coordenadores_classe_disciplina,
    total_coordenadores,
    pessoal_docente,
    pessoal_administrativo,
    pessoal_auxiliar,
    total_trabalhadores,
    coordenador_turno,
    coordenador_educacao_fisica,
    coordenador_curso,
    carreira_enfermagem,
    tecnico_terapeutico,
    pessoal_tecnico,
    bairro,
    endereco,
    telefone,
    email,
    num_professores,
    estado
  } = req.body;

  db.run(
    `UPDATE escolas SET
      codigo = ?, nome = ?, provincia = ?, municipio = ?, comuna = ?, uor_codigo = ?, diretor = ?, subdiretor_pedagogico = ?, subdiretor_administrativo = ?, total_subdirectores = ?, chefe_secretaria = ?, nivel_ensino = ?, classes_leccionadas = ?, num_areas_saber = ?, areas_saber = ?, curso_basico = ?, cursos_ministrados = ?, zona_geografica = ?, num_salas = ?, num_turmas = ?, num_turnos = ?, num_alunos_salas = ?, total_alunos = ?, num_decreto_executivo = ?, coordenadores_classe_disciplina = ?, total_coordenadores = ?, pessoal_docente = ?, pessoal_administrativo = ?, pessoal_auxiliar = ?, total_trabalhadores = ?, coordenador_turno = ?, coordenador_educacao_fisica = ?, coordenador_curso = ?, carreira_enfermagem = ?, tecnico_terapeutico = ?, pessoal_tecnico = ?, bairro = ?, endereco = ?, telefone = ?, email = ?, num_professores = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [
      codigo,
      nome,
      provincia || "",
      municipio || "",
      comuna || "",
      uor_codigo || "",
      diretor || "",
      subdiretor_pedagogico || "",
      subdiretor_administrativo || "",
      total_subdirectores || null,
      chefe_secretaria || "",
      nivel_ensino || "",
      classes_leccionadas || "",
      num_areas_saber || null,
      areas_saber || "",
      curso_basico || "",
      cursos_ministrados || "",
      zona_geografica || "",
      num_salas || null,
      num_turmas || null,
      num_turnos || null,
      num_alunos_salas || null,
      total_alunos || null,
      num_decreto_executivo || "",
      coordenadores_classe_disciplina || null,
      total_coordenadores || null,
      pessoal_docente || null,
      pessoal_administrativo || null,
      pessoal_auxiliar || null,
      total_trabalhadores || null,
      coordenador_turno || "",
      coordenador_educacao_fisica || "",
      coordenador_curso || "",
      carreira_enfermagem || null,
      tecnico_terapeutico || null,
      pessoal_tecnico || null,
      bairro || "",
      endereco || "",
      telefone || "",
      email || "",
      num_professores || null,
      estado || "",
      id
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar escola:", err);
        return res.status(500).json({ message: "Erro ao atualizar escola" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Escola não encontrada" });
      }
      res.json({ message: "Escola atualizada com sucesso" });
    }
  );
});

router.delete("/:id", authenticate, authorize("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID inválido" });
  }

  db.run("DELETE FROM escolas WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao eliminar escola:", err);
      return res.status(500).json({ message: "Erro ao eliminar escola" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Escola não encontrada" });
    }
    res.json({ message: "Escola eliminada com sucesso" });
  });
});

module.exports = router;
