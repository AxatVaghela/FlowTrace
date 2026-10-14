/**
 * cache.js — Simple in-memory + file-backed cache for API responses.
 *
 * Why: Free-tier Etherscan is rate-limited to ~5 req/s.  During development
 * we don't want to re-fetch the same address on every code change.  This
 * module stores results in a JS Map (fast) and also writes them to a local
 * JSON file so the cache survives server restarts.
 *
 * TTL: 5 minutes by default.  We don't need fresher data than that for a
 * block-explorer-style read-only tool.
 */

const fs   = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const CACHE_DIR  = path.join(__dirname, '..', '..', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'tx-cache.json');
const TTL_MS     = 5 * 60 * 1000; // 5 minutes

// ─── In-memory store ─────────────────────────────────────────────────────────
// Structure: { [key]: { value: any, expiresAt: number } }
let memoryStore = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Ensure the cache directory exists. */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/** Load persisted cache from disk into memoryStore (called once on startup). */
function loadFromDisk() {
  try {
    ensureCacheDir();
    if (fs.existsSync(CACHE_FILE)) {
      const raw  = fs.readFileSync(CACHE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      const now  = Date.now();
      // Only keep entries that haven't expired yet
      for (const [key, entry] of Object.entries(data)) {
        if (entry.expiresAt > now) {
          memoryStore[key] = entry;
        }
      }
      console.log(`[cache] Loaded ${Object.keys(memoryStore).length} valid entries from disk.`);
    }
  } catch (err) {
    console.warn('[cache] Could not load cache file (starting fresh):', err.message);
    memoryStore = {};
  }
}

/** Persist current memoryStore to disk (best-effort, non-blocking). */
function saveToDisk() {
  try {
    ensureCacheDir();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(memoryStore, null, 2));
  } catch (err) {
    console.warn('[cache] Could not save cache to disk:', err.message);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Retrieve a cached value.
 * @param {string} key
 * @returns {any|null} The cached value, or null if missing / expired.
 */
function get(key) {
  const entry = memoryStore[key];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete memoryStore[key]; // Evict expired entry
    return null;
  }
  return entry.value;
}

/**
 * Store a value in the cache.
 * @param {string} key
 * @param {any}    value
 * @param {number} [ttlMs]  Override the default TTL in milliseconds.
 */
function set(key, value, ttlMs = TTL_MS) {
  memoryStore[key] = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  // Debounce disk writes — save at most once per second
  if (!set._timer) {
    set._timer = setTimeout(() => {
      saveToDisk();
      set._timer = null;
    }, 1000);
  }
}

/**
 * Invalidate a specific cache entry.
 * @param {string} key
 */
function del(key) {
  delete memoryStore[key];
}

/** Clear the entire cache (useful during development). */
function flush() {
  memoryStore = {};
  saveToDisk();
}

// Load disk cache on module import
loadFromDisk();

module.exports = { get, set, del, flush };
