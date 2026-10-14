/**
 * server.js — FlowTrace Express server entry point.
 *
 * Routes:
 *   GET /               → health check
 *   GET /api/graph      → build + analyze graph for an address
 *   GET /api/tx/:hash   → fetch single transaction detail
 */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');

const graphRoute = require('./routes/graph');
const txRoute    = require('./routes/tx');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // CRA / fallback
    'http://localhost:4173', // Vite preview
  ],
  methods: ['GET'],
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status:  'ok',
    service: 'FlowTrace Backend',
    version: '1.0.0',
    network: process.env.NETWORK || 'mainnet',
    endpoints: [
      'GET /api/graph?address=0x...&depth=1',
      'GET /api/tx/:hash',
    ],
  });
});

app.use('/api/graph', graphRoute);
app.use('/api/tx',    txRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ FlowTrace backend running on http://localhost:${PORT}`);
  console.log(`   Network: ${process.env.NETWORK || 'mainnet'}`);
  console.log(`   Etherscan key: ${process.env.ETHERSCAN_API_KEY ? '✓ set' : '⚠ not set (rate-limited)'}`);
});