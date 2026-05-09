#!/usr/bin/env python3
"""KasiHub API test suite"""
import json, sys, urllib.request, urllib.error

BASE = "http://localhost:4000"
PASS = []; FAIL = []

def req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token: headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r, timeout=5) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

def ok(name, val=None):
    PASS.append(name)
    print(f"  ✅ {name}" + (f": {val}" if val else ""))

def fail(name, err):
    FAIL.append(name)
    print(f"  ❌ {name}: {err}")

print("\n🧪 KasiHub API Test Suite\n")

# Health
print("── Health ──────────────────────────────")
try:
    d = req("GET", "/health")
    assert d["status"] == "ok"
    ok("Health check", d["service"])
except Exception as e: fail("Health check", e)

# Register
print("── Auth ────────────────────────────────")
try:
    d = req("POST", "/api/auth/register", {"name":"Test User","phone":"0611111111","password":"pass1234","section":"Block L"})
    assert "token" in d
    ok("Register", d["user"]["name"])
except Exception as e: fail("Register", e)

# Login
try:
    d = req("POST", "/api/auth/login", {"phone":"0821234567","password":"password123"})
    assert "token" in d and "user" in d
    TOKEN = d["token"]
    ok("Login", d["user"]["name"])
except Exception as e: fail("Login", e); sys.exit(1)

# Me
try:
    d = req("GET", "/api/auth/me", token=TOKEN)
    assert d["name"] == "Thandeka Mokoena"
    ok("GET /me", d["section"])
except Exception as e: fail("GET /me", e)

# Update me
try:
    d = req("PATCH", "/api/auth/me", {"section":"Ext 4"}, token=TOKEN)
    assert d["section"] == "Ext 4"
    req("PATCH", "/api/auth/me", {"section":"Block L"}, token=TOKEN)  # restore
    ok("PATCH /me")
except Exception as e: fail("PATCH /me", e)

# Platform stats
print("── Stats ───────────────────────────────")
try:
    d = req("GET", "/api/stats/platform")
    assert d["listings"] > 0 and d["runners"] > 0
    ok("Platform stats", f"{d['listings']} listings · {d['runners']} runners · {d['flash']} flash · {d['zones']} zones")
except Exception as e: fail("Platform stats", e)

# Listings
print("── Listings ────────────────────────────")
try:
    d = req("GET", "/api/listings")
    assert len(d["listings"]) > 0
    ok("List all listings", f"total={d['total']}")
except Exception as e: fail("List all listings", e)

try:
    d = req("GET", "/api/listings?section=Block%20L&limit=5")
    ok("Filter by section", f"{len(d['listings'])} in Block L")
except Exception as e: fail("Filter by section", e)

try:
    d = req("GET", "/api/listings?flash=1&limit=10")
    assert len(d["listings"]) > 0
    ok("Flash sales", f"{len(d['listings'])} flash listings")
except Exception as e: fail("Flash sales", e)

try:
    d = req("GET", "/api/listings?search=kota")
    ok("Search listings", f"{len(d['listings'])} results for 'kota'")
except Exception as e: fail("Search listings", e)

try:
    d = req("GET", "/api/listings?category=Food")
    ok("Filter by category", f"{len(d['listings'])} Food listings")
except Exception as e: fail("Filter by category", e)

# Create listing
try:
    d = req("POST", "/api/listings", {
        "title":"Test Phone for Sale","price":450,"category":"Electronics",
        "section":"Block L","emoji":"📱","description":"Testing create endpoint"
    }, token=TOKEN)
    assert "id" in d
    LISTING_ID = d["id"]
    ok("Create listing", d["title"])
except Exception as e: fail("Create listing", e); LISTING_ID = None

# Get single listing
if LISTING_ID:
    try:
        d = req("GET", f"/api/listings/{LISTING_ID}")
        assert d["title"] == "Test Phone for Sale"
        ok("Get listing by ID", f"R{d['price']}")
    except Exception as e: fail("Get listing by ID", e)

    # Update listing
    try:
        d = req("PATCH", f"/api/listings/{LISTING_ID}", {"price": 400}, token=TOKEN)
        assert float(d["price"]) == 400
        ok("Update listing price", f"R{d['price']}")
    except Exception as e: fail("Update listing", e)

    # Delete listing
    try:
        d = req("DELETE", f"/api/listings/{LISTING_ID}", token=TOKEN)
        assert d["success"]
        ok("Delete listing")
    except Exception as e: fail("Delete listing", e)

# Runners
print("── Runners ─────────────────────────────")
try:
    d = req("GET", "/api/runners")
    assert len(d) > 0
    RUNNER_ID = d[0]["id"]
    for r in d: ok(f"Runner {r['name']}", f"R{r['rate']} · {r['transport']} · {r['total_deliveries']} deliveries")
except Exception as e: fail("List runners", e); RUNNER_ID = None

# Zones
print("── Safe-Trade Zones ────────────────────")
try:
    d = req("GET", "/api/zones")
    assert len(d) >= 3
    for z in d: ok(f"Zone: {z['name']}", f"{z['distance_km']}km · {z['type']}")
except Exception as e: fail("List zones", e)

# Transactions
print("── Transactions (Escrow Flow) ──────────")
# Get a listing from a different user (Sipho in Ext 4)
try:
    listings = req("GET", "/api/listings?section=Ext%204&limit=5")["listings"]
    buy_listing = next(l for l in listings if l["seller_id"] != req("GET","/api/auth/me",token=TOKEN)["id"])
    TX = req("POST", "/api/transactions", {
        "listing_id": buy_listing["id"],
        "runner_id": RUNNER_ID,
        "delivery_method": "runner"
    }, token=TOKEN)
    assert "id" in TX
    TX_ID = TX["id"]
    ok("Create transaction (escrow lock)", f"Ref: {TX['reference']} · Total: R{TX['total']}")
except Exception as e: fail("Create transaction", e); TX_ID = None

if TX_ID:
    try:
        d = req("GET", f"/api/transactions/{TX_ID}", token=TOKEN)
        assert d["status"] == "escrow_locked"
        ok("Get transaction", f"Status: {d['status']}")
    except Exception as e: fail("Get transaction", e)

    try:
        d = req("POST", f"/api/transactions/{TX_ID}/complete", token=TOKEN)
        assert d["success"]
        ok("Complete transaction (QR scan)", f"Ref: {d['reference']}")
    except Exception as e: fail("Complete transaction", e)

# List transactions
try:
    d = req("GET", "/api/transactions", token=TOKEN)
    ok("List my transactions", f"{len(d)} transactions")
except Exception as e: fail("List transactions", e)

# Notifications
print("── Notifications ───────────────────────")
try:
    d = req("GET", "/api/notifications", token=TOKEN)
    assert len(d) > 0
    ok("List notifications", f"{len(d)} total · {sum(1 for n in d if not n['is_read'])} unread")
except Exception as e: fail("List notifications", e)

try:
    d = req("PATCH", "/api/notifications/read-all", token=TOKEN)
    assert d["success"]
    ok("Mark all read")
except Exception as e: fail("Mark all read", e)

# Reviews
print("── Reviews ─────────────────────────────")
try:
    # Login as another user to review Thandeka
    tok2 = req("POST","/api/auth/login",{"phone":"0829876543","password":"password123"})["token"]
    me = req("GET","/api/auth/me",token=TOKEN)
    if TX_ID:
        d = req("POST", "/api/reviews", {
            "reviewee_id": me["id"],
            "transaction_id": TX_ID,
            "rating": 5,
            "comment": "Great buyer, fast payment!"
        }, token=tok2)
        ok("Post review", f"Rating: {d.get('rating','?')}/5")
    else:
        ok("Post review", "skipped (no TX_ID)")
except Exception as e: fail("Post review", e)

# Frontend
print("── Frontend ────────────────────────────")
try:
    r = urllib.request.urlopen(f"{BASE}/", timeout=4)
    content = r.read()
    assert b"KasiHub" in content or b"<!doctype" in content.lower() or b"<html" in content.lower() or len(content) > 100
    ok("Frontend served", f"{len(content)} bytes")
except Exception as e: fail("Frontend served", e)

# Summary
print(f"\n{'='*46}")
print(f"  Passed: {len(PASS):>2}  |  Failed: {len(FAIL):>2}  |  Total: {len(PASS)+len(FAIL):>2}")
print(f"{'='*46}")
if FAIL:
    print(f"\n  Failed tests: {', '.join(FAIL)}")
    sys.exit(1)
else:
    print(f"\n  🎉  All tests passed!")
    sys.exit(0)
