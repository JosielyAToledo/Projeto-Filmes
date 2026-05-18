const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin;

let token = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('usuario') || 'null');
let rentalsChart;
let currentMovies = [];
let currentClients = [];

const authStatus = document.getElementById('authStatus');

function syncSessionView() {
  document.body.classList.toggle('logged-in', Boolean(token));
}

function showRegisterPanel() {
  document.getElementById('login').classList.add('register-mode');
  setStatus('');
}

function showLoginPanel() {
  document.getElementById('login').classList.remove('register-mode');
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
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está online.');
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
    'Token nao informado.': 'Faça login para continuar.',
    'Token invalido ou expirado.': 'Sua sessão expirou. Faça login novamente.',
    'Campos obrigatorios ausentes.': 'Preencha todos os campos obrigatórios.',
    'E-mail ja cadastrado.': 'Este e-mail já está cadastrado.',
    'Arquivo JSON invalido.': 'O arquivo enviado não é um JSON válido.'
  };

  if (knownMessages[message]) {
    return knownMessages[message];
  }

  if (status === 500) {
    return 'Ocorreu um erro no servidor. Tente novamente em instantes.';
  }

  if (status === 404) {
    return 'Registro não encontrado.';
  }

  return message || 'Não foi possível concluir a operação.';
}

function setStatus(message) {
  authStatus.textContent = message;
}

async function loadPrivateData() {
  await Promise.all([loadDashboard(), loadMovies(), loadClients(), loadChart(), loadLogs()]);
}

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
    syncSessionView();
    setStatus(`Logado como ${result.usuario.nome}.`);
    await loadPrivateData();
  } catch (error) {
    setStatus(error.message);
  }
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const senha = document.getElementById('senhaRegistro').value;
    const confirmarSenha = document.getElementById('confirmarSenhaRegistro').value;

    if (senha !== confirmarSenha) {
      setStatus('As senhas não conferem.');
      return;
    }

    await api('/auth/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: document.getElementById('nomeRegistro').value,
        email: document.getElementById('emailRegistro').value,
        senha
      })
    });
    showLoginPanel();
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
  syncSessionView();
  setStatus('Sessão encerrada.');
});

document.getElementById('refreshDashboard').addEventListener('click', () => {
  loadDashboard().catch((error) => setStatus(error.message));
});

document.getElementById('movieForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('movieId').value;
  const formData = new FormData();
  const capa = document.getElementById('capa').files[0];

  ['titulo', 'descricao', 'ano_lancamento', 'genero_id', 'preco_locacao', 'estoque'].forEach((field) => {
    formData.append(field, document.getElementById(field).value);
  });

  if (capa) {
    formData.append('capa', capa);
  }

  try {
    await api(id ? `/filmes/${id}` : '/filmes', {
      method: id ? 'PUT' : 'POST',
      body: formData
    });
    clearForm();
    await Promise.all([loadDashboard(), loadMovies(), loadLogs()]);
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('clientForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const id = document.getElementById('clientId').value;
  const payload = {
    nome: document.getElementById('clientName').value,
    email: document.getElementById('clientEmail').value,
    telefone: document.getElementById('clientPhone').value,
    documento: document.getElementById('clientDocument').value
  };

  try {
    await api(id ? `/clientes/${id}` : '/clientes', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    clearClientForm();
    await Promise.all([loadDashboard(), loadClients(), loadLogs()]);
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('clearForm').addEventListener('click', clearForm);
document.getElementById('clearClientForm').addEventListener('click', clearClientForm);
document.getElementById('showRegister').addEventListener('click', showRegisterPanel);
document.getElementById('showLogin').addEventListener('click', showLoginPanel);
document.getElementById('searchBtn').addEventListener('click', () => loadMovies(document.getElementById('search').value));
document.getElementById('clientSearchBtn').addEventListener('click', () => loadClients(document.getElementById('clientSearch').value));
document.getElementById('generatePdf').addEventListener('click', generatePdf);
document.getElementById('exportJson').addEventListener('click', () => downloadProtected('/filmes/exportar/json', 'filmes.json'));
document.getElementById('exportXml').addEventListener('click', () => downloadProtected('/logs/exportar/xml', 'logs.xml'));

document.getElementById('importJson').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('arquivo', file);

  try {
    await api('/filmes/importar/json', {
      method: 'POST',
      body: formData
    });
    await Promise.all([loadDashboard(), loadMovies(), loadLogs()]);
    alert('Importação concluída.');
  } catch (error) {
    alert(error.message);
  }
});

async function loadDashboard() {
  const resumo = await api('/relatorios/json');
  document.getElementById('statMovies').textContent = resumo.filmes;
  document.getElementById('statClients').textContent = resumo.clientes;
  document.getElementById('statRentals').textContent = resumo.locacoes;
}

async function loadMovies(query = '') {
  const path = query ? `/filmes?q=${encodeURIComponent(query)}` : '/filmes';
  currentMovies = await api(path);
  renderMovies(currentMovies);
}

function renderMovies(movies) {
  const list = document.getElementById('movieList');

  if (!movies.length) {
    list.innerHTML = '<p>Nenhum filme encontrado.</p>';
    return;
  }

  list.innerHTML = movies.map((movie) => `
    <article class="movie-card">
      ${movie.capa_url ? `<img src="${API_URL}${movie.capa_url}" alt="Capa de ${movie.titulo}">` : '<img alt="Sem capa">'}
      <div>
        <h3>${movie.titulo}</h3>
        <p>${movie.genero_nome || 'Sem gênero'} | ${movie.ano_lancamento || 'Ano não informado'}</p>
        <p>Estoque: ${movie.estoque} | R$ ${Number(movie.preco_locacao).toFixed(2)}</p>
        <div class="card-actions">
          <button onclick="editMovie(${movie.id})">Editar</button>
          <button class="ghost" onclick="deleteMovie(${movie.id})">Excluir</button>
        </div>
      </div>
    </article>
  `).join('');
}

window.editMovie = (id) => {
  const movie = currentMovies.find((item) => item.id === id);
  if (!movie) return;

  ['movieId', 'titulo', 'descricao', 'ano_lancamento', 'genero_id', 'preco_locacao', 'estoque'].forEach((field) => {
    const source = field === 'movieId' ? 'id' : field;
    document.getElementById(field).value = movie[source] || '';
  });
};

window.deleteMovie = async (id) => {
  if (!confirm('Deseja excluir este filme?')) return;

  try {
    await api(`/filmes/${id}`, { method: 'DELETE' });
    await Promise.all([loadDashboard(), loadMovies(), loadLogs()]);
  } catch (error) {
    alert(error.message);
  }
};

function clearForm() {
  document.getElementById('movieForm').reset();
  document.getElementById('movieId').value = '';
}

async function loadClients(query = '') {
  const path = query ? `/clientes?q=${encodeURIComponent(query)}` : '/clientes';
  currentClients = await api(path);
  renderClients(currentClients);
}

function renderClients(clients) {
  const list = document.getElementById('clientList');

  if (!clients.length) {
    list.innerHTML = '<p>Nenhum cliente encontrado.</p>';
    return;
  }

  list.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Telefone</th>
          <th>Documento</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${clients.map((client) => `
          <tr>
            <td>${client.nome}</td>
            <td>${client.email || '-'}</td>
            <td>${client.telefone || '-'}</td>
            <td>${client.documento || '-'}</td>
            <td>
              <div class="table-actions">
                <button onclick="editClient(${client.id})">Editar</button>
                <button class="ghost" onclick="deleteClient(${client.id})">Excluir</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

window.editClient = (id) => {
  const client = currentClients.find((item) => item.id === id);
  if (!client) return;

  document.getElementById('clientId').value = client.id;
  document.getElementById('clientName').value = client.nome || '';
  document.getElementById('clientEmail').value = client.email || '';
  document.getElementById('clientPhone').value = client.telefone || '';
  document.getElementById('clientDocument').value = client.documento || '';
};

window.deleteClient = async (id) => {
  if (!confirm('Deseja excluir este cliente?')) return;

  try {
    await api(`/clientes/${id}`, { method: 'DELETE' });
    await Promise.all([loadDashboard(), loadClients(), loadLogs()]);
  } catch (error) {
    alert(error.message);
  }
};

function clearClientForm() {
  document.getElementById('clientForm').reset();
  document.getElementById('clientId').value = '';
}

async function loadChart() {
  const data = await api('/relatorios/grafico-locacoes');
  const context = document.getElementById('rentalsChart');

  if (rentalsChart) {
    rentalsChart.destroy();
  }

  rentalsChart = new Chart(context, {
    type: 'bar',
    data: {
      labels: data.labels.length ? data.labels : ['sem dados'],
      datasets: [{
        label: 'Locacoes por status',
        data: data.datasets[0].data.length ? data.datasets[0].data : [0],
        backgroundColor: ['#1f6feb', '#2f855a', '#d97706', '#b91c1c']
      }]
    }
  });
}

async function loadLogs() {
  const logs = await api('/logs');
  document.getElementById('logsPreview').textContent = JSON.stringify(logs.slice(0, 10), null, 2);
}

async function generatePdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const resumo = await api('/relatorios/json');

  doc.setFontSize(16);
  doc.text('Relatorio da Locadora Projeto-Filmes', 14, 18);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 26);
  doc.text(`Usuário: ${currentUser ? currentUser.nome : 'Não identificado'}`, 14, 32);

  doc.autoTable({
    startY: 40,
    head: [['Indicador', 'Total']],
    body: [
      ['Filmes cadastrados', resumo.filmes],
      ['Clientes cadastrados', resumo.clientes],
      ['Locacoes registradas', resumo.locacoes]
    ],
    theme: 'grid'
  });

  doc.save('relatorio-projeto-filmes.pdf');
}

async function downloadProtected(path, filename) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: headers()
    });

    if (!response.ok) {
      throw new Error('Não foi possível baixar o arquivo.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(error.message);
  }
}

if (token) {
  syncSessionView();
  setStatus('Token encontrado. Carregando dados...');
  loadPrivateData().catch((error) => setStatus(error.message));
} else {
  syncSessionView();
}
