const path = require('path');
const fs   = require('fs');

// DB file lives next to package.json regardless of cwd
const DB_PATH = path.resolve(__dirname, '../../kasihub.db');

let _db   = null; // raw sql.js Database instance
let _wrap = null; // wrapped synchronous-style API

function save() {
  if (_db) {
    try { fs.writeFileSync(DB_PATH, Buffer.from(_db.export())); } catch (_) {}
  }
}

async function initDb() {
  if (_wrap) return _wrap;

  // sql.js ships both a WASM and a pure-asm build; the asm build works
  // on all platforms without any native compilation.
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  _db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  initSchema(_db);
  save();
  setInterval(save, 5000);

  _wrap = buildWrap(_db);
  return _wrap;
}

function getDb() {
  if (!_wrap) throw new Error('DB not ready — call await initDb() first');
  return _wrap;
}

/* ── Schema ─────────────────────────────────────────────────────────── */
function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, section TEXT NOT NULL DEFAULT 'Block L',
      avatar_initials TEXT NOT NULL DEFAULT 'KH',
      is_verified INTEGER NOT NULL DEFAULT 0,
      verification_anchors INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 0,
      total_sales INTEGER NOT NULL DEFAULT 0,
      total_earnings REAL NOT NULL DEFAULT 0,
      is_runner INTEGER NOT NULL DEFAULT 0,
      runner_transport TEXT, runner_rate REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY, seller_id TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT NOT NULL,
      price REAL NOT NULL, category TEXT NOT NULL,
      condition TEXT NOT NULL DEFAULT 'Good',
      section TEXT NOT NULL, emoji TEXT NOT NULL DEFAULT '📦',
      image_url TEXT, is_flash_sale INTEGER NOT NULL DEFAULT 0,
      flash_ends_at TEXT, status TEXT NOT NULL DEFAULT 'active',
      views INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS safe_zones (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL,
      section TEXT NOT NULL, distance_km REAL NOT NULL,
      walk_minutes INTEGER NOT NULL,
      hours TEXT NOT NULL DEFAULT 'Open 24hrs',
      has_cctv INTEGER NOT NULL DEFAULT 0,
      latitude REAL, longitude REAL
    );
    CREATE TABLE IF NOT EXISTS runners (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE,
      transport TEXT NOT NULL DEFAULT 'bicycle',
      rate REAL NOT NULL DEFAULT 15,
      is_online INTEGER NOT NULL DEFAULT 0,
      current_section TEXT,
      total_deliveries INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 5.0
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY, reference TEXT UNIQUE NOT NULL,
      buyer_id TEXT NOT NULL, seller_id TEXT NOT NULL,
      listing_id TEXT NOT NULL, runner_id TEXT,
      item_price REAL NOT NULL, runner_fee REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      delivery_method TEXT NOT NULL DEFAULT 'runner',
      status TEXT NOT NULL DEFAULT 'escrow_locked',
      voucher_code TEXT, qr_scanned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, transaction_id TEXT,
      sender_id TEXT NOT NULL, receiver_id TEXT NOT NULL,
      content TEXT NOT NULL, is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY, reviewer_id TEXT NOT NULL,
      reviewee_id TEXT NOT NULL, transaction_id TEXT NOT NULL,
      rating INTEGER NOT NULL, comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL,
      type TEXT NOT NULL, title TEXT NOT NULL,
      body TEXT NOT NULL, icon TEXT NOT NULL DEFAULT '🔔',
      is_read INTEGER NOT NULL DEFAULT 0,
      link_screen TEXT, link_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_listings_section ON listings(section);
    CREATE INDEX IF NOT EXISTS idx_listings_status  ON listings(status);
    CREATE INDEX IF NOT EXISTS idx_runners_online   ON runners(is_online);
    CREATE INDEX IF NOT EXISTS idx_notifs_user      ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_tx_buyer         ON transactions(buyer_id);
  `);
}

/* ── Synchronous-style wrapper around sql.js ─────────────────────────
   Mimics the better-sqlite3 API: prepare(sql).run/get/all(…params)    */
function buildWrap(db) {
  function toObj(cols, row) {
    const o = {};
    cols.forEach((c, i) => { o[c] = row[i]; });
    return o;
  }

  // Expand named params (@name) → positional (?) + values array
  function expandNamed(sql, obj) {
    const vals = [];
    const s = sql.replace(/@(\w+)/g, (_, k) => {
      vals.push(obj[k] !== undefined ? obj[k] : null);
      return '?';
    });
    return { s, vals };
  }

  function resolve(sql, args) {
    if (
      args.length === 1 &&
      args[0] !== null &&
      typeof args[0] === 'object' &&
      !Array.isArray(args[0])
    ) {
      return expandNamed(sql, args[0]);
    }
    return { s: sql, vals: args };
  }

  return {
    prepare(sql) {
      return {
        run(...args) {
          const { s, vals } = resolve(sql, args);
          db.run(s, vals.length ? vals : undefined);
          save();
          return { changes: 1 };
        },
        get(...args) {
          const { s, vals } = resolve(sql, args);
          const r = db.exec(s, vals.length ? vals : undefined);
          if (!r.length || !r[0].values.length) return undefined;
          return toObj(r[0].columns, r[0].values[0]);
        },
        all(...args) {
          const { s, vals } = resolve(sql, args);
          const r = db.exec(s, vals.length ? vals : undefined);
          if (!r.length) return [];
          return r[0].values.map(row => toObj(r[0].columns, row));
        },
      };
    },
    exec(sql)  { db.exec(sql); save(); },
    pragma()   {}, // no-op for compat with better-sqlite3 callers
  };
}

module.exports = { initDb, getDb, save };
