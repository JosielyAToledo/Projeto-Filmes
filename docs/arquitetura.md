# Arquitetura do Projeto-Filmes

O backend segue MVC com Service Layer, DAO, Router e Middlewares.

- Controllers recebem requisicoes HTTP e devolvem respostas.
- Services concentram regras de negocio.
- DAO acessa o MySQL e isola SQL do restante da aplicacao.
- Models documentam entidades relacionais e definem schemas MongoDB.
- Routes agrupam endpoints por modulo.
- Middlewares executam tarefas transversais como autenticacao, logs, validacao e tratamento de erros.

O MySQL e o banco principal da locadora. O MongoDB armazena logs operacionais para consultas e exportacoes independentes do fluxo transacional.
