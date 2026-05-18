# Documentacao do Trabalho - Projeto-Filmes

## Tema e Objetivo

O sistema escolhido e uma locadora de filmes. O objetivo e controlar usuarios, clientes, generos, filmes, locacoes e itens de locacao, com upload de capas, relatorios, graficos e logs operacionais.

## Regras de Negocio Principais

- Somente usuarios autenticados podem cadastrar, alterar, excluir, importar e exportar dados protegidos.
- Filmes devem possuir titulo obrigatorio.
- Clientes devem possuir nome obrigatorio.
- Capas de filmes devem ser enviadas como imagem.
- Importacoes JSON validam estrutura antes da insercao.
- Logs de acesso, autenticacao, cadastro, alteracao, exclusao e erro sao salvos no MongoDB.

## Estrutura MVC + Service Layer

- Controllers: recebem requisicoes HTTP e retornam JSON.
- Services: concentram regras de negocio.
- DAO: executa consultas no MySQL.
- Routes: agrupam endpoints por recurso em classes.
- Middlewares: autenticacao, logs, validacao e tratamento global de erros.

## Interfaces

- `IDAO`: contrato para persistencia.
- `IService`: contrato para regras de negocio.
- `IController`: contrato para controllers CRUD.

`FilmeDAO`, `FilmeService`, `FilmeController`, `ClienteDAO`, `ClienteService` e `ClienteController` implementam esses contratos.

## Banco MySQL

As tabelas sao `usuarios`, `clientes`, `generos`, `filmes`, `locacoes` e `itens_locacao`. Existem relacionamentos 1:N entre generos e filmes, clientes e locacoes, usuarios e locacoes. A relacao N:N entre locacoes e filmes e resolvida por `itens_locacao`.

## MongoDB

O MongoDB armazena logs com campos como usuario, acao, tipoEvento, endpoint, metodo, IP, statusCode, tempoRespostaMs, tabela, registroId, antes, depois, dadosInseridos, dadosExcluidos, erro e stackTrace.

## Exportacao XML

A rota `GET /logs/exportar/xml` consulta os logs no MongoDB e gera um XML com eventos, usuario, acao, descricao, data_hora, tipo_evento, IP e dados vinculados.

## Relatorio PDF

O frontend consulta `GET /relatorios/json` e usa jsPDF + autoTable para gerar um PDF com titulo, data de geracao e tabela de totais.

## Grafico

O grafico usa Chart.js no frontend e dados vindos de `GET /relatorios/grafico-locacoes`, alimentado pelo MySQL.

## Execucao

1. `npm install`
2. Copiar `.env.example` para `.env`
3. Importar `database/schema.sql`
4. Iniciar MongoDB
5. `npm run dev`
6. Abrir `frontend/index.html`
