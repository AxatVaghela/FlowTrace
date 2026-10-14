/**
 * fanIn.js — Fan-in convergence anomaly detector.
 *
 * WHAT IT DETECTS:
 *   An address that receives ETH from many different senders in a short time
 *   window.  This can indicate a collection wallet (aggregating funds before
 *   moving them elsewhere) or a laundry "sink" address.
 *
 * HEURISTIC:
 *   1. Find addresses with ≥ FAN_IN_MIN_SENDERS distinct incoming senders.
 *   2. Check if those senders all transacted within FAN_IN_WINDOW_SECONDS.
 *   3. If yes, flag the node.
 *
 * NOTE: Large exchange deposit addresses legitimately receive from many senders —
 * this detector is most meaningful combined with other flags (e.g. if the same
 * address is also a fan-out node, that's much more suspicious).
 */

const FAN_IN_MIN_SENDERS    = 4;     // Minimum distinct incoming senders
const FAN_IN_WINDOW_SECONDS = 3600;  // 1-hour window

/**
 * @param {object} graph  { nodes: Node[], edges: Edge[] }
 * @returns {AnomalyFlag[]}
 */
function detectFanIn(graph) {
  const { nodes, edges } = graph;
  const flags = [];

  // Build per-node index: address → { inEdges[] }
  const nodeInEdges = {};
  for (const node of nodes) {
    nodeInEdges[node.id] = [];
  }
  for (const edge of edges) {
    if (nodeInEdges[edge.target] !== undefined) {
      nodeInEdges[edge.target].push(edge);
    }
  }

  for (const addr of Object.keys(nodeInEdges)) {
    const inEdges = nodeInEdges[addr];

    if (inEdges.length < FAN_IN_MIN_SENDERS) continue;

    // Flatten individual incoming txns, sorted by timestamp
    const inTxs = inEdges
      .flatMap((e) => e.txList.map((tx) => ({ ...tx, from: e.source })))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Sliding-window: find the densest cluster of distinct senders
    let maxSenderCount = 0;
    let bestSenders    = [];

    for (let i = 0; i < inTxs.length; i++) {
      const windowEnd = inTxs[i].timestamp + FAN_IN_WINDOW_SECONDS;
      const windowTxs = inTxs.filter(
        (tx) => tx.timestamp >= inTxs[i].timestamp && tx.timestamp <= windowEnd
      );
      const distinctSenders = [...new Set(windowTxs.map((tx) => tx.from))];
      if (distinctSenders.length > maxSenderCount) {
        maxSenderCount = distinctSenders.length;
        bestSenders    = distinctSenders;
      }
    }

    if (maxSenderCount < FAN_IN_MIN_SENDERS) continue;

    const windowMinutes = Math.round(FAN_IN_WINDOW_SECONDS / 60);
    const totalReceived = inEdges.reduce((sum, e) => sum + e.totalValueEth, 0);

    flags.push({
      type:     'fan-in',
      severity: maxSenderCount >= 8 ? 'high' : 'medium',
      nodeId:   addr,
      edgeId:   null,
      reason:   `Received funds from ${maxSenderCount} distinct addresses within ${windowMinutes} minutes ` +
                `(total ${totalReceived.toFixed(4)} ETH received — possible collection wallet).`,
      metadata: {
        senderCount:   maxSenderCount,
        totalReceived: parseFloat(totalReceived.toFixed(6)),
        windowSeconds: FAN_IN_WINDOW_SECONDS,
      },
    });
  }

  return flags;
}

module.exports = { detectFanIn };
