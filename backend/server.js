// backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Banco de dados
const db = new sqlite3.Database('./backend/database/db.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS massas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    chave TEXT UNIQUE NOT NULL,
    valor TEXT NOT NULL
  )`);
});

// Listar todas as massas
app.get('/massas', (req, res) => {
  db.all('SELECT * FROM massas', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obter uma massa por chave
app.get('/massa/:chave', (req, res) => {
  const { chave } = req.params;
  db.get('SELECT * FROM massas WHERE chave = ?', [chave], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Massa não encontrada' });
    res.json(row);
  });
});

// Adicionar nova massa
app.post('/massas', (req, res) => {
  const { tipo, chave, valor } = req.body;
  db.run(
    'INSERT INTO massas (tipo, chave, valor) VALUES (?, ?, ?)',
    [tipo, chave, JSON.stringify(valor)],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Atualizar massa existente
app.put('/massas/:id', (req, res) => {
  const { id } = req.params;
  const { tipo, chave, valor } = req.body;
  db.run(
    'UPDATE massas SET tipo = ?, chave = ?, valor = ? WHERE id = ?',
    [tipo, chave, JSON.stringify(valor), id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Deletar massa
app.delete('/massas/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM massas WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
