const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const auth = require('../middleware/auth');

// GET /api/listings
router.get('/', (req, res) => {
  try {
    const { section, category, flash, search, limit = 50, offset = 0, status = 'active' } = req.query;
    const db = getDb();

    // Get all listings with seller info using two queries to avoid complex JOIN param issues
    let listings = db.prepare(`SELECT l.*, u.name AS seller_name, u.avatar_initials, u.is_verified, u.rating AS seller_rating, u.total_sales FROM listings l JOIN users u ON l.seller_id = u.id WHERE l.status = ?`).all(status);

    // Filter in JS for reliability
    if (section && section !== 'All') listings = listings.filter(l => l.section === section);
    if (category) listings = listings.filter(l => l.category === category);
    if (flash === '1') listings = listings.filter(l => l.is_flash_sale && l.flash_ends_at && new Date(l.flash_ends_at) > new Date());
    if (search) { const q = search.toLowerCase(); listings = listings.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)); }

    // Sort: flash first, then newest
    listings.sort((a, b) => (b.is_flash_sale - a.is_flash_sale) || (new Date(b.created_at) - new Date(a.created_at)));

    const total = listings.length;
    const page = listings.slice(Number(offset), Number(offset) + Number(limit));
    res.json({ listings: page, total });
  } catch (e) {
    console.error('listings GET error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/listings/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const listing = db.prepare(`SELECT l.*, u.name AS seller_name, u.avatar_initials, u.is_verified, u.rating AS seller_rating, u.total_sales, u.section AS seller_section FROM listings l JOIN users u ON l.seller_id = u.id WHERE l.id = ?`).get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    db.prepare("UPDATE listings SET views = views + 1 WHERE id = ?").run(req.params.id);
    res.json(listing);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/listings
router.post('/', auth, (req, res) => {
  try {
    const { title, description, price, category, condition, section, emoji, is_flash_sale, flash_hours } = req.body;
    if (!title || !price || !category) return res.status(400).json({ error: 'title, price, category required' });
    const db = getDb();
    const id = uuidv4();
    const flash_ends_at = is_flash_sale && flash_hours ? new Date(Date.now() + flash_hours * 3600000).toISOString() : null;
    db.prepare(`INSERT INTO listings (id,seller_id,title,description,price,category,condition,section,emoji,is_flash_sale,flash_ends_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, req.user.id, title, description || '', parseFloat(price), category, condition || 'Good', section || 'Block L', emoji || '📦', is_flash_sale ? 1 : 0, flash_ends_at);
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id);
    res.status(201).json(listing);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/listings/:id
router.patch('/:id', auth, (req, res) => {
  try {
    const db = getDb();
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (listing.seller_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const { title, description, price, status, category, condition } = req.body;
    if (title) db.prepare("UPDATE listings SET title = ? WHERE id = ?").run(title, req.params.id);
    if (description !== undefined) db.prepare("UPDATE listings SET description = ? WHERE id = ?").run(description, req.params.id);
    if (price) db.prepare("UPDATE listings SET price = ? WHERE id = ?").run(parseFloat(price), req.params.id);
    if (status) db.prepare("UPDATE listings SET status = ? WHERE id = ?").run(status, req.params.id);
    if (category) db.prepare("UPDATE listings SET category = ? WHERE id = ?").run(category, req.params.id);
    if (condition) db.prepare("UPDATE listings SET condition = ? WHERE id = ?").run(condition, req.params.id);
    res.json(db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const db = getDb();
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    if (listing.seller_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    db.prepare("UPDATE listings SET status = 'deleted' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
