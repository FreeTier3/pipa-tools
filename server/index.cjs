
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('dist'));

// Caminho para o arquivo de banco de dados
const DATABASE_FILE = path.join(__dirname, '..', 'database', 'data.json');

// Garantir que o diretório database existe
async function ensureDatabaseDir() {
  const databaseDir = path.dirname(DATABASE_FILE);
  try {
    await fs.access(databaseDir);
  } catch {
    await fs.mkdir(databaseDir, { recursive: true });
  }
}

// Função para ler dados do arquivo
async function readDatabase() {
  try {
    await ensureDatabaseDir();
    const data = await fs.readFile(DATABASE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Database file not found or invalid, returning empty data');
    return {};
  }
}

// Função para escrever dados no arquivo
async function writeDatabase(data) {
  try {
    await ensureDatabaseDir();
    await fs.writeFile(DATABASE_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Rotas da API
app.get('/api/database', async (req, res) => {
  try {
    const data = await readDatabase();
    res.json(data);
  } catch (error) {
    console.error('Error reading database:', error);
    res.status(500).json({ error: 'Failed to read database' });
  }
});

app.post('/api/database', async (req, res) => {
  try {
    const success = await writeDatabase(req.body);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to save database' });
    }
  } catch (error) {
    console.error('Error saving database:', error);
    res.status(500).json({ error: 'Failed to save database' });
  }
});

// Rota para servir a aplicação React (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
