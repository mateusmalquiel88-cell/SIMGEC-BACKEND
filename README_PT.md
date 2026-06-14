# Resumo do Projeto SIMGEC Backend

Backend em Node.js/Express para gestão de alunos.

## O que faz
- Regista alunos com validação de dados.
- Guarda as informações em SQLite (`simgec.db`).
- Autentica utilizadores com JWT.
- Gera dashboard em tempo real com SSE (`/events`).
- Fornece métricas simples em `/analytics/summary`.

## Endpoints principais
- `POST /auth/login` - autentica utilizador e retorna token.
- `POST /auth/register` - regista novo utilizador.
- `GET /alunos` - lista todos os alunos.
- `GET /alunos/:id` - obtém aluno por ID.
- `POST /alunos` - cria um aluno (precisa de token).
- `PUT /alunos/:id` - atualiza aluno (precisa de token).
- `DELETE /alunos/:id` - remove aluno (precisa de token).
- `GET /analytics/summary` - mostra total de alunos e contagem por turma.
- `GET /events` - envia updates em tempo real para o dashboard.

## Admin padrão
- Utilizador: `marotheus.mora`
- Senha: `M@iqueias318565`

## Como executar
1. Instalar dependências:`npm install`
2. Iniciar o servidor:`npm start`
3. Aceder ao dashboard em `http://localhost:3000`

## Observações
- Use `JWT_SECRET` em produção.
- O projeto já cria um admin padrão se não existir.
- O dashboard actualiza automaticamente quando há alterações nos alunos.
