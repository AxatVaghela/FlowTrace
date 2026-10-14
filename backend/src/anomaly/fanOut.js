/**
 * fanOut.js — Fan-out burst anomaly detector.
 *
 * WHAT IT DETECTS:
 *   An address that receives funds and then rapidly redistributes them to many
 *   different recipients within a short time window.  This pattern resembles
 *   "peel chain" or mixer behavior, where a single input is scattered across
 *   many outputs to obscure the origin of funds.
 *
 * HEURISTIC:
 *   1. Find addresses that have ≥ FAN_OUT_MIN_RECIPIENTS outgoing edges.
 *   2. Look at the timestamps of those outgoing transactions.
 *   3. If ≥ FAN_OUT_MIN_RECIPIENTS txns happened within FAN_OUT_WINDOW_SECONDS,
 *      flag the node.
 *   4. Additionally check if the forwarded value is ≥ FAN_OUT_VALUE_RATIO of
 *      total received (i.e., funds flowed through with little retention).
 *
 * SEVERITY: 'high' if both count and value ratio conditions are met, 'medium' otherwise.
 */

const FAN_OUT_MIN_RECIPIENTS  = 4;     // Minimum distinct outgoing recipients
const FAN_OUT_WINDOW_SECONDS  = 3600;  // 1-hour sliding window
const FAN_OUT_VALUE_RATIO     = 0.70;  // Forwarded ≥ 70% of received value

/**
 * @param {object} graph  { nodes: Node[], edges: Edge[] }
 * @returns {AnomalyFlag[]}
 */
function detectFanOut(graph) {
  const { nodes, edges } = graph;
  const flags = [];

  // Build per-node index: address → { outEdges[], totalIn }
  const nodeMap = {};
  for (const node of nodes) {
    nodeMap[node.id] = { node, outEdges: [], totalIn: node.totalIn };
  }
  for (const edge of edges) {
    if (nodeMap[edge.source]) {
      nodeMap[edge.source].outEdges.push(edge);
    }
  }

  for (const addr of Object.keys(nodeMap)) {
    const { node, outEdges, totalIn } = nodeMap[addr];

    // Need at least FAN_OUT_MIN_RECIPIENTS distinct outgoing edges
    if (outEdges.length < FAN_OUT_MIN_RECIPIENTS) continue;

    // Flatten all individual txns from outgoing edges, sorted by timestamp
    const outTxs = outEdges
      .flatMap((e) => e.txList.map((tx) => ({ ...tx, to: e.target })))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Sliding-window: find the largest cluster within the time window
    let maxCluster = 0;
    let bestWindowTxs = [];

    for (let i = 0; i < outTxs.length; i++) {
      const windowEnd = outTxs[i].timestamp + FAN_OUT_WINDOW_SECONDS;
      const windowTxs = outTxs.filter(
        (tx) => tx.timestamp >= outTxs[i].timestamp && tx.timestamp <= windowEnd
      );
      const distinctRecipients = new Set(windowTxs.map((tx) => tx.to)).size;
      if (distinctRecipients > maxCluster) {
        maxCluster = distinctRecipients;
        bestWindowTxs = windowTxs;
      }
    }

    if (maxCluster < FAN_OUT_MIN_RECIPIENTS) continue;

    // Value ratio check: total forwarded vs. total received
    const totalForwarded = outEdges.reduce((sum, e) => sum + e.totalValueEth, 0);
    const valueRatio     = totalIn > 0 ? totalForwarded / totalIn : 0;
    const highSeverity   = valueRatio >= FAN_OUT_VALUE_RATIO;

    const windowMinutes = Math.round(FAN_OUT_WINDOW_SECONDS / 60);
    const reason = [
      `Sent funds to ${maxCluster} distinct addresses within ${windowMinutes} minutes`,
      highSeverity
        ? `and forwarded ${Math.round(valueRatio * 100)}% of received ETH (possible mixer/peel-chain behavior).`
        : `(moderate forwarding — ${Math.round(valueRatio * 100)}% of received ETH forwarded).`,
    ].join(' ');

    flags.push({
      type:     'fan-out',
      severity: highSeverity ? 'high' : 'medium',
      nodeId:   addr,
      edgeId:   null,
      reason,
      metadata: {
        recipientCount: maxCluster,
        valueRatio: parseFloat(valueRatio.toFixed(4)),
        windowSeconds: FAN_OUT_WINDOW_SECONDS,
      },
    });
  }

  return flags;
}

module.exports = { detectFanOut };
