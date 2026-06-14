# SIMGEC Backend

API backend em Node.js/Express para gestão de alunos com suporte a SQL, autenticação e dashboard em tempo real.

## Visão geral

- Backend em `Express`.
- Persistência em `SQLite` com arquivo `simgec.db`.
- Validação de entrada com `Joi`.
- Autenticação JWT em `/auth/login` e `/auth/register`.
- Rotas de gestão de alunos em `/alunos`.
- Dashboard em tempo real por `SSE` em `/events`.
- Analytics em `/analytics/summary`.

## Dependências principais

- `express`
- `cors`
- `sqlite3`
- `joi`
- `jsonwebtoken`
- `bcryptjs`

## Instalação

No diretório do projeto:

```bash
npm install
```

> Se o PowerShell bloquear o `npm`, use `cmd.exe`:
>
> ```bash
> cmd /c "cd /d C:\Users\us\OneDrive\Documentos\SIMGEC-BACKEND && npm install"
> ```

## Execução

```bash
npm start
```

O servidor ficará disponível em `http://localhost:3000`.

## Usuário administrador padrão

- Usuário: `marotheus.mora`
- Senha: `M@iqueias318565`

## Endpoints

### Autenticação

- `POST /auth/login`
  - Body JSON: `{ "email": "marotheus.mora", "password": "M@iqueias318565" }`
  - Retorna token JWT.

- `POST /auth/register`
  - Body JSON: `{ "email": "user@example.com", "password": "senha123", "role": "operator" }`
  - Cria um novo usuário.

### Alunos

- `GET /alunos`
  - Lista todos os alunos.

- `GET /alunos/:id`
  - Retorna um aluno específico.

- `POST /alunos`
  - Requer cabeçalho `Authorization: Bearer <token>`.
  - Body JSON: `{ "nome": "João", "idade": 20, "turma": "A1" }`

- `PUT /alunos/:id`
  - Requer cabeçalho `Authorization: Bearer <token>`.
  - Atualiza aluno existente.

- `DELETE /alunos/:id`
  - Requer cabeçalho `Authorization: Bearer <token>`.
  - Remove aluno.

### Analytics

- `GET /analytics/summary`
  - Requer cabeçalho `Authorization: Bearer <token>`.
  - Retorna total de alunos e contagem por turma.

### Dashboard em tempo real

- `GET /events`
  - Fornece eventos SSE para o frontend atualizar automaticamente.

- `GET /`
  - Carrega o dashboard web estático em `public/dashboard.html`.

## Estrutura de arquivos

- `server.js` - configuração do Express e rotas principais.
- `db.js` - inicialização e configuração do banco SQLite.
- `routes/alunos.js` - rotas CRUD de alunos.
- `routes/auth.js` - rotas de autenticação.
- `routes/analytics.js` - rota de estatísticas.
- `events.js` - emissor de eventos para SSE.
- `middleware/auth.js` - middleware de autenticação JWT.
- `public/dashboard.html` - dashboard em tempo real.

## Observações

- O dashboard usa EventSource para atualizar a lista de alunos automaticamente quando há mudanças.
- O usuário admin padrão é criado se não existir.
- Para produção, defina `JWT_SECRET` em variáveis de ambiente e proteja o `simgec.db`.
