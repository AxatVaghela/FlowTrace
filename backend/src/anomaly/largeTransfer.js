/**
 * largeTransfer.js — Large-relative-transfer anomaly detector.
 *
 * WHAT IT DETECTS:
 *   A single transaction that is significantly larger than the historical
 *   sending baseline for that address.  A person who usually sends 0.01 ETH
 *   suddenly sending 10 ETH is unusual and worth flagging.
 *
 * HEURISTIC:
 *   1. For each address (as sender), compute the median outgoing edge value.
 *   2. Flag any edge whose value exceeds LARGE_TRANSFER_MULTIPLIER × median.
 *   3. Only apply when there are at least MIN_EDGES_FOR_BASELINE edges to
 *      form a reliable baseline (avoids false positives for new addresses).
 *
 * Why median and not mean?
 *   The median is robust to outliers — one previous large transfer won't skew
 *   the baseline and mask the current anomaly.
 *
 * Edge case: if all transactions from an address are of equal value (e.g. a
 * programmatic splitter), nothing is flagged — that's intentional.
 */

const LARGE_TRANSFER_MULTIPLIER  = 3;   // 3× median is suspicious
const MIN_EDGES_FOR_BASELINE     = 3;   // Need at least 3 outgoing edges for a baseline
const MIN_EDGE_VALUE_ETH         = 0.001; // Ignore dust transactions

/**
 * @param {object} graph  { nodes: Node[], edges: Edge[] }
 * @returns {AnomalyFlag[]}
 */
function detectLargeTransfers(graph) {
  const { edges } = graph;
  const flags = [];

  // Group edges by source address
  const edgesBySource = {};
  for (const edge of edges) {
    if (edge.totalValueEth < MIN_EDGE_VALUE_ETH) continue;
    if (!edgesBySource[edge.source]) edgesBySource[edge.source] = [];
    edgesBySource[edge.source].push(edge);
  }

  for (const [source, outEdges] of Object.entries(edgesBySource)) {
    if (outEdges.length < MIN_EDGES_FOR_BASELINE) continue;

    const values = outEdges.map((e) => e.totalValueEth).sort((a, b) => a - b);
    const median = computeMedian(values);

    if (median === 0) continue; // All zero-value — skip

    for (const edge of outEdges) {
      const ratio = edge.totalValueEth / median;

      if (ratio >= LARGE_TRANSFER_MULTIPLIER) {
        flags.push({
          type:     'large-transfer',
          severity: ratio >= 10 ? 'high' : 'medium',
          nodeId:   source,
          edgeId:   edge.id,
          reason:   `Transfer of ${edge.totalValueEth.toFixed(4)} ETH to ${edge.target} ` +
                    `is ${ratio.toFixed(1)}× the median outgoing transfer (${median.toFixed(4)} ETH) ` +
                    `for this address — unusually large relative to historical behavior.`,
          metadata: {
            edgeValue:       parseFloat(edge.totalValueEth.toFixed(6)),
            medianValue:     parseFloat(median.toFixed(6)),
            multiplier:      parseFloat(ratio.toFixed(2)),
            baselineEdgeCount: outEdges.length,
          },
        });
      }
    }
  }

  return flags;
}

/** Compute median of a pre-sorted numeric array. */
function computeMedian(sortedArr) {
  const n   = sortedArr.length;
  const mid = Math.floor(n / 2);
  return n % 2 !== 0
    ? sortedArr[mid]
    : (sortedArr[mid - 1] + sortedArr[mid]) / 2;
}

module.exports = { detectLargeTransfers };
