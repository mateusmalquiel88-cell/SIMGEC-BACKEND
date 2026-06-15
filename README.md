# SIMGEC Backend

API backend em Node.js/Express para gestão de alunos com suporte a SQL, autenticação e dashboard em tempo real.

## Visão geral

- Backend em `Express`.
- Persistência em `SQLite` com arquivo `simgec.db`.
- Validação de entrada com `Joi`.
- Autenticação JWT em `/auth/login` e `/auth/register`.
- Importação Excel de escolas em `/escolas/import/excel` e logs em `/escolas/import/logs`.
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

## Testes

- `npm test` — executa toda a suíte de integração em `test/*.test.js`
- `npm run test:db` — executa apenas o teste de banco temporário em `test/import-db.test.js`

> O teste de banco temporário usa uma cópia isolada de `simgec.db` para não alterar os dados reais.

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

### Importação de escolas via Excel

> Pré-requisito: o ficheiro Excel deve estar presente na raiz do projeto com o nome exato `07 - Cubal  - Criação e Recriação de Escolas.xlsx`.

- `POST /escolas/import/excel?dry=true`
  - Requer `Authorization: Bearer <token>` com usuário `admin`.
  - Executa uma simulação de importação sem gravar no banco.
  - Gera log em `logs/import-escolas-dry-*.json`.
  - Exemplo:

    ```bash
    curl -X POST "http://localhost:3000/escolas/import/excel?dry=true" \
      -H "Authorization: Bearer <TOKEN>"
    ```

- `POST /escolas/import/excel`
  - Requer `Authorization: Bearer <token>` com usuário `admin`.
  - Executa a importação real do arquivo Excel padrão.
  - Gera log em `logs/import-escolas-run-*.json`.
  - Exemplo:

    ```bash
    curl -X POST "http://localhost:3000/escolas/import/excel" \
      -H "Authorization: Bearer <TOKEN>"
    ```

- `POST /escolas/import/excel?autoApply=true`
  - Requer `Authorization: Bearer <token>` com usuário `admin`.
  - Executa primeiro dry-run e depois grava os dados reais.
  - Gera dois logs separados: dry e apply.
  - Exemplo:

    ```bash
    curl -X POST "http://localhost:3000/escolas/import/excel?autoApply=true" \
      -H "Authorization: Bearer <TOKEN>"
    ```

- `POST /escolas/import/excel/reprocess-missing`
  - Requer `Authorization: Bearer <token>` com usuário `admin`.
  - Reprocessa apenas os códigos faltantes no banco para o arquivo Excel padrão.
  - Exemplo:

    ```bash
    curl -X POST "http://localhost:3000/escolas/import/excel/reprocess-missing" \
      -H "Authorization: Bearer <TOKEN>"
    ```

- `GET /escolas/import/logs`
  - Lista os arquivos de log gerados pelos fluxos de importação.
  - Exemplo:

    ```bash
    curl -H "Authorization: Bearer <TOKEN>" \
      http://localhost:3000/escolas/import/logs
    ```

- `GET /escolas/import/logs/:fileName`
  - Retorna o conteúdo JSON de um log específico.
  - Exemplo:

    ```bash
    curl -H "Authorization: Bearer <TOKEN>" \
      http://localhost:3000/escolas/import/logs/<NOME_DO_ARQUIVO>.json
    ```

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

## Deploy com Docker

O projeto inclui um `Dockerfile` e um `docker-compose.yml` para executar a aplicação em container.

### Usar Docker diretamente

```bash
cd "c:\Users\us\OneDrive\Documentos\SIMGEC-BACKEND"
docker build -t simgec-backend .
docker run -p 3000:3000 -e JWT_SECRET="uma_senha_segura" -e DATABASE_PATH="/usr/src/app/data/simgec.db" simgec-backend
```

### Usar Docker Compose

```bash
cd "c:\Users\us\OneDrive\Documentos\SIMGEC-BACKEND"
docker compose up --build
```

O serviço será exposto em `http://localhost:3000`.

### Atalhos npm para Docker

```bash
npm run docker:build  # Build do container
npm run docker:up     # Start com docker-compose
npm run docker:down   # Parar serviços
npm run docker:logs   # Ver logs ao vivo
```

### Arquivo de ambiente

Copie o exemplo para `.env` e ajuste os segredos:

```bash
cp .env.example .env
```

Edite `.env` e defina pelo menos:

- `JWT_SECRET`
- `DATABASE_PATH`
- `NODE_ENV=production`

### Notas de produção

- Atualize `docker-compose.yml` para usar um `JWT_SECRET` forte.
- Use volumes para armazenar `data` e `logs` fora do container.
- Proteja o arquivo `simgec.db` e defina permissões adequadas no host.
