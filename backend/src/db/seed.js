// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
}

const { initDb }     = require('./database');
const bcrypt         = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const db = await initDb();
  console.log('🌱  Seeding KasiHub database…');

  db.exec(`
    DELETE FROM notifications; DELETE FROM reviews;
    DELETE FROM messages;      DELETE FROM transactions;
    DELETE FROM runners;       DELETE FROM listings;
    DELETE FROM safe_zones;    DELETE FROM users;
  `);

  const hash = await bcrypt.hash('password123', 10);

  /* ── Users ────────────────────────────────────────────────────────── */
  const users = [
    { id: uuidv4(), name: 'Thandeka Mokoena', phone: '0821234567', section: 'Block L',       initials: 'TM', verified: 1, anchors: 3, rating: 4.8, sales: 34,  earned: 2400, runner: 0 },
    { id: uuidv4(), name: 'Mama Dlamini',     phone: '0829876543', section: 'Block L',       initials: 'MD', verified: 1, anchors: 5, rating: 4.9, sales: 142, earned: 8700, runner: 0 },
    { id: uuidv4(), name: 'Sipho Mokoena',    phone: '0831112233', section: 'Ext 4',         initials: 'SM', verified: 1, anchors: 2, rating: 4.7, sales: 18,  earned: 3200, runner: 0 },
    { id: uuidv4(), name: 'Thabo Langa',      phone: '0844445566', section: 'Block L',       initials: 'TL', verified: 0, anchors: 1, rating: 4.5, sales: 7,   earned: 980,  runner: 0 },
    { id: uuidv4(), name: 'Zakhele Mokoena',  phone: '0855556677', section: 'Block L',       initials: 'ZM', verified: 1, anchors: 4, rating: 4.9, sales: 0,   earned: 0,    runner: 1, rt: 'bicycle', rr: 15 },
    { id: uuidv4(), name: 'Lerato Sithole',   phone: '0866667788', section: 'Block L',       initials: 'LS', verified: 1, anchors: 3, rating: 4.6, sales: 0,   earned: 0,    runner: 1, rt: 'foot',    rr: 10 },
    { id: uuidv4(), name: 'Mpho Tlou',        phone: '0877778899', section: 'Ext 4',         initials: 'MT', verified: 1, anchors: 2, rating: 4.8, sales: 0,   earned: 0,    runner: 1, rt: 'bicycle', rr: 12 },
    { id: uuidv4(), name: 'Bongani Nkosi',    phone: '0888889900', section: 'Block L',       initials: 'BN', verified: 1, anchors: 3, rating: 4.7, sales: 0,   earned: 0,    runner: 1, rt: 'foot',    rr: 8  },
    { id: uuidv4(), name: 'Nandi Dube',       phone: '0811223344', section: 'Mamelodi West', initials: 'ND', verified: 1, anchors: 2, rating: 4.6, sales: 12,  earned: 1800, runner: 0 },
  ];

  const insU = db.prepare(`INSERT INTO users
    (id,name,phone,password_hash,section,avatar_initials,is_verified,
     verification_anchors,rating,total_sales,total_earnings,is_runner,runner_transport,runner_rate)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const u of users)
    insU.run(u.id,u.name,u.phone,hash,u.section,u.initials,
      u.verified,u.anchors,u.rating,u.sales,u.earned,u.runner,u.rt||null,u.rr||null);

  /* ── Runners ──────────────────────────────────────────────────────── */
  const insR = db.prepare(`INSERT INTO runners
    (id,user_id,transport,rate,is_online,current_section,total_deliveries,rating)
    VALUES (?,?,?,?,1,?,?,?)`);
  users.filter(u=>u.runner).forEach((u,i)=>
    insR.run(uuidv4(),u.id,u.rt,u.rr,u.section,[234,89,156,67][i]||50,u.rating));

  /* ── Safe-Trade Zones ─────────────────────────────────────────────── */
  const insZ = db.prepare(`INSERT INTO safe_zones
    (id,name,type,section,distance_km,walk_minutes,hours,has_cctv)
    VALUES (?,?,?,?,?,?,?,?)`);
  [
    [uuidv4(),'Mamelodi Engen Garage',  'PETROL',    'Block L',       0.4, 5, 'Open 24hrs',           1],
    [uuidv4(),'Sanlam Mall Entrance',   'MALL',      'Block L',       0.9,11, 'Mon–Sun 08:00–20:00',  1],
    [uuidv4(),'Block L Police Station', 'POLICE',    'Block L',       1.2,15, 'Open 24hrs',           1],
    [uuidv4(),'Shoprite Mamelodi',      'MALL',      'Mamelodi West', 1.8,22, 'Mon–Sun 08:00–19:00',  1],
    [uuidv4(),'Ext 4 Community Hall',   'COMMUNITY', 'Ext 4',         0.6, 8, 'Mon–Fri 08:00–17:00', 0],
  ].forEach(z=>insZ.run(...z));

  /* ── Listings ─────────────────────────────────────────────────────── */
  // SQLite-compatible datetime: "YYYY-MM-DD HH:MM:SS"
  const flashEnd = h => new Date(Date.now()+h*3_600_000)
    .toISOString().replace('T',' ').slice(0,19);

  const insL = db.prepare(`INSERT INTO listings
    (id,seller_id,title,description,price,category,condition,section,emoji,is_flash_sale,flash_ends_at,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,'active')`);

  const listings = [
    [uuidv4(),users[1].id,'Kota Special x2 with chips & polony',  'Two kota rolls loaded with chips, polony, and atchaar. Made fresh 07:00–14:00.', 45, 'Food',        'New',  'Block L',       '🍗',1,flashEnd(2)],
    [uuidv4(),users[2].id,'Samsung Galaxy A14 — good condition',   'Used 6 months. Screen perfect, battery great. Original charger included.',       850,'Electronics','Good', 'Ext 4',         '📱',0,null],
    [uuidv4(),users[3].id,'Nike Air Max Size 9 — pre-loved',       'Worn 5 times only. Still clean. Box included.',                                  220,'Fashion',     'Good', 'Block L',       '👟',0,null],
    [uuidv4(),users[8].id,'Office Chair — almost new',             'Bought 3 months ago. Adjustable height and armrests.',                           380,'Furniture',   'Good', 'Mamelodi West', '🪑',0,null],
    [uuidv4(),users[1].id,'Eggs x30 — farm fresh',                 'Fresh eggs from local farm. Collected this morning.',                             58, 'Food',        'New',  'Block L',       '🥚',1,flashEnd(3)],
    [uuidv4(),users[1].id,'Brown Bread 4-pack',                    'Albany brown bread, best before end of week.',                                    44, 'Food',        'New',  'Block L',       '🍞',1,flashEnd(5)],
    [uuidv4(),users[1].id,'Mogodu — fresh batch',                  'Freshly prepared tripe. Limited quantity today only.',                            75, 'Food',        'New',  'Block L',       '🥩',1,flashEnd(1)],
    [uuidv4(),users[2].id,'Plumbing Services — same day',          'Qualified plumber. Leaking taps, burst pipes, geyser installation.',             250,'Services',    'New',  'Block L',       '🔧',0,null],
    [uuidv4(),users[2].id,'Grade 12 Maths Tutoring',               'Help with algebra, calculus, past papers. R80/hr.',                               80, 'Education',   'New',  'Ext 4',         '📚',0,null],
    [uuidv4(),users[8].id,'Hair braiding — all styles',            'Box braids, cornrows, loc styles. Home-based, clean setup.',                     180,'Beauty',      'New',  'Mamelodi West', '💅',0,null],
    [uuidv4(),users[3].id,'Adidas tracksuit top — size M',         'Genuine Adidas, navy blue. Worn twice.',                                         150,'Fashion',     'Good', 'Block L',       '👕',0,null],
    [uuidv4(),users[1].id,'Mageu 2L — homemade',                   'Traditional mageu, made fresh this morning.',                                     22, 'Food',        'New',  'Block L',       '🫙',1,flashEnd(6)],
  ];
  listings.forEach(l=>insL.run(...l));

  /* ── Demo transaction ─────────────────────────────────────────────── */
  db.prepare(`INSERT INTO transactions
    (id,reference,buyer_id,seller_id,listing_id,item_price,runner_fee,total,
     delivery_method,status,qr_scanned,completed_at)
    VALUES (?,?,?,?,?,45,15,60,'runner','completed',1,datetime('now','-2 hours'))`)
    .run(uuidv4(),'KH-2025-08741',users[0].id,users[1].id,listings[0][0]);

  /* ── Notifications ────────────────────────────────────────────────── */
  const insN = db.prepare(`INSERT INTO notifications
    (id,user_id,type,title,body,icon,is_read,link_screen)
    VALUES (?,?,?,?,?,?,?,?)`);
  [
    ['runner_update','Runner on the way!',         'Zakhele picked up your Kota. ETA 8 minutes.',              '🚴',0,'transactions'],
    ['message',      'New message from Sipho',     '"Is the Samsung still available? Can you do R800?"',        '💬',0,'messages'    ],
    ['review',       'New 5-star review!',          'Mama Dlamini: "Quick payment, no hassle!"',               '⭐',1,'profile'     ],
    ['flash_sale',   'Flash sale ending soon',      'Mogodu in Block L — under 1 hour left. R75 only.',        '⚡',1,'home'        ],
    ['verification', 'Verified Resident confirmed', 'Your badge is active — 3 community vouches in Block L.', '✅',1,'profile'     ],
  ].forEach(([type,title,body,icon,read,screen])=>
    insN.run(uuidv4(),users[0].id,type,title,body,icon,read,screen));

  console.log(`✅  Seeded: ${users.length} users · ${listings.length} listings · 5 zones · 4 runners\n`);
  process.exit(0);
}

seed().catch(err=>{ console.error('❌', err.message); process.exit(1); });
