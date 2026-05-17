# Endpoints Principais

## Auth

- `POST /auth/registrar`
- `POST /auth/login`
- `POST /auth/logout`

## Filmes

- `GET /filmes`
- `GET /filmes/:id`
- `POST /filmes` com JWT e multipart field `capa`
- `PUT /filmes/:id` com JWT e multipart field `capa`
- `DELETE /filmes/:id` com JWT
- `GET /filmes/exportar/json` com JWT
- `POST /filmes/importar/json` com JWT

## Relatorios

- `GET /relatorios/json`
- `GET /relatorios/grafico-locacoes`
- `GET /relatorios/pdf`

## Logs

- `GET /logs`
- `GET /logs/exportar/xml`
