# FlowTrace 🔗

**On-Chain Money Flow Visualizer & Anomaly Detector**

FlowTrace fetches Ethereum transaction data for any address, builds an interactive directed graph showing fund flows, and automatically flags suspicious patterns like mixing bursts, collection wallets, circular flows, and unusually large transfers.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A free [Etherscan API key](https://etherscan.io/apis) *(optional but recommended)*

### 1. Backend

```bash
cd backend

# Copy env template and add your Etherscan key
cp .env.example .env
# Edit .env: set ETHERSCAN_API_KEY=your_key_here

# Install dependencies (already done if you cloned fresh)
npm install

# Start development server (with hot-reload)
npm run dev
# → http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173**, paste an Ethereum address, and click **Trace**.

---

## Project Structure

```
FlowTrace/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express entry point
│   │   ├── ingestion/
│   │   │   ├── etherscanClient.js # Etherscan API wrapper + normalizer
│   │   │   └── cache.js           # In-memory + JSON-file cache (5-min TTL)
│   │   ├── graph/
│   │   │   └── graphBuilder.js    # BFS graph expansion (adjacency list)
│   │   ├── anomaly/
│   │   │   ├── fanOut.js          # Fan-out burst detector
│   │   │   ├── fanIn.js           # Fan-in convergence detector
│   │   │   ├── loopDetection.js   # Round-trip / cycle detector
│   │   │   ├── largeTransfer.js   # Large-relative-transfer detector
│   │   │   └── index.js           # Orchestrator + risk scoring
│   │   └── routes/
│   │       ├── graph.js           # GET /api/graph
│   │       └── tx.js              # GET /api/tx/:hash
│   └── .env.example
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── GraphView.jsx      # react-force-graph-2d canvas
        │   ├── SearchBar.jsx      # Address input + examples
        │   ├── SidePanel.jsx      # Node detail panel
        │   ├── AnomalyBadge.jsx   # Individual anomaly flag card
        │   └── LoadingOverlay.jsx
        └── hooks/
            └── useGraph.js        # API fetch + state management
```

---

## API Reference

### `GET /api/graph?address=0x...&depth=1`

Returns the transaction graph and anomaly flags for a given address.

**Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `address` | string | required | Ethereum address (`0x...`) |
| `depth` | number | `1` | BFS expansion hops (max `2`) |

**Response:**
```json
{
  "nodes": [
    {
      "id": "0xabc...",
      "label": "0xabc…1234",
      "role": "flagged",
      "totalIn": 1.5,
      "totalOut": 1.48,
      "txCount": 12,
      "riskScore": 60,
      "anomalies": [...]
    }
  ],
  "edges": [
    {
      "id": "0xabc→0xdef",
      "source": "0xabc...",
      "target": "0xdef...",
      "totalValueEth": 0.5,
      "txCount": 3,
      "txList": [...]
    }
  ],
  "anomalies": [...],
  "meta": {
    "seedAddress": "0xabc...",
    "depth": 1,
    "nodeCount": 23,
    "edgeCount": 31,
    "anomalyCount": 4,
    "network": "mainnet",
    "fetchedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### `GET /api/tx/:hash`

Returns detail for a single transaction. Used for drill-down in the side panel.

---

## Anomaly Detectors

Each detector is independently implemented in `backend/src/anomaly/` and outputs a structured flag with a human-readable reason:

| Detector | File | What it catches |
|---|---|---|
| **Fan-Out Burst** | `fanOut.js` | Address receives then distributes to ≥4 addresses within 1 hour — mixer/peel-chain pattern |
| **Fan-In Convergence** | `fanIn.js` | ≥4 addresses send to one address within 1 hour — collection wallet |
| **Circular Flow** | `loopDetection.js` | DFS finds cycles ≤4 hops where funds return within 24h — wash-trading |
| **Large Transfer** | `largeTransfer.js` | Single edge ≥3× the median outgoing transfer — sudden anomalous outflow |

Risk score = sum of flag severities (high=40, medium=20), capped at 100.

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `ETHERSCAN_API_KEY` | *(none)* | Free key from [etherscan.io/apis](https://etherscan.io/apis). Without it: 1 req/5s rate limit |
| `NETWORK` | `mainnet` | `mainnet` or `sepolia`. Mainnet has far richer data for demos. |
| `PORT` | `5000` | Backend server port |

---

## Notes & Limitations

- **Free-tier rate limits**: Etherscan free tier = 5 req/s. The cache and retry logic handle this, but very large graphs (depth=2 from an exchange address) may be slow.
- **Graph is capped at 150 nodes**: Beyond that, the visualization becomes unreadable and API calls exceed rate limits.
- **Mainnet recommended**: Sepolia testnet has sparse activity. The "interesting" patterns only appear in real mainnet data.
- **Anomaly detection is heuristic-based**: False positives are expected. Exchange deposit addresses will trigger fan-in flags — that's by design (they do have that pattern; context determines if it's suspicious).
- **No funds are ever sent**: FlowTrace is entirely read-only. No wallet connection required.

---

## Tech Stack

- **Backend**: Node.js + Express + Etherscan API (axios) + in-memory/JSON cache
- **Frontend**: React (Vite) + react-force-graph-2d + vanilla CSS
- **Data**: Etherscan API (free tier) — mainnet or Sepolia testnet
