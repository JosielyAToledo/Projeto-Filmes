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

## Clientes

- `GET /clientes` com JWT
- `GET /clientes/:id` com JWT
- `POST /clientes` com JWT
- `PUT /clientes/:id` com JWT
- `DELETE /clientes/:id` com JWT

## Relatorios

- `GET /relatorios/json`
- `GET /relatorios/grafico-locacoes`
- `GET /relatorios/pdf`

## Logs

- `GET /logs`
- `GET /logs/exportar/xml`
