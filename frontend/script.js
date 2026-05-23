const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';

let token = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('usuario') || 'null');
let movies = [];
let movieRatings = JSON.parse(localStorage.getItem('movieRatings') || '{}');
let adminSession = localStorage.getItem('adminSession') === '1';

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
  const isLogged = !adminSession && (Boolean(token) || previewMode);
  document.body.classList.toggle('logged-in', isLogged);
  document.body.classList.toggle('admin-logged-in', adminSession);
  document.getElementById('authScreen').classList.toggle('hidden', isLogged || adminSession);
  document.getElementById('appShell').classList.toggle('visible', isLogged);
  document.getElementById('adminShell').classList.toggle('visible', adminSession);
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

document.querySelectorAll('#showRegister').forEach((button) => {
  button.addEventListener('click', showRegister);
});
document.querySelectorAll('#showLogin').forEach((button) => {
  button.addEventListener('click', showLogin);
});

document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordInput = document.getElementById('senha');
  const toggleButton = document.getElementById('togglePassword');
  const shouldShow = passwordInput.type === 'password';

  passwordInput.type = shouldShow ? 'text' : 'password';
  toggleButton.textContent = shouldShow ? '◎' : '◉';
  toggleButton.setAttribute('aria-label', shouldShow ? 'Ocultar senha' : 'Mostrar senha');
  toggleButton.setAttribute('aria-pressed', String(shouldShow));
});

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
    adminSession = isAdminUser(currentUser);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(currentUser));
    if (adminSession) {
      localStorage.setItem('adminSession', '1');
    } else {
      localStorage.removeItem('adminSession');
    }

    syncView();
    if (!adminSession) {
      await loadMovies();
    }
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

document.querySelectorAll('#logoutBtn').forEach((button) => {
  button.addEventListener('click', logoutAndReload);
});

document.getElementById('adminLogoutBtn').addEventListener('click', logoutAndReload);

document.querySelector('.admin-menu-button').addEventListener('click', () => {
  document.querySelector('.admin-sidebar').classList.toggle('menu-open');
});

document.querySelector('.admin-config-trigger').addEventListener('click', () => {
  const menu = document.querySelector('.admin-config-menu');
  const isOpen = menu.classList.toggle('open');
  document.querySelector('.admin-config-trigger').setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('[data-admin-view]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    showAdminView(link.dataset.adminView);
    if (link.dataset.adminConfigShortcut) {
      showAdminConfigTab(link.dataset.adminConfigShortcut);
    }
    document.querySelector('.admin-config-menu')?.classList.remove('open');
    document.querySelector('.admin-config-trigger')?.setAttribute('aria-expanded', 'false');
    document.querySelector('.admin-sidebar').classList.remove('menu-open');
  });
});

document.querySelectorAll('[data-admin-config-tab]').forEach((button) => {
  button.addEventListener('click', () => showAdminConfigTab(button.dataset.adminConfigTab));
});

document.getElementById('adminRefreshLogs').addEventListener('click', loadAdminLogs);

document.getElementById('adminOpenMovieForm').addEventListener('click', () => {
  openAdminMovieForm();
});

document.querySelectorAll('.catalog-action.edit').forEach((button) => {
  button.addEventListener('click', () => {
    openAdminMovieForm(button.closest('tr').dataset);
  });
});

document.getElementById('adminBackToCatalog').addEventListener('click', () => {
  document.getElementById('adminMoviesView').classList.remove('creating');
  document.querySelector('.admin-main').classList.remove('creating-movie');
});

document.getElementById('adminCancelMovieForm').addEventListener('click', () => {
  document.getElementById('adminMoviesView').classList.remove('creating');
  document.querySelector('.admin-main').classList.remove('creating-movie');
});

document.getElementById('adminMovieForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitter = event.submitter;
  const status = submitter ? submitter.dataset.movieStatus : 'publicado';
  const statusElement = document.getElementById('adminMovieStatus');
  statusElement.textContent = 'Salvando filme...';

  try {
    const filme = await api('/filmes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAdminMoviePayload(status))
    });

    statusElement.textContent = `Filme "${filme.titulo}" salvo no MySQL.`;
  } catch (error) {
    statusElement.textContent = error.message;
  }
});

function openAdminMovieForm(movie = null) {
  const isEditing = Boolean(movie);
  document.getElementById('adminMoviesView').classList.add('creating');
  document.querySelector('.admin-main').classList.add('creating-movie');

  const title = isEditing ? movie.title : 'Interestelar';
  const genre = isEditing ? movie.genre : '4';
  const genreLabel = isEditing ? movie.genreLabel : 'Ficção Científica';
  const director = isEditing ? movie.director : 'Christopher Nolan';
  const duration = isEditing ? movie.duration : '169 min';
  const year = isEditing ? movie.year : '2014';
  const rating = isEditing ? movie.rating : '12';

  document.querySelector('.movie-create-page-header h2').textContent = isEditing ? 'Editar Filme' : 'Cadastrar Filme';
  document.querySelector('.movie-create-breadcrumb strong').textContent = isEditing ? 'Editar Filme' : 'Cadastrar Filme';
  document.querySelector('.movie-form-actions .publish').textContent = isEditing ? 'Salvar Alterações' : 'Salvar Filme';

  document.getElementById('adminMovieTitle').value = title;
  document.getElementById('adminMovieOriginalTitle').value = title;
  document.getElementById('adminMovieGenre').value = genre;
  document.getElementById('adminMovieDirector').value = director;
  document.getElementById('adminMovieDuration').value = duration;
  document.getElementById('adminMovieYear').value = year;
  document.getElementById('adminMovieRating').value = rating;
  document.getElementById('adminMovieStatus').textContent = '';

  document.querySelector('.movie-preview-card h3').textContent = title;
  document.querySelector('.movie-preview-card p span:first-child').textContent = genreLabel;
  document.querySelector('.movie-preview-card p span:last-child').textContent = director;
  document.querySelector('.movie-preview-meta').innerHTML = `<b>◷</b>${duration} <b>•</b> ${year} <mark>${rating}</mark> ${rating} anos`;
}

function showAdminView(view) {
  document.querySelectorAll('[data-admin-view]').forEach((link) => {
    link.classList.toggle('active', link.dataset.adminView === view && !link.dataset.adminConfigShortcut);
  });

  const isMoviesView = view === 'movies';
  const isConfigView = view === 'config';
  document.querySelector('.admin-main').classList.toggle('show-movies', isMoviesView);
  document.querySelector('.admin-main').classList.toggle('show-config', isConfigView);
  document.querySelector('.admin-config-trigger')?.classList.toggle('active', isConfigView);
  if (isMoviesView) {
    document.getElementById('adminMoviesView').classList.remove('creating');
    document.querySelector('.admin-main').classList.remove('creating-movie');
  } else {
    document.querySelector('.admin-main').classList.remove('creating-movie');
  }

  const titles = {
    movies: ['Filmes', 'Cadastro e gestao do catalogo'],
    config: ['Configurações', 'Sistema, segurança e logs'],
    dashboard: ['Painel Administrativo', 'Visao geral do sistema']
  };
  const [title, subtitle] = titles[view] || titles.dashboard;
  document.querySelector('.admin-topbar h1').textContent = title;
  document.querySelector('.admin-topbar p').textContent = subtitle;
}

function showAdminConfigTab(tab) {
  document.querySelectorAll('[data-admin-config-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminConfigTab === tab);
  });
  document.querySelectorAll('[data-admin-config-shortcut]').forEach((link) => {
    link.classList.toggle('active', link.dataset.adminConfigShortcut === tab);
  });

  document.getElementById('adminConfigChart').classList.toggle('active', tab === 'chart');
  document.getElementById('adminConfigLogs').classList.toggle('active', tab === 'logs');
  document.getElementById('adminConfigCurrentPage').textContent = tab === 'logs' ? 'Log' : 'Gráfico';

  if (tab === 'logs') {
    loadAdminLogs();
  }
}

async function loadAdminLogs() {
  const logsBody = document.getElementById('adminLogsBody');
  logsBody.innerHTML = '<tr><td colspan="5">Carregando logs...</td></tr>';

  try {
    const logs = await api('/logs');
    logsBody.innerHTML = logs.length
      ? logs.slice(0, 20).map(renderAdminLogRow).join('')
      : '<tr><td colspan="5">Nenhum log encontrado.</td></tr>';
  } catch (error) {
    logsBody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
  }
}

function renderAdminLogRow(log) {
  const date = log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '-';
  return `
    <tr>
      <td>${date}</td>
      <td>${log.usuario || 'anonimo'}</td>
      <td>${log.acao || log.tipoEvento || '-'}</td>
      <td>${log.endpoint || '-'}</td>
      <td>${log.statusCode || '-'}</td>
    </tr>
  `;
}

function buildAdminMoviePayload(status) {
  const secondGenre = document.getElementById('adminMovieSecondGenre').value;

  return {
    titulo: document.getElementById('adminMovieTitle').value.trim(),
    titulo_original: document.getElementById('adminMovieOriginalTitle').value.trim(),
    descricao: document.getElementById('adminMovieDescription').value.trim(),
    ano_lancamento: Number(document.getElementById('adminMovieYear').value) || null,
    genero_id: Number(document.getElementById('adminMovieGenre').value) || null,
    genero_secundario_id: secondGenre ? Number(secondGenre) : null,
    diretor: document.getElementById('adminMovieDirector').value.trim(),
    duracao: document.getElementById('adminMovieDuration').value.trim(),
    classificacao: document.getElementById('adminMovieRating').value,
    pais: document.getElementById('adminMovieCountry').value.trim(),
    preco_locacao: 9.9,
    estoque: 1,
    capa_url: 'https://images.unsplash.com/photo-1614726365952-510103b1bbb4?auto=format&fit=crop&w=320&q=80',
    banner_url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=520&q=80',
    status
  };
}

async function logoutAndReload() {
  if (token) {
    await api('/auth/logout', { method: 'POST' }).catch(() => null);
  }

  clearSessionAndReload();
}

function clearSessionAndReload() {
  token = '';
  currentUser = null;
  adminSession = false;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('adminSession');
  showLogin();
  window.location.href = window.location.pathname;
}

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (link.dataset.page === 'filmes') {
      showAllMovies();
      return;
    }

    showPage(link.dataset.page);
  });
});

const userNavLabels = {
  filmes: 'FILMES',
  favoritos: 'LISTAS',
  perfil: 'MEMBROS',
  assistidos: 'DIÁRIO'
};

document.querySelectorAll('.user-header .nav-link').forEach((link) => {
  const label = userNavLabels[link.dataset.page];

  if (label) {
    link.textContent = label;
  } else {
    link.classList.add('user-nav-hidden');
  }
});

document.getElementById('goMovies').addEventListener('click', showAllMovies);
document.getElementById('editProfileBtn').addEventListener('click', () => {
  renderProfileForm();
  showPage('editarPerfil');
});
document.getElementById('openExportPageBtn').addEventListener('click', () => showPage('exportar'));
document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDFReport);
document.getElementById('downloadPdfIconBtn').addEventListener('click', downloadPDFReport);
document.getElementById('downloadXmlBtn').addEventListener('click', downloadXMLExport);
document.getElementById('downloadXmlIconBtn').addEventListener('click', downloadXMLExport);
document.getElementById('movieSearch').addEventListener('input', (event) => {
  setMoviesHeader('Filmes', 'Explore todos os filmes disponiveis.');
  renderMovies(filterMovies(event.target.value));
});
document.getElementById('globalSearch').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    showPage('filmes');
    setMoviesHeader('Filmes', 'Resultado da busca.');
    document.getElementById('movieSearch').value = event.target.value;
    renderMovies(filterMovies(event.target.value));
  }
});

const categoryNames = [
  'Ação',
  'Aventura',
  'Comédia',
  'Drama',
  'Ficção Científica',
  'Terror',
  'Romance',
  'Animação',
  'Documentário'
];

document.querySelectorAll('.categories-grid article').forEach((card, index) => {
  const category = categoryNames[index];

  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Ver filmes de ${category}`);

  card.addEventListener('click', () => showCategoryMovies(category));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      showCategoryMovies(category);
    }
  });
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

function normalizeText(value = '') {
  return value.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isAdminUser(usuario = {}) {
  return usuario.tipo === 'admin'
    || usuario.role === 'admin'
    || usuario.tipo_usuario === 'admin'
    || normalizeText(usuario.nome || '') === 'admin'
    || normalizeText(usuario.email || '').includes('admin');
}

function setMoviesHeader(title, subtitle) {
  document.getElementById('moviesPageTitle').textContent = title;
  document.querySelector('#filmesPage .movies-header p').textContent = subtitle;
}

function showAllMovies() {
  document.getElementById('movieSearch').value = '';
  setMoviesHeader('Filmes', 'Explore todos os filmes disponiveis.');
  renderMovies(movies);
  showPage('filmes');
}

function showCategoryMovies(category) {
  const filteredMovies = movies.filter((movie) => {
    return normalizeText(movie.genero_nome) === normalizeText(category);
  });

  document.getElementById('movieSearch').value = category;
  setMoviesHeader(`Filmes de ${category}`, `Explore filmes do gênero ${category}.`);
  renderMovies(filteredMovies);
  showPage('filmes');
}

function filterMovies(query = '') {
  if (!query) {
    return movies;
  }

  const normalizedQuery = normalizeText(query);

  return movies.filter((movie) => {
    return normalizeText(movie.titulo).includes(normalizedQuery)
      || normalizeText(movie.genero_nome).includes(normalizedQuery);
  });
}

function renderFeatured() {
  const featured = movies.slice(0, 5);
  document.getElementById('featuredGrid').innerHTML = featured.map(renderMovieCard).join('');
  document.getElementById('favoritesGrid').innerHTML = movies.slice(0, 4).map(renderMovieCard).join('');
  document.getElementById('watchedGrid').innerHTML = movies.slice(1, 9).map((movie, index) => renderMovieCard(movie, { watched: true, positive: index % 3 !== 0 })).join('');
}

function renderMovies(items) {
  document.getElementById('movieGrid').innerHTML = items.length
    ? items.map(renderMovieCard).join('')
    : '<p class="empty-state">Nenhum filme encontrado para este gênero.</p>';
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

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function selectedExportItems() {
  return Array.from(document.querySelectorAll('.export-data input:checked'))
    .map((input) => input.parentElement.textContent.trim());
}

function escapePDFText(text) {
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\\]/g, '\\$&');
}

function makeSimplePDF(lines) {
  const content = [
    'BT',
    '/F1 18 Tf',
    '50 790 Td',
    '(Relatorio MovieHub) Tj',
    '/F1 11 Tf',
    '0 -28 Td',
    ...lines.map((line) => `(${escapePDFText(line)}) Tj 0 -18 Td`),
    'ET'
  ].join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return pdf;
}

function downloadPDFReport() {
  const lines = [
    `Periodo: ${document.querySelector('.export-period-grid select').value}`,
    `Data inicial: ${document.querySelector('[aria-label="Data inicial"]').value}`,
    `Data final: ${document.querySelector('[aria-label="Data final"]').value}`,
    `Dados exportados: ${selectedExportItems().join(', ') || 'Nenhum item selecionado'}`,
    'Resumo: Importacoes e exportacoes do sistema.'
  ];

  downloadBlob(makeSimplePDF(lines), 'relatorio-moviehub.pdf', 'application/pdf');
}

function buildFallbackXML() {
  const items = selectedExportItems()
    .map((item) => `    <item>${item}</item>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<exportacao>\n  <periodo>${document.querySelector('.export-period-grid select').value}</periodo>\n  <dataInicial>${document.querySelector('[aria-label="Data inicial"]').value}</dataInicial>\n  <dataFinal>${document.querySelector('[aria-label="Data final"]').value}</dataFinal>\n  <dados>\n${items}\n  </dados>\n</exportacao>`;
}

async function downloadXMLExport() {
  let xml = '';

  if (token) {
    try {
      const response = await fetch(`${API_URL}/logs/exportar/xml`, {
        headers: headers()
      });

      if (response.ok) {
        xml = await response.text();
      }
    } catch (error) {
      xml = '';
    }
  }

  downloadBlob(xml || buildFallbackXML(), 'relatorio-moviehub.xml', 'application/xml');
}

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

function getMovieRating(id) {
  return Number(movieRatings[id] || 0);
}

function renderRatingStars(id) {
  const rating = getMovieRating(id);

  return `
    <div class="rating-control" role="group" aria-label="Avaliar filme">
      <span>Avaliar</span>
      <div class="rating-stars">
        ${[1, 2, 3, 4, 5].map((value) => `
          <button
            type="button"
            class="${value <= rating ? 'active' : ''}"
            aria-label="Avaliar com ${value} estrela${value > 1 ? 's' : ''}"
            onclick="setMovieRating(${id}, ${value})"
          >★</button>
        `).join('')}
      </div>
      <strong>${rating ? `${rating}/5` : 'Sem nota'}</strong>
    </div>
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
          ${renderRatingStars(movie.id)}
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

window.setMovieRating = (id, rating) => {
  movieRatings[id] = rating;
  localStorage.setItem('movieRatings', JSON.stringify(movieRatings));

  const ratingControl = document.querySelector('.rating-control');
  if (ratingControl) {
    ratingControl.outerHTML = renderRatingStars(id);
  }
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
