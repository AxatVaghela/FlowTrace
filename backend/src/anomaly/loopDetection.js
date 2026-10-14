/**
 * loopDetection.js — Round-trip / cycle anomaly detector.
 *
 * WHAT IT DETECTS:
 *   Funds that leave an address and return to it (directly or via 1–2
 *   intermediaries) within a short time window.  This is characteristic of
 *   wash-trading or circular flow designed to inflate on-chain activity metrics.
 *
 * HEURISTIC (DFS-based cycle finding):
 *   1. Build an adjacency list from the graph edges (with timestamps).
 *   2. From each node, do a DFS up to MAX_CYCLE_LENGTH hops.
 *   3. If we reach back to the starting node and the time span between the
 *      first and last transaction in the cycle is within CYCLE_WINDOW_SECONDS,
 *      record it as a loop anomaly.
 *   4. De-duplicate: if A→B→A is found, don't also report B→A→B.
 *
 * ASSUMPTION: This works on the graph snapshot we've already built — it only
 * finds loops involving nodes/edges already in the graph, not loops that would
 * require fetching additional hops.  This is a deliberate simplification to
 * stay within free-tier API limits.
 */

const MAX_CYCLE_LENGTH    = 4;       // Max hops in a cycle (A→B→C→A = 3 hops)
const CYCLE_WINDOW_SECONDS = 86400; // 24-hour window for the full cycle

/**
 * @param {object} graph  { nodes: Node[], edges: Edge[] }
 * @returns {AnomalyFlag[]}
 */
function detectLoops(graph) {
  const { edges } = graph;
  const flags  = [];
  const seenCycles = new Set(); // prevent duplicate reports

  // Build adjacency list: address → [{ to, txList }]
  const adj = {};
  for (const edge of edges) {
    if (!adj[edge.source]) adj[edge.source] = [];
    adj[edge.source].push({
      to:     edge.target,
      txList: edge.txList,
      edgeId: edge.id,
    });
  }

  // DFS from each node to find cycles back to start
  for (const startAddr of Object.keys(adj)) {
    dfs(startAddr, startAddr, [], 0, adj, flags, seenCycles);
  }

  return flags;
}

/**
 * Recursive DFS to find cycles.
 *
 * @param {string}   startAddr  The node we're trying to loop back to
 * @param {string}   current    Current node in traversal
 * @param {object[]} path       Current path [ { addr, tx } ]
 * @param {number}   depth      Current hop count
 * @param {object}   adj        Adjacency list
 * @param {object[]} flags      Output array
 * @param {Set}      seenCycles De-duplication set
 */
function dfs(startAddr, current, path, depth, adj, flags, seenCycles) {
  if (depth > MAX_CYCLE_LENGTH) return;

  const neighbors = adj[current] || [];

  for (const { to, txList, edgeId } of neighbors) {
    if (to === startAddr && depth >= 1) {
      // ✅ Found a cycle back to start
      const cyclePath = path.map((p) => p.addr).concat([startAddr]);

      // De-duplicate by normalizing the cycle signature
      const cycleKey = [...cyclePath].sort().join('|');
      if (seenCycles.has(cycleKey)) continue;
      seenCycles.add(cycleKey);

      // Check time span: first tx in path to last tx arriving back
      const allTxs = [
        ...path.flatMap((p) => p.txList),
        ...txList,
      ].sort((a, b) => a.timestamp - b.timestamp);

      if (allTxs.length === 0) continue;

      const timeSpan = allTxs[allTxs.length - 1].timestamp - allTxs[0].timestamp;
      if (timeSpan > CYCLE_WINDOW_SECONDS) continue; // Too slow — not suspicious

      const hopCount   = cyclePath.length - 1;
      const windowHrs  = Math.round(CYCLE_WINDOW_SECONDS / 3600);
      const timeSpanHrs = (timeSpan / 3600).toFixed(1);

      flags.push({
        type:     'loop',
        severity: hopCount <= 2 ? 'high' : 'medium',
        nodeId:   startAddr,
        edgeId:   null,
        reason:   `Funds returned to this address via a ${hopCount}-hop cycle ` +
                  `[${cyclePath.join(' → ')}] within ${timeSpanHrs} hours ` +
                  `(possible wash-trading or circular flow).`,
        metadata: {
          cyclePath,
          hopCount,
          timeSpanSeconds: timeSpan,
        },
      });
    } else if (to !== startAddr && depth < MAX_CYCLE_LENGTH) {
      // Avoid revisiting nodes already in the current path (prevents infinite loops
      // and ensures we only find simple cycles, not walks)
      const alreadyInPath = path.some((p) => p.addr === to);
      if (!alreadyInPath) {
        dfs(
          startAddr,
          to,
          [...path, { addr: current, txList }],
          depth + 1,
          adj,
          flags,
          seenCycles
        );
      }
    }
  }
}

module.exports = { detectLoops };
