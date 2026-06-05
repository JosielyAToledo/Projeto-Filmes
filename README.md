# Catalogo7 - Projeto-Filmes 🎬

Sistema web full stack para uma locadora/catalogo de filmes. O projeto tem uma area administrativa para gerenciar filmes, usuarios, logs, exportacoes e relatorios, e uma area de usuario para navegar pelo catalogo, favoritar filmes e registrar avaliacoes.

O sistema foi desenvolvido para o trabalho de aplicacao web full stack, usando Node.js + Express no backend, HTML/CSS/JavaScript no frontend, MySQL como banco principal e MongoDB para logs.

## Link do sistema 🔗

- Aplicacao no Render: https://projeto-filmes.onrender.com
- Health check: https://projeto-filmes.onrender.com/health

## Principais recursos ✨

- Login, registro, logout e recuperacao de senha.
- Autenticacao com JWT.
- Painel administrativo.
- CRUD de filmes com upload de capa.
- Cadastro, edicao e exclusao de usuarios administradores.
- Listagem e controle de usuarios.
- Catalogo de filmes para usuario comum.
- Favoritos e avaliacoes de filmes.
- Busca e filtros por titulo, genero e status.
- Dashboard com totais do sistema.
- Graficos com Chart.js.
- Importacao de filmes por arquivo JSON.
- Exportacao de filmes em JSON.
- Exportacao de logs em XML, JSON e PDF.
- Relatorio PDF com filtros.
- Logs registrados no MongoDB.
- Integracao opcional com TMDB para capas e banners dos filmes.

## Tecnologias 🧰

Backend:

- Node.js
- Express
- MySQL2
- MongoDB com Mongoose
- JWT
- bcryptjs
- multer
- dotenv
- cors

Frontend:

- HTML5
- CSS3
- JavaScript
- Chart.js
- jsPDF

Infraestrutura:

- Render para hospedagem
- Railway MySQL
- MongoDB Atlas
- Cloudinary opcional para imagens
- TMDB opcional para imagens de filmes

## Arquitetura 🏗️

O backend foi organizado seguindo MVC com Service Layer, DAO, Router, Middlewares e Interfaces.

Estrutura principal:

```text
backend/
  src/
    config/
    controllers/
    dao/
    interfaces/
    middlewares/
    models/
    routes/
    services/
frontend/
  index.html
  script.js
  styles.css
database/
  schema.sql
  seed.sql
scripts/
  db-migrate.js
docs/
```

Responsabilidades:

- `controllers`: recebem as requisicoes e chamam os services.
- `services`: concentram as regras de negocio.
- `dao`: acessam o MySQL.
- `routes`: organizam as rotas por recurso.
- `middlewares`: autenticacao, validacao, logs, upload e tratamento de erros.
- `models`: modelos de referencia e schema MongoDB.
- `interfaces`: contratos base para DAO, Service e Controller.

## Bancos de dados 🗄️

O projeto usa dois bancos:

- MySQL: banco principal, usado para usuarios, clientes, generos, filmes, locacoes, favoritos e avaliacoes.
- MongoDB: usado para os logs da aplicacao.

Tabelas principais do MySQL:

- `usuarios`
- `clientes`
- `generos`
- `filmes`
- `locacoes`
- `itens_locacao`
- `avaliacoes_filmes`
- `favorito_filmes`

Relacionamentos importantes:

- 1:N entre generos e filmes.
- 1:N entre clientes e locacoes.
- 1:N entre usuarios e locacoes.
- N:N entre locacoes e filmes por `itens_locacao`.
- N:N entre usuarios e filmes por favoritos e avaliacoes.

O schema fica em:

```text
database/schema.sql
```

## Variaveis de ambiente ⚙️

Crie um arquivo `.env` baseado no `.env.example`.

Exemplo para rodar sem banco externo:

```env
PORT=3000
NODE_ENV=development
LOCAL_MODE=true
JWT_SECRET=troque_esta_chave_em_producao
JWT_EXPIRES_IN=1d
UPLOAD_DIR=backend/src/uploads
TMDB_API_KEY=
```

Exemplo para producao:

```env
PORT=3000
NODE_ENV=production
LOCAL_MODE=false

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=catalogo7

MONGODB_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

TMDB_API_KEY=

JWT_SECRET=
JWT_EXPIRES_IN=1d
UPLOAD_DIR=backend/src/uploads
```

Observacao: `.env` nao deve ser enviado para o GitHub.

## Como rodar localmente ▶️

Instale as dependencias:

```bash
npm install
```

Rode em modo desenvolvimento:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:3000
```

Usuario admin local:

```text
Login: admin
Senha: 123456
```

No Windows tambem existe o arquivo:

```text
Abrir-Projeto.bat
```

Ele inicia o servidor e abre o projeto no navegador.

## Rodar com MySQL e MongoDB 🧪

Configure o `.env` com `LOCAL_MODE=false` e preencha as credenciais do MySQL e MongoDB.

Execute a migracao:

```bash
npm run db:migrate
```

Se quiser inserir dados iniciais:

```bash
npm run db:seed
```

Depois rode:

```bash
npm run dev
```

## Scripts 📌

```bash
npm run dev
```

Inicia o backend com nodemon.

```bash
npm start
```

Inicia o backend com Node.

```bash
npm run db:migrate
```

Cria ou ajusta as tabelas no MySQL sem apagar dados existentes.

```bash
npm run db:seed
```

Insere dados iniciais para teste.

## Deploy 🚀

O deploy esta configurado para o Render.

No Render, as variaveis principais sao:

```env
LOCAL_MODE=false
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=1d
UPLOAD_DIR=backend/src/uploads
TMDB_API_KEY=
```

O arquivo `render.yaml` executa a migracao no build:

```bash
npm run db:migrate
```

Isso cria tabelas e colunas que estiverem faltando, sem usar `DROP TABLE`.

## Endpoints principais 📡

Autenticacao:

- `POST /auth/registrar`
- `POST /auth/login`
- `POST /auth/recuperar-senha`
- `POST /auth/logout`
- `GET /auth/usuarios`

Filmes:

- `GET /filmes`
- `GET /filmes/:id`
- `POST /filmes`
- `PUT /filmes/:id`
- `DELETE /filmes/:id`
- `GET /filmes/exportar/json`
- `POST /filmes/importar/json`
- `POST /filmes/sincronizar-tmdb`

Logs:

- `GET /logs`
- `GET /logs/exportar/xml`
- `GET /logs/exportar/json`
- `GET /logs/exportar/pdf`

Relatorios:

- `GET /relatorios/json`
- `GET /relatorios/grafico-locacoes`
- `GET /relatorios/pdf`

Clientes:

- `GET /clientes`
- `POST /clientes`
- `PUT /clientes/:id`
- `DELETE /clientes/:id`

## TMDB 🖼️

A integracao com TMDB e opcional. Ela serve para buscar poster e banner dos filmes.

Para ativar, informe:

```env
TMDB_API_KEY=sua_chave
```

Rota de sincronizacao:

```http
POST /filmes/sincronizar-tmdb
```

Modo seguro:

- preenche somente imagens vazias.

Modo com sobrescrita:

```http
POST /filmes/sincronizar-tmdb?overwrite=true
```

- substitui imagens quando encontra resultado na TMDB;
- se nao encontrar, mantem a imagem atual.

## Logs 🧾

Os logs ficam no MongoDB e registram:

- endpoint
- metodo
- usuario
- IP
- status code
- tempo de resposta
- login/logout
- inclusao
- alteracao
- exclusao
- erros
- importacoes e exportacoes

A tela administrativa mostra os logs mais recentes e permite exportar em XML, JSON e PDF.

## Documentacao 📚

A documentacao do trabalho foi preparada separadamente em PDF para entrega.

Arquivos auxiliares do projeto:

- `docs/api.md`
- `docs/arquitetura.md`
- `docs/der.md`
- `docs/documentacao_trabalho.md`

## Observacoes finais ✅

O projeto tambem possui `LOCAL_MODE=true`, que permite testar a aplicacao sem MySQL e MongoDB. Esse modo e util para desenvolvimento local, mas para demonstrar todos os requisitos do trabalho, o ideal e usar o ambiente com MySQL e MongoDB ativos, como no Render.
