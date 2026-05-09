const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const auth = require('../middleware/auth');

/* ---- RUNNERS ---- */
router.get('/runners', (req, res) => {
  try {
    const { section } = req.query;
    const db = getDb();
    let runners = db.prepare(`SELECT r.*, u.name, u.avatar_initials, u.phone, u.rating AS user_rating FROM runners r JOIN users u ON r.user_id = u.id WHERE r.is_online = 1`).all();
    if (section && section !== 'All') runners = runners.filter(r => r.current_section === section);
    runners.sort((a, b) => b.rating - a.rating);
    res.json(runners);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/runners/register', auth, (req, res) => {
  try {
    const { transport, rate } = req.body;
    const db = getDb();
    if (db.prepare('SELECT id FROM runners WHERE user_id = ?').get(req.user.id)) return res.status(409).json({ error: 'Already a runner' });
    const id = uuidv4();
    db.prepare("INSERT INTO runners (id,user_id,transport,rate,is_online,current_section) VALUES (?,?,?,?,1,'Block L')").run(id, req.user.id, transport || 'bicycle', parseFloat(rate) || 15);
    db.prepare("UPDATE users SET is_runner=1,runner_transport=?,runner_rate=? WHERE id=?").run(transport || 'bicycle', parseFloat(rate) || 15, req.user.id);
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/runners/status', auth, (req, res) => {
  try {
    const { is_online, section } = req.body;
    const db = getDb();
    const runner = db.prepare('SELECT id FROM runners WHERE user_id = ?').get(req.user.id);
    if (!runner) return res.status(404).json({ error: 'Not a runner' });
    db.prepare("UPDATE runners SET is_online=?,current_section=? WHERE user_id=?").run(is_online ? 1 : 0, section || 'Block L', req.user.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---- SAFE ZONES ---- */
router.get('/zones', (req, res) => {
  try {
    const { section } = req.query;
    const db = getDb();
    let zones = db.prepare('SELECT * FROM safe_zones').all();
    if (section && section !== 'All') zones = zones.filter(z => z.section === section);
    zones.sort((a, b) => a.distance_km - b.distance_km);
    res.json(zones);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---- TRANSACTIONS ---- */
router.get('/transactions', auth, (req, res) => {
  try {
    const db = getDb();
    const txs = db.prepare("SELECT * FROM transactions WHERE buyer_id = ? OR seller_id = ? ORDER BY created_at DESC").all(req.user.id, req.user.id);
    // Enrich with listing and user info
    const enriched = txs.map(tx => {
      const listing = db.prepare('SELECT title, emoji FROM listings WHERE id = ?').get(tx.listing_id) || {};
      const seller = db.prepare('SELECT name FROM users WHERE id = ?').get(tx.seller_id) || {};
      const buyer = db.prepare('SELECT name FROM users WHERE id = ?').get(tx.buyer_id) || {};
      return { ...tx, title: listing.title, emoji: listing.emoji, seller_name: seller.name, buyer_name: buyer.name };
    });
    res.json(enriched);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/transactions/:id', auth, (req, res) => {
  try {
    const db = getDb();
    const tx = db.prepare("SELECT * FROM transactions WHERE id = ? AND (buyer_id = ? OR seller_id = ?)").get(req.params.id, req.user.id, req.user.id);
    if (!tx) return res.status(404).json({ error: 'Not found' });
    const listing = db.prepare('SELECT title, emoji, price FROM listings WHERE id = ?').get(tx.listing_id) || {};
    const seller = db.prepare('SELECT name, avatar_initials FROM users WHERE id = ?').get(tx.seller_id) || {};
    const buyer = db.prepare('SELECT name, avatar_initials FROM users WHERE id = ?').get(tx.buyer_id) || {};
    res.json({ ...tx, ...listing, seller_name: seller.name, seller_initials: seller.avatar_initials, buyer_name: buyer.name, buyer_initials: buyer.avatar_initials });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/transactions', auth, (req, res) => {
  try {
    const { listing_id, runner_id, delivery_method, voucher_code } = req.body;
    if (!listing_id) return res.status(400).json({ error: 'listing_id required' });
    const db = getDb();
    const listing = db.prepare("SELECT * FROM listings WHERE id = ? AND status = 'active'").get(listing_id);
    if (!listing) return res.status(404).json({ error: 'Listing not active' });
    if (listing.seller_id === req.user.id) return res.status(400).json({ error: 'Cannot buy your own listing' });
    let runner_fee = 0;
    if (runner_id) {
      const runner = db.prepare('SELECT rate FROM runners WHERE id = ?').get(runner_id);
      if (runner) runner_fee = runner.rate;
    }
    const id = uuidv4();
    const reference = 'KH-' + Date.now().toString().slice(-8);
    db.prepare(`INSERT INTO transactions (id,reference,buyer_id,seller_id,listing_id,runner_id,item_price,runner_fee,total,delivery_method,status,voucher_code) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, reference, req.user.id, listing.seller_id, listing_id, runner_id || null, listing.price, runner_fee, listing.price + runner_fee, delivery_method || 'runner', 'escrow_locked', voucher_code || null);
    db.prepare(`INSERT INTO notifications (id,user_id,type,title,body,icon) VALUES (?,?,?,?,?,?)`).run(uuidv4(), listing.seller_id, 'new_order', 'New order placed!', `Someone locked payment for "${listing.title}"`, '🛒');
    res.status(201).json(db.prepare('SELECT * FROM transactions WHERE id = ?').get(id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/transactions/:id/complete', auth, (req, res) => {
  try {
    const db = getDb();
    const tx = db.prepare("SELECT * FROM transactions WHERE id = ? AND buyer_id = ?").get(req.params.id, req.user.id);
    if (!tx) return res.status(404).json({ error: 'Not found' });
    if (tx.status !== 'escrow_locked') return res.status(400).json({ error: `Status is ${tx.status}` });
    db.prepare("UPDATE transactions SET status='completed',qr_scanned=1,completed_at=datetime('now') WHERE id=?").run(tx.id);
    db.prepare("UPDATE listings SET status='sold' WHERE id=?").run(tx.listing_id);
    db.prepare("UPDATE users SET total_sales=total_sales+1,total_earnings=total_earnings+? WHERE id=?").run(tx.item_price, tx.seller_id);
    if (tx.runner_id) db.prepare("UPDATE runners SET total_deliveries=total_deliveries+1 WHERE id=?").run(tx.runner_id);
    db.prepare(`INSERT INTO notifications (id,user_id,type,title,body,icon) VALUES (?,?,?,?,?,?)`).run(uuidv4(), tx.seller_id, 'payment_released', 'Payment released!', `R${tx.item_price} sent to you. Transaction complete.`, '💰');
    res.json({ success: true, reference: tx.reference });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---- NOTIFICATIONS ---- */
router.get('/notifications', auth, (req, res) => {
  try {
    res.json(getDb().prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.user.id));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/notifications/read-all', auth, (req, res) => {
  try { getDb().prepare("UPDATE notifications SET is_read=1 WHERE user_id=?").run(req.user.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---- REVIEWS ---- */
router.post('/reviews', auth, (req, res) => {
  try {
    const { reviewee_id, transaction_id, rating, comment } = req.body;
    if (!reviewee_id || !rating) return res.status(400).json({ error: 'reviewee_id and rating required' });
    const db = getDb();
    const id = uuidv4();
    db.prepare('INSERT INTO reviews (id,reviewer_id,reviewee_id,transaction_id,rating,comment) VALUES (?,?,?,?,?,?)').run(id, req.user.id, reviewee_id, transaction_id, rating, comment || null);
    const reviews = db.prepare('SELECT rating FROM reviews WHERE reviewee_id = ?').all(reviewee_id);
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    db.prepare('UPDATE users SET rating = ? WHERE id = ?').run(Math.round(avg * 10) / 10, reviewee_id);
    res.status(201).json({ id, rating });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---- MESSAGES ---- */
router.post('/messages', auth, (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) return res.status(400).json({ error: 'receiver_id and content required' });
    const id = uuidv4();
    getDb().prepare('INSERT INTO messages (id,sender_id,receiver_id,content) VALUES (?,?,?,?)').run(id, req.user.id, receiver_id, content);
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ---- STATS ---- */
router.get('/stats/platform', (req, res) => {
  try {
    const db = getDb();
    const listings = db.prepare("SELECT COUNT(*) AS c FROM listings WHERE status='active'").get().c;
    const runners = db.prepare("SELECT COUNT(*) AS c FROM runners WHERE is_online=1").get().c;
    const flash = db.prepare("SELECT COUNT(*) AS c FROM listings WHERE is_flash_sale=1 AND status='active'").get().c;
    const zones = db.prepare("SELECT COUNT(*) AS c FROM safe_zones").get().c;
    const users = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
    const transactions = db.prepare("SELECT COUNT(*) AS c FROM transactions WHERE status='completed'").get().c;
    res.json({ listings, runners, flash, zones, users, transactions });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
