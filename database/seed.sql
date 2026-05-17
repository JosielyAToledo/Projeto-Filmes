USE projeto_filmes;

INSERT INTO clientes (nome, email, telefone, documento) VALUES
  ('Cliente Exemplo', 'cliente@example.com', '(11) 99999-9999', '00000000000');

INSERT INTO filmes (titulo, descricao, ano_lancamento, genero_id, preco_locacao, estoque) VALUES
  ('Matrix', 'Um classico de ficcao cientifica.', 1999, 4, 9.90, 5),
  ('Central do Brasil', 'Drama brasileiro premiado.', 1998, 3, 7.90, 3);
