const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Setup tables
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, name TEXT, description TEXT)`);
db.exec(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, project_id INTEGER, assignee_id INTEGER, status TEXT, due_date TEXT)`);

// Seed admin
const adminExists = db.prepare("SELECT * FROM users WHERE email='admin@admin.com'").get();
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run('Admin', 'admin@admin.com', hash, 'admin');
  console.log('Admin created');
}


const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  try {
    db.prepare("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)").run(name, email, hash, 'member');
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/projects', auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM projects").all());
});

app.post('/api/projects', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const result = db.prepare("INSERT INTO projects (name, description) VALUES (?,?)").run(req.body.name, req.body.description || '');
  res.json({ id: result.lastInsertRowid });
});

app.delete('/api/projects/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  db.prepare("DELETE FROM projects WHERE id=?").run(req.params.id);
  res.json({ message: 'Deleted' });
});

app.get('/api/tasks', auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM tasks").all());
});

app.post('/api/tasks', auth, (req, res) => {
  const { title, projectId, assigneeId, status, dueDate } = req.body;
  const result = db.prepare("INSERT INTO tasks (title, project_id, assignee_id, status, due_date) VALUES (?,?,?,?,?)").run(title, projectId, assigneeId, status || 'todo', dueDate);
  res.json({ id: result.lastInsertRowid });
});

app.put('/api/tasks/:id', auth, (req, res) => {
  db.prepare("UPDATE tasks SET status=? WHERE id=?").run(req.body.status, req.params.id);
  res.json({ message: 'Updated' });
});

app.delete('/api/tasks/:id', auth, (req, res) => {
  db.prepare("DELETE FROM tasks WHERE id=?").run(req.params.id);
  res.json({ message: 'Deleted' });
});

app.get('/api/users', auth, (req, res) => {
  res.json(db.prepare("SELECT id, name, email, role FROM users").all());
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
