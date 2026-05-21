CREATE DATABASE IF NOT EXISTS catalogo7
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catalogo7;

DROP TABLE IF EXISTS comentarios;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS lista_filmes;
DROP TABLE IF EXISTS listas;
DROP TABLE IF EXISTS historico_visualizacao;
DROP TABLE IF EXISTS avaliacoes;
DROP TABLE IF EXISTS filme_genero;
DROP TABLE IF EXISTS generos;
DROP TABLE IF EXISTS filmes;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  foto_perfil_url VARCHAR(255),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email),
  INDEX idx_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE filmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(180) NOT NULL,
  titulo_original VARCHAR(180),
  ano YEAR NOT NULL,
  duracao_minutos INT NOT NULL,
  classificacao_indicativa VARCHAR(20),
  sinopse TEXT,
  diretor VARCHAR(140),
  poster_url VARCHAR(255),
  banner_url VARCHAR(255),
  trailer_url VARCHAR(255),
  status ENUM('rascunho', 'publicado', 'arquivado') NOT NULL DEFAULT 'rascunho',
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  criado_por INT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_filmes_titulo (titulo),
  INDEX idx_filmes_ano (ano),
  INDEX idx_filmes_status (status),
  INDEX idx_filmes_destaque (destaque),
  INDEX idx_filmes_criado_por (criado_por),
  CONSTRAINT fk_filmes_usuarios
    FOREIGN KEY (criado_por)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE generos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_generos_nome (nome),
  INDEX idx_generos_nome (nome)
) ENGINE=InnoDB;

CREATE TABLE filme_genero (
  filme_id INT NOT NULL,
  genero_id INT NOT NULL,
  PRIMARY KEY (filme_id, genero_id),
  INDEX idx_filme_genero_genero_id (genero_id),
  CONSTRAINT fk_filme_genero_filmes
    FOREIGN KEY (filme_id)
    REFERENCES filmes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_filme_genero_generos
    FOREIGN KEY (genero_id)
    REFERENCES generos(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  filme_id INT NOT NULL,
  nota DECIMAL(2,1) NOT NULL,
  comentario TEXT,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_avaliacoes_usuario_filme (usuario_id, filme_id),
  INDEX idx_avaliacoes_usuario_id (usuario_id),
  INDEX idx_avaliacoes_filme_id (filme_id),
  CONSTRAINT chk_avaliacoes_nota CHECK (nota >= 0 AND nota <= 5),
  CONSTRAINT fk_avaliacoes_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_avaliacoes_filmes
    FOREIGN KEY (filme_id)
    REFERENCES filmes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE historico_visualizacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  filme_id INT NOT NULL,
  progresso_percentual DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  assistido BOOLEAN NOT NULL DEFAULT FALSE,
  assistido_em DATETIME,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_historico_visualizacao_usuario_id (usuario_id),
  INDEX idx_historico_visualizacao_filme_id (filme_id),
  CONSTRAINT chk_historico_progresso CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  CONSTRAINT fk_historico_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_historico_filmes
    FOREIGN KEY (filme_id)
    REFERENCES filmes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE listas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  visibilidade ENUM('publica', 'privada') NOT NULL DEFAULT 'privada',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_listas_usuario_id (usuario_id),
  CONSTRAINT fk_listas_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE lista_filmes (
  lista_id INT NOT NULL,
  filme_id INT NOT NULL,
  adicionado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (lista_id, filme_id),
  INDEX idx_lista_filmes_filme_id (filme_id),
  CONSTRAINT fk_lista_filmes_listas
    FOREIGN KEY (lista_id)
    REFERENCES listas(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_lista_filmes_filmes
    FOREIGN KEY (filme_id)
    REFERENCES filmes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE favoritos (
  usuario_id INT NOT NULL,
  filme_id INT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, filme_id),
  INDEX idx_favoritos_filme_id (filme_id),
  CONSTRAINT fk_favoritos_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_favoritos_filmes
    FOREIGN KEY (filme_id)
    REFERENCES filmes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  filme_id INT NOT NULL,
  comentario TEXT NOT NULL,
  status ENUM('ativo', 'oculto', 'removido') NOT NULL DEFAULT 'ativo',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_comentarios_usuario_id (usuario_id),
  INDEX idx_comentarios_filme_id (filme_id),
  CONSTRAINT fk_comentarios_usuarios
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_comentarios_filmes
    FOREIGN KEY (filme_id)
    REFERENCES filmes(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO usuarios
  (id, nome, email, senha_hash, tipo_usuario, status, foto_perfil_url)
VALUES
  (1, 'Administrador', 'admin@catalogo7.com', 'admin123_hash', 'admin', 'ativo', '/uploads/perfis/admin.png'),
  (2, 'Maria Santos', 'maria@catalogo7.com', 'maria123_hash', 'usuario', 'ativo', '/uploads/perfis/maria.png'),
  (3, 'Joao Oliveira', 'joao@catalogo7.com', 'joao123_hash', 'usuario', 'ativo', '/uploads/perfis/joao.png'),
  (4, 'Ana Costa', 'ana@catalogo7.com', 'ana123_hash', 'usuario', 'ativo', '/uploads/perfis/ana.png');

INSERT INTO generos (id, nome, descricao) VALUES
  (1, 'Ação', 'Filmes com ritmo intenso, perseguições, conflitos e aventura.'),
  (2, 'Drama', 'Narrativas com foco emocional, conflitos humanos e transformação.'),
  (3, 'Terror', 'Obras criadas para provocar medo, tensão e suspense psicológico.'),
  (4, 'Ficção Científica', 'Histórias sobre tecnologia, espaço, futuro e possibilidades científicas.'),
  (5, 'Suspense', 'Filmes centrados em mistério, tensão e expectativa.'),
  (6, 'Romance', 'Narrativas focadas em relações amorosas e vínculos afetivos.'),
  (7, 'Crime', 'Histórias envolvendo investigação, delitos, máfia ou justiça.'),
  (8, 'Mistério', 'Filmes baseados em segredos, enigmas e revelações.'),
  (9, 'Comédia', 'Obras voltadas ao humor e situações leves ou satíricas.'),
  (10, 'Animação', 'Filmes produzidos com técnicas de animação digital ou tradicional.');

INSERT INTO filmes
  (id, titulo, titulo_original, ano, duracao_minutos, classificacao_indicativa, sinopse, diretor, poster_url, banner_url, trailer_url, status, destaque, criado_por)
VALUES
  (1, 'O Terceiro Homem', 'The Third Man', 1949, 104, '12 anos', 'Em Viena pós-guerra, um escritor investiga a morte misteriosa de um amigo.', 'Carol Reed', '/uploads/posters/o-terceiro-homem.jpg', '/uploads/banners/o-terceiro-homem.jpg', 'https://trailers.example.com/o-terceiro-homem', 'publicado', TRUE, 1),
  (2, 'Blade Runner', 'Blade Runner', 1982, 117, '14 anos', 'Um caçador de androides investiga replicantes em uma Los Angeles distópica.', 'Ridley Scott', '/uploads/posters/blade-runner.jpg', '/uploads/banners/blade-runner.jpg', 'https://trailers.example.com/blade-runner', 'publicado', TRUE, 1),
  (3, 'La Haine', 'La Haine', 1995, 98, '16 anos', 'Três jovens vivem um dia de tensão social nos subúrbios de Paris.', 'Mathieu Kassovitz', '/uploads/posters/la-haine.jpg', '/uploads/banners/la-haine.jpg', 'https://trailers.example.com/la-haine', 'publicado', FALSE, 1),
  (4, 'Persona', 'Persona', 1966, 83, '14 anos', 'Uma atriz em silêncio e sua enfermeira mergulham em uma relação psicológica intensa.', 'Ingmar Bergman', '/uploads/posters/persona.jpg', '/uploads/banners/persona.jpg', 'https://trailers.example.com/persona', 'publicado', TRUE, 1),
  (5, 'Taxi Driver', 'Taxi Driver', 1976, 114, '18 anos', 'Um veterano solitário dirige pelas ruas de Nova York enquanto perde contato com a realidade.', 'Martin Scorsese', '/uploads/posters/taxi-driver.jpg', '/uploads/banners/taxi-driver.jpg', 'https://trailers.example.com/taxi-driver', 'publicado', TRUE, 1),
  (6, 'Interestelar', 'Interstellar', 2014, 169, '10 anos', 'Exploradores viajam por um buraco de minhoca em busca de um futuro para a humanidade.', 'Christopher Nolan', '/uploads/posters/interestelar.jpg', '/uploads/banners/interestelar.jpg', 'https://trailers.example.com/interestelar', 'publicado', FALSE, 1),
  (7, 'Corra!', 'Get Out', 2017, 104, '14 anos', 'Um jovem visita a família da namorada e descobre segredos perturbadores.', 'Jordan Peele', '/uploads/posters/corra.jpg', '/uploads/banners/corra.jpg', 'https://trailers.example.com/corra', 'publicado', FALSE, 1),
  (8, 'A Viagem de Chihiro', 'Sen to Chihiro no Kamikakushi', 2001, 125, 'Livre', 'Uma menina entra em um mundo mágico e precisa salvar seus pais.', 'Hayao Miyazaki', '/uploads/posters/chihiro.jpg', '/uploads/banners/chihiro.jpg', 'https://trailers.example.com/chihiro', 'publicado', TRUE, 1),
  (9, 'Antes do Amanhecer', 'Before Sunrise', 1995, 101, '12 anos', 'Dois jovens se conhecem em um trem e passam uma noite conversando em Viena.', 'Richard Linklater', '/uploads/posters/antes-do-amanhecer.jpg', '/uploads/banners/antes-do-amanhecer.jpg', 'https://trailers.example.com/antes-do-amanhecer', 'publicado', FALSE, 1),
  (10, 'O Grande Lebowski', 'The Big Lebowski', 1998, 117, '14 anos', 'Um homem comum é arrastado para uma confusão envolvendo sequestro, crime e boliche.', 'Joel Coen', '/uploads/posters/o-grande-lebowski.jpg', '/uploads/banners/o-grande-lebowski.jpg', 'https://trailers.example.com/o-grande-lebowski', 'publicado', FALSE, 1);

INSERT INTO filme_genero (filme_id, genero_id) VALUES
  (1, 5), (1, 7), (1, 8),
  (2, 1), (2, 4), (2, 5),
  (3, 2), (3, 7),
  (4, 2), (4, 8),
  (5, 2), (5, 7),
  (6, 2), (6, 4),
  (7, 3), (7, 5), (7, 8),
  (8, 10), (8, 2),
  (9, 6), (9, 2),
  (10, 9), (10, 7);

INSERT INTO avaliacoes (usuario_id, filme_id, nota, comentario) VALUES
  (2, 1, 4.8, 'Atmosfera noir impecável e final memorável.'),
  (2, 6, 4.5, 'Emocionante e visualmente grandioso.'),
  (3, 2, 5.0, 'Um clássico absoluto da ficção científica.'),
  (3, 5, 4.7, 'Perturbador e muito bem dirigido.'),
  (4, 8, 5.0, 'Animação belíssima e cheia de imaginação.'),
  (4, 9, 4.4, 'Simples, íntimo e muito humano.');

INSERT INTO historico_visualizacao
  (usuario_id, filme_id, progresso_percentual, assistido, assistido_em)
VALUES
  (2, 1, 100.00, TRUE, '2026-05-01 20:30:00'),
  (2, 2, 62.50, FALSE, NULL),
  (3, 5, 100.00, TRUE, '2026-05-03 22:10:00'),
  (3, 10, 45.00, FALSE, NULL),
  (4, 8, 100.00, TRUE, '2026-05-05 18:00:00'),
  (4, 6, 80.00, FALSE, NULL);

INSERT INTO listas (id, usuario_id, nome, descricao, visibilidade) VALUES
  (1, 2, 'Noir e crime', 'Filmes com ruas molhadas, sombras e investigações.', 'publica'),
  (2, 3, 'Favoritos sci-fi', 'Ficções científicas essenciais.', 'publica'),
  (3, 4, 'Para reassistir', 'Filmes que merecem uma nova sessão.', 'privada');

INSERT INTO lista_filmes (lista_id, filme_id) VALUES
  (1, 1), (1, 5), (1, 10),
  (2, 2), (2, 6),
  (3, 4), (3, 8), (3, 9);

INSERT INTO favoritos (usuario_id, filme_id) VALUES
  (2, 1), (2, 5), (2, 9),
  (3, 2), (3, 6),
  (4, 4), (4, 8);

INSERT INTO comentarios (usuario_id, filme_id, comentario, status) VALUES
  (2, 1, 'A fotografia e as sombras criam uma experiência única.', 'ativo'),
  (3, 2, 'Visualmente influente até hoje.', 'ativo'),
  (4, 8, 'Um dos filmes mais bonitos que já vi.', 'ativo'),
  (2, 5, 'A construção do personagem é desconfortável e brilhante.', 'ativo'),
  (3, 10, 'Engraçado e estranho na medida certa.', 'ativo');

SELECT
  f.id,
  f.titulo,
  f.ano,
  GROUP_CONCAT(g.nome ORDER BY g.nome SEPARATOR ', ') AS generos
FROM filmes f
JOIN filme_genero fg ON fg.filme_id = f.id
JOIN generos g ON g.id = fg.genero_id
GROUP BY f.id, f.titulo, f.ano
ORDER BY f.titulo;

SELECT
  f.titulo,
  u.nome AS usuario,
  a.nota,
  a.comentario,
  a.criado_em
FROM avaliacoes a
JOIN filmes f ON f.id = a.filme_id
JOIN usuarios u ON u.id = a.usuario_id
ORDER BY f.titulo, a.nota DESC;

SELECT
  u.nome AS usuario,
  f.titulo,
  h.progresso_percentual,
  h.assistido,
  h.assistido_em
FROM historico_visualizacao h
JOIN usuarios u ON u.id = h.usuario_id
JOIN filmes f ON f.id = h.filme_id
WHERE u.email = 'maria@catalogo7.com'
ORDER BY h.atualizado_em DESC;

SELECT
  u.nome AS usuario,
  f.titulo,
  fav.criado_em
FROM favoritos fav
JOIN usuarios u ON u.id = fav.usuario_id
JOIN filmes f ON f.id = fav.filme_id
WHERE u.email = 'maria@catalogo7.com'
ORDER BY fav.criado_em DESC;

SELECT
  id,
  titulo,
  ano,
  status
FROM filmes
WHERE status = 'publicado'
ORDER BY titulo;

SELECT
  id,
  titulo,
  ano,
  destaque
FROM filmes
WHERE destaque = TRUE
ORDER BY ano;
