const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';

let token = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('usuario') || 'null');
let movies = [];
let movieRatings = JSON.parse(localStorage.getItem('movieRatings') || '{}');
let favoriteMovies = {};
let userMovieReviews = [];
let adminSession = localStorage.getItem('adminSession') === '1';
let userMoviesPage = 1;
let currentMovieItems = [];
let pendingEditMovie = null;
let pendingDeleteMovie = null;
let editingMovieId = null;
let pendingMovieSaveStatus = 'publicado';
let adminMoviesCache = [];
let adminMoviesFiltered = [];
let adminMoviesPage = 1;
let adminUsersCache = [];
let adminCurrentView = 'dashboard';
let adminLogsCache = [];
let adminDashboardSummary = {};
let reportsLogsCache = [];
let reportsSummaryCache = {};
let pendingDeleteLogIndex = null;
const ADMIN_MOVIES_PER_PAGE = 4;
const USER_MOVIES_PER_PAGE = 5;
let pendingInactiveUser = null;
let pendingDeleteUser = null;
let pendingDeleteAdministratorRow = null;
let pendingEditAdministratorData = null;
let pendingEditAdministratorRow = null;
let editingAdministratorRow = null;
let heroMovieIndex = 0;
const adminChartInstances = {};

const curatedMovieImages = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=2200&q=85',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=85'
];

const sampleAdminLogs = [
  {
    timestamp: '2024-05-31T17:32:15.000Z',
    usuario: 'Admin',
    acao: 'CREATE',
    descricao: 'Criação de filme',
    endpoint: '/api/filmes',
    metodo: 'POST',
    statusCode: 200,
    ip: '192.168.1.10'
  },
  {
    timestamp: '2024-05-31T17:28:47.000Z',
    usuario: 'João Silva',
    acao: 'UPDATE',
    descricao: 'Atualização de usuário',
    endpoint: '/api/usuarios/123',
    metodo: 'PUT',
    statusCode: 200,
    ip: '192.168.1.12'
  },
  {
    timestamp: '2024-05-31T17:25:03.000Z',
    usuario: 'Maria Santos',
    acao: 'DELETE',
    descricao: 'Exclusão de filme',
    endpoint: '/api/filmes/456',
    metodo: 'DELETE',
    statusCode: 204,
    ip: '192.168.1.15'
  },
  {
    timestamp: '2024-05-31T17:20:11.000Z',
    usuario: 'Admin',
    acao: 'GET',
    descricao: 'Listagem de usuários',
    endpoint: '/api/usuarios',
    metodo: 'GET',
    statusCode: 200,
    ip: '192.168.1.10'
  },
  {
    timestamp: '2024-05-31T17:15:22.000Z',
    usuario: 'Pedro Oliveira',
    acao: 'GET',
    descricao: 'Detalhes do filme',
    endpoint: '/api/filmes/789',
    metodo: 'GET',
    statusCode: 404,
    ip: '192.168.1.18'
  },
  {
    timestamp: '2024-05-31T17:10:05.000Z',
    usuario: 'Admin',
    acao: 'EXPORT_XML',
    descricao: 'Exportação de logs em XML',
    endpoint: '/api/logs/export/xml',
    metodo: 'GET',
    statusCode: 200,
    ip: '192.168.1.12'
  },
  {
    timestamp: '2024-05-31T17:05:33.000Z',
    usuario: 'João Silva',
    acao: 'EXPORT_PDF',
    descricao: 'Geração de relatório PDF',
    endpoint: '/api/logs/export/pdf',
    metodo: 'GET',
    statusCode: 200,
    ip: '192.168.1.12'
  },
  {
    timestamp: '2024-05-31T17:01:19.000Z',
    usuario: 'Maria Santos',
    acao: 'LOGIN',
    descricao: 'Usuário realizou login',
    endpoint: '/api/auth/login',
    metodo: 'POST',
    statusCode: 200,
    ip: '192.168.1.15'
  },
  {
    timestamp: '2024-05-31T16:58:42.000Z',
    usuario: 'Pedro Oliveira',
    acao: 'UPLOAD',
    descricao: 'Upload de imagem do filme',
    endpoint: '/api/filmes/789/imagem',
    metodo: 'POST',
    statusCode: 200,
    ip: '192.168.1.18'
  },
  {
    timestamp: '2024-05-31T16:55:10.000Z',
    usuario: 'Admin',
    acao: 'LOGIN_ERROR',
    descricao: 'Falha ao realizar login',
    endpoint: '/api/auth/login',
    metodo: 'POST',
    statusCode: 401,
    ip: '192.168.1.10'
  }
];

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
  document.querySelectorAll('#currentUserName').forEach((element) => {
    element.textContent = name.split(' ')[0];
  });
  document.querySelectorAll('.user-box > span').forEach((element) => {
    element.textContent = name.split(' ')[0];
  });
  applyUserAvatar(name);
  if (previewMode && !currentUser) {
    document.querySelectorAll('#currentUserName').forEach((element) => {
      element.textContent = 'Lucas';
    });
    document.querySelectorAll('.user-box > span').forEach((element) => {
      element.textContent = 'Lucas';
    });
    applyUserAvatar('Lucas Silva');
  }

  if (adminSession) {
    renderAdminDashboardCharts({});
    loadAdminDashboardStats();
  }
}

function applyUserAvatar(name) {
  const initials = getInitials(name);
  const colors = getAvatarColors(name);

  document.querySelectorAll('.user-box .avatar').forEach((avatar) => {
    avatar.textContent = initials;
    avatar.style.setProperty('--avatar-color-a', colors[0]);
    avatar.style.setProperty('--avatar-color-b', colors[1]);
  });
}

function getAvatarColors(name = '') {
  const palettes = [
    ['#8f4e38', '#5a0f0f'],
    ['#9a6a3b', '#5a0f0f'],
    ['#7d1919', '#2a2a2a'],
    ['#b27654', '#5a0f0f'],
    ['#6d4734', '#151515'],
    ['#9f5f45', '#2a2a2a']
  ];
  const key = String(name || '').trim().charCodeAt(0) || 0;
  return palettes[key % palettes.length];
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
    if (response.status === 401 && error.message === 'Token invalido ou expirado.') {
      clearSessionAndReload(false);
    }
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
    'Campos obrigatorios ausentes.': 'Preencha todos os campos obrigatórios.',
    'Token invalido ou expirado.': 'Sessão expirada. Saia e entre novamente como admin.'
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
    const memberSinceKey = `memberSince:${currentUser.id || currentUser.email}`;
    if (!localStorage.getItem(memberSinceKey)) {
      localStorage.setItem(memberSinceKey, new Date().toISOString());
    }
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
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    const userBox = button.closest('.user-box');
    const isOpen = userBox?.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    userBox?.querySelector('.user-menu')?.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });
});

document.querySelectorAll('[data-user-menu-profile]').forEach((button) => {
  button.addEventListener('click', () => {
    closeUserMenus();
    showPage('perfil');
  });
});

document.querySelectorAll('[data-user-menu-logout]').forEach((button) => {
  button.addEventListener('click', logoutAndReload);
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.user-box')) {
    closeUserMenus();
  }
});

function closeUserMenus() {
  document.querySelectorAll('.user-box.menu-open').forEach((userBox) => {
    userBox.classList.remove('menu-open');
    userBox.querySelector('#logoutBtn')?.setAttribute('aria-expanded', 'false');
    userBox.querySelector('.user-menu')?.setAttribute('aria-hidden', 'true');
  });
}

document.getElementById('adminLogoutBtn').addEventListener('click', logoutAndReload);

document.querySelector('.admin-menu-button').addEventListener('click', () => {
  document.querySelector('.admin-sidebar').classList.toggle('menu-open');
});

document.querySelectorAll('[data-admin-view]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    showAdminView(link.dataset.adminView);
    if (link.dataset.adminConfigShortcut) {
      showAdminConfigTab(link.dataset.adminConfigShortcut);
    } else if (link.dataset.adminView === 'config') {
      showAdminConfigTab('settings');
    }
    document.querySelector('.admin-sidebar').classList.remove('menu-open');
  });
});

document.querySelectorAll('[data-admin-config-tab]').forEach((button) => {
  button.addEventListener('click', () => showAdminConfigTab(button.dataset.adminConfigTab));
});

document.querySelectorAll('[data-admin-log-panel]').forEach((button) => {
  button.addEventListener('click', () => showAdminLogPanel(button.dataset.adminLogPanel));
});

document.querySelectorAll('[data-admin-dashboard-modal]').forEach((button) => {
  button.addEventListener('click', () => openAdminDashboardModal(button.dataset.adminDashboardModal));
});

document.getElementById('closeAdminDashboardModal')?.addEventListener('click', closeAdminDashboardModal);
document.getElementById('adminDashboardModal')?.addEventListener('click', (event) => {
  if (event.target.id === 'adminDashboardModal') {
    closeAdminDashboardModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAdminDashboardModal();
  }
});

document.getElementById('adminAddAdministrator')?.addEventListener('click', openAdminProfileFormForCreate);

document.getElementById('adminProfileSave')?.addEventListener('click', saveAdministratorProfile);
document.getElementById('adminAdministratorsBody')?.addEventListener('click', (event) => {
  const editButton = event.target.closest('[data-admin-edit]');
  const deleteButton = event.target.closest('[data-admin-delete]');

  if (editButton) {
    openEditAdministratorModal(editButton.closest('tr'));
  }

  if (deleteButton) {
    openDeleteAdministratorModal(deleteButton.closest('tr'));
  }
});

document.getElementById('adminOpenXmlExport')?.addEventListener('click', openAdminXmlExportPanel);
document.getElementById('adminOpenJsonImport')?.addEventListener('click', openAdminJsonImportPanel);
document.getElementById('adminOpenJsonExport')?.addEventListener('click', openAdminJsonExportPanel);
document.getElementById('adminOpenPdfExport')?.addEventListener('click', openAdminPdfExportPanel);
document.getElementById('adminCancelJsonImport')?.addEventListener('click', closeAdminJsonImportPanel);
document.getElementById('adminConfirmJsonImport')?.addEventListener('click', importAdminJsonFile);
document.getElementById('adminJsonFile')?.addEventListener('change', () => {
  const fileName = document.getElementById('adminJsonFile')?.files?.[0]?.name;
  setAdminJsonImportStatus(fileName ? `Arquivo selecionado: ${fileName}` : '');
});
document.querySelector('.admin-export-btn')?.addEventListener('click', () => {
  showAdminView('config');
  showAdminConfigTab('logs');
  showAdminLogPanel('export');
});
document.getElementById('adminDownloadXmlPreview')?.addEventListener('click', async () => {
  await ensureAdminLogsLoaded();
  await downloadAdminExport('xml');
});
document.getElementById('adminDownloadJsonPreview')?.addEventListener('click', async () => {
  await ensureAdminLogsLoaded();
  await downloadAdminExport('json');
});
document.getElementById('adminDownloadPdfPreview')?.addEventListener('click', async () => {
  await ensureAdminLogsLoaded();
  await downloadAdminExport('pdf');
});
document.getElementById('adminCopyXmlPreview')?.addEventListener('click', async () => {
  const preview = document.getElementById('adminXmlPreview')?.textContent || '';
  await navigator.clipboard?.writeText(preview).catch(() => null);
});
document.getElementById('adminCopyJsonPreview')?.addEventListener('click', async () => {
  const preview = document.getElementById('adminJsonPreview')?.textContent || '';
  await navigator.clipboard?.writeText(preview).catch(() => null);
});
['adminXmlPeriod', 'adminXmlStartDate', 'adminXmlEndDate', 'adminXmlUser', 'adminXmlType', 'adminXmlStatus', 'adminXmlSearch', 'adminJsonEntity', 'adminPdfScope', 'adminPdfGenre'].forEach((id) => {
  document.getElementById(id)?.addEventListener('change', updateAdminXmlPreview);
  document.getElementById(id)?.addEventListener('input', updateAdminXmlPreview);
});
document.getElementById('adminJsonEntity')?.addEventListener('change', updateAdminJsonStatusOptions);
document.getElementById('adminPdfScope')?.addEventListener('change', () => {
  updateAdminPdfGenreFilterState();
  updateAdminXmlPreview();
});
document.getElementById('adminXmlPeriod')?.addEventListener('change', () => {
  if (document.querySelector('.admin-xml-filters')?.classList.contains('json-mode')) {
    applyAdminJsonPeriodDates();
  }
});
document.getElementById('adminApplyXmlFilters')?.addEventListener('click', updateAdminXmlPreview);
document.getElementById('adminClearXmlFilters')?.addEventListener('click', clearAdminXmlFilters);

document.getElementById('adminTopSearch').addEventListener('input', applyAdminTopFilters);
document.getElementById('adminTopFilter').addEventListener('change', applyAdminTopFilters);
document.querySelectorAll('.admin-chart-card select').forEach((select) => {
  select.addEventListener('change', () => {
    loadAdminDashboardStats();
    filterAdminCharts();
  });
});
document.getElementById('adminChartFilterButton')?.addEventListener('click', openAdminChartFilterModal);
document.getElementById('adminCancelChartFilter')?.addEventListener('click', closeAdminChartFilterModal);
document.getElementById('adminApplyChartFilter')?.addEventListener('click', applyAdminChartFilterModal);
document.getElementById('adminChartFilterModal')?.addEventListener('click', (event) => {
  if (event.target.id === 'adminChartFilterModal') {
    closeAdminChartFilterModal();
  }
});

document.getElementById('adminRefreshLogs')?.addEventListener('click', loadAdminLogs);
document.getElementById('adminLogsBody')?.addEventListener('click', handleAdminLogsClick);
document.getElementById('adminCancelDeleteLog')?.addEventListener('click', closeDeleteLogModal);
document.getElementById('adminConfirmDeleteLog')?.addEventListener('click', confirmDeleteLog);
document.getElementById('adminCancelEditAdministrator')?.addEventListener('click', closeEditAdministratorModal);
document.getElementById('adminConfirmEditAdministrator')?.addEventListener('click', confirmEditAdministrator);
document.getElementById('adminEditAdministratorModal')?.addEventListener('click', (event) => {
  if (event.target.id === 'adminEditAdministratorModal') {
    closeEditAdministratorModal();
  }
});
document.getElementById('adminCancelDeleteAdministrator')?.addEventListener('click', closeDeleteAdministratorModal);
document.getElementById('adminConfirmDeleteAdministrator')?.addEventListener('click', confirmDeleteAdministrator);
document.getElementById('adminDeleteAdministratorModal')?.addEventListener('click', (event) => {
  if (event.target.id === 'adminDeleteAdministratorModal') {
    closeDeleteAdministratorModal();
  }
});
document.getElementById('adminOpenMovieForm').addEventListener('click', () => {
  openAdminMovieForm();
});

document.getElementById('adminMoviesTableBody').addEventListener('click', (event) => {
  const editButton = event.target.closest('.catalog-action.edit');
  const deleteButton = event.target.closest('.catalog-action.delete');
  const row = event.target.closest('tr');

  if (!row) return;
  if (!row.dataset.id && !row.dataset.title) return;

  if (editButton) {
    openEditConfirmModal(row.dataset);
    return;
  }

  if (deleteButton) {
    openDeleteConfirmModal(row.dataset);
    return;
  }

  openAdminMovieDetailsModal(row.dataset);
});

document.getElementById('adminCloseMovieDetails').addEventListener('click', closeAdminMovieDetailsModal);

document.getElementById('adminMovieDetailsModal').addEventListener('click', (event) => {
  if (event.target.id === 'adminMovieDetailsModal') {
    closeAdminMovieDetailsModal();
  }
});

document.getElementById('adminMoviesPagination').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-admin-movie-page]');
  if (!button) return;

  adminMoviesPage = Number(button.dataset.adminMoviePage);
  renderAdminMoviesPage();
});

document.getElementById('adminCancelEditConfirm').addEventListener('click', closeEditConfirmModal);

document.getElementById('adminEditConfirmModal').addEventListener('click', (event) => {
  if (event.target.id === 'adminEditConfirmModal') {
    closeEditConfirmModal();
  }
});

document.getElementById('adminConfirmEditMovie').addEventListener('click', () => {
  if (pendingEditMovie) {
    openAdminMovieForm(pendingEditMovie);
  }
  closeEditConfirmModal();
});

document.getElementById('adminCancelDeleteConfirm').addEventListener('click', closeDeleteConfirmModal);

document.getElementById('adminDeleteConfirmModal').addEventListener('click', (event) => {
  if (event.target.id === 'adminDeleteConfirmModal') {
    closeDeleteConfirmModal();
  }
});

document.getElementById('adminConfirmDeleteMovie').addEventListener('click', () => {
  deleteAdminMovie();
});

document.querySelectorAll('.user-action.lock').forEach((button) => {
  button.addEventListener('click', () => {
    const userName = button.closest('tr').querySelector('td strong').textContent;
    openInactivateUserModal(userName);
  });
});

document.getElementById('adminCancelInactivateUser').addEventListener('click', closeInactivateUserModal);

document.getElementById('adminInactivateUserModal').addEventListener('click', (event) => {
  if (event.target.id === 'adminInactivateUserModal') {
    closeInactivateUserModal();
  }
});

document.getElementById('adminConfirmInactivateUser').addEventListener('click', () => {
  closeInactivateUserModal();
});

document.querySelectorAll('.user-action.delete').forEach((button) => {
  button.addEventListener('click', () => {
    const row = button.closest('tr');
    const userName = row.querySelector('td strong').textContent;
    const isInactive = row.querySelector('.user-status-pill')?.classList.contains('inactive');
    openDeleteUserModal(userName, isInactive);
  });
});

document.getElementById('adminCancelDeleteUser').addEventListener('click', closeDeleteUserModal);

document.getElementById('adminDeleteUserModal').addEventListener('click', (event) => {
  if (event.target.id === 'adminDeleteUserModal') {
    closeDeleteUserModal();
  }
});

document.getElementById('adminConfirmDeleteUser').addEventListener('click', () => {
  closeDeleteUserModal();
});

document.querySelectorAll('.user-action.view').forEach((button) => {
  button.addEventListener('click', () => {
    openUserDetailsModal(button.closest('tr'));
  });
});

document.querySelector('.admin-users-table tbody')?.addEventListener('click', (event) => {
  const button = event.target.closest('.user-action');
  const row = event.target.closest('tr');
  if (!button || !row) return;

  if (button.classList.contains('view')) {
    openUserDetailsModal(row);
    return;
  }

  if (button.classList.contains('lock')) {
    const userName = row.querySelector('td strong')?.textContent || 'este usuário';
    openInactivateUserModal(userName);
    return;
  }

  if (button.classList.contains('delete')) {
    const userName = row.querySelector('td strong')?.textContent || 'este usuário';
    const isInactive = row.querySelector('.user-status-pill')?.classList.contains('inactive');
    openDeleteUserModal(userName, isInactive);
  }
});

document.getElementById('adminCloseUserDetails').addEventListener('click', closeUserDetailsModal);

document.getElementById('adminUserDetailsModal').addEventListener('click', (event) => {
  if (event.target.id === 'adminUserDetailsModal') {
    closeUserDetailsModal();
  }
});

document.getElementById('adminBackToCatalog').addEventListener('click', () => {
  document.getElementById('adminMoviesView').classList.remove('creating');
  document.querySelector('.admin-main').classList.remove('creating-movie');
  editingMovieId = null;
});

document.getElementById('adminCancelMovieForm').addEventListener('click', () => {
  document.getElementById('adminMoviesView').classList.remove('creating');
  document.querySelector('.admin-main').classList.remove('creating-movie');
  editingMovieId = null;
});

document.getElementById('adminMovieCover').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    updateAdminMoviePreviewImage('');
    return;
  }

  updateAdminMoviePreviewImage(URL.createObjectURL(file));
});

[
  'adminMovieTitle',
  'adminMovieGenre',
  'adminMovieDirector',
  'adminMovieDuration',
  'adminMovieYear',
  'adminMovieRating',
  'adminMovieDescription'
].forEach((fieldId) => {
  document.getElementById(fieldId).addEventListener('input', updateAdminMoviePreview);
  document.getElementById(fieldId).addEventListener('change', updateAdminMoviePreview);
});

['adminMovieDuration', 'adminMovieYear'].forEach((fieldId) => {
  document.getElementById(fieldId).addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '');
  });
});

document.getElementById('adminMovieForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitter = event.submitter;
  pendingMovieSaveStatus = submitter ? submitter.dataset.movieStatus : 'publicado';
  openSaveMovieConfirmModal();
});

document.getElementById('adminCancelSaveMovie').addEventListener('click', closeSaveMovieConfirmModal);

document.getElementById('adminSaveMovieConfirmModal').addEventListener('click', (event) => {
  if (event.target.id === 'adminSaveMovieConfirmModal') {
    closeSaveMovieConfirmModal();
  }
});

document.getElementById('adminConfirmSaveMovie').addEventListener('click', saveAdminMovie);

async function saveAdminMovie() {
  closeSaveMovieConfirmModal();

  const status = pendingMovieSaveStatus || 'publicado';
  const statusElement = document.getElementById('adminMovieStatus');
  statusElement.textContent = 'Salvando filme...';
  const isEditing = Boolean(editingMovieId);
  const moviePayload = buildAdminMoviePayload(status);
  const coverFile = document.getElementById('adminMovieCover').files[0];
  const hasCoverFile = Boolean(coverFile);
  const body = hasCoverFile ? buildAdminMovieFormData(moviePayload, coverFile) : JSON.stringify(moviePayload);
  const headers = hasCoverFile ? {} : { 'Content-Type': 'application/json' };
  const wasEditing = Boolean(editingMovieId);
  const movieId = editingMovieId;

  document.getElementById('adminMoviesView').classList.remove('creating');
  document.querySelector('.admin-main').classList.remove('creating-movie');
  editingMovieId = null;
  document.getElementById('adminMoviesTableBody').innerHTML = '<tr><td colspan="7">Salvando filme...</td></tr>';
  document.getElementById('adminMoviesTableCount').textContent = 'Salvando filme...';

  try {
    await api(wasEditing ? `/filmes/${movieId}` : '/filmes', {
      method: wasEditing ? 'PUT' : 'POST',
      headers,
      body
    });

    adminMoviesPage = 1;
    await loadAdminMovies();
    await loadAdminDashboardStats();
  } catch (error) {
    document.getElementById('adminMoviesTableBody').innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
    document.getElementById('adminMoviesTableCount').textContent = 'Erro ao salvar filme';
  }
}

function openAdminMovieForm(movie = null) {
  const isEditing = Boolean(movie);
  editingMovieId = isEditing ? movie.id : null;
  document.getElementById('adminMoviesView').classList.add('creating');
  document.querySelector('.admin-main').classList.add('creating-movie');

  const title = isEditing ? movie.title : '';
  const genre = isEditing ? movie.genre : '';
  const genreLabel = isEditing ? movie.genreLabel : 'Gênero';
  const director = isEditing ? movie.director : '';
  const duration = isEditing ? String(movie.duration || '').replace(/\D/g, '') : '';
  const year = isEditing ? movie.year : '';
  const rating = isEditing ? movie.rating : '12';
  const description = isEditing ? movie.description : '';

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
  document.getElementById('adminMovieDescription').value = description;
  document.getElementById('adminMovieStatus').textContent = '';

  document.getElementById('adminMovieCover').value = '';
  updateAdminMoviePreviewImage(movie?.cover || movie?.capaUrl || '');
  updateAdminMoviePreview();
}

function buildAdminMovieFormData(payload, coverFile) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  formData.append('capa', coverFile);
  return formData;
}

function openSaveMovieConfirmModal() {
  const movieTitle = document.getElementById('adminMovieTitle').value.trim() || 'este filme';
  document.getElementById('adminSaveMovieConfirmTitle').textContent = editingMovieId ? 'Salvar alterações?' : 'Cadastrar filme?';
  document.getElementById('adminSaveMovieConfirmName').textContent = movieTitle;
  document.getElementById('adminConfirmSaveMovie').textContent = editingMovieId ? 'Salvar alterações' : 'Cadastrar filme';
  document.getElementById('adminSaveMovieConfirmModal').classList.add('visible');
  document.getElementById('adminSaveMovieConfirmModal').setAttribute('aria-hidden', 'false');
}

function closeSaveMovieConfirmModal() {
  document.getElementById('adminSaveMovieConfirmModal').classList.remove('visible');
  document.getElementById('adminSaveMovieConfirmModal').setAttribute('aria-hidden', 'true');
}

function updateAdminMoviePreviewImage(src) {
  const previewImage = document.getElementById('adminMoviePreviewImage');
  if (src) {
    previewImage.src = src;
  } else {
    previewImage.src = 'https://images.unsplash.com/photo-1614726365952-510103b1bbb4?auto=format&fit=crop&w=780&q=80';
  }
}

function updateAdminMoviePreview() {
  const title = document.getElementById('adminMovieTitle').value.trim() || 'Novo filme';
  const genreSelect = document.getElementById('adminMovieGenre');
  const genreLabel = genreSelect.options[genreSelect.selectedIndex]?.text || 'Gênero';
  const director = document.getElementById('adminMovieDirector').value.trim() || 'Diretor';
  const durationValue = document.getElementById('adminMovieDuration').value.trim();
  const duration = durationValue ? `${durationValue} min` : '0 min';
  const yearValue = document.getElementById('adminMovieYear').value.trim();
  const year = yearValue ? `${yearValue} ano` : 'Ano';
  const rating = document.getElementById('adminMovieRating').value || '12';
  const ratingLabel = rating === 'L' ? 'Livre' : `${rating}+`;
  const description = document.getElementById('adminMovieDescription').value.trim()
    || 'A sinopse do filme aparecerá aqui.';

  document.querySelector('.movie-preview-card h3').textContent = title;
  document.querySelector('.movie-preview-card p span:first-child').textContent = genreLabel;
  document.querySelector('.movie-preview-card p span:last-child').textContent = director;
  document.querySelector('.movie-preview-meta').innerHTML = `<b>◷</b>${duration} <b>•</b> ${year} <mark>${ratingLabel}</mark>`;
  document.querySelector('.movie-preview-card article > div > p:last-child').textContent = description;
  updateAdminSynopsisCount();
}

function updateAdminSynopsisCount() {
  const synopsis = document.getElementById('adminMovieDescription');
  const counter = document.querySelector('.movie-synopsis small');
  counter.textContent = `${synopsis.value.length}/${synopsis.maxLength || 500}`;
}

function openEditConfirmModal(movie) {
  pendingEditMovie = movie;
  document.getElementById('adminEditConfirmMovie').textContent = movie.title || 'este filme';
  document.getElementById('adminEditConfirmModal').classList.add('visible');
  document.getElementById('adminEditConfirmModal').setAttribute('aria-hidden', 'false');
}

function closeEditConfirmModal() {
  pendingEditMovie = null;
  document.getElementById('adminEditConfirmModal').classList.remove('visible');
  document.getElementById('adminEditConfirmModal').setAttribute('aria-hidden', 'true');
}

function openDeleteConfirmModal(movie) {
  pendingDeleteMovie = movie;
  document.getElementById('adminDeleteConfirmMovie').textContent = movie.title || 'este filme';
  document.getElementById('adminDeleteConfirmModal').classList.add('visible');
  document.getElementById('adminDeleteConfirmModal').setAttribute('aria-hidden', 'false');
}

function closeDeleteConfirmModal() {
  pendingDeleteMovie = null;
  document.getElementById('adminDeleteConfirmModal').classList.remove('visible');
  document.getElementById('adminDeleteConfirmModal').setAttribute('aria-hidden', 'true');
}

function fixPortugueseText(value) {
  const replacements = {
    '\u00c3\u0192\u00c2\u00a7': '\u00e7',
    '\u00c3\u0192\u00c2\u00a3': '\u00e3',
    '\u00c3\u0192\u00c2\u00aa': '\u00ea',
    '\u00c3\u0192\u00c2\u00a1': '\u00e1',
    '\u00c3\u0192\u00c2\u00a9': '\u00e9',
    '\u00c3\u0192\u00c2\u00ad': '\u00ed',
    '\u00c3\u0192\u00c2\u00b3': '\u00f3',
    '\u00c3\u0192\u00c2\u00ba': '\u00fa',
    '\u00c3\u00a7': '\u00e7',
    '\u00c3\u00a3': '\u00e3',
    '\u00c3\u00aa': '\u00ea',
    '\u00c3\u00a1': '\u00e1',
    '\u00c3\u00a9': '\u00e9',
    '\u00c3\u00ad': '\u00ed',
    '\u00c3\u00b3': '\u00f3',
    '\u00c3\u00ba': '\u00fa'
  };

  return Object.entries(replacements).reduce((text, [from, to]) => (
    text.split(from).join(to)
  ), String(value || ''));
}

function openAdminMovieDetailsModal(movie) {
  const rating = movie.rating === 'L'
    ? 'Livre'
    : movie.rating && movie.rating !== '-' ? `${movie.rating}+` : 'Classificação';
  const description = fixPortugueseText(movie.description || 'Sem sinopse cadastrada.');
  const genre = fixPortugueseText(movie.genreLabel || 'G\u00eanero');
  const director = fixPortugueseText(movie.director || 'Diretor');
  const year = movie.year && movie.year !== '-' ? movie.year : 'Ano';
  const duration = fixPortugueseText(movie.duration || 'Dura\u00e7\u00e3o');

  document.getElementById('adminMovieDetailsImage').src = movie.cover || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=960&q=80';
  document.getElementById('adminMovieDetailsImage').alt = `Capa do filme ${fixPortugueseText(movie.title || '')}`.trim();
  document.getElementById('adminMovieDetailsTitle').textContent = fixPortugueseText(movie.title || 'Filme');
  document.getElementById('adminMovieDetailsGenre').textContent = genre;
  document.getElementById('adminMovieDetailsDirector').textContent = director;
  document.getElementById('adminMovieDetailsYear').textContent = year;
  document.getElementById('adminMovieDetailsRating').textContent = rating;
  document.getElementById('adminMovieDetailsDuration').textContent = duration;
  document.getElementById('adminMovieDetailsInfoDirector').textContent = director;
  document.getElementById('adminMovieDetailsInfoDuration').textContent = duration.replace('min', 'minutos');
  document.getElementById('adminMovieDetailsInfoYear').textContent = year;
  document.getElementById('adminMovieDetailsInfoGenre').textContent = genre;
  document.getElementById('adminMovieDetailsInfoRating').textContent = rating;
  document.getElementById('adminMovieDetailsDescription').textContent = description;

  document.getElementById('adminMovieDetailsModal').classList.add('visible');
  document.getElementById('adminMovieDetailsModal').setAttribute('aria-hidden', 'false');
}

function closeAdminMovieDetailsModal() {
  document.getElementById('adminMovieDetailsModal').classList.remove('visible');
  document.getElementById('adminMovieDetailsModal').setAttribute('aria-hidden', 'true');
}

function formatAdminTotal(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR');
}

function updateAdminDashboardStats(stats = {}) {
  const totalMovies = document.getElementById('adminTotalMovies');
  const totalUsers = document.getElementById('adminTotalUsers');
  const totalFavorites = document.getElementById('adminTotalFavorites');

  if (totalMovies) totalMovies.textContent = formatAdminTotal(stats.filmes);
  if (totalUsers) totalUsers.textContent = formatAdminTotal(stats.usuarios);
  if (totalFavorites) totalFavorites.textContent = formatAdminTotal(stats.favoritos);
}

function updateAdminDashboardCards(data = {}) {
  renderAdminRecentMovies(data.filmesRecentes || []);
  renderAdminLatestReviews(data.ultimasAvaliacoes || []);
  renderAdminFavoriteMovies(data.filmesFavoritados || []);
  renderAdminRecentActivity(data.atividadesRecentes || []);
  renderAdminDashboardCharts(data.graficos || {});
  updateAdminDashboardModalData(data);
}

function renderAdminRecentMovies(movies = []) {
  const container = document.getElementById('adminRecentMovies');
  if (!container) return;

  const visibleMovies = movies.slice(0, 8);
  if (!visibleMovies.length) {
    container.innerHTML = '<p class="admin-empty-state">Nenhum filme cadastrado recentemente.</p>';
    return;
  }

  container.innerHTML = visibleMovies.map((movie, index) => {
    const title = movie.titulo || 'Filme sem título';
    const genre = movie.genero_nome || generoNameById(movie.genero_id) || 'Sem gênero';
    const details = [movie.ano_lancamento, movie.duracao].filter(Boolean).join(' • ');
    const cover = resolveImageUrl(movie.capa_url) || getCuratedMovieImage(index);

    return `
      <article class="admin-added-movie" style="--admin-movie-cover: url('${escapeHtml(cover)}')">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(genre)}</span>
          <small>${escapeHtml(details || '-')}</small>
        </div>
      </article>
    `;
  }).join('');
}

function renderAdminDashboardCharts(charts = {}) {
  renderAdminHorizontalChart(
    'watched',
    charts.filmesMaisFavoritados || charts.filmesMaisAssistidos || [],
    'Nenhum favorito registrado no período.',
    'favoritos'
  );
  renderAdminGenreChart(charts.filmesPorGenero || []);
  renderAdminUserStatusChart(charts.usuariosPorStatus || []);
  renderAdminHorizontalChart(
    'comments',
    charts.filmesMaisComentados || [],
    'Nenhum comentário registrado ainda.',
    'comentários'
  );
}

function renderAdminHorizontalChart(kind, rows = [], emptyText, valueLabel) {
  const card = document.querySelector(`.admin-chart-card[data-chart-kind="${kind}"]`);
  const chart = card?.querySelector('.admin-horizontal-chart');
  if (!chart) return;

  const values = rows
    .map((row) => ({
      label: row.titulo || row.label || 'Filme',
      total: Number(row.total) || 0
    }))
    .filter((row) => row.total > 0);

  if (!values.length) {
    destroyAdminChartJsInstance(kind);
    chart.innerHTML = `<p class="admin-empty-state">${escapeHtml(emptyText)}</p>`;
    return;
  }

  if (window.Chart) {
    renderAdminChartJsBar({
      instanceKey: kind,
      chart,
      values,
      valueLabel
    });
    return;
  }

  const maxValue = Math.max(...values.map((row) => row.total));

  chart.innerHTML = values.map((row) => {
    const width = Math.max(4, Math.round((row.total / maxValue) * 100));
    return `<div class="chart-row"><span>${escapeHtml(row.label)}</span><i title="${formatAdminTotal(row.total)} ${escapeHtml(valueLabel)}" style="--bar: ${width}%"></i><b>${escapeHtml(formatAdminTotal(row.total))}</b></div>`;
  }).join('');
}

function renderAdminChartJsBar({ instanceKey, chart, values, valueLabel }) {
  chart.innerHTML = '<canvas class="admin-chart-canvas" aria-label="Gráfico de barras"></canvas>';
  const canvas = chart.querySelector('canvas');
  const color = instanceKey === 'comments' ? '#c65f63' : '#d99142';

  destroyAdminChartJsInstance(instanceKey);

  adminChartInstances[instanceKey] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: values.map((row) => row.label),
      datasets: [{
        label: valueLabel,
        data: values.map((row) => row.total),
        backgroundColor: color,
        borderColor: color,
        borderRadius: 3,
        barThickness: 13
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${formatAdminTotal(context.raw)} ${valueLabel}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          display: false,
          ticks: {
            color: 'rgba(232, 226, 214, 0.62)',
            precision: 0
          },
          grid: {
            color: 'rgba(232, 226, 214, 0.06)'
          },
          border: {
            display: false
          }
        },
        y: {
          ticks: {
            color: 'rgba(232, 226, 214, 0.86)',
            font: {
              size: 10,
              weight: 800
            }
          },
          grid: {
            display: false
          },
          border: {
            display: false
          }
        }
      }
    }
  });
}

function renderAdminGenreChart(rows = []) {
  const card = document.querySelector('.admin-chart-card[data-chart-kind="genres"]');
  const chart = card?.querySelector('.admin-donut-chart');
  const legend = card?.querySelector('.admin-chart-legend');
  if (!chart || !legend) return;

  const values = rows
    .map((row) => ({
      label: row.genero || row.label || 'Sem gênero',
      total: Number(row.total) || 0
    }))
    .filter((row) => row.total > 0);

  if (window.Chart) {
    renderAdminChartJsDonut({
      instanceKey: 'genres',
      chart,
      legend,
      values,
      centerLabel: 'Filmes',
      emptyText: 'Nenhum filme cadastrado por gênero.',
      colors: ['#d9811d', '#b37425', '#2f5a78', '#638d4f', '#7653a3', '#c65f63', '#7e8583']
    });
    return;
  }

  renderAdminDonutChart({
    chart,
    legend,
    values,
    centerLabel: 'Filmes',
    emptyText: 'Nenhum filme cadastrado por gênero.'
  });
}

function renderAdminUserStatusChart(rows = []) {
  const card = document.querySelector('.admin-chart-card[data-chart-kind="users"]');
  const chart = card?.querySelector('.admin-status-donut');
  const legend = card?.querySelector('.admin-chart-legend');
  if (!chart || !legend) return;

  const values = rows
    .map((row) => ({
      label: formatAdminStatusLabel(row.status || row.label || 'sem status'),
      total: Number(row.total) || 0
    }))
    .filter((row) => row.total > 0);

  if (window.Chart && chart.querySelector('canvas')) {
    renderAdminChartJsDonut({
      instanceKey: 'users',
      chart,
      legend,
      values,
      centerLabel: 'Usuários',
      emptyText: 'Nenhum usuário cadastrado.',
      colors: ['#638d4f', '#c65f63', '#2f5a78', '#7653a3', '#d9811d', '#b37425', '#7e8583']
    });
    return;
  }

  renderAdminDonutChart({
    chart,
    legend,
    values,
    centerLabel: 'Usuários',
    emptyText: 'Nenhum usuário cadastrado.'
  });
}

function renderAdminChartJsDonut({ instanceKey, chart, legend, values, centerLabel, emptyText, colors }) {
  chart.querySelectorAll('.donut-label').forEach((label) => label.remove());
  let canvas = chart.querySelector('canvas');
  let center = chart.querySelector('.donut-center');

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'admin-chart-canvas';
    canvas.setAttribute('aria-label', `Gráfico de ${centerLabel}`);
    chart.prepend(canvas);
  }

  if (!center) {
    center = document.createElement('div');
    center.className = 'donut-center';
    chart.appendChild(center);
  }

  const total = values.reduce((sum, row) => sum + row.total, 0);
  const palette = colors || ['#d9811d', '#638d4f', '#2f5a78', '#7653a3', '#c65f63', '#b37425', '#7e8583'];

  chart.style.background = 'transparent';

  if (!total) {
    destroyAdminChartJsInstance(instanceKey);
    if (center) center.innerHTML = `<strong>0</strong><span>${escapeHtml(centerLabel)}</span>`;
    legend.innerHTML = `<span>${escapeHtml(emptyText)}</span>`;
    return;
  }

  if (center) {
    center.innerHTML = `<strong>${escapeHtml(formatAdminTotal(total))}</strong><span>${escapeHtml(centerLabel)}</span>`;
  }

  destroyAdminChartJsInstance(instanceKey);

  adminChartInstances[instanceKey] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: values.map((row) => row.label),
      datasets: [{
        data: values.map((row) => row.total),
        backgroundColor: values.map((_, index) => palette[index % palette.length]),
        borderColor: '#080c10',
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = Number(context.raw) || 0;
              const percent = total ? ((value / total) * 100).toFixed(1).replace('.', ',') : '0';
              return `${context.label}: ${formatAdminTotal(value)} (${percent}%)`;
            }
          }
        }
      }
    }
  });

  legend.innerHTML = values.map((row, index) => {
    const percent = ((row.total / total) * 100).toFixed(1).replace('.', ',');
    const color = palette[index % palette.length];
    return `<span><i style="background: ${color}"></i>${escapeHtml(row.label)} <b>${escapeHtml(formatAdminTotal(row.total))} (${percent}%)</b></span>`;
  }).join('');
}

function destroyAdminChartJsInstance(instanceKey) {
  if (adminChartInstances[instanceKey]) {
    adminChartInstances[instanceKey].destroy();
    delete adminChartInstances[instanceKey];
  }
}

function renderAdminDonutChart({ chart, legend, values, centerLabel, emptyText }) {
  const total = values.reduce((sum, row) => sum + row.total, 0);
  const colors = ['#d9811d', '#638d4f', '#2f5a78', '#7653a3', '#c65f63', '#b37425', '#7e8583'];
  const labelClasses = ['action', 'drama', 'scifi', 'adventure', 'suspense', 'comedy', 'other'];

  if (!total) {
    chart.style.background = '';
    chart.innerHTML = `<div class="donut-center"><strong>0</strong><span>${escapeHtml(centerLabel)}</span></div>`;
    legend.innerHTML = `<span>${escapeHtml(emptyText)}</span>`;
    return;
  }

  let current = 0;
  const segments = values.map((row, index) => {
    const start = current;
    const degrees = (row.total / total) * 360;
    current += degrees;
    return `${colors[index % colors.length]} ${start.toFixed(2)}deg ${current.toFixed(2)}deg`;
  });

  chart.style.background = `radial-gradient(circle, rgba(9, 12, 15, 1) 0 31%, transparent 32%), conic-gradient(${segments.join(', ')})`;
  chart.innerHTML = `
    <div class="donut-center"><strong>${escapeHtml(formatAdminTotal(total))}</strong><span>${escapeHtml(centerLabel)}</span></div>
    ${values.slice(0, 7).map((row, index) => {
      const percent = ((row.total / total) * 100).toFixed(1).replace('.', ',');
      return `<span class="donut-label ${labelClasses[index] || 'other'}">${escapeHtml(row.label)}<br />${escapeHtml(formatAdminTotal(row.total))} (${percent}%)</span>`;
    }).join('')}
  `;

  legend.innerHTML = values.map((row, index) => {
    const percent = ((row.total / total) * 100).toFixed(1).replace('.', ',');
    const color = colors[index % colors.length];
    return `<span><i style="background: ${color}"></i>${escapeHtml(row.label)} <b>${escapeHtml(formatAdminTotal(row.total))} (${percent}%)</b></span>`;
  }).join('');
}

function formatAdminStatusLabel(status) {
  const normalized = normalizeText(status);
  if (normalized === 'ativo') return 'Ativos';
  if (normalized === 'inativo') return 'Inativos';
  return status || 'Sem status';
}

async function loadAdminDashboardStats() {
  try {
    const query = getAdminChartQueryString();
    const dashboardData = await api(`/relatorios/json${query ? `?${query}` : ''}`);
    adminDashboardSummary = dashboardData || {};
    updateAdminDashboardStats(dashboardData);
    updateAdminDashboardCards(dashboardData);
  } catch (error) {
    console.warn('Nao foi possivel carregar os totais do dashboard.', error.message);
    renderAdminDashboardCharts({});
  }
}

function getAdminChartQueryString() {
  const params = new URLSearchParams();
  const watchedPeriod = document.querySelector('.admin-chart-card[data-chart-kind="watched"] select')?.value;
  const genre = document.querySelector('.admin-chart-card[data-chart-kind="genres"] select')?.value;
  const usersPeriod = document.querySelector('.admin-chart-card[data-chart-kind="users"] select')?.value;
  const commentsPeriod = document.querySelector('.admin-chart-card[data-chart-kind="comments"] select')?.value;

  if (watchedPeriod) params.set('watchedPeriod', watchedPeriod);
  if (genre) params.set('genero', genre);
  if (usersPeriod) params.set('usersPeriod', usersPeriod);
  if (commentsPeriod) params.set('commentsPeriod', commentsPeriod);

  return params.toString();
}

function renderAdminLatestReviews(reviews = []) {
  const container = document.getElementById('adminLatestReviews');
  if (!container) return;

  const visibleReviews = reviews.slice(0, 2);
  if (!visibleReviews.length) {
    container.innerHTML = '<p class="admin-empty-state">Nenhuma avaliação registrada.</p>';
    return;
  }

  container.innerHTML = visibleReviews.map((review, index) => {
    const name = review.usuario_nome || 'Usuário';
    const rating = Number(review.nota) || 0;
    const stars = '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));
    const avatarClass = index % 2 === 0 ? 'purple' : 'blue';
    return `
      <div class="admin-review-item">
        <span class="admin-review-avatar ${avatarClass}">${escapeHtml(getInitials(name) || 'U')}</span>
        <div>
          <strong>${escapeHtml(name)}</strong>
          <span class="admin-stars">${escapeHtml(stars)}</span>
          <p>${escapeHtml(review.comentario || 'Sem comentário escrito.')}</p>
          <small>${escapeHtml(formatAdminDate(review.updated_at))} <b>${escapeHtml(review.filme_titulo || 'Filme não informado')}</b></small>
        </div>
      </div>
    `;
  }).join('');
}

function renderAdminFavoriteMovies(favorites = []) {
  const list = document.getElementById('adminFavoriteMovies');
  if (!list) return;

  const visibleFavorites = favorites.slice(0, 5);
  if (!visibleFavorites.length) {
    list.innerHTML = '<li class="admin-empty-state">Nenhum favorito registrado.</li>';
    return;
  }

  list.innerHTML = visibleFavorites.map((movie, index) => `
    <li>
      <span>${index + 1}</span>
      <img src="${escapeHtml(resolveImageUrl(movie.capa_url))}" alt="" />
      <strong>${escapeHtml(movie.titulo || 'Filme sem título')}</strong>
      <b>${escapeHtml(formatAdminTotal(movie.total))} ♥</b>
    </li>
  `).join('');
}

function renderAdminRecentActivity(activities = []) {
  const list = document.getElementById('adminRecentActivity');
  if (!list) return;

  const visibleActivities = activities.slice(0, 5);
  if (!visibleActivities.length) {
    list.innerHTML = '<li class="admin-empty-state">Nenhuma atividade registrada.</li>';
    return;
  }

  list.innerHTML = visibleActivities.map((activity) => {
    const meta = getAdminActivityMeta(activity);
    return `
      <li>
        <i class="${meta.className}">${meta.icon}</i>
        ${escapeHtml(meta.text)}
        <span>${escapeHtml(formatAdminDate(activity.timestamp))}</span>
      </li>
    `;
  }).join('');
}

function updateAdminDashboardModalData(data = {}) {
  adminDashboardModalData.reviews.items = (data.ultimasAvaliacoes || []).map((review) => [
    review.usuario_nome || 'Usuário',
    `${Number(review.nota) || 0}/5`,
    review.filme_titulo || 'Filme não informado',
    review.comentario || 'Sem comentário escrito.',
    formatAdminDate(review.updated_at)
  ]);

  adminDashboardModalData.favorites.items = (data.filmesFavoritados || []).map((movie, index) => [
    String(index + 1),
    movie.titulo || 'Filme sem título',
    `${formatAdminTotal(movie.total)} favoritos`
  ]);

  adminDashboardModalData.activity.items = (data.atividadesRecentes || []).map((activity) => {
    const meta = getAdminActivityMeta(activity);
    return [
      meta.category,
      meta.text,
      formatAdminDate(activity.timestamp)
    ];
  });
}

function getAdminActivityMeta(activity = {}) {
  const action = String(activity.acao || '').toUpperCase();
  const description = activity.descricao || activity.endpoint || 'Atividade registrada';
  const endpoint = String(activity.endpoint || '').toLowerCase();

  if (action.includes('FAVORITO')) {
    return { category: 'Favorito', className: 'red', icon: '♥', text: description };
  }
  if (action.includes('AVALIACAO') || action.includes('AVALIAÇÃO') || description.toLowerCase().includes('avaliou')) {
    return { category: 'Avaliação', className: 'gold', icon: '★', text: description };
  }
  if (endpoint.includes('usuarios') || endpoint.includes('auth') || description.toLowerCase().includes('usuário')) {
    return { category: 'Usuário', className: 'blue', icon: '●', text: description };
  }
  if (action.includes('INCLUSAO') || action.includes('CREATE') || action.includes('POST')) {
    return { category: 'Cadastro', className: 'purple', icon: '▦', text: description };
  }
  if (action.includes('ALTERACAO')) {
    return { category: 'Alteração', className: 'green', icon: '□', text: description };
  }
  if (action.includes('EXCLUSAO') || action.includes('DELETE')) {
    return { category: 'Exclusão', className: 'red', icon: '■', text: description };
  }

  return { category: 'Sistema', className: 'green', icon: '□', text: description };
}

function formatAdminDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

async function loadAdminUsers() {
  const tableBody = document.querySelector('.admin-users-view .admin-users-table tbody');
  const userCount = document.querySelector('.admin-users-view .admin-catalog-footer span');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="7">Carregando usuários...</td></tr>';
  if (userCount) userCount.textContent = 'Carregando usuários...';

  try {
    adminUsersCache = await api('/auth/usuarios');
    renderAdminUsersTable(adminUsersCache);
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
    if (userCount) userCount.textContent = 'Erro ao carregar usuários';
  }
}

function renderAdminUsersTable(users = []) {
  const tableBody = document.querySelector('.admin-users-view .admin-users-table tbody');
  if (!tableBody) return;

  if (!users.length) {
    tableBody.innerHTML = '<tr><td colspan="7">Nenhum usuário cadastrado.</td></tr>';
    updateAdminUsersCount(0);
    return;
  }

  tableBody.innerHTML = users.map(renderAdminUserRow).join('');
  filterAdminUsers();
}

function renderAdminUserRow(user, index) {
  const name = user.nome || 'Usuário sem nome';
  const email = user.email || '-';
  const type = formatAdminUserType(user.tipo_usuario);
  const status = String(user.status || 'ativo').toLowerCase() === 'inativo' ? 'Inativo' : 'Ativo';
  const statusClass = status === 'Inativo' ? 'inactive' : 'active';
  const typeClass = type === 'Admin' ? ' admin' : '';
  const avatarClass = getAdminUserAvatarClass(name, index);
  const createdAt = formatAdminDate(user.created_at);
  const lastAccess = formatAdminDate(user.updated_at);

  return `
    <tr data-user-id="${escapeHtml(user.id || '')}">
      <td>
        <span class="user-table-avatar ${avatarClass}">${escapeHtml(getInitials(name) || 'U')}</span>
        <strong>${escapeHtml(name)}</strong>
      </td>
      <td>${escapeHtml(email)}</td>
      <td><span class="user-type-pill${typeClass}">${escapeHtml(type)}</span></td>
      <td><span class="user-status-pill ${statusClass}">${escapeHtml(status)}</span></td>
      <td>${escapeHtml(lastAccess)}</td>
      <td>${escapeHtml(createdAt)}</td>
      <td>
        <button class="user-action view" type="button" aria-label="Ver ${escapeHtml(name)}">👁</button>
        <button class="user-action lock" type="button" aria-label="Bloquear ${escapeHtml(name)}"><span class="lock-icon" aria-hidden="true"></span></button>
        <button class="user-action delete" type="button" aria-label="Excluir ${escapeHtml(name)}">🗑</button>
      </td>
    </tr>
  `;
}

function formatAdminUserType(type) {
  return String(type || '').toLowerCase() === 'admin' ? 'Admin' : 'Usuário';
}

function getAdminUserAvatarClass(name = '', index = 0) {
  const colors = ['purple', 'blue', 'orange', 'teal', 'red', 'yellow'];
  const initialCode = (name.trim().charCodeAt(0) || index) + index;
  return colors[Math.abs(initialCode) % colors.length];
}

function updateAdminUsersCount(count) {
  const userCount = document.querySelector('.admin-users-view .admin-catalog-footer span');
  if (!userCount) return;

  userCount.textContent = count
    ? `Mostrando 1 a ${count} de ${count} usuários`
    : 'Nenhum usuário encontrado';
}

async function loadAdminMovies() {
  const tableBody = document.getElementById('adminMoviesTableBody');
  const tableCount = document.getElementById('adminMoviesTableCount');
  tableBody.innerHTML = '<tr><td colspan="7">Carregando filmes...</td></tr>';
  tableCount.textContent = 'Carregando filmes...';

  try {
    adminMoviesCache = await api('/filmes');
    adminMoviesFiltered = adminMoviesCache;
    applyAdminTopFilters();
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="7">${escapeHtml(error.message)}</td></tr>`;
    tableCount.textContent = 'Erro ao carregar filmes';
    document.getElementById('adminMoviesPagination').innerHTML = '';
  }
}

function renderAdminMoviesPage() {
  const tableBody = document.getElementById('adminMoviesTableBody');
  const tableCount = document.getElementById('adminMoviesTableCount');
  const total = adminMoviesFiltered.length;

  if (!total) {
    tableBody.innerHTML = '<tr><td colspan="7">Nenhum filme cadastrado.</td></tr>';
    tableCount.textContent = 'Nenhum filme cadastrado';
    renderAdminMoviesPagination();
    return;
  }

  const start = (adminMoviesPage - 1) * ADMIN_MOVIES_PER_PAGE;
  const pageItems = adminMoviesFiltered.slice(start, start + ADMIN_MOVIES_PER_PAGE);
  tableBody.innerHTML = pageItems.map(renderAdminMovieRow).join('');
  tableCount.textContent = `Mostrando ${start + 1} a ${start + pageItems.length} de ${total} filmes`;
  renderAdminMoviesPagination();
}

function renderAdminMoviesPagination() {
  const pagination = document.getElementById('adminMoviesPagination');
  const totalPages = Math.max(1, Math.ceil(adminMoviesFiltered.length / ADMIN_MOVIES_PER_PAGE));

  if (totalPages <= 1) {
    pagination.innerHTML = `
      <button type="button" disabled>‹</button>
      <button class="active" type="button" data-admin-movie-page="1">1</button>
      <button type="button" disabled>›</button>
    `;
    return;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .map((page) => (
      `<button class="${page === adminMoviesPage ? 'active' : ''}" type="button" data-admin-movie-page="${page}">${page}</button>`
    ))
    .join('');

  pagination.innerHTML = `
    <button type="button" data-admin-movie-page="${Math.max(1, adminMoviesPage - 1)}" ${adminMoviesPage === 1 ? 'disabled' : ''}>‹</button>
    ${pages}
    <button type="button" data-admin-movie-page="${Math.min(totalPages, adminMoviesPage + 1)}" ${adminMoviesPage === totalPages ? 'disabled' : ''}>›</button>
  `;
}

function renderAdminMovieRow(movie) {
  const title = movie.titulo || 'Sem título';
  const genre = movie.genero_nome || generoNameById(movie.genero_id) || 'Sem gênero';
  const genreClass = getGenrePillClass(genre);
  const director = movie.diretor || '-';
  const year = movie.ano_lancamento || '-';
  const rating = movie.classificacao || '-';
  const duration = movie.duracao || '-';
  const poster = movie.capa_url || 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=80&q=80';

  return `
    <tr
      data-id="${movie.id}"
      data-title="${escapeHtml(title)}"
      data-genre="${movie.genero_id || ''}"
      data-genre-label="${escapeHtml(genre)}"
      data-director="${escapeHtml(director)}"
      data-duration="${escapeHtml(duration)}"
      data-year="${escapeHtml(String(year))}"
      data-rating="${escapeHtml(String(rating))}"
      data-description="${escapeHtml(movie.descricao || '')}"
      data-cover="${escapeHtml(poster)}"
    >
      <td>
        <img src="${escapeHtml(poster)}" alt="Poster ${escapeHtml(title)}" />
        <strong>${escapeHtml(title)}</strong>
      </td>
      <td><span class="genre-pill ${genreClass}">${escapeHtml(genre)}</span></td>
      <td>${escapeHtml(director)}</td>
      <td>${escapeHtml(String(year))}</td>
      <td><span class="rating-pill">${escapeHtml(String(rating))}</span></td>
      <td>${escapeHtml(duration)}</td>
      <td>
        <button class="catalog-action edit" type="button" aria-label="Editar ${escapeHtml(title)}">✎</button>
        <button class="catalog-action delete" type="button" aria-label="Excluir ${escapeHtml(title)}">🗑</button>
      </td>
    </tr>
  `;
}

async function deleteAdminMovie() {
  if (!pendingDeleteMovie?.id) {
    closeDeleteConfirmModal();
    return;
  }

  try {
    await api(`/filmes/${pendingDeleteMovie.id}`, { method: 'DELETE' });
    closeDeleteConfirmModal();
    await loadAdminMovies();
    await loadAdminDashboardStats();
  } catch (error) {
    document.getElementById('adminDeleteConfirmMovie').textContent = error.message;
  }
}

function generoNameById(id) {
  const genres = {
    1: 'Ação',
    3: 'Drama',
    4: 'Ficção Científica',
    5: 'Suspense',
    6: 'Romance'
  };
  return genres[Number(id)] || '';
}

function getGenrePillClass(genre = '') {
  const normalized = genre.toLowerCase();
  if (normalized.includes('drama')) return 'drama';
  if (normalized.includes('ação') || normalized.includes('acao')) return 'action';
  return 'sci-fi';
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const adminDashboardModalData = {
  recentMovies: {
    title: 'Filmes adicionados',
    items: [
      ['Duna: Parte Dois', 'Ação, Aventura, Drama', '19/05/2024'],
      ['Godzilla e Kong: O Novo Império', 'Ação, Aventura, Ficção Científica', '18/05/2024'],
      ['Kung Fu Panda 4', 'Animação, Ação, Comédia', '17/05/2024'],
      ['Oppenheimer', 'Drama, Biografia, História', '16/05/2024'],
      ['Interestelar', 'Drama, Ficção Científica', '15/05/2024'],
      ['Batman: O Cavaleiro das Trevas', 'Ação, Crime, Drama', '14/05/2024']
    ]
  },
  reviews: {
    title: 'Últimas avaliações',
    items: [
      ['Josiely', '5/5', 'Oppenheimer', 'Filme excelente! História envolvente do início ao fim.', 'Hoje, 14:32'],
      ['Carlos', '4/5', 'Batman: O Cavaleiro das Trevas', 'Muito bom! Efeitos incríveis e ótimas atuações.', 'Hoje, 11:05'],
      ['Ana Paula', '5/5', 'Interestelar', 'Um dos melhores filmes de ficção científica.', 'Ontem, 20:14'],
      ['Marina', '4/5', 'A Origem', 'Roteiro criativo e cheio de reviravoltas.', 'Ontem, 18:40']
    ]
  },
  favorites: {
    title: 'Filmes mais favoritados',
    items: [
      ['1', 'Interestelar', '1.245 favoritos'],
      ['2', 'Batman: O Cavaleiro das Trevas', '987 favoritos'],
      ['3', 'Oppenheimer', '862 favoritos'],
      ['4', 'A Origem', '756 favoritos'],
      ['5', 'Coringa', '645 favoritos'],
      ['6', 'Duna: Parte Dois', '522 favoritos'],
      ['7', 'Clube da Luta', '481 favoritos']
    ]
  },
  activity: {
    title: 'Atividades recentes',
    items: [
      ['Filme', 'Novo filme cadastrado: Duna: Parte Dois', 'Hoje, 14:32'],
      ['Usuário', 'Novo usuário registrado: Juliana Souza', 'Hoje, 13:15'],
      ['Avaliação', 'Nova avaliação em Oppenheimer', 'Hoje, 11:05'],
      ['Comentário', 'Comentário denunciado em Coringa', 'Ontem, 21:44'],
      ['Comentário', 'Usuário excluiu comentário em A Origem', 'Ontem, 16:30'],
      ['Filme', 'Filme atualizado: Batman: O Cavaleiro das Trevas', 'Ontem, 15:10']
    ]
  }
};

function openAdminDashboardModal(type) {
  const modal = document.getElementById('adminDashboardModal');
  const title = document.getElementById('adminDashboardModalTitle');
  const content = document.getElementById('adminDashboardModalContent');
  const data = adminDashboardModalData[type];

  if (!modal || !title || !content || !data) return;

  title.textContent = data.title;
  content.innerHTML = renderAdminDashboardModalContent(type, data.items);
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
}

function closeAdminDashboardModal() {
  const modal = document.getElementById('adminDashboardModal');
  if (!modal) return;

  modal.classList.remove('visible');
  modal.setAttribute('aria-hidden', 'true');
}

function renderAdminDashboardModalContent(type, items) {
  if (type === 'recentMovies') {
    return `<div class="admin-dashboard-modal-list movie-list">${items.map(([title, genre, date]) => `
      <article>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(genre)}</span>
        <time>${escapeHtml(date)}</time>
      </article>
    `).join('')}</div>`;
  }

  if (type === 'reviews') {
    return `<div class="admin-dashboard-modal-list review-list">${items.map(([user, rating, movie, comment, date]) => `
      <article>
        <div>
          <strong>${escapeHtml(user)}</strong>
          <span>${escapeHtml(rating)} em ${escapeHtml(movie)}</span>
        </div>
        <p>${escapeHtml(comment)}</p>
        <time>${escapeHtml(date)}</time>
      </article>
    `).join('')}</div>`;
  }

  if (type === 'favorites') {
    return `<div class="admin-dashboard-modal-list favorite-list">${items.map(([position, title, count]) => `
      <article>
        <b>${escapeHtml(position)}</b>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(count)}</span>
      </article>
    `).join('')}</div>`;
  }

  return `<div class="admin-dashboard-modal-list activity-list">${items.map(([category, description, date]) => `
    <article>
      <b>${escapeHtml(category)}</b>
      <strong>${escapeHtml(description)}</strong>
      <time>${escapeHtml(date)}</time>
    </article>
  `).join('')}</div>`;
}

function openInactivateUserModal(userName) {
  pendingInactiveUser = userName;
  document.getElementById('adminInactivateUserName').textContent = userName || 'este usuário';
  document.getElementById('adminInactivateUserModal').classList.add('visible');
  document.getElementById('adminInactivateUserModal').setAttribute('aria-hidden', 'false');
}

function closeInactivateUserModal() {
  pendingInactiveUser = null;
  document.getElementById('adminInactivateUserModal').classList.remove('visible');
  document.getElementById('adminInactivateUserModal').setAttribute('aria-hidden', 'true');
}

function openDeleteUserModal(userName, canDelete) {
  pendingDeleteUser = canDelete ? userName : null;
  document.getElementById('adminDeleteUserName').textContent = userName || 'este usuário';
  document.getElementById('adminDeleteUserMessage').innerHTML = canDelete
    ? `Deseja excluir <strong id="adminDeleteUserName">${userName}</strong>?`
    : `Para excluir <strong id="adminDeleteUserName">${userName}</strong>, primeiro inative este usuário.`;
  document.getElementById('adminConfirmDeleteUser').textContent = canDelete ? 'Excluir usuário' : 'Entendi';
  document.getElementById('adminConfirmDeleteUser').classList.toggle('danger', canDelete);
  document.getElementById('adminCancelDeleteUser').style.display = canDelete ? '' : 'none';
  document.getElementById('adminDeleteUserModal').classList.add('visible');
  document.getElementById('adminDeleteUserModal').setAttribute('aria-hidden', 'false');
}

function closeDeleteUserModal() {
  pendingDeleteUser = null;
  document.getElementById('adminDeleteUserModal').classList.remove('visible');
  document.getElementById('adminDeleteUserModal').setAttribute('aria-hidden', 'true');
  document.getElementById('adminCancelDeleteUser').style.display = '';
}

function openUserDetailsModal(row) {
  const cells = row.querySelectorAll('td');
  const user = {
    nome: cells[0].querySelector('strong').textContent,
    email: cells[1].textContent.trim(),
    tipo: cells[2].textContent.trim(),
    status: cells[3].textContent.trim(),
    ultimoAcesso: cells[4].textContent.trim(),
    cadastro: cells[5].textContent.trim()
  };

  document.getElementById('adminUserDetailsTitle').textContent = user.nome;
  document.getElementById('adminUserDetailsList').innerHTML = `
    <p><span>Nome</span><strong>${user.nome}</strong></p>
    <p><span>E-mail</span><strong>${user.email}</strong></p>
    <p><span>Tipo</span><strong>${user.tipo}</strong></p>
    <p><span>Status</span><strong>${user.status}</strong></p>
    <p><span>Último acesso</span><strong>${user.ultimoAcesso}</strong></p>
    <p><span>Data de cadastro</span><strong>${user.cadastro}</strong></p>
  `;
  document.getElementById('adminUserDetailsModal').classList.add('visible');
  document.getElementById('adminUserDetailsModal').setAttribute('aria-hidden', 'false');
}

function closeUserDetailsModal() {
  document.getElementById('adminUserDetailsModal').classList.remove('visible');
  document.getElementById('adminUserDetailsModal').setAttribute('aria-hidden', 'true');
}

function showAdminView(view) {
  adminCurrentView = view;
  document.querySelectorAll('[data-admin-view]').forEach((link) => {
    link.classList.toggle('active', link.dataset.adminView === view && !link.dataset.adminConfigShortcut);
  });

  const isMoviesView = view === 'movies';
  const isConfigView = view === 'config';
  const isUsersView = view === 'users';
  document.querySelector('.admin-main').classList.toggle('show-movies', isMoviesView);
  document.querySelector('.admin-main').classList.toggle('show-config', isConfigView);
  document.querySelector('.admin-main').classList.toggle('show-users', isUsersView);
  document.querySelector('.admin-main').classList.remove('show-logs');
  document.querySelector('.admin-main').classList.remove('show-settings');
  document.querySelector('.admin-main').classList.remove('show-chart');
  if (isMoviesView) {
    document.getElementById('adminMoviesView').classList.remove('creating');
    document.querySelector('.admin-main').classList.remove('creating-movie');
    editingMovieId = null;
    loadAdminMovies();
  } else if (isUsersView) {
    loadAdminUsers();
  } else if (view === 'dashboard') {
    loadAdminDashboardStats();
  } else {
    document.querySelector('.admin-main').classList.remove('creating-movie');
  }

  const titles = {
    movies: ['Filmes', 'Cadastro e gestão do catálogo'],
    users: ['Usuários', 'Gerenciamento de usuários'],
    config: ['Configurações', 'Sistema, segurança e logs'],
    dashboard: ['Painel Administrativo', 'Visao geral do sistema']
  };
  const [title, subtitle] = titles[view] || titles.dashboard;
  document.querySelector('.admin-user-topbar-title').textContent = isUsersView ? 'Usuários' : 'Log';
  document.querySelector('.admin-topbar h1').textContent = title;
  document.querySelector('.admin-topbar p').textContent = subtitle;
  updateAdminTopFilter(view);
  applyAdminTopFilters();
}

function updateAdminTopFilter(view) {
  const filter = document.getElementById('adminTopFilter');
  const search = document.getElementById('adminTopSearch');
  if (!filter) return;

  if (view === 'logs') {
    if (search) {
      search.value = '';
      search.placeholder = 'Buscar logs...';
    }
    filter.setAttribute('aria-label', 'Filtrar por status');
    filter.innerHTML = `
      <option>Todos os status</option>
      <option>200</option>
      <option>201</option>
      <option>400</option>
      <option>401</option>
      <option>500</option>
    `;
    return;
  }

  if (view === 'users') {
    if (search) {
      search.value = '';
      search.placeholder = 'Buscar usuários...';
    }
    filter.setAttribute('aria-label', 'Filtrar por status');
    filter.innerHTML = `
      <option>Todos os status</option>
      <option>Ativo</option>
      <option>Inativo</option>
    `;
    return;
  }

  if (view === 'config') {
    if (search) {
      search.value = '';
      search.placeholder = 'Buscar gráficos...';
    }
    filter.setAttribute('aria-label', 'Filtrar por status');
    filter.innerHTML = `
      <option>Todos os status</option>
      <option>Ativo</option>
      <option>Inativo</option>
    `;
    return;
  }

  if (search) {
    search.value = '';
    search.placeholder = view === 'movies' ? 'Buscar filmes...' : 'Buscar filmes, usuários, etc...';
  }
  filter.setAttribute('aria-label', 'Filtrar por gênero');
  filter.innerHTML = `
    <option>Todos os gêneros</option>
    <option>Ação</option>
    <option>Drama</option>
    <option>Ficção Científica</option>
    <option>Romance</option>
    <option>Suspense</option>
  `;
}

function applyAdminTopFilters() {
  if (adminCurrentView === 'movies') {
    filterAdminMovies();
    return;
  }

  if (adminCurrentView === 'users') {
    filterAdminUsers();
    return;
  }

  if (adminCurrentView === 'logs') {
    filterAdminLogs();
    return;
  }

  if (adminCurrentView === 'config') {
    filterAdminCharts();
  }
}

function openAdminProfileFormForCreate() {
  const profileForm = document.getElementById('adminProfileForm');
  const nameInput = document.getElementById('adminProfileName');
  const emailInput = document.getElementById('adminProfileEmail');
  const passwordInput = document.getElementById('adminProfilePassword');
  const confirmPasswordInput = document.getElementById('adminProfileConfirmPassword');
  const statusInput = document.getElementById('adminProfileStatus');

  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (confirmPasswordInput) confirmPasswordInput.value = '';
  if (statusInput) statusInput.value = 'Ativo';
  editingAdministratorRow = null;

  profileForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  nameInput?.focus({ preventScroll: true });
}

function openAdminProfileFormForEdit(adminData) {
  const profileForm = document.getElementById('adminProfileForm');
  const nameInput = document.getElementById('adminProfileName');
  const emailInput = document.getElementById('adminProfileEmail');
  const passwordInput = document.getElementById('adminProfilePassword');
  const confirmPasswordInput = document.getElementById('adminProfileConfirmPassword');
  const statusInput = document.getElementById('adminProfileStatus');

  if (nameInput) nameInput.value = adminData.adminName || '';
  if (emailInput) emailInput.value = adminData.adminEmail || '';
  if (passwordInput) passwordInput.value = '';
  if (confirmPasswordInput) confirmPasswordInput.value = '';
  if (statusInput) statusInput.value = adminData.adminStatus || 'Ativo';

  profileForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  nameInput?.focus({ preventScroll: true });
}

function openEditAdministratorModal(row) {
  if (!row) return;

  pendingEditAdministratorRow = row;
  pendingEditAdministratorData = row.dataset;
  document.getElementById('adminEditAdministratorName').textContent = row.dataset.adminName || 'este administrador';
  document.getElementById('adminEditAdministratorModal').classList.add('visible');
  document.getElementById('adminEditAdministratorModal').setAttribute('aria-hidden', 'false');
}

function closeEditAdministratorModal() {
  pendingEditAdministratorData = null;
  pendingEditAdministratorRow = null;
  document.getElementById('adminEditAdministratorModal').classList.remove('visible');
  document.getElementById('adminEditAdministratorModal').setAttribute('aria-hidden', 'true');
}

function confirmEditAdministrator() {
  if (pendingEditAdministratorData) {
    const adminData = pendingEditAdministratorData;
    editingAdministratorRow = pendingEditAdministratorRow;
    closeEditAdministratorModal();
    openAdminProfileFormForEdit(adminData);
  }
}

function clearAdministratorProfileForm() {
  const nameInput = document.getElementById('adminProfileName');
  const emailInput = document.getElementById('adminProfileEmail');
  const passwordInput = document.getElementById('adminProfilePassword');
  const confirmPasswordInput = document.getElementById('adminProfileConfirmPassword');
  const statusInput = document.getElementById('adminProfileStatus');

  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (confirmPasswordInput) confirmPasswordInput.value = '';
  if (statusInput) statusInput.value = 'Ativo';
  editingAdministratorRow = null;
}

function getAdministratorAvatarClass(name = '') {
  const initials = name.trim().charAt(0).toUpperCase();
  if (initials === 'A') return 'red';
  if (initials === 'J') return 'blue';
  if (initials === 'M') return 'purple';
  return 'blue';
}

function buildAdministratorRow(name, email, status, accessDate = null) {
  const initial = getInitials(name) || 'A';
  const avatarClass = getAdministratorAvatarClass(name);
  const statusClass = normalizeText(status) === 'inativo' ? 'red' : 'green';
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeStatus = escapeHtml(status);
  const date = accessDate ? new Date(accessDate) : new Date();
  const dateLabel = Number.isNaN(date.getTime())
    ? '-'
    : `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  return `
    <tr data-admin-name="${safeName}" data-admin-email="${safeEmail}" data-admin-status="${safeStatus}">
      <td><span class="settings-avatar ${avatarClass}">${escapeHtml(initial)}</span>${safeName}</td>
      <td>${safeEmail}</td>
      <td><span class="settings-pill ${statusClass}">${safeStatus}</span></td>
      <td>${escapeHtml(dateLabel)}</td>
      <td>
        <div class="settings-actions">
          <button type="button" data-admin-edit>Editar</button>
          <button class="settings-delete" type="button" aria-label="Excluir ${safeName}" data-admin-delete>🗑</button>
        </div>
      </td>
    </tr>
  `;
}

async function loadAdministratorsTable() {
  const administratorsBody = document.getElementById('adminAdministratorsBody');
  if (!administratorsBody) return;

  try {
    const administrators = await api('/auth/admins');
    administratorsBody.innerHTML = administrators.map((admin) => {
      const status = admin.status === 'inativo' ? 'Inativo' : 'Ativo';
      return buildAdministratorRow(admin.nome, admin.email, status, admin.updated_at);
    }).join('');
  } catch (error) {
    setStatus(error.message);
  }
}

function updateAdministratorRow(row, name, email, status) {
  const nextRow = document.createElement('tbody');
  nextRow.innerHTML = buildAdministratorRow(name, email, status).trim();
  row.replaceWith(nextRow.firstElementChild);
}

async function saveAdministratorProfile() {
  try {
    const name = document.getElementById('adminProfileName')?.value.trim() || '';
    const email = document.getElementById('adminProfileEmail')?.value.trim() || '';
    const password = document.getElementById('adminProfilePassword')?.value || '';
    const confirmPassword = document.getElementById('adminProfileConfirmPassword')?.value || '';
    const status = document.getElementById('adminProfileStatus')?.value || 'Ativo';
    const administratorsBody = document.getElementById('adminAdministratorsBody');

    if (!name || !email || !administratorsBody) return;

    if (password !== confirmPassword) {
      setStatus('As senhas não conferem.');
      return;
    }

    const payload = {
      nome: name,
      email,
      status,
      ...(password ? { senha: password } : {})
    };

    const path = editingAdministratorRow
      ? `/auth/admins/${encodeURIComponent(editingAdministratorRow.dataset.adminEmail || email)}`
      : '/auth/admins';

    const savedAdmin = await api(path, {
      method: editingAdministratorRow ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const savedStatus = savedAdmin.status === 'inativo' ? 'Inativo' : 'Ativo';

    if (editingAdministratorRow) {
      updateAdministratorRow(editingAdministratorRow, savedAdmin.nome || name, savedAdmin.email || email, savedStatus);
    } else {
      administratorsBody.insertAdjacentHTML('beforeend', buildAdministratorRow(savedAdmin.nome || name, savedAdmin.email || email, savedStatus));
    }

    clearAdministratorProfileForm();
    setStatus('Administrador salvo com sucesso.');
    loadAdminDashboardStats();
  } catch (error) {
    setStatus(error.message);
  }
}

function openDeleteAdministratorModal(row) {
  if (!row) return;

  pendingDeleteAdministratorRow = row;
  document.getElementById('adminDeleteAdministratorName').textContent = row.dataset.adminName || 'este administrador';
  document.getElementById('adminDeleteAdministratorModal').classList.add('visible');
  document.getElementById('adminDeleteAdministratorModal').setAttribute('aria-hidden', 'false');
}

function closeDeleteAdministratorModal() {
  pendingDeleteAdministratorRow = null;
  document.getElementById('adminDeleteAdministratorModal').classList.remove('visible');
  document.getElementById('adminDeleteAdministratorModal').setAttribute('aria-hidden', 'true');
}

async function confirmDeleteAdministrator() {
  if (!pendingDeleteAdministratorRow) return;

  try {
    await api(`/auth/admins/${encodeURIComponent(pendingDeleteAdministratorRow.dataset.adminEmail || '')}`, {
      method: 'DELETE'
    });
    pendingDeleteAdministratorRow.remove();
    loadAdminDashboardStats();
    closeDeleteAdministratorModal();
  } catch (error) {
    setStatus(error.message);
  }
}

function filterAdminCharts() {
  const chartShell = document.querySelector('.admin-chart-shell');
  if (!chartShell) return;

  const query = normalizeText(document.getElementById('adminTopSearch').value);
  const selectedStatus = normalizeText(document.getElementById('adminTopFilter').value);
  const shouldFilterStatus = selectedStatus && selectedStatus !== normalizeText('Todos os status');
  const selectedKinds = getSelectedChartKinds();
  const cards = Array.from(chartShell.querySelectorAll('.admin-chart-card'));
  let visibleCount = 0;

  cards.forEach((card) => {
    const status = normalizeText(card.dataset.status || 'Ativo');
    const kind = card.dataset.chartKind || '';
    const searchable = normalizeText(`${card.dataset.chartSearch || ''} ${card.textContent || ''}`);
    const isVisible = selectedKinds.includes(kind)
      && (!query || searchable.includes(query))
      && (!shouldFilterStatus || status === selectedStatus);
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  chartShell.classList.toggle('is-empty', visibleCount === 0);
}

function getSelectedChartKinds() {
  return [...new Set(Array.from(document.querySelectorAll('#adminChartFilterModal input:checked'))
    .map((input) => input.value))];
}

function openAdminChartFilterModal() {
  document.getElementById('adminChartFilterModal')?.classList.add('visible');
  document.getElementById('adminChartFilterModal')?.setAttribute('aria-hidden', 'false');
}

function closeAdminChartFilterModal() {
  document.getElementById('adminChartFilterModal')?.classList.remove('visible');
  document.getElementById('adminChartFilterModal')?.setAttribute('aria-hidden', 'true');
}

function applyAdminChartFilterModal() {
  const period = document.getElementById('adminChartPeriod')?.value;
  if (period) {
    document.querySelectorAll('.admin-chart-card select').forEach((select) => {
      const matchingOption = Array.from(select.options).find((option) => option.textContent === period);
      if (matchingOption) {
        select.value = period;
      }
    });
  }
  filterAdminCharts();
  closeAdminChartFilterModal();
}

function filterAdminMovies() {
  const query = normalizeText(document.getElementById('adminTopSearch').value);
  const selectedGenre = normalizeText(document.getElementById('adminTopFilter').value);
  const shouldFilterGenre = selectedGenre && selectedGenre !== normalizeText('Todos os gêneros');

  adminMoviesFiltered = adminMoviesCache.filter((movie) => {
    const genre = movie.genero_nome || generoNameById(movie.genero_id) || '';
    const searchable = normalizeText([
      movie.titulo,
      movie.titulo_original,
      movie.diretor,
      movie.ano_lancamento,
      movie.classificacao,
      movie.duracao,
      genre
    ].filter(Boolean).join(' '));
    const matchesQuery = !query || searchable.includes(query);
    const matchesGenre = !shouldFilterGenre || normalizeText(genre) === selectedGenre;

    return matchesQuery && matchesGenre;
  });

  adminMoviesPage = 1;
  renderAdminMoviesPage();
}

function filterAdminUsers() {
  const query = normalizeText(document.getElementById('adminTopSearch').value);
  const selectedStatus = normalizeText(document.getElementById('adminTopFilter').value);
  const shouldFilterStatus = selectedStatus && selectedStatus !== normalizeText('Todos os status');
  const rows = document.querySelectorAll('.admin-users-table tbody tr');
  let visibleCount = 0;

  rows.forEach((row) => {
    const status = normalizeText(row.querySelector('.user-status-pill')?.textContent || '');
    const searchable = normalizeText(row.textContent);
    const matchesQuery = !query || searchable.includes(query);
    const matchesStatus = !shouldFilterStatus || status === selectedStatus;
    const shouldShow = matchesQuery && matchesStatus;

    row.style.display = shouldShow ? '' : 'none';
    if (shouldShow) visibleCount += 1;
  });

  const userCount = document.querySelector('.admin-users-view .admin-catalog-footer span');
  if (userCount) {
    userCount.textContent = visibleCount
      ? `Mostrando 1 a ${visibleCount} de ${visibleCount} usuários`
      : 'Nenhum usuário encontrado';
  }
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function showAdminConfigTab(tab) {
  const isLogsTab = tab === 'logs';
  const isSettingsTab = tab === 'settings';
  const isChartTab = tab === 'chart';
  const adminMain = document.querySelector('.admin-main');
  adminMain.classList.toggle('show-logs', isLogsTab);
  adminMain.classList.toggle('show-settings', isSettingsTab);
  adminMain.classList.toggle('show-chart', isChartTab);
  if (isLogsTab) {
    adminCurrentView = 'logs';
    document.querySelector('.admin-user-topbar-title').textContent = 'Log';
    document.querySelector('.admin-topbar h1').textContent = 'Log';
    document.querySelector('.admin-topbar p').textContent = 'Eventos registrados pela API';
    updateAdminTopFilter('logs');
    showAdminLogPanel('logs');
  } else if (isSettingsTab) {
    adminCurrentView = 'config';
    document.querySelector('.admin-user-topbar-title').textContent = 'Configurações';
    document.querySelector('.admin-topbar h1').textContent = 'Configurações';
    document.querySelector('.admin-topbar p').textContent = 'Sistema, segurança e logs';
    updateAdminTopFilter('dashboard');
    clearAdministratorProfileForm();
    loadAdministratorsTable();
  } else if (adminCurrentView === 'logs' || isChartTab) {
    adminCurrentView = 'config';
    document.querySelector('.admin-user-topbar-title').textContent = 'Gráfico';
    document.querySelector('.admin-topbar h1').textContent = 'Gráfico';
    document.querySelector('.admin-topbar p').textContent = 'Visualização dos gráficos do sistema';
    updateAdminTopFilter('config');
    filterAdminCharts();
  }

  document.querySelectorAll('[data-admin-config-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminConfigTab === tab || (isSettingsTab && button.dataset.adminConfigTab === 'chart'));
  });
  document.querySelectorAll('[data-admin-config-shortcut]').forEach((link) => {
    link.classList.toggle('active', link.dataset.adminConfigShortcut === tab);
  });
  document.querySelectorAll('[data-admin-view="config"]:not([data-admin-config-shortcut])').forEach((link) => {
    link.classList.toggle('active', isSettingsTab);
  });

  document.getElementById('adminConfigChart').classList.toggle('active', isChartTab || isSettingsTab);
  document.getElementById('adminConfigLogs').classList.toggle('active', tab === 'logs');
  const adminConfigCurrentPage = document.getElementById('adminConfigCurrentPage');
  if (adminConfigCurrentPage) {
    adminConfigCurrentPage.textContent = isLogsTab ? 'Log' : (isSettingsTab ? 'Geral' : 'Gráfico');
  }

  if (isLogsTab) {
    loadAdminLogs();
  }
}

function showAdminLogPanel(panel) {
  const isExportPanel = panel === 'export';
  document.querySelectorAll('[data-admin-log-panel]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminLogPanel === panel);
  });
  document.getElementById('adminLogTablePanel')?.classList.toggle('active', !isExportPanel);
  document.getElementById('adminLogExportPanel')?.classList.toggle('active', isExportPanel);
}

async function ensureAdminLogsLoaded() {
  if (adminLogsCache.length) return adminLogsCache;

  try {
    adminLogsCache = await api('/logs');
  } catch (error) {
    console.warn('Nao foi possivel carregar logs reais para exportacao.', error.message);
    adminLogsCache = [];
  }

  return adminLogsCache;
}

async function openAdminXmlExportPanel() {
  setAdminExportMode('xml');
  await ensureAdminLogsLoaded();
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonExportPanel')?.classList.remove('visible');
  document.getElementById('adminPdfExportPanel')?.classList.remove('visible');
  updateAdminXmlPreview();
  document.getElementById('adminXmlExportPanel').classList.add('visible');
}

function openAdminJsonImportPanel() {
  setAdminExportMode('import');
  document.getElementById('adminXmlExportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonExportPanel')?.classList.remove('visible');
  document.getElementById('adminPdfExportPanel')?.classList.remove('visible');
  setAdminJsonImportStatus('');
  document.getElementById('adminJsonImportPanel')?.classList.add('visible');
}

function closeAdminJsonImportPanel() {
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
  setAdminJsonImportStatus('');
}

function setAdminJsonImportStatus(message, isError = false) {
  const status = document.getElementById('adminJsonImportStatus');
  if (!status) return;

  status.textContent = message || '';
  status.classList.toggle('error', Boolean(isError));
}

async function importAdminJsonFile() {
  const fileInput = document.getElementById('adminJsonFile');
  const tableSelect = document.getElementById('adminJsonTable');
  const selectedTable = normalizeText([
    tableSelect?.value || '',
    tableSelect?.selectedOptions?.[0]?.textContent || ''
  ].join(' '));
  const file = fileInput?.files?.[0];

  if (!file) {
    setAdminJsonImportStatus('Selecione um arquivo JSON para importar.', true);
    return;
  }

  if (false && !selectedTable.includes('filmes')) {
    setAdminJsonImportStatus('Neste momento a importação JSON está disponível para Filmes.', true);
    return;
  }

  const formData = new FormData();
  formData.append('arquivo', file);
  setAdminJsonImportStatus('Importando filmes...');

  try {
    const importedMovies = await api('/filmes/importar/json', {
      method: 'POST',
      body: formData
    });
    const total = Array.isArray(importedMovies) ? importedMovies.length : 0;
    setAdminJsonImportStatus(`${total} filme${total === 1 ? '' : 's'} importado${total === 1 ? '' : 's'} com sucesso.`);
    if (fileInput) fileInput.value = '';
    await loadAdminMovies();
    await loadAdminDashboardStats();
    await loadAdminLogs();
  } catch (error) {
    setAdminJsonImportStatus(error.message, true);
  }
}

async function openAdminJsonExportPanel() {
  setAdminExportMode('json');
  await ensureAdminLogsLoaded();
  document.getElementById('adminXmlExportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
  document.getElementById('adminPdfExportPanel')?.classList.remove('visible');
  updateAdminJsonPreview();
  document.getElementById('adminJsonExportPanel')?.classList.add('visible');
}

async function openAdminPdfExportPanel() {
  setAdminExportMode('pdf');
  if (!Object.keys(adminDashboardSummary).length) {
    await loadAdminDashboardStats();
  }
  if (!adminMoviesCache.length) {
    await loadAdminMovies();
  }
  populateAdminPdfGenreFilter();
  updateAdminPdfGenreFilterState();
  if (!adminUsersCache.length) {
    await loadAdminUsers();
  }
  await ensureAdminLogsLoaded();
  document.getElementById('adminXmlExportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonExportPanel')?.classList.remove('visible');
  updateAdminPdfPreview();
  document.getElementById('adminPdfExportPanel')?.classList.add('visible');
}

function setAdminExportMode(mode) {
  const filters = document.querySelector('.admin-xml-filters');
  const description = filters?.querySelector('header p');
  filters?.classList.toggle('json-mode', mode === 'json');
  filters?.classList.toggle('xml-mode', mode === 'xml');
  filters?.classList.toggle('pdf-mode', mode === 'pdf');
  updateAdminJsonFilterControls(mode);
  if (description) {
    if (mode === 'json') {
      description.textContent = 'Filtre os dados do MySQL antes de exportar.';
    } else if (mode === 'xml') {
      description.textContent = 'Filtre os logs por usuário e status antes de exportar.';
    } else if (mode === 'pdf') {
      description.textContent = 'Escolha o conteúdo e o período do relatório PDF.';
    } else {
      description.textContent = 'Filtre os logs antes de exportar os dados.';
    }
  }
}

function updateAdminJsonFilterControls(mode) {
  const status = document.getElementById('adminXmlStatus');
  const action = document.getElementById('adminXmlType');
  const search = document.getElementById('adminXmlSearch');

  if (mode === 'json') {
    applyAdminJsonPeriodDates();
    updateAdminJsonStatusOptions();
    if (search) search.placeholder = 'Buscar por titulo, diretor, nome, e-mail...';
    return;
  }

  if (status) {
    status.innerHTML = `
      <option>Todos os status</option>
      <option>200</option>
      <option>204</option>
      <option>401</option>
      <option>404</option>
    `;
  }
  if (action) {
    action.innerHTML = `
      <option>Todas as acoes</option>
      <option>CREATE</option>
      <option>UPDATE</option>
      <option>DELETE</option>
      <option>LOGIN</option>
      <option>EXPORT_XML</option>
    `;
  }
  if (search) search.placeholder = 'Buscar por IP, usuario, acao, etc...';
}

function applyAdminJsonPeriodDates() {
  const period = normalizeText(document.getElementById('adminXmlPeriod')?.value || '');
  const startInput = document.getElementById('adminXmlStartDate');
  const endInput = document.getElementById('adminXmlEndDate');
  if (!startInput || !endInput) return;

  const today = new Date();
  const startDate = new Date(today);
  if (period.includes('12')) {
    startDate.setMonth(startDate.getMonth() - 12);
  } else if (period.includes('ano')) {
    startDate.setMonth(0, 1);
  } else {
    startDate.setMonth(startDate.getMonth() - 6);
  }

  startInput.value = formatAdminFilterDate(startDate);
  endInput.value = formatAdminFilterDate(today);
}

function formatAdminFilterDate(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function updateAdminJsonStatusOptions() {
  const status = document.getElementById('adminXmlStatus');
  if (!status) return;

  const entity = getSelectedAdminJsonEntity();
  status.innerHTML = entity === 'usuarios'
    ? `
      <option>Todos os status</option>
      <option>Ativo</option>
      <option>Inativo</option>
    `
    : `
      <option>Todos os status</option>
      <option>Publicado</option>
      <option>Rascunho</option>
      <option>Arquivado</option>
    `;
}

function getFilteredAdminXmlLogs() {
  const selectedUser = normalizeText(document.getElementById('adminXmlUser')?.value || 'Todos');
  const selectedType = normalizeText(document.getElementById('adminXmlType')?.value || 'Todas as ações');
  const selectedStatus = normalizeText(document.getElementById('adminXmlStatus')?.value || 'Todos os status');
  const query = normalizeText(document.getElementById('adminXmlSearch')?.value || '');
  const logs = adminLogsCache;

  return logs.filter((log) => {
    const user = normalizeText(formatLogUser(log.usuario || 'anônimo'));
    const action = normalizeText(formatLogAction(log.acao || log.tipoEvento || ''));
    const status = normalizeText(log.statusCode || '');
    const searchable = normalizeText([
      formatLogUser(log.usuario || 'anônimo'),
      formatLogAction(log.acao || log.tipoEvento || ''),
      log.descricao || log.description || '',
      log.endpoint || '',
      log.ip || log.ipOrigem || log.ip_origem || '',
      log.statusCode || ''
    ].join(' '));
    const matchesUser = selectedUser === normalizeText('Todos') || user === selectedUser;
    const matchesType = selectedType === normalizeText('Todas as ações') || action === selectedType;
    const matchesStatus = selectedStatus === normalizeText('Todos os status') || status === selectedStatus;
    const matchesQuery = !query || searchable.includes(query);
    return matchesUser && matchesType && matchesStatus && matchesQuery;
  });
}

function clearAdminXmlFilters() {
  const defaults = {
    adminXmlPeriod: 'Últimos 6 meses',
    adminXmlStartDate: '01/12/2023',
    adminXmlEndDate: '31/05/2024',
    adminXmlUser: 'Todos',
    adminXmlStatus: 'Todos os status',
    adminXmlType: 'Todas as ações',
    adminXmlSearch: '',
    adminJsonEntity: 'filmes',
    adminPdfScope: 'completo',
    adminPdfGenre: ''
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });
  if (document.querySelector('.admin-xml-filters')?.classList.contains('json-mode')) {
    applyAdminJsonPeriodDates();
    updateAdminJsonStatusOptions();
  }
  updateAdminXmlPreview();
}

function updateAdminXmlPreview() {
  const preview = document.getElementById('adminXmlPreview');
  if (!preview) return;

  const filteredLogs = getFilteredAdminXmlLogs();
  const previewLogs = filteredLogs.slice(0, 2);
  const xml = buildAdminLogsXML(previewLogs, filteredLogs.length > previewLogs.length);
  preview.textContent = xml;
  updateAdminJsonPreview();
  updateAdminPdfPreview();
}

function updateAdminJsonPreview() {
  const preview = document.getElementById('adminJsonPreview');
  if (!preview) return;

  if (document.querySelector('.admin-xml-filters')?.classList.contains('json-mode')) {
    preview.textContent = buildAdminEntityJsonPreview();
    return;
  }

  preview.textContent = buildAdminLogsJSON(getFilteredAdminXmlLogs().slice(0, 4));
}

function updateAdminPdfPreview() {
  const preview = document.getElementById('adminPdfPreview');
  if (!preview) return;

  const data = adminDashboardSummary || {};
  const scope = getSelectedAdminPdfScope();
  const filteredMovies = getAdminPdfPreviewMovies();
  const filteredUsers = getAdminPdfPreviewUsers();
  const reviews = data.ultimasAvaliacoes || [];
  const favorites = data.filmesFavoritados || [];
  const activities = data.atividadesRecentes || [];
  const count = document.getElementById('adminPdfPreviewCount');
  if (count) count.textContent = getAdminPdfScopeLabel(scope);

  preview.innerHTML = `
    <div class="admin-pdf-page">
      <h3>Catálogo7</h3>
      <h4>${escapeHtml(getAdminPdfScopeLabel(scope))}</h4>
      <p>Gerado em: ${escapeHtml(new Date().toLocaleString('pt-BR'))}</p>
      ${buildAdminPdfPreviewBody(scope, {
        data,
        filteredMovies,
        filteredUsers,
        reviews,
        favorites,
        activities
      })}
    </div>
  `;
}

function buildAdminPdfPreviewBody(scope, context) {
  const { data, filteredMovies, filteredUsers, reviews, favorites, activities } = context;
  const totals = getAdminPdfPreviewTotals(data, filteredMovies, filteredUsers);
  const previewFavorites = getAdminPdfPreviewFavorites(data, favorites);
  const previewReviews = getAdminPdfPreviewReviews(data, reviews);
  const previewActivities = getAdminPdfPreviewActivities(data, activities);

  if (scope === 'filmes') {
    return `
      <p><strong>Total de filmes no período:</strong> ${escapeHtml(formatAdminTotal(filteredMovies.length))}</p>
      ${buildAdminPdfPreviewTable(['Filme', 'Gênero', 'Ano'], filteredMovies.slice(0, 8).map((movie) => [
        movie.titulo || 'Filme',
        movie.genero_nome || generoNameById(movie.genero_id) || 'Sem gênero',
        movie.ano_lancamento || '-'
      ]))}
    `;
  }

  if (scope === 'usuarios') {
    return `
      <p><strong>Total de usuários no período:</strong> ${escapeHtml(formatAdminTotal(filteredUsers.length))}</p>
      ${buildAdminPdfPreviewTable(['Usuário', 'E-mail', 'Status'], filteredUsers.slice(0, 8).map((user) => [
        user.nome || 'Usuário',
        user.email || '-',
        user.status || '-'
      ]))}
    `;
  }

  if (scope === 'favoritos') {
    return `
      <p><strong>Total de favoritos:</strong> ${escapeHtml(formatAdminTotal(data.favoritos))}</p>
      <p><strong>Mais favoritados:</strong> ${escapeHtml(previewFavorites.slice(0, 5).map((movie) => `${movie.titulo} (${formatAdminTotal(movie.total)})`).join(', ') || 'Nenhum favorito registrado')}</p>
      <p><strong>Últimas avaliações:</strong> ${escapeHtml(previewReviews.slice(0, 4).map((review) => `${review.usuario_nome || 'Usuário'} em ${review.filme_titulo || 'Filme'}`).join('; ') || 'Nenhuma avaliação registrada')}</p>
    `;
  }

  if (scope === 'atividades') {
    return `
      <p><strong>Atividades recentes:</strong> ${escapeHtml(formatAdminTotal(previewActivities.length))}</p>
      ${buildAdminPdfPreviewTable(['Data', 'Usuário', 'Descrição'], previewActivities.slice(0, 8).map((activity) => [
        formatAdminDate(activity.timestamp),
        activity.usuario || 'anônimo',
        activity.descricao || activity.acao || '-'
      ]))}
    `;
  }

  return `
    <table>
      <thead>
        <tr><th>Indicador</th><th>Total</th></tr>
      </thead>
      <tbody>
        <tr><td>Filmes cadastrados</td><td>${escapeHtml(formatAdminTotal(totals.filmes))}</td></tr>
        <tr><td>Usuários cadastrados</td><td>${escapeHtml(formatAdminTotal(totals.usuarios))}</td></tr>
        <tr><td>Favoritos registrados</td><td>${escapeHtml(formatAdminTotal(totals.favoritos))}</td></tr>
        <tr><td>Clientes</td><td>${escapeHtml(formatAdminTotal(totals.clientes))}</td></tr>
        <tr><td>Locações</td><td>${escapeHtml(formatAdminTotal(totals.locacoes))}</td></tr>
      </tbody>
    </table>
    <p><strong>Filmes no período:</strong> ${escapeHtml(formatAdminTotal(filteredMovies.length))}</p>
    ${buildAdminPdfPreviewTable(['Filme', 'Gênero', 'Ano'], filteredMovies.slice(0, 5).map((movie) => [
      movie.titulo || 'Filme',
      movie.genero_nome || generoNameById(movie.genero_id) || 'Sem gênero',
      movie.ano_lancamento || '-'
    ]))}
    <p><strong>Usuários no período:</strong> ${escapeHtml(formatAdminTotal(filteredUsers.length))}</p>
    ${buildAdminPdfPreviewTable(['Usuário', 'E-mail', 'Status'], filteredUsers.slice(0, 5).map((user) => [
      user.nome || 'Usuário',
      user.email || '-',
      user.status || '-'
    ]))}
    <p><strong>Mais favoritados:</strong> ${escapeHtml(previewFavorites.slice(0, 5).map((movie) => `${movie.titulo} (${formatAdminTotal(movie.total)})`).join(', ') || 'Nenhum favorito registrado')}</p>
    <p><strong>Últimas avaliações:</strong> ${escapeHtml(previewReviews.slice(0, 3).map((review) => `${review.usuario_nome || 'Usuário'} em ${review.filme_titulo || 'Filme'}`).join('; ') || 'Nenhuma avaliação registrada')}</p>
    <p><strong>Atividades recentes:</strong> ${escapeHtml(previewActivities.slice(0, 3).map((activity) => activity.descricao || activity.acao || '-').join('; ') || 'Nenhuma atividade registrada')}</p>
  `;
}

function getAdminPdfPreviewTotals(data = {}, filteredMovies = [], filteredUsers = []) {
  return {
    filmes: Number(data.filmes) || adminMoviesCache.length || filteredMovies.length || 0,
    usuarios: Number(data.usuarios) || adminUsersCache.length || filteredUsers.length || 0,
    favoritos: Number(data.favoritos) || Object.keys(favoriteMovies || {}).length || 0,
    clientes: Number(data.clientes) || 0,
    locacoes: Number(data.locacoes) || 0
  };
}

function getAdminPdfPreviewFavorites(data = {}, favorites = []) {
  if (favorites.length) return favorites;

  const favoriteIds = Object.keys(favoriteMovies || {}).map(Number);
  if (!favoriteIds.length) return [];

  return adminMoviesCache
    .filter((movie) => favoriteIds.includes(Number(movie.id)))
    .map((movie) => ({
      titulo: movie.titulo || 'Filme',
      total: 1
    }));
}

function getAdminPdfPreviewReviews(data = {}, reviews = []) {
  if (reviews.length) return reviews;

  return (userMovieReviews || []).map((review) => {
    const movie = adminMoviesCache.find((item) => Number(item.id) === Number(review.filme_id));
    return {
      usuario_nome: currentUser?.nome || currentUser?.email || 'Usuário',
      filme_titulo: movie?.titulo || review.filme_titulo || 'Filme',
      nota: review.nota || 0,
      updated_at: review.updated_at || review.created_at
    };
  });
}

function getAdminPdfPreviewActivities(data = {}, activities = []) {
  if (activities.length) return activities;

  return (adminLogsCache || []).map((log) => ({
    timestamp: log.timestamp,
    usuario: formatLogUser(log.usuario || 'anônimo'),
    descricao: log.descricao || log.description || describeLogAction(log.acao || log.tipoEvento || '', log.endpoint || ''),
    acao: log.acao || log.tipoEvento || ''
  }));
}

function buildAdminPdfPreviewTable(headers, rows) {
  const body = rows.length
    ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${headers.length}">Nenhum dado encontrado.</td></tr>`;

  return `
    <table>
      <thead>
        <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function getAdminPdfPreviewMovies() {
  const { startDate, endDate } = getAdminPdfPreviewDateRange();
  const selectedGenre = shouldApplyAdminPdfGenre() ? normalizeText(getSelectedAdminPdfGenre()) : '';
  return adminMoviesCache.filter((movie) => {
    const genre = movie.genero_nome || generoNameById(movie.genero_id) || '';
    const matchesGenre = !selectedGenre || normalizeText(genre) === selectedGenre;
    return matchesGenre && isAdminPdfDateInRange(movie.created_at, startDate, endDate);
  });
}

function getAdminPdfPreviewUsers() {
  const { startDate, endDate } = getAdminPdfPreviewDateRange();
  return adminUsersCache.filter((user) => isAdminPdfDateInRange(user.created_at, startDate, endDate));
}

function getAdminPdfPreviewDateRange() {
  return {
    startDate: parseAdminFilterDate(document.getElementById('adminXmlStartDate')?.value),
    endDate: parseAdminFilterDate(document.getElementById('adminXmlEndDate')?.value, true)
  };
}

function isAdminPdfDateInRange(value, startDateValue, endDateValue) {
  if (!value) return true;
  const date = new Date(value);
  const startDate = startDateValue ? new Date(startDateValue) : null;
  const endDate = endDateValue ? new Date(endDateValue) : null;
  return (!startDate || date >= startDate) && (!endDate || date <= endDate);
}

function getSelectedAdminPdfGenre() {
  return document.getElementById('adminPdfGenre')?.value || '';
}

function populateAdminPdfGenreFilter() {
  const select = document.getElementById('adminPdfGenre');
  if (!select) return;

  const currentValue = select.value;
  const genres = Array.from(new Set(adminMoviesCache
    .map((movie) => movie.genero_nome || generoNameById(movie.genero_id) || '')
    .filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  select.innerHTML = '<option value="">Todos os gêneros</option>'
    + genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`).join('');
  select.value = genres.includes(currentValue) ? currentValue : '';
  updateAdminPdfGenreFilterState();
}

function shouldApplyAdminPdfGenre() {
  return ['filmes', 'favoritos'].includes(getSelectedAdminPdfScope());
}

function updateAdminPdfGenreFilterState() {
  const select = document.getElementById('adminPdfGenre');
  if (!select) return;

  const enabled = shouldApplyAdminPdfGenre();
  select.disabled = !enabled;
  if (!enabled) {
    select.value = '';
  }
}

function getSelectedAdminPdfScope() {
  return document.getElementById('adminPdfScope')?.value || 'completo';
}

function getAdminPdfScopeLabel(scope = getSelectedAdminPdfScope()) {
  const labels = {
    completo: 'Relatório completo',
    resumo: 'Resumo geral',
    filmes: 'Filmes',
    usuarios: 'Usuários',
    favoritos: 'Favoritos e avaliações',
    atividades: 'Atividades recentes'
  };
  return labels[scope] || labels.completo;
}

function buildAdminSystemPdfLines(data = adminDashboardSummary) {
  const scope = getSelectedAdminPdfScope();
  const filteredMovies = getAdminPdfPreviewMovies();
  const filteredUsers = getAdminPdfPreviewUsers();
  const lines = [
    'Relatório Geral do Sistema - Catálogo7',
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    `Conteúdo: ${getAdminPdfScopeLabel(scope)}`,
    '',
  ];

  if (scope === 'filmes') {
    return [
      ...lines,
      `Total de filmes no período: ${formatAdminTotal(filteredMovies.length)}`,
      `Gênero: ${getSelectedAdminPdfGenre() || 'Todos'}`,
      '',
      'Filmes',
      ...filteredMovies.map((movie) => {
        return `${movie.titulo || 'Filme'} | ${movie.genero_nome || generoNameById(movie.genero_id) || 'Sem gênero'} | ${movie.ano_lancamento || '-'} | ${movie.status || '-'}`;
      })
    ];
  }

  if (scope === 'usuarios') {
    return [
      ...lines,
      `Total de usuários no período: ${formatAdminTotal(filteredUsers.length)}`,
      '',
      'Usuários',
      ...filteredUsers.map((user) => `${user.nome || 'Usuário'} | ${user.email || '-'} | ${user.tipo_usuario || '-'} | ${user.status || '-'}`)
    ];
  }

  if (scope === 'favoritos') {
    return [
      ...lines,
      `Favoritos registrados: ${formatAdminTotal(data.favoritos)}`,
      '',
      'Filmes mais favoritados',
      ...(data.filmesFavoritados || []).map((movie, index) => `${index + 1}. ${movie.titulo || 'Filme'} - ${formatAdminTotal(movie.total)} favoritos`),
      '',
      'Últimas avaliações',
      ...(data.ultimasAvaliacoes || []).map((review) => `${review.usuario_nome || 'Usuário'} avaliou ${review.filme_titulo || 'Filme'} com ${review.nota || 0}/5`)
    ];
  }

  if (scope === 'atividades') {
    return [
      ...lines,
      'Atividades recentes',
      ...(data.atividadesRecentes || []).map((activity) => `${formatAdminDate(activity.timestamp)} | ${activity.usuario || 'anônimo'} | ${activity.descricao || activity.acao || '-'}`)
    ];
  }

  return [
    ...lines,
    'Resumo',
    `Filmes cadastrados: ${formatAdminTotal(data.filmes)}`,
    `Usuários cadastrados: ${formatAdminTotal(data.usuarios)}`,
    `Favoritos registrados: ${formatAdminTotal(data.favoritos)}`,
    `Clientes cadastrados: ${formatAdminTotal(data.clientes)}`,
    `Locações registradas: ${formatAdminTotal(data.locacoes)}`,
    '',
    'Filmes mais favoritados',
    ...(data.filmesFavoritados || []).slice(0, 8).map((movie, index) => `${index + 1}. ${movie.titulo || 'Filme'} - ${formatAdminTotal(movie.total)} favoritos`),
    '',
    'Últimas avaliações',
    ...(data.ultimasAvaliacoes || []).slice(0, 8).map((review) => `${review.usuario_nome || 'Usuário'} avaliou ${review.filme_titulo || 'Filme'} com ${review.nota || 0}/5`),
    '',
    'Atividades recentes',
    ...(data.atividadesRecentes || []).slice(0, 8).map((activity) => `${formatAdminDate(activity.timestamp)} | ${activity.usuario || 'anônimo'} | ${activity.descricao || activity.acao || '-'}`)
  ];
}
function getAdminExportQueryString() {
  const params = new URLSearchParams();
  const user = document.getElementById('adminXmlUser')?.value || '';
  const status = document.getElementById('adminXmlStatus')?.value || '';

  if (user && normalizeText(user) !== normalizeText('Todos')) {
    params.set('usuario', user);
  }

  if (status && normalizeText(status) !== normalizeText('Todos os status')) {
    params.set('statusCode', status);
  }

  return params.toString();
}

async function downloadAdminExport(format) {
  if (format === 'json' && document.querySelector('.admin-xml-filters')?.classList.contains('json-mode')) {
    await downloadAdminEntityJson();
    return;
  }

  if (format === 'pdf') {
    await downloadAdminSystemPdf();
    return;
  }

  const query = getAdminExportQueryString();
  const suffix = query ? `?${query}` : '';
  const contentTypes = {
    xml: 'application/xml',
    json: 'application/json',
    pdf: 'application/pdf'
  };
  const filenames = {
    xml: 'logs-catalogo7.xml',
    json: 'logs-catalogo7.json',
    pdf: 'logs-catalogo7.pdf'
  };

  try {
    const response = await fetch(`${API_URL}/logs/exportar/${format}${suffix}`, {
      headers: headers()
    });

    if (response.ok) {
      const content = format === 'json'
        ? JSON.stringify(await response.json(), null, 2)
        : await response.text();
      downloadBlob(content, filenames[format], contentTypes[format]);
      return;
    }
  } catch (error) {
    console.warn('Exportacao pela API indisponivel, usando dados filtrados em tela.', error.message);
  }

  const logs = getFilteredAdminXmlLogs();
  const fallback = {
    xml: () => buildAdminLogsXML(logs),
    json: () => buildAdminLogsJSON(logs)
  };

  downloadBlob(fallback[format](), filenames[format], contentTypes[format]);
}

async function downloadAdminSystemPdf() {
  try {
    const params = new URLSearchParams({
      conteudo: getSelectedAdminPdfScope()
    });
    const startDate = parseAdminFilterDate(document.getElementById('adminXmlStartDate')?.value);
    const endDate = parseAdminFilterDate(document.getElementById('adminXmlEndDate')?.value, true);
    const genre = shouldApplyAdminPdfGenre() ? getSelectedAdminPdfGenre() : '';
    if (startDate) params.set('dataInicio', startDate);
    if (endDate) params.set('dataFim', endDate);
    if (genre) params.set('genero', genre);
    const response = await fetch(`${API_URL}/relatorios/pdf?${params.toString()}`, {
      headers: headers()
    });

    if (response.ok) {
      downloadBlob(await response.arrayBuffer(), 'relatorio-geral-catalogo7.pdf', 'application/pdf');
      return;
    }
  } catch (error) {
    console.warn('Relatorio geral pela API indisponivel, usando resumo em tela.', error.message);
  }

  if (!Object.keys(adminDashboardSummary).length) {
    await loadAdminDashboardStats();
  }
  if (!adminMoviesCache.length) {
    await loadAdminMovies();
  }
  if (!adminUsersCache.length) {
    await loadAdminUsers();
  }
  downloadBlob(makeSimplePDF(buildAdminSystemPdfLines()), 'relatorio-geral-catalogo7.pdf', 'application/pdf');
}

function getSelectedAdminJsonEntity() {
  return document.getElementById('adminJsonEntity')?.value || 'filmes';
}

function getAdminJsonFilters() {
  return {
    startDate: parseAdminFilterDate(document.getElementById('adminXmlStartDate')?.value),
    endDate: parseAdminFilterDate(document.getElementById('adminXmlEndDate')?.value, true),
    status: document.getElementById('adminXmlStatus')?.value || 'Todos os status',
    query: normalizeText(document.getElementById('adminXmlSearch')?.value || '')
  };
}

function parseAdminFilterDate(value, endOfDay = false) {
  const match = String(value || '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function filterAdminEntityRows(rows = [], entity = 'filmes') {
  const filters = getAdminJsonFilters();
  const statusFilter = normalizeText(filters.status);
  const shouldFilterStatus = statusFilter && statusFilter !== normalizeText('Todos os status');
  const startDate = filters.startDate ? new Date(filters.startDate) : null;
  const endDate = filters.endDate ? new Date(filters.endDate) : null;

  return rows.filter((row) => {
    const createdAt = row.created_at ? new Date(row.created_at) : null;
    const rawStatus = entity === 'usuarios' ? row.status : row.status;
    const searchable = normalizeText(entity === 'usuarios'
      ? [row.nome, row.email, row.tipo_usuario, row.status].join(' ')
      : [row.titulo, row.titulo_original, row.diretor, row.genero_nome, row.status, row.ano_lancamento].join(' '));

    const matchesSearch = !filters.query || searchable.includes(filters.query);
    const matchesStatus = !shouldFilterStatus || normalizeText(rawStatus) === statusFilter;
    const matchesStart = !startDate || !createdAt || createdAt >= startDate;
    const matchesEnd = !endDate || !createdAt || createdAt <= endDate;

    return matchesSearch && matchesStatus && matchesStart && matchesEnd;
  });
}

function buildAdminEntityJsonPreview() {
  const entity = getSelectedAdminJsonEntity();
  const filters = getAdminJsonFilters();
  const labels = {
    filmes: 'Filmes',
    usuarios: 'Usuários'
  };

  return JSON.stringify({
    exportacao: {
      formato: 'JSON',
      entidade: labels[entity] || entity,
      fonte: 'MySQL',
      filtros: {
        periodo: document.getElementById('adminXmlPeriod')?.value || '',
        dataInicial: filters.startDate || null,
        dataFinal: filters.endDate || null,
        status: filters.status || 'Todos os status',
        busca: filters.query || null
      },
      observacao: 'Clique em Exportar JSON para baixar os dados reais.'
    }
  }, null, 2);
}

async function getAdminEntityExportData(entity) {
  if (entity === 'usuarios') {
    const usuarios = filterAdminEntityRows(await api('/auth/usuarios'), 'usuarios');
    return {
      exportedAt: new Date().toISOString(),
      entidade: 'usuarios',
      total: usuarios.length,
      usuarios
    };
  }

  const response = await fetch(`${API_URL}/filmes/exportar/json`, {
    headers: headers()
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao exportar filmes.' }));
    throw new Error(formatApiError(error.message, response.status));
  }

  const payload = await response.json();
  const filmes = filterAdminEntityRows(payload.filmes || [], 'filmes');
  return {
    ...payload,
    total: filmes.length,
    filmes
  };
}

async function downloadAdminEntityJson() {
  const entity = getSelectedAdminJsonEntity();
  const payload = await getAdminEntityExportData(entity);
  downloadBlob(JSON.stringify(payload, null, 2), `${entity}-catalogo7.json`, 'application/json');
}

function buildAdminLogsXML(logs, hasMore = false) {
  const items = logs.map((log, index) => {
    const action = log.acao || log.tipoEvento || '-';
    return `  <evento id="${index + 1}">
    <usuario>${escapeXml(formatLogUser(log.usuario || 'anônimo'))}</usuario>
    <acao>${escapeXml(formatLogAction(action))}</acao>
    <descricao>${escapeXml(log.descricao || log.description || describeLogAction(action, log.endpoint || ''))}</descricao>
    <data_hora>${escapeXml(log.timestamp ? new Date(log.timestamp).toISOString() : '')}</data_hora>
    <ip>${escapeXml(log.ip || log.ipOrigem || log.ip_origem || '')}</ip>
    <endpoint>${escapeXml(log.endpoint || '')}</endpoint>
  </evento>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<logs>
${items}${hasMore ? '\n  ...' : ''}
</logs>`;
}

function buildAdminLogsJSON(logs) {
  const payload = {
    exportacao: {
      formato: 'JSON',
      periodo: document.getElementById('adminXmlPeriod')?.value || 'Últimos 6 meses',
      gerado_em: new Date().toISOString(),
      total: logs.length,
      logs: logs.map((log, index) => {
        const action = log.acao || log.tipoEvento || '-';
        return {
          id: index + 1,
          usuario: formatLogUser(log.usuario || 'anônimo'),
          acao: formatLogAction(action),
          descricao: log.descricao || log.description || describeLogAction(action, log.endpoint || ''),
          data_hora: log.timestamp ? new Date(log.timestamp).toISOString() : '',
          ip: log.ip || log.ipOrigem || log.ip_origem || '',
          endpoint: log.endpoint || '',
          metodo: log.metodo || log.method || '',
          status: log.statusCode || ''
        };
      })
    }
  };

  return JSON.stringify(payload, null, 2);
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function loadAdminLogs() {
  const logsBody = document.getElementById('adminLogsBody');
  const logsCount = document.getElementById('adminLogsTableCount');
  logsBody.innerHTML = '<tr><td colspan="9">Carregando logs...</td></tr>';
  if (logsCount) logsCount.textContent = 'Carregando logs...';

  try {
    const logs = await api('/logs');
    adminLogsCache = logs.length ? logs.slice(0, 20) : sampleAdminLogs;
    filterAdminLogs();
  } catch (error) {
    adminLogsCache = sampleAdminLogs;
    filterAdminLogs();
  }
}

function renderAdminLogRow(log, index = 0) {
  const date = log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '-';
  const user = log.usuario || 'anônimo';
  const action = log.acao || log.tipoEvento || '-';
  const method = log.metodo || log.method || '-';
  const statusCode = log.statusCode || '-';
  const endpoint = log.endpoint || '-';
  const description = log.descricao || log.description || describeLogAction(action, endpoint);
  const ip = log.ip || log.ipOrigem || log.ip_origem || '-';
  return `
    <tr data-log-index="${index}">
      <td>${escapeHtml(date)}</td>
      <td>
        <span class="log-user-cell">
          <strong>${escapeHtml(formatLogUser(user))}</strong>
        </span>
      </td>
      <td><span class="log-action-pill ${logActionClass(action)}">${escapeHtml(formatLogAction(action))}</span></td>
      <td>${escapeHtml(description)}</td>
      <td><span class="log-endpoint"><span class="log-method-pill ${logMethodClass(method)}">${escapeHtml(method)}</span>${escapeHtml(endpoint)}</span></td>
      <td>${escapeHtml(method)}</td>
      <td><span class="log-status-pill ${logStatusClass(statusCode)}">${escapeHtml(statusCode)}</span></td>
      <td>${escapeHtml(ip)}</td>
      <td>
        <span class="log-detail-actions">
          <button class="log-more-button" type="button" aria-label="Opções do log" data-log-menu>&vellip;</button>
          <span class="log-row-menu" aria-hidden="true">
            <button type="button" data-log-delete>Excluir</button>
          </span>
        </span>
      </td>
    </tr>
  `;
}

function handleAdminLogsClick(event) {
  const menuButton = event.target.closest('[data-log-menu]');
  const deleteButton = event.target.closest('[data-log-delete]');

  if (menuButton) {
    const actions = menuButton.closest('.log-detail-actions');
    document.querySelectorAll('.log-detail-actions.open').forEach((item) => {
      if (item !== actions) item.classList.remove('open');
    });
    actions.classList.toggle('open');
    return;
  }

  if (deleteButton) {
    const row = deleteButton.closest('tr');
    openDeleteLogModal(Number(row?.dataset.logIndex || 0));
  }
}

function openDeleteLogModal(index) {
  pendingDeleteLogIndex = index;
  const log = adminLogsCache[index];
  const action = log ? formatLogAction(log.acao || log.tipoEvento || '-') : 'este log';
  document.getElementById('adminDeleteLogName').textContent = action;
  document.getElementById('adminDeleteLogModal').classList.add('visible');
  document.getElementById('adminDeleteLogModal').setAttribute('aria-hidden', 'false');
}

function closeDeleteLogModal() {
  pendingDeleteLogIndex = null;
  document.getElementById('adminDeleteLogModal').classList.remove('visible');
  document.getElementById('adminDeleteLogModal').setAttribute('aria-hidden', 'true');
}

function confirmDeleteLog() {
  if (pendingDeleteLogIndex !== null) {
    adminLogsCache.splice(pendingDeleteLogIndex, 1);
    filterAdminLogs();
    updateAdminXmlPreview();
  }
  closeDeleteLogModal();
}

function formatLogUser(user) {
  const cleanUser = String(user || 'anônimo').split('@')[0].replace(/[._-]+/g, ' ').trim();
  return cleanUser || 'anônimo';
}

function formatLogAction(action) {
  const normalized = normalizeText(action).replace(/\s+/g, '_').toUpperCase();
  const labels = {
    CREATE: 'Criação',
    INCLUSAO: 'Inclusão',
    UPDATE: 'Atualização',
    ALTERACAO: 'Alteração',
    DELETE: 'Exclusão',
    EXCLUSAO: 'Exclusão',
    GET: 'Consulta',
    LOGIN: 'Login',
    LOGIN_ERROR: 'Erro no login',
    UPLOAD: 'Upload',
    EXPORT_XML: 'Exportação XML',
    EXPORT_PDF: 'Exportação PDF',
    EXPORTACAO_JSON: 'Exportação JSON',
    IMPORTACAO_JSON: 'Importação JSON'
  };

  return labels[normalized] || String(action || '-');
}

function logActionClass(action) {
  const normalized = normalizeText(action);
  if (normalized.includes('delete') || normalized.includes('exclu')) return 'delete';
  if (normalized.includes('update') || normalized.includes('alter') || normalized.includes('atual')) return 'update';
  if (normalized.includes('export')) return normalized.includes('pdf') ? 'export-pdf' : 'export-xml';
  if (normalized.includes('login_error') || normalized.includes('erro')) return 'login-error';
  if (normalized.includes('login')) return 'login';
  if (normalized.includes('upload')) return 'upload';
  if (normalized.includes('create') || normalized.includes('cria') || normalized.includes('cadastro')) return 'create';
  return 'get';
}

function logMethodClass(method) {
  return normalizeText(method || 'get');
}

function logStatusClass(statusCode) {
  const status = Number(statusCode);
  if (status >= 400) return 'error';
  if (status === 204) return 'empty';
  return 'success';
}

function describeLogAction(action, endpoint) {
  const normalized = normalizeText(action);
  if (normalized.includes('delete') || normalized.includes('exclu')) return 'Exclusão de registro';
  if (normalized.includes('update') || normalized.includes('alter') || normalized.includes('atual')) return 'Atualização de registro';
  if (normalized.includes('create') || normalized.includes('cria') || normalized.includes('cadastro')) return 'Criação de registro';
  if (normalized.includes('login_error')) return 'Falha ao realizar login';
  if (normalized.includes('login')) return 'Usuário realizou login';
  if (normalized.includes('export')) return 'Exportação de dados';
  if (normalizeText(endpoint).includes('upload')) return 'Upload de imagem do filme';
  return 'Evento registrado pela API';
}

function filterAdminLogs() {
  const logsBody = document.getElementById('adminLogsBody');
  const logsCount = document.getElementById('adminLogsTableCount');
  if (!logsBody) return;

  const query = normalizeText(document.getElementById('adminTopSearch').value);
  const selectedStatus = normalizeText(document.getElementById('adminTopFilter').value);
  const shouldFilterStatus = selectedStatus && selectedStatus !== normalizeText('Todos os status');
  const filteredLogs = adminLogsCache.filter((log) => {
    const status = normalizeText(log.statusCode || '');
    const searchable = normalizeText([
      log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '',
      log.usuario || 'anônimo',
      log.acao || log.tipoEvento || '',
      log.descricao || log.description || '',
      log.endpoint || '',
      log.metodo || log.method || '',
      log.statusCode || '',
      log.ip || log.ipOrigem || log.ip_origem || ''
    ].join(' '));

    return (!query || searchable.includes(query)) && (!shouldFilterStatus || status === selectedStatus);
  });

  logsBody.innerHTML = filteredLogs.length
    ? filteredLogs.map((log) => renderAdminLogRow(log, adminLogsCache.indexOf(log))).join('')
    : '<tr><td colspan="9">Nenhum log encontrado.</td></tr>';

  if (logsCount) {
    logsCount.textContent = filteredLogs.length
      ? `Mostrando 1 a ${filteredLogs.length} de ${filteredLogs.length} logs`
      : 'Nenhum log encontrado.';
  }
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
    duracao: `${document.getElementById('adminMovieDuration').value.trim()} min`,
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

function clearSessionAndReload(shouldReload = true) {
  token = '';
  currentUser = null;
  favoriteMovies = {};
  userMovieReviews = [];
  adminSession = false;
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  localStorage.removeItem('adminSession');
  showLogin();
  if (shouldReload) {
    window.location.href = window.location.pathname;
  } else {
    syncView();
  }
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

document.querySelector('.user-home-link')?.addEventListener('click', () => {
  showPage('inicio');
});

const userNavLabels = {
  filmes: 'FILMES',
  categorias: 'GÊNEROS',
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

document.getElementById('genreSearch')?.addEventListener('input', (event) => {
  const query = normalizeText(event.target.value);
  document.querySelectorAll('#categoriasPage .categories-grid article').forEach((card) => {
    card.hidden = query && !normalizeText(card.textContent).includes(query);
  });
});
document.getElementById('diarySearch')?.addEventListener('input', (event) => {
  applyDiaryFilters();
});
document.getElementById('diaryGenreFilter')?.addEventListener('change', applyDiaryFilters);
document.getElementById('goMovies').addEventListener('click', showAllMovies);
document.querySelector('.hero-arrow.prev')?.addEventListener('click', () => {
  heroMovieIndex -= 1;
  renderHeroMovie();
});
document.querySelector('.hero-arrow.next')?.addEventListener('click', () => {
  heroMovieIndex += 1;
  renderHeroMovie();
});
document.getElementById('editProfileBtn').addEventListener('click', () => {
  renderProfileForm();
  showPage('editarPerfil');
});
document.getElementById('openExportPageBtn').addEventListener('click', () => {
  syncExportPageDates();
  showPage('exportar');
});
document.getElementById('reportPeriod')?.addEventListener('change', renderReportsPage);
document.getElementById('reportType')?.addEventListener('change', renderReportsPage);
document.querySelector('.export-period-grid select')?.addEventListener('change', syncExportPageDates);
document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDFReport);
document.getElementById('downloadPdfIconBtn').addEventListener('click', downloadPDFReport);
document.getElementById('downloadXmlBtn').addEventListener('click', downloadXMLExport);
document.getElementById('downloadXmlIconBtn').addEventListener('click', downloadXMLExport);
document.getElementById('movieSearch').addEventListener('input', (event) => {
  setMoviesHeader('Filmes', 'Explore todos os filmes disponíveis.');
  applyMovieFilters();
});
document.getElementById('genreFilter')?.addEventListener('change', () => {
  setMoviesHeader('Filmes', 'Explore todos os filmes disponíveis.');
  applyMovieFilters();
});
document.getElementById('globalSearch').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    showPage('filmes');
    setMoviesHeader('Filmes', 'Resultado da busca.');
    document.getElementById('movieSearch').value = event.target.value;
    userMoviesPage = 1;
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
  'Suspense'
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

  if (page === 'relatorios') {
    loadReportsPage();
  }

  if (page === 'exportar') {
    loadReportsPage();
    syncExportPageDates();
  }
}

async function loadReportsPage() {
  if (!token) {
    reportsLogsCache = [];
    reportsSummaryCache = {};
    renderReportsPage();
    return;
  }

  try {
    const [logs, summary] = await Promise.all([
      api('/logs'),
      api('/relatorios/json')
    ]);
    reportsLogsCache = Array.isArray(logs) ? logs : [];
    reportsSummaryCache = summary || {};
  } catch (error) {
    console.warn('Nao foi possivel carregar dados reais para relatorios.', error.message);
    if (!reportsLogsCache.length) reportsLogsCache = [];
    if (!Object.keys(reportsSummaryCache).length) reportsSummaryCache = {};
  }

  renderReportsPage();
}

function renderReportsPage() {
  const chart = document.querySelector('#relatoriosPage .chart-grid');
  if (!chart) return;

  const period = document.getElementById('reportPeriod')?.value || 'Últimos 6 meses';
  const type = document.getElementById('reportType')?.value || 'Todos';
  const months = getReportMonths(period);
  const rows = months.map((month) => {
    const logs = reportsLogsCache.filter((log) => isSameReportMonth(log.timestamp, month.date));
    return {
      label: month.label,
      importacoes: logs.filter(isImportLog).length,
      exportacoes: logs.filter(isExportLog).length
    };
  });
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.importacoes, row.exportacoes]));
  const normalizedType = normalizeText(type);
  const scale = document.querySelector('#relatoriosPage .chart-scale');

  if (scale) {
    scale.innerHTML = [1, 0.8, 0.6, 0.4, 0.2, 0]
      .map((factor) => `<span>${Math.round(maxValue * factor)}</span>`)
      .join('');
  }

  chart.innerHTML = rows.map((row) => {
    const showImports = normalizedType === normalizeText('Todos') || normalizedType.includes('import');
    const showExports = normalizedType === normalizeText('Todos') || normalizedType.includes('export');
    const importHeight = showImports && row.importacoes > 0 ? Math.max(2, Math.round((row.importacoes / maxValue) * 100)) : 0;
    const exportHeight = showExports && row.exportacoes > 0 ? Math.max(2, Math.round((row.exportacoes / maxValue) * 100)) : 0;

    return `
      <article>
        <div class="bar-group">
          ${showImports ? `<span class="bar import" title="${row.importacoes} importações" style="height: ${importHeight}%"></span>` : ''}
          ${showExports ? `<span class="bar export" title="${row.exportacoes} exportações" style="height: ${exportHeight}%"></span>` : ''}
        </div>
        <strong>${escapeHtml(row.label)}</strong>
      </article>
    `;
  }).join('');
}

function getReportMonths(period) {
  const normalized = normalizeText(period);
  const total = normalized.includes('12') ? 12 : 6;
  const now = new Date();
  const start = normalized.includes('ano')
    ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - total + 1, 1);
  const months = [];
  const cursor = new Date(start);

  while (cursor <= now) {
    months.push({
      date: new Date(cursor),
      label: cursor.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}

function isSameReportMonth(value, monthDate) {
  if (!value) return false;
  const date = new Date(value);
  return date.getFullYear() === monthDate.getFullYear()
    && date.getMonth() === monthDate.getMonth();
}

function isImportLog(log = {}) {
  const text = normalizeText([
    log.acao,
    log.tipoEvento,
    log.descricao,
    log.description,
    log.endpoint
  ].join(' '));
  return text.includes('import');
}

function isExportLog(log = {}) {
  const text = normalizeText([
    log.acao,
    log.tipoEvento,
    log.descricao,
    log.description,
    log.endpoint
  ].join(' '));
  return text.includes('export');
}

async function loadMovies() {
  if (previewMode && !token) {
    movies = sampleMovies;
    favoriteMovies = {};
    userMovieReviews = [];
  } else {
    try {
      movies = await api('/filmes');
      await loadFavoriteMovies();
      await loadUserMovieReviews();
    } catch (error) {
      movies = sampleMovies;
      favoriteMovies = {};
      userMovieReviews = [];
    }
  }

  renderFeatured();
  populateMovieGenreFilter();
  renderMovies(movies);
  renderProfile();
}

async function loadFavoriteMovies() {
  if (!token) {
    favoriteMovies = {};
    return;
  }

  const favorites = await api('/filmes/favoritos/me');
  favoriteMovies = favorites.reduce((acc, favorite) => {
    acc[favorite.filme_id] = true;
    return acc;
  }, {});
}

async function loadUserMovieReviews() {
  if (!token) {
    userMovieReviews = [];
    return;
  }

  userMovieReviews = await api('/filmes/avaliacoes/me');
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
  const genreFilter = document.getElementById('genreFilter');
  if (genreFilter) {
    genreFilter.value = '';
  }
  setMoviesHeader('Filmes', 'Explore todos os filmes disponíveis.');
  userMoviesPage = 1;
  renderMovies(movies);
  showPage('filmes');
}

function showCategoryMovies(category) {
  const filteredMovies = movies.filter((movie) => {
    return normalizeText(movie.genero_nome) === normalizeText(category);
  });

  document.getElementById('movieSearch').value = category;
  const genreFilter = document.getElementById('genreFilter');
  if (genreFilter) {
    genreFilter.value = category;
  }
  setMoviesHeader(`Filmes de ${category}`, `Explore filmes do gênero ${category}.`);
  userMoviesPage = 1;
  renderMovies(filteredMovies);
  showPage('filmes');
}

function populateMovieGenreFilter() {
  const genreFilter = document.getElementById('genreFilter');
  const diaryGenreFilter = document.getElementById('diaryGenreFilter');

  const genres = Array.from(new Set(movies.map(getMovieGenre).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const options = '<option value="">Todos os gêneros</option>'
    + genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`).join('');

  if (genreFilter) genreFilter.innerHTML = options;
  if (diaryGenreFilter) diaryGenreFilter.innerHTML = options;
}

function applyMovieFilters() {
  const query = document.getElementById('movieSearch')?.value || '';
  const genre = document.getElementById('genreFilter')?.value || '';
  userMoviesPage = 1;
  renderMovies(filterMovies(query, genre));
}

function applyDiaryFilters() {
  const query = document.getElementById('diarySearch')?.value || '';
  const genre = document.getElementById('diaryGenreFilter')?.value || '';
  renderDiaryMovies(filterFavoriteMovies(query, genre));
}

function filterMovies(query = '', genre = '') {
  const normalizedQuery = normalizeText(query);
  const normalizedGenre = normalizeText(genre);

  return movies.filter((movie) => {
    const movieGenre = getMovieGenre(movie);
    const matchesQuery = !normalizedQuery
      || normalizeText(movie.titulo).includes(normalizedQuery)
      || normalizeText(movieGenre).includes(normalizedQuery);
    const matchesGenre = !normalizedGenre || normalizeText(movieGenre) === normalizedGenre;

    return matchesQuery && matchesGenre;
  });
}

function getFavoriteMovieItems() {
  return movies.filter((movie) => isFavoriteMovie(movie.id));
}

function filterFavoriteMovies(query = '', genre = '') {
  const favoriteIds = new Set(getFavoriteMovieItems().map((movie) => Number(movie.id)));
  return filterMovies(query, genre).filter((movie) => favoriteIds.has(Number(movie.id)));
}

function getMovieGenre(movie = {}) {
  return movie.genero_nome || generoNameById(movie.genero_id) || '';
}

function renderFeatured() {
  const featured = movies.slice(0, 5);
  renderHeroMovie();
  document.getElementById('featuredGrid').innerHTML = featured.map(renderMovieCard).join('');
  document.getElementById('favoritesGrid').innerHTML = movies.slice(0, 4).map(renderMovieCard).join('');
  renderDiaryMovies(getFavoriteMovieItems());
}

function getCuratedMovieImage(index = 0) {
  return curatedMovieImages[Math.abs(index) % curatedMovieImages.length];
}

function renderHeroMovie() {
  const hero = document.querySelector('.user-home-shell .hero');
  if (!hero || !movies.length) return;

  const index = ((heroMovieIndex % movies.length) + movies.length) % movies.length;
  const movie = movies[index];
  const title = movie.titulo || 'Filme sem título';
  const year = movie.ano_lancamento || 'Ano não informado';
  const genre = getMovieGenre(movie) || 'Cinema para quem observa.';
  const director = movie.diretor || 'Diretor não informado';
  const description = movie.descricao || 'Filme disponível no catálogo.';

  hero.style.setProperty('--hero-image', `url("${getCuratedMovieImage(index)}")`);
  hero.querySelector('h1').innerHTML = `${escapeHtml(title)} <span>${escapeHtml(String(year))}</span>`;
  hero.querySelector('.hero-kicker').textContent = genre;
  hero.querySelector('.hero-director').textContent = `Direção: ${director}`;
  hero.querySelector('.hero-description').textContent = description;
}

function renderMovies(items) {
  currentMovieItems = items;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / USER_MOVIES_PER_PAGE));
  userMoviesPage = Math.min(Math.max(userMoviesPage, 1), totalPages);

  const start = (userMoviesPage - 1) * USER_MOVIES_PER_PAGE;
  const pageItems = items.slice(start, start + USER_MOVIES_PER_PAGE);

  document.getElementById('movieGrid').innerHTML = pageItems.length
    ? renderMovieListPanel(pageItems)
    : '<p class="empty-state">Nenhum filme encontrado para este gênero.</p>';
  renderUserMoviesPagination(total, pageItems.length, start, totalPages);
}

function renderUserMoviesPagination(total, pageCount, start, totalPages) {
  const pagination = document.getElementById('moviesPagination');
  if (!pagination) return;

  if (!total) {
    pagination.innerHTML = '';
    pagination.hidden = true;
    return;
  }

  const end = start + pageCount;
  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="${page === userMoviesPage ? 'active' : ''}" type="button" onclick="goToUserMoviesPage(${page})">${page}</button>`;
  }).join('');

  pagination.hidden = false;
  pagination.innerHTML = `
    <span>Mostrando ${start + 1} a ${end} de ${total} filmes</span>
    <div>
      <button type="button" ${userMoviesPage === 1 ? 'disabled' : ''} onclick="goToUserMoviesPage(${userMoviesPage - 1})">‹</button>
      ${pageButtons}
      <button type="button" ${userMoviesPage === totalPages ? 'disabled' : ''} onclick="goToUserMoviesPage(${userMoviesPage + 1})">›</button>
    </div>
  `;
}

function renderMovieListPanel(items) {
  return `
    <div class="movie-list-panel">
      <div class="movie-card-list">
        ${items.map(renderMovieListRow).join('')}
      </div>
    </div>
  `;
}

function renderMovieListRow(movie, index = 0) {
  const title = movie.titulo || 'Filme sem título';
  const genre = movie.genero_nome || generoNameById(movie.genero_id) || 'Sem gênero';
  const year = movie.ano_lancamento || 'N/I';
  const duration = movie.duracao || '2h 00min';
  const status = movie.status === 'rascunho' ? 'Rascunho' : 'Disponível';

  const cover = getCuratedMovieImage(index);

  return `
    <article class="movie-management-card-item" style="--movie-cover: url('${escapeHtml(cover)}')" onclick="openMovieModal(${movie.id})">
      <div class="movie-management-poster">
        <img src="${escapeHtml(resolveImageUrl(movie.capa_url))}" alt="Capa de ${escapeHtml(title)}" />
        <span class="movie-status-pill">${escapeHtml(status)}</span>
      </div>
      <div class="movie-management-info">
        <span class="movie-list-genre">${escapeHtml(genre)}</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(movie.diretor || 'Diretor não informado')}</p>
        <div class="movie-management-meta">
          <span>${escapeHtml(String(year))}</span>
          <span>${escapeHtml(duration)}</span>
        </div>
      </div>
      <div class="movie-list-actions">
        <button class="movie-card-arrow" type="button" aria-label="Ver detalhes de ${escapeHtml(title)}" onclick="event.stopPropagation(); openMovieModal(${movie.id})">→</button>
      </div>
    </article>
  `;
}

function renderDiaryMovies(items) {
  document.getElementById('watchedGrid').innerHTML = items.length
    ? renderMovieListPanel(items)
    : '<p class="empty-state">Nenhum filme favoritado ainda.</p>';
}

window.goToUserMoviesPage = (page) => {
  userMoviesPage = page;
  renderMovies(currentMovieItems);
};

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

function getProfileStats() {
  const favoriteIds = Object.keys(favoriteMovies).map(Number);
  const watchedIds = userMovieReviews.map((review) => Number(review.filme_id));
  const activityIds = Array.from(new Set([...favoriteIds, ...watchedIds]));
  const preferredGenres = new Set(
    activityIds
      .map((id) => movies.find((movie) => Number(movie.id) === Number(id)))
      .map(getMovieGenre)
      .filter(Boolean)
  );

  return {
    favorites: favoriteIds.length,
    watched: new Set(watchedIds).size,
    genres: preferredGenres.size
  };
}

function getMemberSince(user = {}) {
  const key = `memberSince:${user.id || user.email || 'preview'}`;
  const savedDate = localStorage.getItem(key);
  const date = savedDate ? new Date(savedDate) : new Date();

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function renderProfile() {
  const user = getProfileUser();
  const name = user.nome || user.email || 'Usuário Catálogo7';
  const email = user.email || 'email@catalogo7.com';
  const stats = getProfileStats();

  document.getElementById('profileAvatar').textContent = getInitials(name);
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('profileMemberSince').textContent = `Membro desde: ${getMemberSince(user)}`;
  document.getElementById('favoriteCount').textContent = stats.favorites;
  document.getElementById('watchedCount').textContent = stats.watched;
  document.getElementById('categoryCount').textContent = stats.genres;
  document.getElementById('accountName').textContent = name;
  document.getElementById('accountEmail').textContent = email;
}

function renderProfileForm() {
  const user = getProfileUser();
  const name = user.nome || user.email || 'Usuário Catálogo7';
  const email = user.email || 'email@catalogo7.com';

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

function getReportDateRange(periodValue) {
  const normalized = normalizeText(periodValue || 'Ultimos 6 meses');
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const start = normalized.includes('ano')
    ? new Date(now.getFullYear(), 0, 1)
    : new Date(now.getFullYear(), now.getMonth() - (normalized.includes('12') ? 11 : 5), 1);

  return { start, end };
}

function formatReportDate(value) {
  return value.toLocaleDateString('pt-BR');
}

function syncExportPageDates() {
  const period = document.querySelector('.export-period-grid select')?.value
    || document.getElementById('reportPeriod')?.value
    || 'Ultimos 6 meses';
  const range = getReportDateRange(period);
  const startInput = document.querySelector('[aria-label="Data inicial"]');
  const endInput = document.querySelector('[aria-label="Data final"]');

  if (startInput) startInput.value = formatReportDate(range.start);
  if (endInput) endInput.value = formatReportDate(range.end);
}

function getExportDateQuery() {
  const params = new URLSearchParams();
  const startDate = parseAdminFilterDate(document.querySelector('[aria-label="Data inicial"]')?.value);
  const endDate = parseAdminFilterDate(document.querySelector('[aria-label="Data final"]')?.value, true);

  if (startDate) params.set('dataInicio', startDate);
  if (endDate) params.set('dataFim', endDate);

  return params;
}

function getReportPdfScopeFromSelection() {
  const selected = selectedExportItems().map((item) => normalizeText(item));
  if (!selected.length || selected.length > 1) return 'completo';

  const [item] = selected;
  if (item.includes('filme') || item.includes('genero')) return 'filmes';
  if (item.includes('usuario')) return 'usuarios';
  if (item.includes('logs') || item.includes('import') || item.includes('export')) return 'atividades';

  return 'completo';
}

async function ensureReportExportData() {
  const tasks = [];

  if (!Object.keys(reportsSummaryCache).length && token) {
    tasks.push(api('/relatorios/json').then((data) => {
      reportsSummaryCache = data || {};
    }));
  }

  if (!reportsLogsCache.length && token) {
    tasks.push(api('/logs').then((data) => {
      reportsLogsCache = Array.isArray(data) ? data : [];
    }));
  }

  if (!movies.length) {
    tasks.push(loadMovies());
  }

  await Promise.allSettled(tasks);
}

function filterReportLogsByExportDate(logs = []) {
  const start = parseAdminFilterDate(document.querySelector('[aria-label="Data inicial"]')?.value);
  const end = parseAdminFilterDate(document.querySelector('[aria-label="Data final"]')?.value, true);
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  return logs.filter((log) => {
    const date = log.timestamp ? new Date(log.timestamp) : null;
    if (!date || Number.isNaN(date.getTime())) return false;
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  });
}

function buildReportExportLines() {
  const selectedItems = selectedExportItems();
  const summary = reportsSummaryCache || {};
  const filteredLogs = filterReportLogsByExportDate(reportsLogsCache);
  const importCount = filteredLogs.filter(isImportLog).length;
  const exportCount = filteredLogs.filter(isExportLog).length;
  const lines = [
    `Período: ${document.querySelector('.export-period-grid select')?.value || '-'}`,
    `Data inicial: ${document.querySelector('[aria-label="Data inicial"]')?.value || '-'}`,
    `Data final: ${document.querySelector('[aria-label="Data final"]')?.value || '-'}`,
    `Dados exportados: ${selectedItems.join(', ') || 'Nenhum item selecionado'}`,
    ''
  ];

  if (selectedItems.some((item) => normalizeText(item).includes('filme'))) {
    lines.push(`Total de filmes: ${formatAdminTotal(summary.filmes ?? movies.length)}`);
  }

  if (selectedItems.some((item) => normalizeText(item).includes('genero'))) {
    const genres = new Set(movies.map((movie) => movie.genero_nome || movie.genero).filter(Boolean));
    lines.push(`Total de gêneros: ${formatAdminTotal(genres.size || (summary.filmesPorGenero || []).length)}`);
  }

  if (selectedItems.some((item) => normalizeText(item).includes('usuario'))) {
    lines.push(`Total de usuários: ${formatAdminTotal(summary.usuarios ?? adminUsersCache.length)}`);
  }

  if (selectedItems.some((item) => normalizeText(item).includes('logs'))) {
    lines.push(`Logs no período: ${formatAdminTotal(filteredLogs.length)}`);
  }

  if (selectedItems.some((item) => normalizeText(item).includes('import') || normalizeText(item).includes('export'))) {
    lines.push(`Importações no período: ${formatAdminTotal(importCount)}`);
    lines.push(`Exportações no período: ${formatAdminTotal(exportCount)}`);
  }

  if (summary.filmesFavoritados?.length) {
    lines.push('', 'Filmes mais favoritados');
    summary.filmesFavoritados.slice(0, 5).forEach((movie, index) => {
      lines.push(`${index + 1}. ${movie.titulo || 'Filme'} - ${formatAdminTotal(movie.total)} favoritos`);
    });
  }

  if (summary.ultimasAvaliacoes?.length) {
    lines.push('', 'Últimas avaliações');
    summary.ultimasAvaliacoes.slice(0, 5).forEach((review) => {
      lines.push(`${review.usuario_nome || 'Usuário'} avaliou ${review.filme_titulo || 'Filme'} com ${review.nota || 0}/5`);
    });
  }

  if (filteredLogs.length) {
    lines.push('', 'Atividades no período');
    filteredLogs.slice(0, 8).forEach((log) => {
      const date = log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '-';
      lines.push(`${date} | ${log.usuario || 'anônimo'} | ${log.descricao || log.acao || '-'}`);
    });
  }

  return lines;
}

function escapePDFText(text) {
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[()\\]/g, '\\$&');
}

function makeSimplePDF(lines) {
  const content = [
    'BT',
    '/F1 18 Tf',
    '50 790 Td',
    '(Relatorio Catalogo7) Tj',
    '/F1 11 Tf',
    '15 TL',
    '0 -28 Td',
    ...lines.map((line) => `(${escapePDFText(line)}) Tj T*`),
    'ET'
  ].join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream\nendobj\n`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += object;
  });

  const xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return pdf;
}

async function downloadPDFReport() {
  await ensureReportExportData();

  if (token) {
    try {
      const params = getExportDateQuery();
      params.set('conteudo', 'completo');
      const response = await fetch(`${API_URL}/relatorios/pdf?${params.toString()}`, {
        headers: headers()
      });

      if (response.ok) {
        downloadBlob(await response.arrayBuffer(), 'relatorio-catalogo7.pdf', 'application/pdf');
        return;
      }
    } catch (error) {
      console.warn('Relatorio PDF pela API indisponivel, usando dados carregados em tela.', error.message);
    }
  }

  downloadBlob(makeSimplePDF(buildReportExportLines()), 'relatorio-catalogo7.pdf', 'application/pdf');
}

function buildFallbackXML() {
  const items = buildReportExportLines()
    .filter(Boolean)
    .map((item) => `    <item>${escapeHtml(item)}</item>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<exportacao>\n  <periodo>${escapeHtml(document.querySelector('.export-period-grid select')?.value || '')}</periodo>\n  <dataInicial>${escapeHtml(document.querySelector('[aria-label="Data inicial"]')?.value || '')}</dataInicial>\n  <dataFinal>${escapeHtml(document.querySelector('[aria-label="Data final"]')?.value || '')}</dataFinal>\n  <dados>\n${items}\n  </dados>\n</exportacao>`;
}

async function downloadXMLExport() {
  await ensureReportExportData();
  let xml = '';

  if (token) {
    try {
      const params = getExportDateQuery();
      const response = await fetch(`${API_URL}/logs/exportar/xml?${params.toString()}`, {
        headers: headers()
      });

      if (response.ok) {
        xml = await response.text();
      }
    } catch (error) {
      xml = '';
    }
  }

  downloadBlob(xml || buildFallbackXML(), 'relatorio-catalogo7.xml', 'application/xml');
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

function formatReviewDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

function renderMovieComments(reviews = []) {
  if (!reviews.length) {
    return '<p class="movie-comments-empty">Nenhum comentário ainda.</p>';
  }

  return reviews.map((review) => {
    const name = review.usuario_nome || 'Usuário';
    const rating = Number(review.nota || 0);
    const stars = [1, 2, 3, 4, 5].map((value) => value <= rating ? '★' : '☆').join('');

    return `
    <article class="movie-comment">
      <span class="movie-comment-avatar">${escapeHtml(getInitials(name) || 'U')}</span>
      <div>
        <header>
          <strong>${escapeHtml(name)}</strong>
          <time>${escapeHtml(formatReviewDate(review.created_at || review.updated_at))}</time>
        </header>
        <div class="movie-comment-stars" aria-hidden="true">${stars}</div>
        <p>${escapeHtml(review.comentario || 'Sem comentário escrito.')}</p>
      </div>
    </article>
  `;
  }).join('');
}

function getReviewsAverage(reviews = []) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, review) => sum + Number(review.nota || 0), 0);
  return total / reviews.length;
}

function isFavoriteMovie(id) {
  return Boolean(favoriteMovies[id]);
}

async function hydrateMovieReviews(movieId) {
  const list = document.getElementById('movieCommentsList');
  const score = document.getElementById('movieScoreValue');
  const count = document.getElementById('movieScoreCount');

  if (!list) return;

  try {
    const reviews = await api(`/filmes/${movieId}/avaliacoes`);
    const average = getReviewsAverage(reviews);
    list.innerHTML = renderMovieComments(reviews);
    if (score) score.textContent = average ? `★ ${average.toFixed(1)}` : '★ 0.0';
    if (count) count.textContent = `(${reviews.length} avaliação${reviews.length === 1 ? '' : 'ões'})`;

    const myReview = reviews.find((review) => Number(review.usuario_id) === Number(currentUser?.id));
    if (myReview) {
      movieRatings[movieId] = Number(myReview.nota);
      localStorage.setItem('movieRatings', JSON.stringify(movieRatings));
      const ratingControl = document.querySelector('.rating-control');
      if (ratingControl) ratingControl.outerHTML = renderRatingStars(movieId);
      const textarea = document.getElementById('movieReviewComment');
      if (textarea) textarea.value = myReview.comentario || '';
    }
  } catch (error) {
    list.innerHTML = '<p class="movie-comments-empty">Não foi possível carregar os comentários.</p>';
  }
}

window.openMovieModal = (id) => {
  const movie = movies.find((item) => Number(item.id) === Number(id));
  if (!movie) return;

  const modal = document.getElementById('movieModal');
  const title = movie.titulo || 'Filme sem título';
  const year = movie.ano_lancamento || 'Não informado';
  const genre = getMovieGenre(movie) || 'Não informado';
  const duration = movie.duracao || 'Não informado';
  const director = movie.diretor || 'Não informado';
  const classification = movie.classificacao || '12';
  const classificationText = String(classification);
  const classificationLabel = classificationText === 'L' || normalizeText(classificationText) === 'livre'
    ? 'Livre'
    : classificationText.includes('anos') ? classificationText : `${classificationText} anos`;
  const poster = resolveImageUrl(movie.capa_url);
  const synopsis = movie.descricao || 'Filme disponível no catálogo Catálogo7.';

  document.getElementById('movieModalContent').innerHTML = `
    <div class="movie-detail-shell">
      <section class="movie-detail-hero">
        <nav class="movie-breadcrumb" aria-label="Caminho">
          <span>Filmes</span>
          <span>${escapeHtml(genre)}</span>
          <span>${escapeHtml(title)}</span>
        </nav>
        <div class="movie-detail">
          <img src="${escapeHtml(poster)}" alt="Capa de ${escapeHtml(title)}" />
          <div class="movie-detail-content">
            <h2 id="modalMovieTitle">${escapeHtml(title)}</h2>
            <div class="movie-meta">
              <span>${escapeHtml(String(year))}</span>
              <span>${escapeHtml(duration)}</span>
              <span>${escapeHtml(genre)}</span>
              <mark>${escapeHtml(classificationLabel)}</mark>
            </div>
            <div class="movie-score">
              <strong id="movieScoreValue">★ 0.0</strong>
              <span id="movieScoreCount">(0 avaliações)</span>
              <button type="button" class="secondary-action favorite-button ${isFavoriteMovie(movie.id) ? 'active' : ''}" onclick="toggleFavoriteMovie(${movie.id})">
                <span class="favorite-icon" aria-hidden="true"></span>
                Adicionar aos favoritos
              </button>
            </div>
            <h3>Sinopse</h3>
            <p>${escapeHtml(synopsis)}</p>
            <dl class="movie-quick-info">
              <div>
                <dt>Diretor</dt>
                <dd>${escapeHtml(director)}</dd>
              </div>
              <div>
                <dt>Gênero</dt>
                <dd>${escapeHtml(genre)}</dd>
              </div>
              <div>
                <dt>Duração</dt>
                <dd>${escapeHtml(duration)}</dd>
              </div>
              <div>
                <dt>Lançamento</dt>
                <dd>${escapeHtml(String(year))}</dd>
              </div>
              <div>
                <dt>Classificação</dt>
                <dd><mark>${escapeHtml(classificationLabel)}</mark></dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
      <section class="movie-review-card">
        <h3>Minha avaliação</h3>
        ${renderRatingStars(movie.id)}
        <label>
          Comentário opcional
          <textarea id="movieReviewComment" maxlength="500" placeholder="Escreva o que achou do filme..."></textarea>
          <span id="movieReviewCounter">0/500</span>
        </label>
        <button type="button" onclick="submitMovieReview(${movie.id})">Enviar avaliação</button>
      </section>
      <section class="movie-comments-card">
        <h3>Comentários dos usuários</h3>
        <div id="movieCommentsList">
          <p class="movie-comments-empty">Carregando comentários...</p>
        </div>
      </section>
    </div>
  `;
  modal.classList.add('visible');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('movieReviewComment')?.addEventListener('input', (event) => {
    const counter = document.getElementById('movieReviewCounter');
    if (counter) counter.textContent = `${event.target.value.length}/500`;
  });
  hydrateMovieReviews(movie.id);
};

window.setMovieRating = (id, rating) => {
  movieRatings[id] = rating;
  localStorage.setItem('movieRatings', JSON.stringify(movieRatings));

  const ratingControl = document.querySelector('.rating-control');
  if (ratingControl) {
    ratingControl.outerHTML = renderRatingStars(id);
  }
};

window.toggleFavoriteMovie = async (id) => {
  const shouldFavorite = !isFavoriteMovie(id);
  const previousFavorites = { ...favoriteMovies };

  if (shouldFavorite) {
    favoriteMovies[id] = true;
  } else {
    delete favoriteMovies[id];
  }

  const favoriteButton = document.querySelector('.favorite-button');
  if (favoriteButton) {
    favoriteButton.classList.toggle('active', isFavoriteMovie(id));
  }

  applyDiaryFilters();

  try {
    await api(`/filmes/${id}/favorito`, {
      method: shouldFavorite ? 'POST' : 'DELETE'
    });
    renderProfile();
  } catch (error) {
    favoriteMovies = previousFavorites;
    if (favoriteButton) {
      favoriteButton.classList.toggle('active', isFavoriteMovie(id));
    }
    applyDiaryFilters();
    renderProfile();
    alert(error.message);
  }
};

window.submitMovieReview = async (id) => {
  const rating = getMovieRating(id);
  const comment = document.getElementById('movieReviewComment')?.value || '';

  if (!rating) {
    alert('Clique em uma estrela antes de enviar.');
    return;
  }

  try {
    await api(`/filmes/${id}/avaliacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nota: rating,
        comentario: comment
      })
    });
    await hydrateMovieReviews(id);
    await loadUserMovieReviews();
    renderProfile();
  } catch (error) {
    alert(error.message);
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
