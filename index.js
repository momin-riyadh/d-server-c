const express = require('express');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');
const auth = require('./auth');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());
app.use(express.static('client'));

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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/login.html');
});

app.post('/register', async (req, res) => {
    const { email, password, role } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
        
        connection.query(query, [email, hashedPassword, role || 'user'], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User created successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({ token, role: user.role });
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

// Validation middleware
const validateContact = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('mobile').trim().matches(/^\+?[\d\s-]{10,}$/).withMessage('Invalid mobile number format'),
];

// Create contact with validation and authorization
app.post('/contacts', 
    auth.verifyToken,
    auth.checkRole(['admin', 'editor']),
    validateContact,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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

// Read all contacts (with optional role-based filtering)
app.get('/contacts',
    auth.verifyToken,
    (req, res) => {
        const query = req.user.role === 'admin' 
            ? 'SELECT * FROM contacts'
            : 'SELECT id, name, mobile FROM contacts';
            
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