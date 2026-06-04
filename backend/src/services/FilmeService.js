const IService = require('../interfaces/IService');
const FilmeDAO = require('../dao/FilmeDAO');
const { isLocalMode } = require('../config/local_mode');
const fs = require('fs');
const path = require('path');

const LOCAL_MOVIES_FILE = path.resolve(
  process.env.LOCAL_FILMES_FILE || 'backend/data/local-filmes.json'
);

const defaultLocalMovies = [
  {
    id: 1,
    titulo: 'Interestelar',
    titulo_original: 'Interstellar',
    descricao: 'Um grupo de exploradores viaja atraves de um buraco de minhoca no espaco em uma tentativa de garantir a sobrevivencia da humanidade.',
    ano_lancamento: 2014,
    genero_id: 4,
    genero_nome: 'Ficção Científica',
    genero_secundario_id: null,
    diretor: 'Christopher Nolan',
    elenco: null,
    duracao: '169 min',
    classificacao: '12',
    pais: 'Estados Unidos',
    preco_locacao: 9.9,
    estoque: 1,
    capa_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=80&q=80',
    banner_url: null,
    trailer_url: null,
    status: 'publicado',
    destaque: false,
    criado_por: 1
  },
  {
    id: 2,
    titulo: 'A Origem',
    titulo_original: 'Inception',
    descricao: 'Um ladrao especializado em extrair segredos do subconsciente recebe a chance de apagar seu passado.',
    ano_lancamento: 2010,
    genero_id: 4,
    genero_nome: 'Ficção Científica',
    genero_secundario_id: null,
    diretor: 'Christopher Nolan',
    elenco: null,
    duracao: '148 min',
    classificacao: '12',
    pais: 'Estados Unidos',
    preco_locacao: 9.9,
    estoque: 1,
    capa_url: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=80&q=80',
    banner_url: null,
    trailer_url: null,
    status: 'publicado',
    destaque: false,
    criado_por: 1
  },
  {
    id: 3,
    titulo: 'Oppenheimer',
    titulo_original: 'Oppenheimer',
    descricao: 'A trajetoria do fisico J. Robert Oppenheimer durante o desenvolvimento da bomba atomica.',
    ano_lancamento: 2023,
    genero_id: 3,
    genero_nome: 'Drama',
    genero_secundario_id: null,
    diretor: 'Christopher Nolan',
    elenco: null,
    duracao: '180 min',
    classificacao: '16',
    pais: 'Estados Unidos',
    preco_locacao: 9.9,
    estoque: 1,
    capa_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=80&q=80',
    banner_url: null,
    trailer_url: null,
    status: 'publicado',
    destaque: false,
    criado_por: 1
  },
  {
    id: 4,
    titulo: 'Batman: O Cavaleiro das Trevas',
    titulo_original: 'The Dark Knight',
    descricao: 'Batman enfrenta o Coringa em Gotham em uma batalha moral e caotica.',
    ano_lancamento: 2008,
    genero_id: 1,
    genero_nome: 'Ação',
    genero_secundario_id: null,
    diretor: 'Christopher Nolan',
    elenco: null,
    duracao: '152 min',
    classificacao: '12',
    pais: 'Estados Unidos',
    preco_locacao: 9.9,
    estoque: 1,
    capa_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=80&q=80',
    banner_url: null,
    trailer_url: null,
    status: 'publicado',
    destaque: false,
    criado_por: 1
  },
  {
    id: 5,
    titulo: 'Kung Fu Panda 4',
    titulo_original: 'Kung Fu Panda 4',
    descricao: 'Po precisa treinar uma nova guerreira enquanto enfrenta uma vila que mistura aventura, humor e autodescoberta.',
    ano_lancamento: 2024,
    genero_id: 2,
    genero_nome: 'Com\u00e9dia',
    genero_secundario_id: null,
    diretor: 'Mike Mitchell',
    elenco: null,
    duracao: '94 min',
    classificacao: 'L',
    pais: 'Estados Unidos',
    preco_locacao: 9.9,
    estoque: 1,
    capa_url: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=80&q=80',
    banner_url: null,
    trailer_url: null,
    status: 'publicado',
    destaque: false,
    criado_por: 1
  }
];

function ensureLocalMoviesDir() {
  fs.mkdirSync(path.dirname(LOCAL_MOVIES_FILE), { recursive: true });
}

function loadLocalMovies() {
  try {
    if (!fs.existsSync(LOCAL_MOVIES_FILE)) {
      return [...defaultLocalMovies];
    }

    const content = fs.readFileSync(LOCAL_MOVIES_FILE, 'utf8');
    const movies = JSON.parse(content);
    return Array.isArray(movies) ? movies : [...defaultLocalMovies];
  } catch (error) {
    console.warn('Nao foi possivel carregar filmes locais. Usando lista padrao.', error.message);
    return [...defaultLocalMovies];
  }
}

function saveLocalMovies() {
  ensureLocalMoviesDir();
  fs.writeFileSync(LOCAL_MOVIES_FILE, JSON.stringify(localMovies, null, 2));
}

const localMovies = loadLocalMovies();

function nextLocalMovieId() {
  return localMovies.length ? Math.max(...localMovies.map((movie) => movie.id)) + 1 : 1;
}

function genreNameById(id) {
  const genres = {
    1: 'Ação',
    2: 'Com\u00e9dia',
    3: 'Drama',
    4: 'Ficção Científica',
    5: 'Suspense',
    6: 'Romance',
    7: 'Terror',
    9: 'Aventura'
  };
  return genres[Number(id)] || null;
}

class FilmeService extends IService {
  constructor() {
    super();
    this.filmeDAO = new FilmeDAO();
  }

  async listar(filtros = {}) {
    if (isLocalMode()) {
      const query = String(filtros.q || '').trim().toLowerCase();
      const items = query
        ? localMovies.filter((movie) => {
            return movie.titulo.toLowerCase().includes(query)
              || String(movie.genero_nome || '').toLowerCase().includes(query);
          })
        : localMovies;

      return [...items].sort((a, b) => b.id - a.id);
    }

    return this.filmeDAO.findAll(filtros);
  }

  async buscarPorId(id) {
    if (isLocalMode()) {
      const filmeLocal = localMovies.find((filme) => Number(filme.id) === Number(id));

      if (!filmeLocal) {
        const error = new Error('Filme nao encontrado.');
        error.statusCode = 404;
        throw error;
      }

      return filmeLocal;
    }

    const filme = await this.filmeDAO.findById(id);

    if (!filme) {
      const error = new Error('Filme nao encontrado.');
      error.statusCode = 404;
      throw error;
    }

    return filme;
  }

  async criar(dados) {
    if (isLocalMode()) {
      const filme = {
        id: nextLocalMovieId(),
        titulo: dados.titulo,
        titulo_original: dados.titulo_original || null,
        descricao: dados.descricao || null,
        ano_lancamento: Number(dados.ano_lancamento) || null,
        genero_id: Number(dados.genero_id) || null,
        genero_nome: genreNameById(dados.genero_id),
        genero_secundario_id: dados.genero_secundario_id || null,
        diretor: dados.diretor || null,
        elenco: dados.elenco || null,
        duracao: dados.duracao || null,
        classificacao: dados.classificacao || null,
        pais: dados.pais || null,
        preco_locacao: Number(dados.preco_locacao) || 0,
        estoque: Number(dados.estoque) || 0,
        capa_url: dados.capa_url || null,
        banner_url: dados.banner_url || null,
        trailer_url: dados.trailer_url || null,
        status: dados.status || 'publicado',
        destaque: Boolean(dados.destaque),
        criado_por: dados.criado_por || null
      };

      localMovies.push(filme);
      saveLocalMovies();
      return filme;
    }

    return this.filmeDAO.create(dados);
  }

  async atualizar(id, dados) {
    if (isLocalMode()) {
      const filmeAtual = await this.buscarPorId(id);
      Object.assign(filmeAtual, {
        titulo: dados.titulo,
        titulo_original: dados.titulo_original || null,
        descricao: dados.descricao || null,
        ano_lancamento: Number(dados.ano_lancamento) || null,
        genero_id: Number(dados.genero_id) || null,
        genero_nome: genreNameById(dados.genero_id),
        genero_secundario_id: dados.genero_secundario_id || null,
        diretor: dados.diretor || null,
        elenco: dados.elenco || null,
        duracao: dados.duracao || null,
        classificacao: dados.classificacao || null,
        pais: dados.pais || null,
        preco_locacao: Number(dados.preco_locacao) || 0,
        estoque: Number(dados.estoque) || 0,
        capa_url: dados.capa_url || null,
        banner_url: dados.banner_url || null,
        trailer_url: dados.trailer_url || null,
        status: dados.status || 'publicado',
        destaque: Boolean(dados.destaque)
      });

      saveLocalMovies();
      return filmeAtual;
    }

    await this.buscarPorId(id);
    return this.filmeDAO.update(id, dados);
  }

  async remover(id) {
    if (isLocalMode()) {
      await this.buscarPorId(id);
      const index = localMovies.findIndex((filme) => Number(filme.id) === Number(id));
      localMovies.splice(index, 1);
      saveLocalMovies();
      return true;
    }

    await this.buscarPorId(id);
    return this.filmeDAO.delete(id);
  }
}

module.exports = FilmeService;
