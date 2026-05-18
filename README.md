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

