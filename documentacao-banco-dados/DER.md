# Diagrama Entidade-Relacionamento - Projeto Filmes

Este diagrama representa o catalogo de filmes apresentado no projeto.

```mermaid
erDiagram
    USUARIOS {
        INT id PK
        VARCHAR nome
        VARCHAR email UK
        VARCHAR senha_hash
        ENUM tipo_usuario
        ENUM status
        VARCHAR foto_perfil_url
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    GENEROS {
        INT id PK
        VARCHAR nome UK
        TEXT descricao
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    FILMES {
        INT id PK
        VARCHAR titulo
        VARCHAR titulo_original
        TEXT descricao
        INT ano_lancamento
        INT genero_id FK
        INT genero_secundario_id FK
        VARCHAR diretor
        TEXT elenco
        VARCHAR duracao
        VARCHAR classificacao
        VARCHAR pais
        VARCHAR capa_url
        VARCHAR banner_url
        VARCHAR trailer_url
        ENUM status
        BOOLEAN destaque
        INT criado_por FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    AVALIACOES_FILMES {
        INT id PK
        INT filme_id FK
        INT usuario_id FK
        TINYINT nota
        TEXT comentario
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    FAVORITO_FILMES {
        INT id PK
        INT filme_id FK
        INT usuario_id FK
        TIMESTAMP created_at
    }

    GENEROS o|--o{ FILMES : "genero principal"
    GENEROS o|--o{ FILMES : "genero secundario"
    USUARIOS o|--o{ FILMES : "cria"
    USUARIOS ||--o{ AVALIACOES_FILMES : "faz"
    FILMES ||--o{ AVALIACOES_FILMES : "recebe"
    USUARIOS ||--o{ FAVORITO_FILMES : "favorita"
    FILMES ||--o{ FAVORITO_FILMES : "e favoritado"
```

## Regras importantes

- Um filme pode possuir genero principal, genero secundario e usuario criador.
- `avaliacoes_filmes` permite apenas uma avaliacao por usuario para cada filme.
- `favorito_filmes` permite apenas um favorito por usuario para cada filme.
- A nota de uma avaliacao deve estar entre 1 e 5.
