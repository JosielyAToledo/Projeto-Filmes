# Projeto-Filmes

Sistema web full stack para uma locadora de filmes, criado com Node.js, Express, MySQL como banco principal e MongoDB para logs do sistema.

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

