INSERT INTO generos (id, nome, descricao) VALUES
  (1, 'Acao', 'Filmes com ritmo intenso, conflitos, perseguicoes e aventura.'),
  (2, 'Comédia', 'Filmes voltados ao humor e situacoes leves ou satiricas.'),
  (3, 'Drama', 'Narrativas com foco emocional e conflitos humanos.'),
  (4, 'Ficcao Cientifica', 'Historias sobre tecnologia, espaco, futuro e ciencia.'),
  (5, 'Suspense', 'Filmes centrados em misterio, tensao e expectativa.'),
  (6, 'Romance', 'Narrativas focadas em relacoes amorosas e vinculos afetivos.'),
  (7, 'Terror', 'Obras criadas para provocar medo e tensao.'),
  (8, 'Animacao', 'Filmes produzidos com tecnicas de animacao.'),
  (9, 'Aventura', 'Filmes com jornadas, descobertas e situacoes de exploracao.')
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  descricao = VALUES(descricao);

INSERT INTO clientes (id, nome, email, telefone, documento) VALUES
  (1, 'Cliente Exemplo', 'cliente@example.com', '(11) 99999-9999', '00000000000')
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  telefone = VALUES(telefone);

INSERT INTO filmes
  (id, titulo, titulo_original, descricao, ano_lancamento, genero_id, diretor, duracao, classificacao, pais, preco_locacao, estoque, capa_url, banner_url, status, destaque)
VALUES
  (1, 'Matrix', 'The Matrix', 'Um classico de ficcao cientifica sobre realidade simulada.', 1999, 4, 'Lana Wachowski, Lilly Wachowski', '136 min', '14', 'Estados Unidos', 9.90, 5, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', 'publicado', TRUE),
  (2, 'Central do Brasil', 'Central do Brasil', 'Drama brasileiro premiado sobre encontros, memoria e afeto.', 1998, 3, 'Walter Salles', '113 min', '12', 'Brasil', 7.90, 3, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80', 'publicado', FALSE),
  (3, 'Interestelar', 'Interstellar', 'Exploradores viajam por um buraco de minhoca em busca de um futuro para a humanidade.', 2014, 4, 'Christopher Nolan', '169 min', '10', 'Estados Unidos', 12.90, 4, 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=1200&q=80', 'publicado', TRUE),
  (4, 'Kung Fu Panda 4', 'Kung Fu Panda 4', 'Po precisa treinar uma nova guerreira enquanto enfrenta uma vila que mistura aventura, humor e autodescoberta.', 2024, 2, 'Mike Mitchell', '94 min', 'L', 'Estados Unidos', 9.90, 5, 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=500&q=80', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80', 'publicado', FALSE)
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  descricao = VALUES(descricao),
  ano_lancamento = VALUES(ano_lancamento),
  genero_id = VALUES(genero_id),
  estoque = VALUES(estoque),
  status = VALUES(status);
