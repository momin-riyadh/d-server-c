const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'node_server'
});

// Connect to database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Create contact
app.post('/contacts', (req, res) => {
  const { name, mobile } = req.body;
  const query = 'INSERT INTO contacts (name, mobile) VALUES (?, ?)';
  connection.query(query, [name, mobile], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: results.insertId, name, mobile });
  });
});

// Read all contacts
app.get('/contacts', (req, res) => {
  connection.query('SELECT * FROM contacts', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Read single contact
app.get('/contacts/:id', (req, res) => {
  const query = 'SELECT * FROM contacts WHERE id = ?';
  connection.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    res.json(results[0]);
  });
});

// Update contact
app.put('/contacts/:id', (req, res) => {
  const { name, mobile } = req.body;
  const query = 'UPDATE contacts SET name = ?, mobile = ? WHERE id = ?';
  connection.query(query, [name, mobile, req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    res.json({ id: req.params.id, name, mobile });
  });
});

// Delete contact
app.delete('/contacts/:id', (req, res) => {
  const query = 'DELETE FROM contacts WHERE id = ?';
  connection.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Contact not found' });
      return;
    }
    res.json({ message: 'Contact deleted successfully' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});