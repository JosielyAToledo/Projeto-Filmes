USE projeto_filmes;

INSERT INTO usuarios (nome, email, senha, perfil) VALUES
  ('admin', 'admin@catalogo7.local', '$2a$10$DddNgW.uzbVmUkcDig4BUONe/lMRQVHLOnCclZ9SiWijCWp4m7YOa', 'admin')
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  senha = VALUES(senha),
  perfil = VALUES(perfil);

INSERT INTO clientes (nome, email, telefone, documento) VALUES
  ('Cliente Exemplo', 'cliente@example.com', '(11) 99999-9999', '00000000000');

INSERT INTO filmes (titulo, descricao, ano_lancamento, genero_id, preco_locacao, estoque) VALUES
  ('Matrix', 'Um classico de ficcao cientifica.', 1999, 4, 9.90, 5),
  ('Central do Brasil', 'Drama brasileiro premiado.', 1998, 3, 7.90, 3);
