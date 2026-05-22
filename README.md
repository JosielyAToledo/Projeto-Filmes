# Projeto-Filmes

Sistema web full stack para uma locadora de filmes, criado com Node.js, Express, MySQL como banco principal e MongoDB para logs do sistema.

## Link Online

- Sistema no Render: https://projeto-filmes.onrender.com
- Health check: https://projeto-filmes.onrender.com/health

## Arquitetura

O backend foi organizado com MVC, Service Layer, Router, DAO, Models, Interfaces e Middlewares. Essa separacao deixa o projeto preparado para crescer sem misturar regra de negocio, SQL, HTTP e infraestrutura.

- `controllers`: recebem requisicoes e chamam services.
- `services`: concentram regras de negocio.
- `dao`: acessam o MySQL.
- `routes`: definem endpoints por modulo.
- `middlewares`: autenticacao JWT, logs, validacao e erros.
- `models`: entidades de referencia e schema MongoDB.
- `interfaces`: contratos base para DAO, Service e Controller.

## Tecnologias

- Node.js
- Express
- MySQL2
- MongoDB com Mongoose
- JWT
- bcryptjs
- multer
- dotenv
- cors
- Chart.js no frontend
- jsPDF para relatorio PDF
- Railway MySQL
- MongoDB Atlas
- Render

## Rodar Localmente Sem Banco

Para abrir na sua maquina sem depender de MySQL ou MongoDB, deixe `LOCAL_MODE=true` no arquivo `.env` e rode:

```bash
npm install
npm run dev
```

Depois acesse `http://localhost:3000` e entre com:

- Login: `admin`
- Senha: `123456`

Se entrar como admin, o sistema abre o painel administrativo. Se criar uma conta pela janela "Criar conta" e fizer login com esse usuario, o sistema abre a area de usuario comum. As contas criadas no modo local ficam apenas enquanto o servidor estiver rodando.

No Windows, tambem da para abrir tudo dando dois cliques no arquivo `Abrir-Projeto.bat`. Ele inicia o servidor e abre a janela de login no navegador.

Nesse modo local, o sistema pula as conexoes externas. Para publicar/deploy, use `LOCAL_MODE=false` ou remova essa variavel e preencha as credenciais `DB_*` e `MONGODB_URI`.

## Produção: Render + Railway + MongoDB Atlas

Arquitetura oficial mantida:

- Frontend entregue pelo backend hospedado.
- Backend Node.js/Express no Render.
- MySQL no Railway para dados relacionais.
- MongoDB Atlas para logs.
- GitHub conectado ao deploy automatico do Render.

Variaveis obrigatorias no Render:

```bash
LOCAL_MODE=false
DB_HOST=host-do-railway
DB_PORT=porta-do-railway
DB_USER=usuario-do-railway
DB_PASSWORD=senha-do-railway
DB_NAME=nome-do-banco
MONGODB_URI=mongodb+srv://...
JWT_SECRET=uma_chave_forte
JWT_EXPIRES_IN=1d
UPLOAD_DIR=backend/src/uploads
```

O Render executa `npm run db:migrate` no build, conforme `render.yaml`. Para rodar manualmente contra o MySQL do Railway quando precisar:

```bash
npm run db:migrate
npm run db:seed
```

O schema oficial fica em `database/schema.sql`. O script e seguro para producao academica: ele cria tabelas com `CREATE TABLE IF NOT EXISTS`, nao executa `DROP TABLE`, e preserva dados existentes. O admin inicial e criado automaticamente quando o backend sobe em producao:

- Login: `admin` ou `admin@catalogo7.com`
- Senha: `123456`

Dados persistidos no MySQL:

- usuarios e administradores em `usuarios`;
- clientes em `clientes`;
- filmes em `filmes`;
- locacoes em `locacoes`;
- filmes de cada locacao em `itens_locacao`.

## Funcionalidades

- Login, registro e logout com JWT.
- CRUD completo de filmes com upload de capa.
- CRUD completo de clientes.
- Busca de filmes por titulo/genero e busca de clientes.
- Dashboard com totais vindos do MySQL.
- Exportacao JSON de filmes.
- Importacao JSON de filmes por upload de arquivo.
- Exportacao XML dos logs armazenados no MongoDB.
- Relatorio PDF gerado no frontend com jsPDF.
- Grafico Chart.js com dados da API.
- Logs de acesso, login, logout, inclusao, alteracao, exclusao e erros.

## Bancos de Dados

O sistema utiliza dois bancos:

- MySQL Railway: banco relacional principal, com as tabelas `usuarios`, `clientes`, `generos`, `filmes`, `locacoes` e `itens_locacao`.
- MongoDB Atlas: banco NoSQL usado para logs do sistema, com registros de acesso, autenticacao, cadastro, alteracao, exclusao e erros.

O MySQL atende aos relacionamentos exigidos no trabalho:

- 1:N entre `generos` e `filmes`.
- 1:N entre `clientes` e `locacoes`.
- 1:N entre `usuarios` e `locacoes`.
- N:N entre `locacoes` e `filmes`, usando `itens_locacao`.

