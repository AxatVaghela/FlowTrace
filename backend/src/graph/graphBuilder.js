/**
 * graphBuilder.js — Builds a directed graph from Ethereum transaction data.
 *
 * Graph Model:
 *   - Node  = Ethereum address { id, label, totalIn, totalOut, txCount }
 *   - Edge  = Aggregated flow between two addresses
 *             { id, source, target, totalValueEth, txCount, txList }
 *
 * The builder supports N-hop BFS expansion:
 *   hop 0 = seed address only
 *   hop 1 = seed + direct neighbors (all counterparties)
 *   hop 2 = their neighbors too (can get large — capped at MAX_NODES)
 *
 * Design decision: we aggregate parallel edges (multiple txns between the
 * same pair) into a single weighted edge for readability.  Individual tx
 * details are kept in edge.txList so the side panel can show them.
 */

const { getTransactions, getInternalTransactions } = require('../ingestion/etherscanClient');

// ─── Config ──────────────────────────────────────────────────────────────────
const MAX_NODES        = 150;  // Cap to keep the graph renderable
const MAX_TXS_PER_ADDR = 100;  // Max txns to fetch per address per hop

// ─── Graph Builder ───────────────────────────────────────────────────────────

/**
 * Build a directed graph starting from `seedAddress`, expanding `depth` hops.
 *
 * @param {string} seedAddress  The starting Ethereum address
 * @param {number} [depth=1]    BFS depth (1 or 2 recommended)
 * @returns {Promise<{ nodes: Node[], edges: Edge[] }>}
 */
async function buildGraph(seedAddress, depth = 1) {
  seedAddress = seedAddress.toLowerCase();

  // adjacencyList: address → { in: Set<address>, out: Set<address> }
  const nodes = new Map();   // address → Node object
  const edges = new Map();   // `from:to` → Edge object

  // BFS queue: [address, currentDepth]
  const queue    = [[seedAddress, 0]];
  const visited  = new Set();

  while (queue.length > 0 && nodes.size < MAX_NODES) {
    const [address, currentDepth] = queue.shift();

    if (visited.has(address)) continue;
    visited.add(address);

    // Ensure node exists
    ensureNode(nodes, address, address === seedAddress ? 'seed' : 'normal');

    // Fetch transactions for this address
    const [externalTxs, internalTxs] = await Promise.all([
      getTransactions(address, MAX_TXS_PER_ADDR),
      currentDepth === 0 ? getInternalTransactions(address, 50) : Promise.resolve([]),
    ]);

    const allTxs = [...externalTxs, ...internalTxs];

    for (const tx of allTxs) {
      if (!tx.from || !tx.to) continue;
      if (tx.valueEth === 0) continue; // Skip zero-value txns (contract calls)

      const from = tx.from.toLowerCase();
      const to   = tx.to.toLowerCase();

      // Add/update nodes for both endpoints
      ensureNode(nodes, from);
      ensureNode(nodes, to);

      // Update node flow stats
      nodes.get(from).totalOut  += tx.valueEth;
      nodes.get(from).txCount   += 1;
      nodes.get(to).totalIn     += tx.valueEth;
      nodes.get(to).txCount     += 1;

      // Aggregate edges
      const edgeKey = `${from}→${to}`;
      if (!edges.has(edgeKey)) {
        edges.set(edgeKey, {
          id:            edgeKey,
          source:        from,
          target:        to,
          totalValueEth: 0,
          txCount:       0,
          txList:        [],
        });
      }
      const edge = edges.get(edgeKey);
      edge.totalValueEth += tx.valueEth;
      edge.txCount       += 1;
      edge.txList.push({
        hash:        tx.hash,
        valueEth:    tx.valueEth,
        timestamp:   tx.timestamp,
        blockNumber: tx.blockNumber,
        type:        tx.type,
      });

      // Queue neighbors for next hop
      if (currentDepth < depth) {
        const neighbor = (from === address) ? to : from;
        if (!visited.has(neighbor) && nodes.size < MAX_NODES) {
          queue.push([neighbor, currentDepth + 1]);
        }
      }
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
  };
}

/** Create a node if it doesn't already exist. */
function ensureNode(nodes, address, role = 'normal') {
  if (!nodes.has(address)) {
    nodes.set(address, {
      id:         address,
      label:      shortenAddress(address),
      role,         // 'seed' | 'normal' | 'flagged' (set by anomaly module)
      totalIn:    0,
      totalOut:   0,
      txCount:    0,
      anomalies:  [],
    });
  }
}

/** Shorten 0x-address to 0xAbCd…1234 format for display. */
function shortenAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

module.exports = { buildGraph };
