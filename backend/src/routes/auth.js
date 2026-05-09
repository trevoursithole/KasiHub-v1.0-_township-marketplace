const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const auth = require('../middleware/auth');

const sign = (user) => jwt.sign({ id: user.id, name: user.name, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '30d' });
const safe = ({ password_hash, ...u }) => u;

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, section } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ error: 'name, phone, password required' });
    const db = getDb();
    if (db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)) return res.status(409).json({ error: 'Phone already registered' });
    const id = uuidv4();
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const hash = await bcrypt.hash(password, 10);
    db.prepare(`INSERT INTO users (id,name,phone,password_hash,section,avatar_initials) VALUES (?,?,?,?,?,?)`).run(id, name, phone, hash, section || 'Block L', initials);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(201).json({ token: sign(user), user: safe(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: sign(user), user: safe(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/me', auth, (req, res) => {
  try {
    const user = getDb().prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(safe(user));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/me', auth, (req, res) => {
  try {
    const { name, section } = req.body;
    const db = getDb();
    if (name) db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.user.id);
    if (section) db.prepare("UPDATE users SET section = ? WHERE id = ?").run(section, req.user.id);
    res.json(safe(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
