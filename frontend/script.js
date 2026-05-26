const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;
const previewMode = new URLSearchParams(window.location.search).get('preview') === '1';

let token = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('usuario') || 'null');
let movies = [];
let movieRatings = JSON.parse(localStorage.getItem('movieRatings') || '{}');
let adminSession = localStorage.getItem('adminSession') === '1';
let pendingEditMovie = null;
let pendingDeleteMovie = null;
let editingMovieId = null;
let pendingMovieSaveStatus = 'publicado';
let adminMoviesCache = [];
let adminMoviesFiltered = [];
let adminMoviesPage = 1;
let adminCurrentView = 'dashboard';
let adminLogsCache = [];
let pendingDeleteLogIndex = null;
const ADMIN_MOVIES_PER_PAGE = 4;
let pendingInactiveUser = null;
let pendingDeleteUser = null;

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

document.querySelectorAll('[data-admin-view]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();

    showAdminView(link.dataset.adminView);
    if (link.dataset.adminConfigShortcut) {
      showAdminConfigTab(link.dataset.adminConfigShortcut);
    } else if (link.dataset.adminView === 'config') {
      showAdminConfigTab('chart');
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

document.getElementById('adminOpenXmlExport')?.addEventListener('click', openAdminXmlExportPanel);
document.getElementById('adminOpenJsonImport')?.addEventListener('click', openAdminJsonImportPanel);
document.getElementById('adminOpenJsonExport')?.addEventListener('click', openAdminJsonExportPanel);
document.getElementById('adminOpenPdfExport')?.addEventListener('click', openAdminPdfExportPanel);
document.getElementById('adminCancelJsonImport')?.addEventListener('click', closeAdminJsonImportPanel);
document.getElementById('adminDownloadXmlPreview')?.addEventListener('click', () => {
  downloadBlob(buildAdminLogsXML(getFilteredAdminXmlLogs()), 'logs-catalogo7.xml', 'application/xml');
});
document.getElementById('adminDownloadJsonPreview')?.addEventListener('click', () => {
  downloadBlob(buildAdminLogsJSON(getFilteredAdminXmlLogs()), 'logs-catalogo7.json', 'application/json');
});
document.getElementById('adminDownloadPdfPreview')?.addEventListener('click', () => {
  downloadBlob(makeSimplePDF(buildAdminPdfLines(getFilteredAdminXmlLogs())), 'logs-catalogo7.pdf', 'application/pdf');
});
document.getElementById('adminCopyXmlPreview')?.addEventListener('click', async () => {
  const preview = document.getElementById('adminXmlPreview')?.textContent || '';
  await navigator.clipboard?.writeText(preview).catch(() => null);
});
document.getElementById('adminCopyJsonPreview')?.addEventListener('click', async () => {
  const preview = document.getElementById('adminJsonPreview')?.textContent || '';
  await navigator.clipboard?.writeText(preview).catch(() => null);
});
['adminXmlPeriod', 'adminXmlUser', 'adminXmlType', 'adminXmlStatus', 'adminXmlSearch'].forEach((id) => {
  document.getElementById(id)?.addEventListener('change', updateAdminXmlPreview);
  document.getElementById(id)?.addEventListener('input', updateAdminXmlPreview);
});
document.getElementById('adminApplyXmlFilters')?.addEventListener('click', updateAdminXmlPreview);
document.getElementById('adminClearXmlFilters')?.addEventListener('click', clearAdminXmlFilters);

document.getElementById('adminTopSearch').addEventListener('input', applyAdminTopFilters);
document.getElementById('adminTopFilter').addEventListener('change', applyAdminTopFilters);

document.getElementById('adminRefreshLogs')?.addEventListener('click', loadAdminLogs);
document.getElementById('adminLogsBody')?.addEventListener('click', handleAdminLogsClick);
document.getElementById('adminCancelDeleteLog')?.addEventListener('click', closeDeleteLogModal);
document.getElementById('adminConfirmDeleteLog')?.addEventListener('click', confirmDeleteLog);

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
  if (isMoviesView) {
    document.getElementById('adminMoviesView').classList.remove('creating');
    document.querySelector('.admin-main').classList.remove('creating-movie');
    editingMovieId = null;
    loadAdminMovies();
  } else {
    document.querySelector('.admin-main').classList.remove('creating-movie');
  }

  const titles = {
    movies: ['Filmes', 'Cadastro e gestao do catalogo'],
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
  }
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
  const adminMain = document.querySelector('.admin-main');
  adminMain.classList.toggle('show-logs', isLogsTab);
  if (isLogsTab) {
    adminCurrentView = 'logs';
    document.querySelector('.admin-user-topbar-title').textContent = 'Log';
    document.querySelector('.admin-topbar h1').textContent = 'Log';
    document.querySelector('.admin-topbar p').textContent = 'Eventos registrados pela API';
    updateAdminTopFilter('logs');
    showAdminLogPanel('logs');
  } else if (adminCurrentView === 'logs') {
    adminCurrentView = 'config';
    updateAdminTopFilter('config');
  }

  document.querySelectorAll('[data-admin-config-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminConfigTab === tab);
  });
  document.querySelectorAll('[data-admin-config-shortcut]').forEach((link) => {
    link.classList.toggle('active', link.dataset.adminConfigShortcut === tab);
  });
  document.querySelectorAll('[data-admin-view="config"]:not([data-admin-config-shortcut])').forEach((link) => {
    link.classList.toggle('active', !isLogsTab);
  });

  document.getElementById('adminConfigChart').classList.toggle('active', tab === 'chart');
  document.getElementById('adminConfigLogs').classList.toggle('active', tab === 'logs');
  document.getElementById('adminConfigCurrentPage').textContent = tab === 'logs' ? 'Log' : 'Geral';

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

function openAdminXmlExportPanel() {
  if (!adminLogsCache.length) {
    adminLogsCache = sampleAdminLogs;
  }
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonExportPanel')?.classList.remove('visible');
  document.getElementById('adminPdfExportPanel')?.classList.remove('visible');
  updateAdminXmlPreview();
  document.getElementById('adminXmlExportPanel').classList.add('visible');
}

function openAdminJsonImportPanel() {
  document.getElementById('adminXmlExportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonExportPanel')?.classList.remove('visible');
  document.getElementById('adminPdfExportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonImportPanel')?.classList.add('visible');
}

function closeAdminJsonImportPanel() {
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
}

function openAdminJsonExportPanel() {
  if (!adminLogsCache.length) {
    adminLogsCache = sampleAdminLogs;
  }
  document.getElementById('adminXmlExportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
  document.getElementById('adminPdfExportPanel')?.classList.remove('visible');
  updateAdminJsonPreview();
  document.getElementById('adminJsonExportPanel')?.classList.add('visible');
}

function openAdminPdfExportPanel() {
  if (!adminLogsCache.length) {
    adminLogsCache = sampleAdminLogs;
  }
  document.getElementById('adminXmlExportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonImportPanel')?.classList.remove('visible');
  document.getElementById('adminJsonExportPanel')?.classList.remove('visible');
  updateAdminPdfPreview();
  document.getElementById('adminPdfExportPanel')?.classList.add('visible');
}

function getFilteredAdminXmlLogs() {
  const selectedUser = normalizeText(document.getElementById('adminXmlUser')?.value || 'Todos');
  const selectedType = normalizeText(document.getElementById('adminXmlType')?.value || 'Todas as ações');
  const selectedStatus = normalizeText(document.getElementById('adminXmlStatus')?.value || 'Todos os status');
  const query = normalizeText(document.getElementById('adminXmlSearch')?.value || '');
  const logs = adminLogsCache.length ? adminLogsCache : sampleAdminLogs;

  return logs.filter((log) => {
    const user = normalizeText(formatLogUser(log.usuario || 'anonimo'));
    const action = normalizeText(formatLogAction(log.acao || log.tipoEvento || ''));
    const status = normalizeText(log.statusCode || '');
    const searchable = normalizeText([
      formatLogUser(log.usuario || 'anonimo'),
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
    adminXmlUser: 'Todos',
    adminXmlStatus: 'Todos os status',
    adminXmlType: 'Todas as ações',
    adminXmlSearch: ''
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const field = document.getElementById(id);
    if (field) field.value = value;
  });
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

  preview.textContent = buildAdminLogsJSON(getFilteredAdminXmlLogs().slice(0, 4));
}

function updateAdminPdfPreview() {
  const preview = document.getElementById('adminPdfPreview');
  if (!preview) return;

  const logs = getFilteredAdminXmlLogs();
  const rows = logs.slice(0, 8).map((log) => {
    const action = log.acao || log.tipoEvento || '-';
    return `
      <tr>
        <td>${escapeHtml(log.timestamp ? new Date(log.timestamp).toLocaleDateString('pt-BR') : '-')}</td>
        <td>${escapeHtml(formatLogUser(log.usuario || 'anonimo'))}</td>
        <td>${escapeHtml(formatLogAction(action))}</td>
        <td>${escapeHtml(log.statusCode || '-')}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('adminPdfPreviewCount').textContent = `${logs.length} logs`;
  preview.innerHTML = `
    <div class="admin-pdf-page">
      <h3>Catálogo7</h3>
      <h4>Relatório de Logs</h4>
      <p>Período: ${escapeHtml(document.getElementById('adminXmlPeriod')?.value || 'Últimos 6 meses')}</p>
      <table>
        <thead>
          <tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Status</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="4">Nenhum log encontrado.</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

function buildAdminPdfLines(logs) {
  return [
    'Relatorio de Logs - Catalogo7',
    `Periodo: ${document.getElementById('adminXmlPeriod')?.value || 'Ultimos 6 meses'}`,
    `Total de logs: ${logs.length}`,
    '',
    ...logs.slice(0, 24).map((log) => {
      const date = log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : '-';
      const action = formatLogAction(log.acao || log.tipoEvento || '-');
      return `${date} | ${formatLogUser(log.usuario || 'anonimo')} | ${action} | ${log.statusCode || '-'}`;
    })
  ];
}

function buildAdminLogsXML(logs, hasMore = false) {
  const items = logs.map((log, index) => {
    const action = log.acao || log.tipoEvento || '-';
    return `  <evento id="${index + 1}">
    <usuario>${escapeXml(formatLogUser(log.usuario || 'anonimo'))}</usuario>
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
          usuario: formatLogUser(log.usuario || 'anonimo'),
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
  const user = log.usuario || 'anonimo';
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
  const cleanUser = String(user || 'anonimo').split('@')[0].replace(/[._-]+/g, ' ').trim();
  return cleanUser || 'anonimo';
}

function formatLogAction(action) {
  return String(action || '-').replace(/\s+/g, '_').toUpperCase();
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
      log.usuario || 'anonimo',
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
  const name = user.nome || user.email || 'Usuario Catálogo7';
  const email = user.email || 'email@catalogo7.com';
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
  const name = user.nome || user.email || 'Usuario Catálogo7';
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
    '(Relatorio Catálogo7) Tj',
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

  downloadBlob(makeSimplePDF(lines), 'relatorio-catalogo7.pdf', 'application/pdf');
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
        <p>${movie.descricao || 'Filme disponível no catálogo Catálogo7.'}</p>
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
