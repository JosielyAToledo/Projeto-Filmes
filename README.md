# Catálogo7 - Projeto-Filmes

Sistema web full stack para um catálogo de filmes. O projeto tem uma área administrativa para gerenciar filmes, usuários, logs, exportações e relatórios, além de uma área para o usuário navegar pelo catálogo, favoritar filmes e registrar avaliações.

O sistema foi desenvolvido para um trabalho de aplicação web full stack, usando Node.js com Express no backend, HTML, CSS e JavaScript no frontend, MySQL como banco principal no Railway e MongoDB para armazenar os logs.

## Link do sistema

- Aplicação no Render: https://projeto-filmes.onrender.com
- Banco MySQL no Railway: https://railway.com/project/0ab9f4af-9581-41cb-bcb7-2cc976941774/service/b5d25993-4fb8-45a5-82ab-1fac518d743a/database?environmentId=d03019af-f967-4fc5-acaa-500607e69e06
- Cloudinary, usado para armazenar imagens enviadas pelo sistema: https://console.cloudinary.com/app/c-0c5f576313c3557afda65298f984e5/settings/api-keys
- TMDB, usado para buscar capas e banners dos filmes: https://www.themoviedb.org/u/projeto_filmes

## Principais recursos

- Login, registro, logout e recuperação de senha.
- Autenticação com JWT.
- Painel administrativo.
- CRUD de filmes com upload de capa.
- Cadastro, edição e exclusão de usuários administradores.
- Listagem e controle de usuários.
- Catálogo de filmes para usuário comum.
- Favoritos e avaliações de filmes.
- Busca e filtros por título, gênero e status.
- Dashboard com totais do sistema.
- Gráficos com Chart.js.
- Importação de filmes por arquivo JSON.
- Exportação de filmes em JSON.
- Exportação de logs em XML, JSON e PDF.
- Relatório PDF com filtros.
- Logs registrados no MongoDB.
- Integração opcional com TMDB para capas e banners dos filmes.

## Tecnologias

Backend:

- Node.js
- Express
- MySQL2
- MongoDB com Mongoose
- JWT
- bcryptjs

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
- Cloudinary para imagens enviadas pelo sistema
- TMDB para imagens de filmes

## Arquitetura

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

- `controllers`: recebem as requisições e chamam os services.
- `services`: concentram as regras de negócio.
- `dao`: acessam o MySQL.
- `routes`: organizam as rotas por recurso.
- `middlewares`: cuidam de autenticação, validação, logs, upload e tratamento de erros.
- `models`: guardam modelos de referência e schemas do MongoDB.
- `interfaces`: definem contratos base para DAO, Service e Controller.

## Bancos de dados

O projeto usa dois bancos:

- MySQL: banco principal, usado para usuários, clientes, gêneros, filmes, locações, favoritos e avaliações.
- MongoDB: banco usado para registrar os logs da aplicação.

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

- 1:N entre gêneros e filmes.
- 1:N entre clientes e locações.
- 1:N entre usuários e locações.
- N:N entre locações e filmes por `itens_locacao`.
- N:N entre usuários e filmes por favoritos e avaliações.

O schema fica em:

```text
database/schema.sql
```

## Como rodar localmente

Instale as dependências:

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

Usuário admin local:

```text
Login: admin
Senha: 123456
```

No Windows também existe o arquivo:

```text
Abrir-Projeto.bat
```

Ele inicia o servidor e abre o projeto no navegador.

## TMDB

A integração com TMDB é opcional. Ela serve para buscar pôster e banner dos filmes cadastrados.

Quando uma imagem do TMDB é encontrada, o sistema pode atualizar o filme com essa imagem. Se não encontrar, a imagem que já existe no cadastro continua sendo usada.

## Logs

Os logs ficam no MongoDB e registram informações importantes da aplicação, como:

- endpoint acessado
- método da requisição
- usuário
- IP
- status code
- tempo de resposta
- login e logout
- inclusão
- alteração
- exclusão
- erros
- importações e exportações

