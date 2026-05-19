const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';

let token = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('usuario') || 'null');
let movies = [];

const authStatus = document.getElementById('authStatus');
const sampleMovies = [
  {
    id: 1,
    titulo: 'Duna',
    ano_lancamento: 2021,
    genero_nome: 'Aventura',
    duracao: '2h 35min',
    diretor: 'Denis Villeneuve',
    elenco: 'Timothée Chalamet, Rebecca Ferguson, Oscar Isaac',
    descricao: 'Um jovem herdeiro precisa sobreviver em um planeta desértico onde política, poder e destino se encontram.',
    capa_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    titulo: 'Vingadores: Ultimato',
    ano_lancamento: 2019,
    genero_nome: 'Ação',
    duracao: '3h 01min',
    diretor: 'Anthony Russo, Joe Russo',
    elenco: 'Robert Downey Jr., Chris Evans, Scarlett Johansson',
    descricao: 'Heróis se reúnem para uma última missão e tentam reverter as perdas causadas por Thanos.',
    capa_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    titulo: 'Interestelar',
    ano_lancamento: 2014,
    genero_nome: 'Drama',
    duracao: '2h 49min',
    diretor: 'Christopher Nolan',
    elenco: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    descricao: 'Um grupo de exploradores viaja através de um buraco de minhoca no espaço em uma tentativa de garantir a sobrevivência da humanidade.',
    capa_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    titulo: 'The Batman',
    ano_lancamento: 2022,
    genero_nome: 'Suspense',
    duracao: '2h 56min',
    diretor: 'Matt Reeves',
    elenco: 'Robert Pattinson, Zoë Kravitz, Paul Dano',
    descricao: 'Batman investiga uma série de crimes em Gotham enquanto confronta a corrupção da cidade.',
    capa_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    titulo: 'Top Gun: Maverick',
    ano_lancamento: 2022,
    genero_nome: 'Ação',
    duracao: '2h 10min',
    diretor: 'Joseph Kosinski',
    elenco: 'Tom Cruise, Miles Teller, Jennifer Connelly',
    descricao: 'Maverick retorna para treinar uma nova geração de pilotos em uma missão quase impossível.',
    capa_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 6,
    titulo: 'Oppenheimer',
    ano_lancamento: 2023,
    genero_nome: 'Drama',
    duracao: '3h 00min',
    diretor: 'Christopher Nolan',
    elenco: 'Cillian Murphy, Emily Blunt, Robert Downey Jr.',
    descricao: 'A história do físico J. Robert Oppenheimer e a criação da bomba atômica.',
    capa_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 7,
    titulo: 'Guardiões da Galáxia',
    ano_lancamento: 2014,
    genero_nome: 'Ficção Científica',
    duracao: '2h 01min',
    diretor: 'James Gunn',
    elenco: 'Chris Pratt, Zoe Saldana, Dave Bautista',
    descricao: 'Um grupo improvável de heróis precisa proteger uma poderosa esfera das mãos erradas.',
    capa_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 8,
    titulo: 'Coringa',
    ano_lancamento: 2019,
    genero_nome: 'Drama',
    duracao: '2h 02min',
    diretor: 'Todd Phillips',
    elenco: 'Joaquin Phoenix, Robert De Niro, Zazie Beetz',
    descricao: 'Um homem marginalizado em Gotham mergulha em uma transformação sombria e imprevisível.',
    capa_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 9,
    titulo: 'Matrix',
    ano_lancamento: 1999,
    genero_nome: 'Ficção Científica',
    duracao: '2h 16min',
    diretor: 'Lana Wachowski, Lilly Wachowski',
    elenco: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss',
    descricao: 'Um programador descobre que a realidade pode ser uma simulação criada por máquinas.',
    capa_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 10,
    titulo: 'Avatar',
    ano_lancamento: 2009,
    genero_nome: 'Aventura',
    duracao: '2h 42min',
    diretor: 'James Cameron',
    elenco: 'Sam Worthington, Zoe Saldana, Sigourney Weaver',
    descricao: 'Em Pandora, um ex-fuzileiro vive uma jornada que muda sua relação com um novo mundo.',
    capa_url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 11,
    titulo: 'Blade Runner 2049',
    ano_lancamento: 2017,
    genero_nome: 'Ficção Científica',
    duracao: '2h 44min',
    diretor: 'Denis Villeneuve',
    elenco: 'Ryan Gosling, Harrison Ford, Ana de Armas',
    descricao: 'Um novo blade runner descobre um segredo capaz de abalar o futuro da sociedade.',
    capa_url: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 12,
    titulo: 'Mad Max',
    ano_lancamento: 2015,
    genero_nome: 'Ação',
    duracao: '2h 00min',
    diretor: 'George Miller',
    elenco: 'Tom Hardy, Charlize Theron, Nicholas Hoult',
    descricao: 'Em um deserto pós-apocalíptico, sobreviventes lutam por liberdade em uma perseguição brutal.',
    capa_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=500&q=80'
  }
];

function setStatus(message) {
  authStatus.textContent = message;
}

function syncView() {
  const isLogged = Boolean(token) || previewMode;
  document.body.classList.toggle('logged-in', isLogged);
  document.getElementById('authScreen').classList.toggle('hidden', isLogged);
  document.getElementById('appShell').classList.toggle('visible', isLogged);
  renderProfile();

  const name = currentUser ? currentUser.nome || currentUser.email || 'usuário' : 'Preview';
  document.getElementById('currentUserName').textContent = name.split(' ')[0];
  document.querySelector('.user-box .avatar').textContent = getInitials(name);
  if (previewMode && !currentUser) {
    document.getElementById('currentUserName').textContent = 'Lucas';
    document.querySelector('.user-box .avatar').textContent = 'LS';
  }
}

function showRegister() {
  document.getElementById('authScreen').classList.add('register-mode');
  setStatus('');
}

function showLogin() {
  document.getElementById('authScreen').classList.remove('register-mode');
  setStatus('');
}

function headers(extra = {}) {
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra;
}

async function api(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: headers(options.headers || {})
    });
  } catch (error) {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(formatApiError(error.message, response.status));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatApiError(message, status) {
  const knownMessages = {
    'Credenciais invalidas.': 'E-mail ou senha incorretos.',
    'E-mail ja cadastrado.': 'Este e-mail já está cadastrado.',
    'Campos obrigatorios ausentes.': 'Preencha todos os campos obrigatórios.'
  };

  if (knownMessages[message]) {
    return knownMessages[message];
  }

  if (status === 500) {
    return 'Erro no servidor. Tente novamente em instantes.';
  }

  return message || 'Não foi possível concluir a operação.';
}

document.getElementById('showRegister').addEventListener('click', showRegister);
document.getElementById('showLogin').addEventListener('click', showLogin);

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const result = await api('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
      })
    });

    token = result.token;
    currentUser = result.usuario;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(currentUser));
    syncView();
    await loadMovies();
  } catch (error) {
    setStatus(error.message);
  }
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const senha = document.getElementById('senhaRegistro').value;
  const confirmarSenha = document.getElementById('confirmarSenhaRegistro').value;

  if (senha !== confirmarSenha) {
    setStatus('As senhas não conferem.');
    return;
  }

  try {
    await api('/auth/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: document.getElementById('nomeRegistro').value,
        email: document.getElementById('emailRegistro').value,
        senha
      })
    });

    showLogin();
    setStatus('Conta criada com sucesso. Agora faça login.');
  } catch (error) {
    setStatus(error.message);
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (token) {
    await api('/auth/logout', { method: 'POST' }).catch(() => null);
  }

  token = '';
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  syncView();
});

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showPage(link.dataset.page);
  });
});

document.getElementById('goMovies').addEventListener('click', () => showPage('filmes'));
document.getElementById('editProfileBtn').addEventListener('click', () => {
  renderProfileForm();
  showPage('editarPerfil');
});
document.getElementById('openExportPageBtn').addEventListener('click', () => showPage('exportar'));
document.getElementById('movieSearch').addEventListener('input', (event) => renderMovies(filterMovies(event.target.value)));
document.getElementById('globalSearch').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    showPage('filmes');
    document.getElementById('movieSearch').value = event.target.value;
    renderMovies(filterMovies(event.target.value));
  }
});

function showPage(page) {
  document.querySelectorAll('.page').forEach((item) => item.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
  document.getElementById(`${page}Page`).classList.add('active');
  const activeLink = document.querySelector(`[data-page="${page}"]`);

  if (activeLink) {
    activeLink.classList.add('active');
  }
}

async function loadMovies() {
  if (previewMode && !token) {
    movies = sampleMovies;
  } else {
    try {
      movies = await api('/filmes');
    } catch (error) {
      movies = sampleMovies;
    }
  }

  renderFeatured();
  renderMovies(movies);
  renderProfile();
}

function filterMovies(query = '') {
  if (!query) {
    return movies;
  }

  return movies.filter((movie) => movie.titulo.toLowerCase().includes(query.toLowerCase()));
}

function renderFeatured() {
  const featured = movies.slice(0, 5);
  document.getElementById('featuredGrid').innerHTML = featured.map(renderMovieCard).join('');
  document.getElementById('favoritesGrid').innerHTML = movies.slice(0, 4).map(renderMovieCard).join('');
  document.getElementById('watchedGrid').innerHTML = movies.slice(1, 9).map((movie, index) => renderMovieCard(movie, { watched: true, positive: index % 3 !== 0 })).join('');
}

function renderMovies(items) {
  document.getElementById('movieGrid').innerHTML = items.map(renderMovieCard).join('');
}

function getProfileUser() {
  return currentUser || {
    nome: 'Lucas Silva',
    email: 'lucas@email.com'
  };
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return 'M';
  }

  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function renderProfile() {
  const user = getProfileUser();
  const name = user.nome || user.email || 'Usuario MovieHub';
  const email = user.email || 'email@moviehub.com';
  const uniqueCategories = new Set(movies.map((movie) => movie.genero_nome).filter(Boolean));

  document.getElementById('profileAvatar').textContent = getInitials(name);
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('profileMemberSince').textContent = 'Membro desde: Maio de 2024';
  document.getElementById('favoriteCount').textContent = movies.length ? Math.min(movies.length, 32) : 32;
  document.getElementById('watchedCount').textContent = movies.length ? Math.min(Math.max(movies.length - 2, 1), 18) : 18;
  document.getElementById('categoryCount').textContent = uniqueCategories.size || 6;
  document.getElementById('accountName').textContent = name;
  document.getElementById('accountEmail').textContent = email;
}

function renderProfileForm() {
  const user = getProfileUser();
  const name = user.nome || user.email || 'Usuario MovieHub';
  const email = user.email || 'email@moviehub.com';

  document.getElementById('editProfileAvatar').textContent = getInitials(name);
  document.getElementById('editName').value = name;
  document.getElementById('editEmail').value = email;
}

document.querySelector('.edit-profile-form').addEventListener('submit', (event) => {
  event.preventDefault();

  currentUser = {
    ...(currentUser || {}),
    nome: document.getElementById('editName').value,
    email: document.getElementById('editEmail').value
  };

  localStorage.setItem('usuario', JSON.stringify(currentUser));
  syncView();
  showPage('perfil');
});

function renderMovieCard(movie, options = {}) {
  return `
    <article class="movie-card" onclick="openMovieModal(${movie.id})">
      <div class="poster-wrap">
        <img src="${resolveImageUrl(movie.capa_url)}" alt="Capa de ${movie.titulo}" />
        <button type="button" aria-label="Favoritar" onclick="event.stopPropagation()">♥</button>
        ${options.watched ? `<span class="watched-badge ${options.positive ? 'positive' : 'negative'}">${options.positive ? '✓' : '•'}</span>` : ''}
      </div>
      <strong>${movie.titulo}</strong>
      <span>${movie.ano_lancamento || 'Ano não informado'}</span>
    </article>
  `;
}

window.openMovieModal = (id) => {
  const movie = movies.find((item) => Number(item.id) === Number(id));
  if (!movie) return;

  const modal = document.getElementById('movieModal');
  document.getElementById('movieModalContent').innerHTML = `
    <div class="movie-detail">
      <img src="${resolveImageUrl(movie.capa_url)}" alt="Capa de ${movie.titulo}" />
      <div class="movie-detail-content">
        <h2 id="modalMovieTitle">${movie.titulo}</h2>
        <div class="movie-meta">
          <span>${movie.ano_lancamento || 'Ano não informado'}</span>
          <span>★ 8.6</span>
          <span>${movie.duracao || '2h 00min'}</span>
          <span>${movie.genero_nome || 'Drama'}</span>
        </div>
        <p>${movie.descricao || 'Filme disponível no catálogo MovieHub.'}</p>
        <div class="detail-actions">
          <button type="button">Assistir trailer</button>
          <button type="button" class="secondary-action">Adicionar aos favoritos</button>
        </div>
      </div>
    </div>
    <div class="movie-info">
      <h3>Informações</h3>
      <dl>
        <div>
          <dt>Diretor</dt>
          <dd>${movie.diretor || 'Não informado'}</dd>
        </div>
        <div>
          <dt>Elenco</dt>
          <dd>${movie.elenco || 'Não informado'}</dd>
        </div>
        <div>
          <dt>Lançamento</dt>
          <dd>${movie.ano_lancamento || 'Não informado'}</dd>
        </div>
      </dl>
    </div>
  `;
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
};

function closeMovieModal() {
  const modal = document.getElementById('movieModal');
  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
}

document.getElementById('closeMovieModal').addEventListener('click', closeMovieModal);
document.getElementById('movieModal').addEventListener('click', (event) => {
  if (event.target.id === 'movieModal') {
    closeMovieModal();
  }
});

function resolveImageUrl(url) {
  if (!url) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `${API_URL}${url}`;
}

syncView();

if (token || previewMode) {
  loadMovies();
}
