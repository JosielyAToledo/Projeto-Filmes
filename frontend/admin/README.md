# Perfil Admin

Esta pasta organiza a area administrativa do frontend.

No momento, o painel admin continua dentro de `frontend/index.html`, `frontend/styles.css` e `frontend/script.js` para nao quebrar o deploy atual.

## Onde esta cada parte hoje

- HTML: secao `adminShell` em `../index.html`
- CSS: bloco `Admin dashboard` em `../styles.css`
- JavaScript: funcoes e eventos de admin em `../script.js`

## Telas do admin

- Dashboard
- Catalogo
- Usuarios
- Logs
- Graficos
- Configuracoes

## Observacao

Separar o codigo em arquivos proprios, como `admin.html`, `admin.css` e `admin.js`, deve ser feito em uma etapa posterior, ajustando as rotas do Express e testando o deploy.
