CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  foto_perfil_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_email (email),
  INDEX idx_usuarios_tipo_usuario (tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE,
  telefone VARCHAR(30),
  documento VARCHAR(30) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clientes_nome (nome),
  INDEX idx_clientes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS generos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_generos_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS filmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(180) NOT NULL,
  titulo_original VARCHAR(180),
  descricao TEXT,
  ano_lancamento INT,
  genero_id INT,
  genero_secundario_id INT,
  diretor VARCHAR(140),
  elenco TEXT,
  duracao VARCHAR(40),
  classificacao VARCHAR(30),
  pais VARCHAR(80),
  preco_locacao DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estoque INT NOT NULL DEFAULT 0,
  capa_url VARCHAR(255),
  banner_url VARCHAR(255),
  trailer_url VARCHAR(255),
  status ENUM('rascunho', 'publicado', 'arquivado') NOT NULL DEFAULT 'publicado',
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  criado_por INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_filmes_titulo (titulo),
  INDEX idx_filmes_genero_id (genero_id),
  INDEX idx_filmes_status (status),
  CONSTRAINT fk_filmes_generos
    FOREIGN KEY (genero_id) REFERENCES generos(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_filmes_genero_secundario
    FOREIGN KEY (genero_secundario_id) REFERENCES generos(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_filmes_criado_por
    FOREIGN KEY (criado_por) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS locacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  usuario_id INT NOT NULL,
  data_locacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_devolucao_prevista DATE NOT NULL,
  data_devolucao DATE,
  valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('aberta', 'devolvida', 'atrasada', 'cancelada') NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_locacoes_cliente_id (cliente_id),
  INDEX idx_locacoes_usuario_id (usuario_id),
  INDEX idx_locacoes_status (status),
  CONSTRAINT fk_locacoes_clientes
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_locacoes_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS itens_locacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  locacao_id INT NOT NULL,
  filme_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_itens_locacao_locacao_id (locacao_id),
  INDEX idx_itens_locacao_filme_id (filme_id),
  CONSTRAINT fk_itens_locacao_locacoes
    FOREIGN KEY (locacao_id) REFERENCES locacoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_itens_locacao_filmes
    FOREIGN KEY (filme_id) REFERENCES filmes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
