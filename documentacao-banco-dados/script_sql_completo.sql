-- Projeto Filmes - script MySQL completo
-- Contem a criacao do banco, tabelas, relacionamentos e dados iniciais.

CREATE DATABASE IF NOT EXISTS catalogo7
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE catalogo7;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS favorito_filmes;
DROP TABLE IF EXISTS avaliacoes_filmes;
DROP TABLE IF EXISTS filmes;
DROP TABLE IF EXISTS generos;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
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

CREATE TABLE generos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_generos_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE filmes (
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
  CONSTRAINT fk_filmes_generos FOREIGN KEY (genero_id) REFERENCES generos(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_filmes_genero_secundario FOREIGN KEY (genero_secundario_id) REFERENCES generos(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_filmes_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE avaliacoes_filmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filme_id INT NOT NULL,
  usuario_id INT NOT NULL,
  nota TINYINT NOT NULL,
  comentario TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_avaliacoes_filmes_usuario (filme_id, usuario_id),
  INDEX idx_avaliacoes_filmes_filme_id (filme_id),
  INDEX idx_avaliacoes_filmes_usuario_id (usuario_id),
  CONSTRAINT fk_avaliacoes_filmes_filmes FOREIGN KEY (filme_id) REFERENCES filmes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_avaliacoes_filmes_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_avaliacoes_filmes_nota CHECK (nota BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorito_filmes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filme_id INT NOT NULL,
  usuario_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_favorito_filmes_usuario (filme_id, usuario_id),
  INDEX idx_favorito_filmes_filme_id (filme_id),
  INDEX idx_favorito_filmes_usuario_id (usuario_id),
  CONSTRAINT fk_favorito_filmes_filmes FOREIGN KEY (filme_id) REFERENCES filmes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_favorito_filmes_usuarios FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados de teste
-- Senhas: admin@catalogo7.com = admin123 | usuario@catalogo7.com = usuario123

INSERT INTO usuarios (id, nome, email, senha_hash, tipo_usuario, status) VALUES
  (1, 'Administrador', 'admin@catalogo7.com', '$2a$10$sDx41uxnaV0Dt6MZM9PXfOx4jkG6Qt4tvgmhsEbA.xItyCTAFYSVG', 'admin', 'ativo'),
  (2, 'Usuario Teste', 'usuario@catalogo7.com', '$2a$10$.ma2wbPzgDPaERaiV9q6/.bGEOvJmIZ2j7sQmY0ynzZjWj96QbtpW', 'usuario', 'ativo');

INSERT INTO generos (id, nome, descricao) VALUES
  (1, 'Ação', 'Filmes com ritmo intenso e aventura.'),
  (2, 'Aventura', 'Filmes com jornadas e descobertas.'),
  (3, 'Comédia', 'Filmes voltados ao humor.'),
  (4, 'Drama', 'Narrativas com foco emocional.'),
  (5, 'Ficção Científica', 'Histórias sobre tecnologia, espaço e futuro.'),
  (6, 'Terror', 'Filmes criados para provocar medo e tensão.'),
  (7, 'Romance', 'Narrativas focadas em relações amorosas.'),
  (8, 'Suspense', 'Filmes centrados em mistério e tensão.');

-- Os INSERTs abaixo correspondem aos filmes cadastrados no catalogo.
INSERT INTO filmes
  (id, titulo, descricao, ano_lancamento, genero_id, diretor, duracao,
   classificacao, status, destaque, criado_por)
VALUES
  (1, 'Os Sete Samurais', 'No Japão feudal, uma vila de camponeses indefesos contrata sete samurais desempregados e dispostos a defendê-los contra saques iminentes de uma impiedosa gangue de bandidos.', 1954, 1, 'Akira Kurosawa', '207 min', '14 anos', 'publicado', TRUE, 1),
  (2, 'O Bom, o Mau e o Feio', 'Durante a Guerra Civil Americana, três pistoleiros sem escrúpulos cruzam caminhos em uma busca frenética e traiçoeira por uma fortuna oculta em moedas de ouro num cemitério confederado.', 1966, 1, 'Sergio Leone', '161 min', '14 anos', 'publicado', TRUE, 1),
  (3, 'O Salário do Medo', 'Em uma isolada cidade da América do Sul, quatro homens desesperados aceitam uma missão suicida: dirigir caminhões carregados de nitroglicerina instável por estradas montanhosas precárias.', 1953, 1, 'Henri-Georges Clouzot', '131 min', '14 anos', 'publicado', TRUE, 1),
  (4, 'A Fortaleza Escondida', 'No Japão medieval, um general lendário e uma princesa disfarçada tentam cruzar as linhas inimigas com uma carga de ouro, escoltados por dois camponeses gananciosos e atrapalhados.', 1958, 1, 'Akira Kurosawa', '139 min', '12 anos', 'publicado', TRUE, 1),
  (5, 'O Encouraçado Potemkin', 'Um motim violento eclode a bordo de um navio de guerra czarista quando os marinheiros se revoltam contra as condições desumanas, desencadeando uma insurreição popular em Odessa.', 1925, 1, 'Sergei Eisenstein', '75 min', '12 anos', 'publicado', TRUE, 1),
  (6, 'No Tempo das Diligências', 'Um grupo de passageiros dramaticamente variados viaja a bordo de uma diligência através do perigoso território Apache, enfrentando seus próprios demônios e conflitos internos pelo caminho.', 1939, 2, 'John Ford', '96 min', '12 anos', 'publicado', FALSE, 1),
  (7, 'O Ladrão de Bagdá', 'Um jovem rei destronado e um astuto ladrãozinho de rua unem forças para derrotar um grão-vizir maligno que usa feitiçaria e um gênio gigante para controlar o reino.', 1940, 2, 'Michael Powell, Ludwig Berger, Tim Whelan', '106 min', 'Livre', 'publicado', FALSE, 1),
  (8, 'O Tesouro de Sierra Madre', 'Dois vagabundos americanos desempregados no México se juntam a um velho garimpeiro para procurar ouro nas montanhas, mas a ganância logo corrói a sanidade e a confiança do grupo.', 1948, 2, 'John Huston', '126 min', '12 anos', 'publicado', FALSE, 1),
  (9, 'As Aventuras de Robin Hood', 'Na ausência do Rei Ricardo, o nobre saxão Robin Hood assume a liderança de um bando de rebeldes na floresta de Sherwood para combater a tirania do cruel Príncipe João.', 1938, 2, 'Michael Curtiz, William Keighley', '102 min', 'Livre', 'publicado', FALSE, 1),
  (10, 'A Estrada da Vida', 'Uma jovem ingênua e de espírito puro é vendida por sua mãe para trabalhar como assistente itinerante de um violento e bruto homem forte de circo pelas estradas da Itália.', 1954, 2, 'Federico Fellini', '108 min', '14 anos', 'publicado', FALSE, 1),
  (11, 'Levada da Breca', 'Enquanto tenta conseguir uma grande doação para o seu museu, um paleontólogo tímido se envolve com uma herdeira rica, excêntrica e decidida, dona de um leopardo de estimação chamado Baby.', 1938, 3, 'Howard Hawks', '102 min', 'Livre', 'publicado', FALSE, 1),
  (12, 'Tempos Modernos', 'O icônico Vagabundo tenta sobreviver à desumanização de uma sociedade industrial moderna, enlouquecendo nas linhas de montagem antes de se aliar a uma jovem órfã sem-teto.', 1936, 3, 'Charles Chaplin', '87 min', 'Livre', 'publicado', FALSE, 1),
  (13, 'Jejum de Amor', 'O editor de um grande jornal usa todos os truques profissionais e pessoais imagináveis para impedir que sua melhor repórter e ex-esposa se aposente e se case com outro homem.', 1940, 3, 'Howard Hawks', '92 min', 'Livre', 'publicado', FALSE, 1),
  (14, 'Ser ou Não Ser', 'Na Polônia ocupada por nazistas, uma companhia teatral de atores excêntricos usa seus disfarces e habilidades dramáticas para sabotar espiões alemães e salvar a resistência local.', 1942, 3, 'Ernst Lubitsch', '99 min', '12 anos', 'publicado', FALSE, 1),
  (15, 'Quanto Mais Quente Melhor', 'Dois músicos desempregados testemunham acidentalmente um massacre da máfia e se disfarçam de mulheres em uma banda de jazz feminina em turnê para escapar dos gângsteres.', 1959, 3, 'Billy Wilder', '121 min', '12 anos', 'publicado', FALSE, 1),
  (16, 'Cidadão Kane', 'Após a morte de um magnata da imprensa editorial, jornalistas correm contra o tempo para descobrir o significado de sua enigmática última palavra pronunciada no leito de morte: ''Rosebud''.', 1941, 4, 'Orson Welles', '119 min', 'Livre', 'publicado', FALSE, 1),
  (17, 'Crepúsculo dos Deuses', 'Um roteirista decadente desenvolve uma relação perigosa e dependente com Norma Desmond, uma antiga estrela do cinema mudo que vive reclusa em delírios sobre seu retorno triunfal.', 1950, 4, 'Billy Wilder', '110 min', '12 anos', 'publicado', FALSE, 1),
  (18, 'Ladrões de Bicicleta', 'Na Roma pós-guerra empobrecida, um trabalhador desesperado tem sua bicicleta roubada no primeiro dia de emprego e cruza a cidade com seu filho pequeno em uma busca inútil e dolorosa.', 1948, 4, 'Vittorio De Sica', '89 min', '12 anos', 'publicado', FALSE, 1),
  (19, 'Acossado', 'Um pequeno criminoso rouba um carro, mata um policial e tenta convencer uma jovem estudante americana de jornalismo a fugir com ele para a Itália, desafiando os padrões estéticos do cinema.', 1960, 4, 'Jean-Luc Godard', '90 min', '14 anos', 'publicado', FALSE, 1),
  (20, 'A Doce Vida', 'Um jornalista de fofocas acompanha a elite decadente, celebridades e aristocratas em Roma ao longo de sete dias e noites, buscando um sentido maior para sua própria existência vazia.', 1960, 4, 'Federico Fellini', '174 min', '14 anos', 'publicado', FALSE, 1),
  (21, 'Metrópolis', 'Em uma cidade futurista dividida entre a classe trabalhadora e os planejadores urbanos, o filho do mestre da cidade se apaixona por uma profetisa operária, prevendo a vinda de um mediador.', 1927, 5, 'Fritz Lang', '153 min', 'Livre', 'publicado', FALSE, 1),
  (22, 'O Dia em que a Terra Parou', 'Um alienígena humanoide e seu indestrutível robô gigante pousam um disco voador em Washington para entregar um aviso urgente à humanidade sobre a proliferação de armas nucleares.', 1951, 5, 'Robert Wise', '92 min', 'Livre', 'publicado', FALSE, 1),
  (23, 'Vampiros de Almas', 'Um médico de uma cidadezinha descobre gradualmente que a população local está sendo substituída por clones alienígenas desprovidos de qualquer emoção humana, nascidos de estranhas vagens.', 1956, 5, 'Don Siegel', '80 min', '14 anos', 'publicado', FALSE, 1),
  (24, 'Planeta Proibido', 'Uma expedição espacial investiga o silêncio de uma colônia planetária distante e encontra apenas dois sobreviventes, um robô guardião e um terrível monstro invisível gerado pela mente.', 1956, 5, 'Fred M. Wilcox', '98 min', 'Livre', 'publicado', FALSE, 1),
  (25, 'Gojira', 'Testes com armas nucleares no oceano despertam e transformam um réptil gigante pré-histórico em um monstro colossal radioativo, que marcha em direção a Tóquio espalhando destruição.', 1954, 5, 'Ishiro Honda', '96 min', '12 anos', 'publicado', FALSE, 1),
  (26, 'O Mensageiro do Diabo', 'Um falso pregador psicopata e com as palavras ''amor'' e ''ódio'' tatuadas nas mãos persegue duas crianças órfãs para roubar o dinheiro que seu falecido pai escondeu.', 1955, 6, 'Charles Laughton', '92 min', '14 anos', 'publicado', FALSE, 1),
  (27, 'Psicose', 'Uma secretária foge após roubar quarenta mil dólares e decide passar a noite em um motel de beira de estrada isolado, gerenciado por um jovem calmo sob o controle obsessivo de sua mãe.', 1960, 6, 'Alfred Hitchcock', '109 min', '14 anos', 'publicado', FALSE, 1),
  (28, 'Nosferatu', 'Nesta obra do expressionismo alemão, o sinistro Conde Orlok manifesta interesse na esposa de seu agente imobiliário e traz uma peste terrível e mortal para a cidadezinha dela.', 1922, 6, 'F.W. Murnau', '94 min', '14 anos', 'publicado', FALSE, 1),
  (29, 'O Gabinete do Dr. Caligari', 'Um hipnotizador de feira usa um sonâmbulo sob seu controle total para cometer uma série de assassinatos bizarros em uma pequena cidade alemã de cenários distorcidos.', 1920, 6, 'Robert Wiene', '77 min', '12 anos', 'publicado', FALSE, 1),
  (30, 'As Diabólicas', 'A frágil esposa e a amante obstinada de um diretor de escola cruel unem forças para assassiná-lo em um plano minucioso, mas o corpo dele desaparece misteriosamente da piscina.', 1955, 6, 'Henri-Georges Clouzot', '117 min', '14 anos', 'publicado', FALSE, 1),
  (31, 'Casablanca', 'Em plena Segunda Guerra Mundial, um exilado americano cínico que administra uma casa noturna em Marrocos reencontra um antigo amor, colocando seus sentimentos e ideais políticos à prova.', 1942, 7, 'Michael Curtiz', '102 min', '12 anos', 'publicado', FALSE, 1),
  (32, 'Hiroshima, Meu Amor', 'Uma atriz francesa filmando no Japão pós-guerra e um arquiteto local vivem um breve e intenso romance, compartilhando memórias dolorosas sobre o trauma atômico e a traição.', 1959, 7, 'Alain Resnais', '90 min', '14 anos', 'publicado', FALSE, 1),
  (33, 'Noites de Cabíria', 'Uma profissional do sexo em Roma, romântica e de bom coração, é constantemente explorada e enganada pelos homens que encontra, mas mantém a esperança inabalável de encontrar o amor verdadeiro.', 1957, 7, 'Federico Fellini', '110 min', '14 anos', 'publicado', FALSE, 1),
  (34, 'Desencanto', 'Uma dona de casa suburbana comum e um médico casado se encontram por acaso em uma estação de trem britânica e iniciam uma paixão secreta, intensa e fadada à impossibilidade.', 1945, 7, 'David Lean', '86 min', 'Livre', 'publicado', FALSE, 1),
  (35, 'Luzes da Cidade', 'O Vagabundo se apaixona perdidamente por uma jovem florista cega e faz sacrifícios financeiros inacreditáveis para conseguir o dinheiro necessário para a cirurgia que devolverá a visão dela.', 1931, 7, 'Charles Chaplin', '87 min', 'Livre', 'publicado', FALSE, 1),
  (36, 'M, o Vampiro de Düsseldorf', 'Quando a polícia alemã falha em capturar um infame assassino de crianças, o submundo do crime local decide se organizar para caçá-lo por conta própria, paralisando Berlim.', 1931, 8, 'Fritz Lang', '117 min', '14 anos', 'publicado', FALSE, 1),
  (37, 'Um Corpo que Cai', 'Um detetive aposentado de San Francisco que sofre de acrofobia extrema é contratado para seguir a esposa de um velho amigo, tornando-se perigosamente obcecado por ela.', 1958, 8, 'Alfred Hitchcock', '128 min', '14 anos', 'publicado', FALSE, 1),
  (38, 'Relíquia Macabra', 'O detetive particular Sam Spade assume um caso complexo que o envolve com três criminosos excêntricos e a busca implacável por uma lendária e inestimável estatueta de falcão.', 1941, 8, 'John Huston', '100 min', '14 anos', 'publicado', FALSE, 1),
  (39, 'Pacto de Sangue', 'Um vendedor de seguros de vida é seduzido por uma femme fatale provocante a forjar uma apólice fraudulenta e assassinar o marido dela para receberem juntos a indenização.', 1944, 8, 'Billy Wilder', '107 min', '14 anos', 'publicado', FALSE, 1),
  (40, 'Janela Indiscreta', 'Confinado a uma cadeira de rodas devido a uma perna quebrada, um fotógrafo profissional passa os dias espionando os vizinhos de seu pátio e se convence de que testemunhou um assassinato.', 1954, 8, 'Alfred Hitchcock', '112 min', '12 anos', 'publicado', FALSE, 1);

INSERT INTO avaliacoes_filmes (id, filme_id, usuario_id, nota, comentario) VALUES
  (1, 1, 2, 5, 'Excelente clássico do cinema.'),
  (2, 16, 2, 4, 'Drama marcante e muito bem dirigido.');

INSERT INTO favorito_filmes (id, filme_id, usuario_id) VALUES
  (1, 1, 2),
  (2, 27, 2);

-- Consultas rapidas para confirmar a importacao
SELECT 'usuarios' AS tabela, COUNT(*) AS registros FROM usuarios
UNION ALL SELECT 'generos', COUNT(*) FROM generos
UNION ALL SELECT 'filmes', COUNT(*) FROM filmes
UNION ALL SELECT 'avaliacoes_filmes', COUNT(*) FROM avaliacoes_filmes
UNION ALL SELECT 'favorito_filmes', COUNT(*) FROM favorito_filmes;
