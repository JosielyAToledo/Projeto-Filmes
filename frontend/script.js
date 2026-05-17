const API_URL = 'http://localhost:3000';
let token = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('usuario') || 'null');
let rentalsChart;
let currentMovies = [];

const authStatus = document.getElementById('authStatus');

function headers(extra = {}) {
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: headers(options.headers || {})
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function setStatus(message) {
  authStatus.textContent = message;
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
    setStatus(`Logado como ${result.usuario.nome}`);
    await Promise.all([loadMovies(), loadChart(), loadLogs()]);
  } catch (error) {
    setStatus(error.message);
  }
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await api('/auth/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: document.getElementById('nomeRegistro').value,
        email: document.getElementById('emailRegistro').value,
        senha: document.getElementById('senhaRegistro').value
      })
    });
    setStatus('Usuario registrado. Agora faca login.');
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
  setStatus('Sessao encerrada.');
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
    await Promise.all([loadMovies(), loadLogs()]);
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('clearForm').addEventListener('click', clearForm);
document.getElementById('searchBtn').addEventListener('click', () => loadMovies(document.getElementById('search').value));
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
    await loadMovies();
    alert('Importacao concluida.');
  } catch (error) {
    alert(error.message);
  }
});

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
        <p>${movie.genero_nome || 'Sem genero'} | ${movie.ano_lancamento || 'Ano nao informado'}</p>
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
    await Promise.all([loadMovies(), loadLogs()]);
  } catch (error) {
    alert(error.message);
  }
};

function clearForm() {
  document.getElementById('movieForm').reset();
  document.getElementById('movieId').value = '';
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
  doc.text(`Usuario: ${currentUser ? currentUser.nome : 'Nao identificado'}`, 14, 32);

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
  const response = await fetch(`${API_URL}${path}`, {
    headers: headers()
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel baixar o arquivo.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

if (token) {
  setStatus('Token encontrado. Carregando dados...');
  Promise.all([loadMovies(), loadChart(), loadLogs()]).catch((error) => setStatus(error.message));
}
