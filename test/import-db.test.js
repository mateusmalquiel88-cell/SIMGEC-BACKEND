const request = require('supertest');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { expect } = require('chai');

let app;
let db;
const TEST_DB = path.join(__dirname, 'temp-simgc.db');
const ORIGINAL_DB = path.join(__dirname, '..', 'simgec.db');

function copyTestDb() {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  if (fs.existsSync(ORIGINAL_DB)) {
    fs.copyFileSync(ORIGINAL_DB, TEST_DB);
  } else {
    fs.writeFileSync(TEST_DB, '');
  }
}

function cleanupTestDb() {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
}

describe('Importação Excel - banco temporário', function() {
  this.timeout(60000);
  let token;

  before((done) => {
    copyTestDb();
    process.env.DATABASE_PATH = 'test/temp-simgc.db';
<<<<<<< HEAD
    delete require.cache[require.resolve('../config')];
    delete require.cache[require.resolve('../db')];
    delete require.cache[require.resolve('../server')];
    delete require.cache[require.resolve('../routes/auth')];
    delete require.cache[require.resolve('../routes/escolas')];
    delete require.cache[require.resolve('../routes/alunos')];
    delete require.cache[require.resolve('../routes/analytics')];
    delete require.cache[require.resolve('../routes/admin')];
    delete require.cache[require.resolve('../routes/chat')];
=======
    delete require.cache[require.resolve('../config')];
    delete require.cache[require.resolve('../db')];
    delete require.cache[require.resolve('../server')];
    delete require.cache[require.resolve('../routes/auth')];
    delete require.cache[require.resolve('../routes/escolas')];
    delete require.cache[require.resolve('../routes/alunos')];
    delete require.cache[require.resolve('../routes/analytics')];
    delete require.cache[require.resolve('../routes/admin')];
    delete require.cache[require.resolve('../routes/chat')];
>>>>>>> cb63e0d (Improve escolas Excel import use upsert preserve updated_at align tests and docs)
    db = require('../db');
    app = require('../server');

    request(app)
      .post('/auth/login')
      .send({ email: 'marotheus.mora', password: 'M@iqueias318565' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        token = res.body.token;
        done();
      });
  });

  after((done) => {
    if (db) db.close(() => cleanupTestDb() || done());
    else cleanupTestDb() && done();
  });

  it('POST /escolas/import/excel?dry=true não altera o DB', async () => {
    const beforeCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM escolas', [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });

    const res = await request(app)
      .post('/escolas/import/excel?dry=true')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('importados').that.is.a('number');

    const afterCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM escolas', [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });

    expect(afterCount).to.equal(beforeCount);
  });

  it('POST /escolas/import/excel deve gravar no DB', async () => {
    const beforeCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM escolas', [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });

    const res = await request(app)
      .post('/escolas/import/excel')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('importados').that.is.a('number');

    const afterCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM escolas', [], (err, row) => {
        if (err) return reject(err);
        resolve(row.count);
      });
    });

    expect(afterCount).to.be.at.least(beforeCount);
  });

  it('POST /escolas/import/excel/reprocess-missing deve processar faltantes no DB', async () => {
    const res = await request(app)
      .post('/escolas/import/excel/reprocess-missing')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('importados').that.is.a('number');
    expect(res.body).to.have.property('missing').that.is.a('number');
    expect(res.body).to.have.property('total_codes').that.is.a('number');
  });

  it('GET /escolas/import/logs deve listar logs de importação após dry-run', async () => {
    const dryRes = await request(app)
      .post('/escolas/import/excel?dry=true')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(dryRes.status).to.equal(200);

    const logsRes = await request(app)
      .get('/escolas/import/logs')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(logsRes.status).to.equal(200);
    expect(logsRes.body).to.have.property('logs').that.is.an('array');
    expect(logsRes.body.logs.length).to.be.greaterThan(0);

    const fileName = logsRes.body.logs[0];
    const logRes = await request(app)
      .get(`/escolas/import/logs/${encodeURIComponent(fileName)}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(logRes.status).to.equal(200);
    expect(logRes.headers['content-type']).to.match(/application\/json/);
    expect(() => JSON.parse(logRes.text)).to.not.throw();
  });
});
