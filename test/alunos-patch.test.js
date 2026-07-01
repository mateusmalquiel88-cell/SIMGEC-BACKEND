const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const TEST_DB = path.join(__dirname, 'temp-alunos-patch.db');

function cleanupTestDb() {
  if (fs.existsSync(TEST_DB)) {
    try {
      fs.unlinkSync(TEST_DB);
    } catch (err) {
      // pode estar em uso por outra instancia; ignorar para não falhar os testes
    }
  }
}

describe('Alunos PATCH endpoint', function () {
  this.timeout(20000);

  let app;
  let db;
  let token;
  let createdAlunoId;

  before(async () => {
    cleanupTestDb();
    process.env.DATABASE_PATH = TEST_DB;
    delete require.cache[require.resolve('../db')];
    delete require.cache[require.resolve('../server')];
    db = require('../db');
    app = require('../server');

    // Ensure admin user
    await new Promise((resolve, reject) => {
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
              if (insertErr) return reject(insertErr);
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

    // create a school
    const school = { codigo: 'PTCH001', nome: 'Escola Patch', provincia: 'Prov', municipio: 'Mun', bairro: 'Bai', endereco: 'Rua', estado: 'ativo' };
    await request(app).post('/escolas').set('Authorization', `Bearer ${token}`).send(school).expect(201);

    // create aluno
    const aluno = { nome: 'Aluno Patch', idade: 15, turma: 'B1', escola: 'Escola Patch' };
    const createRes = await request(app).post('/alunos').set('Authorization', `Bearer ${token}`).send(aluno).expect(201);
    createdAlunoId = createRes.body.aluno.id;
  });

  after((done) => {
    // Não fechamos a conexão global do DB aqui para evitar interferir noutros testes
    cleanupTestDb();
    done();
  });

  it('should partially update aluno nome via PATCH', async () => {
    const patchData = { nome: 'Aluno Atualizado' };

    const res = await request(app)
      .patch(`/alunos/${createdAlunoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(patchData)
      .expect(200);

    expect(res.body).to.have.property('message').that.includes('atualizado');
    expect(res.body).to.have.property('aluno');
    expect(res.body.aluno).to.include({ nome: 'Aluno Atualizado' });
  });
});
