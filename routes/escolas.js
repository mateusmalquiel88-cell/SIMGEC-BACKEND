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
    const searchTerm = `%${req.query.q.trim().toLowerCase()}%`;
    query += ` AND (LOWER(codigo) LIKE ? OR LOWER(nome) LIKE ? OR LOWER(municipio) LIKE ? OR LOWER(comuna) LIKE ? OR LOWER(provincia) LIKE ? OR LOWER(uor_codigo) LIKE ?)`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Filtros específicos por campo
  if (req.query.provincia) {
    query += ` AND LOWER(provincia) LIKE ?`;
    params.push(`%${req.query.provincia.trim().toLowerCase()}%`);
  }
  if (req.query.municipio) {
    query += ` AND LOWER(municipio) LIKE ?`;
    params.push(`%${req.query.municipio.trim().toLowerCase()}%`);
  }
  if (req.query.comuna) {
    query += ` AND LOWER(comuna) LIKE ?`;
    params.push(`%${req.query.comuna.trim().toLowerCase()}%`);
  }
  if (req.query.nivel_ensino) {
    query += ` AND LOWER(nivel_ensino) LIKE ?`;
    params.push(`%${req.query.nivel_ensino.trim().toLowerCase()}%`);
  }
  if (req.query.zona_geografica) {
    query += ` AND LOWER(zona_geografica) LIKE ?`;
    params.push(`%${req.query.zona_geografica.trim().toLowerCase()}%`);
  }
  if (req.query.estado) {
    query += ` AND LOWER(estado) LIKE ?`;
    params.push(`%${req.query.estado.trim().toLowerCase()}%`);
  }
  if (req.query.diretor) {
    query += ` AND LOWER(diretor) LIKE ?`;
    params.push(`%${req.query.diretor.trim().toLowerCase()}%`);
  }
  if (req.query.chefe_secretaria) {
    query += ` AND LOWER(chefe_secretaria) LIKE ?`;
    params.push(`%${req.query.chefe_secretaria.trim().toLowerCase()}%`);
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
      const searchTerm = `%${req.query.q.trim().toLowerCase()}%`;
      countQuery += ` AND (LOWER(codigo) LIKE ? OR LOWER(nome) LIKE ? OR LOWER(municipio) LIKE ? OR LOWER(comuna) LIKE ? OR LOWER(provincia) LIKE ? OR LOWER(uor_codigo) LIKE ?)`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (req.query.provincia) {
      countQuery += ` AND LOWER(provincia) LIKE ?`;
      countParams.push(`%${req.query.provincia.trim().toLowerCase()}%`);
    }
    if (req.query.municipio) {
      countQuery += ` AND LOWER(municipio) LIKE ?`;
      countParams.push(`%${req.query.municipio.trim().toLowerCase()}%`);
    }
    if (req.query.comuna) {
      countQuery += ` AND LOWER(comuna) LIKE ?`;
      countParams.push(`%${req.query.comuna.trim().toLowerCase()}%`);
    }
    if (req.query.nivel_ensino) {
      countQuery += ` AND LOWER(nivel_ensino) LIKE ?`;
      countParams.push(`%${req.query.nivel_ensino.trim().toLowerCase()}%`);
    }
    if (req.query.zona_geografica) {
      countQuery += ` AND LOWER(zona_geografica) LIKE ?`;
      countParams.push(`%${req.query.zona_geografica.trim().toLowerCase()}%`);
    }
    if (req.query.estado) {
      countQuery += ` AND LOWER(estado) LIKE ?`;
      countParams.push(`%${req.query.estado.trim().toLowerCase()}%`);
    }
    if (req.query.diretor) {
      countQuery += ` AND LOWER(diretor) LIKE ?`;
      countParams.push(`%${req.query.diretor.trim().toLowerCase()}%`);
    }
    if (req.query.chefe_secretaria) {
      countQuery += ` AND LOWER(chefe_secretaria) LIKE ?`;
      countParams.push(`%${req.query.chefe_secretaria.trim().toLowerCase()}%`);
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

// Endpoint de importação Excel
router.post("/import/excel", authenticate, authorize("admin"), async (req, res) => {
  const fs = require("fs");
  const path = require("path");
  const xlsx = require("xlsx");

  try {
    const filePath = path.join(__dirname, "..", "07 - Cubal  - Criação e Recriação de Escolas.xlsx");
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Ficheiro Excel não encontrado" });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Ficheiro Excel vazio" });
    }

    const campos = [
      "CÓDIGO", "ESCOLA", "DESIGNAÇÃO DA ESCOLA", "DIRECTOR", "SUBP",
      "SUBA", "PROVÍNCIA", "MUNICÍPIO", "COMUNA", "BAIRRO", "ENDEREÇO",
      "TELEFONE", "EMAIL", "NÍVEL DE ENSINO", "Nº DE SALAS", " Nº DE TURMAS",
      "TOTAL DE ALUNOS", "TOTAL DE DOCENTE", "ESTADO"
    ];

    function normalizeRowKeys(row) {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        if (!key) return;
        normalized[String(key).trim().toLowerCase()] = row[key];
      });
      return normalized;
    }

    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) { try { fs.mkdirSync(logsDir); } catch (e) {} }

    const autoApply = req.query && (req.query.autoApply === '1' || req.query.autoApply === 'true');

    async function runImport(dryFlag) {
      const promisesLocal = [];
      const errosLocal = [];
      const simulatedLocal = [];

      data.forEach((row, index) => {
        try {
          const normalizedRow = normalizeRowKeys(row);
          const mappedData = {
            codigo: normalizedRow["código"] || normalizedRow["codigo"] || normalizedRow["escola código"] || normalizedRow["uor_codigo"] || `ESCLA_${Date.now()}_${index}`,
            nome: normalizedRow["escola"] || normalizedRow["designação da escola"] || normalizedRow["designação escola"] || normalizedRow["nome da escola"] || normalizedRow["nome escola"] || normalizedRow["school"] || null,
            diretor: normalizedRow["director"] || normalizedRow["diretor"] || null,
            subdiretor_pedagogico: normalizedRow["subp"] || normalizedRow["subdiretor pedagógico"] || normalizedRow["subdiretor pedagogico"] || null,
            subdiretor_administrativo: normalizedRow["suba"] || normalizedRow["subdiretor administrativo"] || null,
            municipio: normalizedRow["município"] || normalizedRow["municipio"] || null,
            comuna: normalizedRow["comuna"] || null,
            bairro: normalizedRow["bairro"] || null,
            endereco: normalizedRow["endereço"] || normalizedRow["endereco"] || null,
            telefone: normalizedRow["telefone"] || null,
            email: normalizedRow["email"] || null,
            nivel_ensino: normalizedRow["nível de ensino"] || normalizedRow["nivel de ensino"] || null,
            num_salas: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow["nº de salas"] || normalizedRow["num salas"] || normalizedRow["nº salas"] || normalizedRow["numero de salas"] || normalizedRow["total de salas"]),
            num_turmas: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow["nº de turmas"] || normalizedRow["num turmas"] || normalizedRow["nº turmas"] || normalizedRow["numero de turmas"] || normalizedRow["total de turmas"]),
            total_alunos: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow["total de alunos"] || normalizedRow["nº de alunos"] || normalizedRow["num alunos"] || normalizedRow["nº de alunos/salas"] || normalizedRow["numero de alunos"]),
            num_professores: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow["total de docente"] || normalizedRow["pessoal docente"] || normalizedRow["nº professores"] || normalizedRow["num professores"] || normalizedRow["professores"]),
            estado: normalizedRow["estado"] || "ativo"
          };

          if (!mappedData.nome) {
            errosLocal.push(`Linha ${index + 1}: Nome da escola obrigatório`);
            return;
          }

          if (dryFlag) {
            simulatedLocal.push({ linha: index + 1, dados: mappedData });
            promisesLocal.push(Promise.resolve({ success: true, simulated: true }));
          } else {
            const p = new Promise((resolve) => {
              db.run(
                `INSERT INTO escolas (codigo, nome, diretor, subdiretor_pedagogico, subdiretor_administrativo, municipio, comuna, bairro, endereco, telefone, email, nivel_ensino, num_salas, num_turmas, total_alunos, num_professores, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(codigo) DO UPDATE SET
                   nome=excluded.nome,
                   diretor=excluded.diretor,
                   subdiretor_pedagogico=excluded.subdiretor_pedagogico,
                   subdiretor_administrativo=excluded.subdiretor_administrativo,
                   municipio=excluded.municipio,
                   comuna=excluded.comuna,
                   bairro=excluded.bairro,
                   endereco=excluded.endereco,
                   telefone=excluded.telefone,
                   email=excluded.email,
                   nivel_ensino=excluded.nivel_ensino,
                   num_salas=excluded.num_salas,
                   num_turmas=excluded.num_turmas,
                   total_alunos=excluded.total_alunos,
                   num_professores=excluded.num_professores,
                   estado=excluded.estado,
                   updated_at=CURRENT_TIMESTAMP`,
                [mappedData.codigo, mappedData.nome, mappedData.diretor, mappedData.subdiretor_pedagogico, mappedData.subdiretor_administrativo, mappedData.municipio, mappedData.comuna, mappedData.bairro, mappedData.endereco, mappedData.telefone, mappedData.email, mappedData.nivel_ensino, mappedData.num_salas, mappedData.num_turmas, mappedData.total_alunos, mappedData.num_professores, mappedData.estado],
                function(err) {
                  if (err) {
                    errosLocal.push(`Linha ${index + 1}: ${err.message}`);
                    return resolve({ success: false });
                  }
                  return resolve({ success: true });
                }
              );
            });
            promisesLocal.push(p);
          }
        } catch (err) {
          errosLocal.push(`Linha ${index + 1}: ${err.message}`);
        }
      });

      const resultsLocal = await Promise.all(promisesLocal);
      const importadosLocal = resultsLocal.filter(r => r && r.success).length;
      return { importados: importadosLocal, total: data.length, erros: errosLocal, simulated: simulatedLocal };
    }

    if (autoApply) {
      // primeiro dry-run
      const dryResult = await runImport(true);
      const timestampDry = new Date().toISOString().replace(/[:.]/g, '-');
      const dryLogFile = path.join(logsDir, `import-escolas-dry-${timestampDry}.json`);
      fs.writeFileSync(dryLogFile, JSON.stringify({ timestamp: new Date().toISOString(), user: req.user && req.user.email ? req.user.email : null, dry: true, file: filePath, ...dryResult }, null, 2));

      // em seguida aplicar de verdade
      const realResult = await runImport(false);
      const timestampReal = new Date().toISOString().replace(/[:.]/g, '-');
      const realLogFile = path.join(logsDir, `import-escolas-apply-${timestampReal}.json`);
      fs.writeFileSync(realLogFile, JSON.stringify({ timestamp: new Date().toISOString(), user: req.user && req.user.email ? req.user.email : null, dry: false, file: filePath, ...realResult }, null, 2));

      try { db.run('INSERT INTO audit_log (user_email, action, resource) VALUES (?, ?, ?)', [req.user && req.user.email ? req.user.email : 'unknown', `import_excel:autoApply`, filePath]); } catch (e) {}

      return res.json({ message: 'Importação autoApply completa', dry: dryResult, applied: realResult });
    } else {
      const dry = (req.query && (req.query.dry === '1' || req.query.dry === 'true')) || false;
      const result = await runImport(dry);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = path.join(logsDir, `import-escolas-${dry? 'dry' : 'run'}-${timestamp}.json`);
      fs.writeFileSync(logFile, JSON.stringify({ timestamp: new Date().toISOString(), user: req.user && req.user.email ? req.user.email : null, dry: dry, file: filePath, ...result }, null, 2));
      try { db.run('INSERT INTO audit_log (user_email, action, resource) VALUES (?, ?, ?)', [req.user && req.user.email ? req.user.email : 'unknown', `import_excel:${dry? 'dry' : 'run'}`, filePath]); } catch (e) {}
      return res.json({ message: 'Importação completada', importados: result.importados, total: result.total, erros: result.erros });
    }
  } catch (err) {
    console.error("Erro ao importar Excel:", err);
    res.status(500).json({ message: "Erro ao importar ficheiro", erro: err.message });
  }
});

// Endpoint: reprocessar apenas códigos faltantes do mesmo ficheiro Excel
router.post("/import/excel/reprocess-missing", authenticate, authorize("admin"), async (req, res) => {
  const fs = require("fs");
  const path = require("path");
  const xlsx = require("xlsx");

  try {
    const filePath = path.join(__dirname, "..", "07 - Cubal  - Criação e Recriação de Escolas.xlsx");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Ficheiro Excel não encontrado" });
    }

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    if (!data || data.length === 0) {
      return res.status(400).json({ message: "Ficheiro Excel vazio" });
    }

    function normalizeRowKeys(row) {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        if (!key) return;
        normalized[String(key).trim().toLowerCase()] = row[key];
      });
      return normalized;
    }

    // extrair códigos do Excel
    const excelMap = new Map();
    data.forEach((row, idx) => {
      const nr = normalizeRowKeys(row);
      const code = nr['código'] || nr['codigo'] || nr['escola código'] || nr['uor_codigo'] || null;
      if (code) excelMap.set(String(code).trim(), { row, idx });
    });

    const codes = Array.from(excelMap.keys());
    if (codes.length === 0) {
      return res.json({ message: 'Nenhum código encontrado no Excel', total: 0 });
    }

    // consultar DB para ver quais já existem
    const placeholders = codes.map(() => '?').join(',');
    const existing = await new Promise((resolve, reject) => {
      db.all(`SELECT codigo FROM escolas WHERE codigo IN (${placeholders})`, codes, (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(r => String(r.codigo)));
      });
    });

    const existingSet = new Set(existing);
    const missing = codes.filter(c => !existingSet.has(c));

    // preparar inserções apenas para faltantes
    const dry = (req.query && (req.query.dry === '1' || req.query.dry === 'true')) || false;
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) { try { fs.mkdirSync(logsDir); } catch (e) {} }

    const promises = [];
    const erros = [];
    const simulated = [];

    missing.forEach((code) => {
      const entry = excelMap.get(code);
      if (!entry) return;
      const { row, idx } = entry;
      const normalizedRow = normalizeRowKeys(row);
      const mappedData = {
        codigo: code,
        nome: normalizedRow['escola'] || normalizedRow['designação da escola'] || normalizedRow['nome da escola'] || normalizedRow['nome escola'] || null,
        diretor: normalizedRow['director'] || normalizedRow['diretor'] || null,
        subdiretor_pedagogico: normalizedRow['subp'] || normalizedRow['subdiretor pedagógico'] || null,
        subdiretor_administrativo: normalizedRow['suba'] || normalizedRow['subdiretor administrativo'] || null,
        municipio: normalizedRow['município'] || normalizedRow['municipio'] || null,
        comuna: normalizedRow['comuna'] || null,
        bairro: normalizedRow['bairro'] || null,
        endereco: normalizedRow['endereço'] || normalizedRow['endereco'] || null,
        telefone: normalizedRow['telefone'] || null,
        email: normalizedRow['email'] || null,
        nivel_ensino: normalizedRow['nível de ensino'] || normalizedRow['nivel de ensino'] || null,
        num_salas: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow['nº de salas'] || normalizedRow['num salas']),
        num_turmas: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow['nº de turmas'] || normalizedRow['num turmas']),
        total_alunos: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow['total de alunos'] || normalizedRow['num alunos']),
        num_professores: (function(v){const n=parseInt(v); return Number.isNaN(n)?null:n;})(normalizedRow['total de docente'] || normalizedRow['pessoal docente'] || normalizedRow['num professores']),
        estado: normalizedRow['estado'] || 'ativo'
      };

      if (!mappedData.nome) {
        erros.push(`Linha ${idx + 1}: Nome da escola obrigatório`);
        return;
      }

      if (dry) {
        simulated.push({ linha: idx + 1, dados: mappedData });
        promises.push(Promise.resolve({ success: true, simulated: true }));
      } else {
        promises.push(new Promise((resolve) => {
          db.run(`INSERT INTO escolas (codigo, nome, diretor, subdiretor_pedagogico, subdiretor_administrativo, municipio, comuna, bairro, endereco, telefone, email, nivel_ensino, num_salas, num_turmas, total_alunos, num_professores, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(codigo) DO UPDATE SET
              nome=excluded.nome,
              diretor=excluded.diretor,
              subdiretor_pedagogico=excluded.subdiretor_pedagogico,
              subdiretor_administrativo=excluded.subdiretor_administrativo,
              municipio=excluded.municipio,
              comuna=excluded.comuna,
              bairro=excluded.bairro,
              endereco=excluded.endereco,
              telefone=excluded.telefone,
              email=excluded.email,
              nivel_ensino=excluded.nivel_ensino,
              num_salas=excluded.num_salas,
              num_turmas=excluded.num_turmas,
              total_alunos=excluded.total_alunos,
              num_professores=excluded.num_professores,
              estado=excluded.estado,
              updated_at=CURRENT_TIMESTAMP`,
            [mappedData.codigo, mappedData.nome, mappedData.diretor, mappedData.subdiretor_pedagogico, mappedData.subdiretor_administrativo, mappedData.municipio, mappedData.comuna, mappedData.bairro, mappedData.endereco, mappedData.telefone, mappedData.email, mappedData.nivel_ensino, mappedData.num_salas, mappedData.num_turmas, mappedData.total_alunos, mappedData.num_professores, mappedData.estado],
            function(err) {
              if (err) { erros.push(`Código ${code}: ${err.message}`); return resolve({ success: false }); }
              return resolve({ success: true });
            }
          );
        }));
      }
    });

    const results = await Promise.all(promises);
    const importados = results.filter(r => r && r.success).length;

    // salvar log
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = path.join(logsDir, `reprocess-escolas-${timestamp}.json`);
      const logObj = { timestamp: new Date().toISOString(), user: req.user && req.user.email ? req.user.email : null, dry: dry, file: filePath, total_codes: codes.length, missing: missing.length, importados, erros, simulated: simulated.slice(0,20) };
      fs.writeFileSync(logFile, JSON.stringify(logObj, null, 2));
      try { db.run('INSERT INTO audit_log (user_email, action, resource) VALUES (?, ?, ?)', [req.user && req.user.email ? req.user.email : 'unknown', `reprocess_missing:${dry? 'dry' : 'run'}`, filePath]); } catch (e) {}
    } catch (e) { console.error('Erro ao escrever log reprocess:', e); }

    res.json({ message: 'Reprocessamento concluído', total_codes: codes.length, missing: missing.length, importados, erros });
  } catch (err) {
    console.error('Erro reprocessamento:', err);
    res.status(500).json({ message: 'Erro no reprocessamento', erro: err.message });
  }
});

router.get('/import/logs', authenticate, authorize('admin'), (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, '..', 'logs');

  if (!fs.existsSync(logsDir)) {
    return res.json({ logs: [] });
  }

  const files = fs.readdirSync(logsDir)
    .filter((file) => file.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a));

  res.json({ logs: files });
});

router.get('/import/logs/:fileName', authenticate, authorize('admin'), (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, '..', 'logs');
  const { fileName } = req.params;

  if (!fileName || fileName.includes('..') || !fileName.endsWith('.json')) {
    return res.status(400).json({ message: 'Nome de ficheiro inválido' });
  }

  const filePath = path.join(logsDir, fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Ficheiro de log não encontrado' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.type('application/json').send(content);
  } catch (err) {
    console.error('Erro a ler ficheiro de log:', err);
    res.status(500).json({ message: 'Erro ao ler ficheiro de log' });
  }
});

module.exports = router;
