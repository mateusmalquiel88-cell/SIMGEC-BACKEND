const request = require('supertest');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { expect } = require('chai');

const TEST_DB = path.join(__dirname, 'temp-core-api.db');

function cleanupTestDb() {
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
}

describe('SIMGEC API - Core integration', function () {
  this.timeout(30000);

  let app;
  let db;
  let token;

  before(async () => {
    cleanupTestDb();
    process.env.DATABASE_PATH = TEST_DB;
    delete require.cache[require.resolve('../db')];
    delete require.cache[require.resolve('../server')];
    db = require('../db');
    app = require('../server');

    await new Promise((resolve, reject) => {
      // Ensure the default admin user exists before tests run.
      db.get('SELECT * FROM users WHERE email = ?', ['marotheus.mora'], (err, user) => {
        if (err) return reject(err);
        if (user) return resolve();

        const bcrypt = require('bcryptjs');
        bcrypt.hash('M@iqueias318565', 10, (hashErr, hashedPassword) => {
          if (hashErr) return reject(hashErr);
          db.run(
            'INSERT OR IGNORE INTO users (email, password, role, escola) VALUES (?, ?, ?, ?)',
            ['marotheus.mora', hashedPassword, 'admin', 'Todas'],
            (insertErr) => {
              if (insertErr) {
                if (insertErr.message.includes('UNIQUE')) {
                  return resolve();
                }
                return reject(insertErr);
              }
              resolve();
            }
          );
        });
      });
    });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'marotheus.mora', password: 'M@iqueias318565' })
      .expect(200);

    token = loginRes.body.token;
    expect(token).to.be.a('string');
    // Server should set HttpOnly cookie for browser sessions
    expect(loginRes.headers).to.have.property('set-cookie');
    expect(loginRes.headers['set-cookie'].some(h => h.includes('simgc_token='))).to.be.true;
  });

  after((done) => {
    if (db) {
      db.close(() => {
        cleanupTestDb();
        done();
      });
    } else {
      cleanupTestDb();
      done();
    }
  });

  it('should respond to health check', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).to.have.property('status', 'ok');
  });

  it('should reject unauthenticated access to protected routes', async () => {
    await request(app).get('/alunos').expect(401);
    await request(app).get('/escolas').expect(401);
    await request(app).get('/chat-api/history').expect(401);
  });

  it('should verify token successfully', async () => {
    const res = await request(app)
      .get('/auth/verify')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).to.have.property('valid', true);
    expect(res.body).to.have.property('user');
    expect(res.body.user).to.include({ email: 'marotheus.mora', role: 'admin' });
  });

  it('should allow admin to create and list escolas', async () => {
    const newSchool = {
      codigo: 'TEST123',
      nome: 'Escola de Teste',
      provincia: 'Luanda',
      municipio: 'Belas',
      comuna: 'Talatona',
      uor_codigo: 'UOR123',
      diretor: 'Diretor Teste',
      subdiretor_pedagogico: 'SubP Teste',
      subdiretor_administrativo: 'SubA Teste',
      total_subdirectores: 2,
      chefe_secretaria: 'Chefe',
      nivel_ensino: 'Secundário',
      classes_leccionadas: 'A, B',
      num_areas_saber: 3,
      areas_saber: 'Matemática, Física, Química',
      curso_basico: 'Não',
      cursos_ministrados: 'Ciências',
      zona_geografica: 'Urbana',
      num_salas: 10,
      num_turmas: 12,
      num_turnos: 2,
      num_alunos_salas: 25,
      total_alunos: 300,
      num_decreto_executivo: '123/2026',
      coordenadores_classe_disciplina: 1,
      total_coordenadores: 4,
      pessoal_docente: 20,
      pessoal_administrativo: 5,
      pessoal_auxiliar: 8,
      total_trabalhadores: 33,
      coordenador_turno: 'Coord Turno',
      coordenador_educacao_fisica: 'Coord EF',
      coordenador_curso: 'Coord Curso',
      carreira_enfermagem: 0,
      tecnico_terapeutico: 0,
      pessoal_tecnico: 2,
      bairro: 'Bairro Teste',
      endereco: 'Rua dos Testes',
      telefone: '222333444',
      email: 'teste@escola.com',
      num_professores: 20,
      estado: 'ativo'
    };

    const createRes = await request(app)
      .post('/escolas')
      .set('Authorization', `Bearer ${token}`)
      .send(newSchool)
      .expect(201);

    expect(createRes.body).to.have.property('message', 'Escola criada com sucesso');
    expect(createRes.body).to.have.property('id').that.is.a('number');

    const listRes = await request(app)
      .get('/escolas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listRes.body).to.have.property('data').that.is.an('array');
    expect(listRes.body.data.some((item) => item.codigo === 'TEST123')).to.be.true;
  });

  it('should allow admin to create and list alunos', async () => {
    const alunoData = {
      nome: 'João Teste',
      idade: 16,
      turma: 'A1',
      escola: 'Escola de Teste'
    };

    const createRes = await request(app)
      .post('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .send(alunoData)
      .expect(201);

    expect(createRes.body).to.have.property('message', 'Aluno criado com sucesso');
    expect(createRes.body).to.have.property('aluno');
    expect(createRes.body.aluno).to.include({ nome: 'João Teste', idade: 16, turma: 'A1', escola: 'Escola de Teste' });

    const listRes = await request(app)
      .get('/alunos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listRes.body).to.be.an('array');
    expect(listRes.body.some((item) => item.nome === 'João Teste')).to.be.true;
  });

  it('should require token for chat endpoints', async () => {
    await request(app)
      .post('/chat-api/message')
      .send({ message: 'Olá' })
      .expect(401);

    await request(app)
      .post('/chat-api/clear')
      .expect(401);
  });
});
