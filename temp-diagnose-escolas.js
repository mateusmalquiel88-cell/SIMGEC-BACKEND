const request = require('supertest');
const app = require('./server');
(async function () {
  try {
    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'marotheus.mora', password: 'M@iqueias318565' });
    console.log('login status', login.status, login.body);
    const res = await request(app)
      .post('/escolas')
      .set('Authorization', 'Bearer ' + login.body.token)
      .send({
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
        email: 'teste@escola.test',
        num_professores: 20,
        estado: 'ativo'
      });
    console.log('create status', res.status, res.body);
  } catch (err) {
    console.error(err);
  }
})();
