/**
 * anomaly/index.js — Orchestrates all anomaly detectors.
 *
 * This module runs each detector in sequence, merges the results, and
 * annotates the graph nodes/edges with their anomaly flags so the frontend
 * can visually distinguish them.
 *
 * Each detector is independent — if one throws (bug or edge case), the others
 * still run.  Errors are logged but don't crash the API.
 */

const { detectFanOut }         = require('./fanOut');
const { detectFanIn }          = require('./fanIn');
const { detectLoops }          = require('./loopDetection');
const { detectLargeTransfers } = require('./largeTransfer');

/**
 * Run all anomaly detectors against a graph and return:
 *   - The annotated graph (nodes/edges with .anomalies[] populated)
 *   - A flat list of all anomaly flags
 *
 * @param {{ nodes: Node[], edges: Edge[] }} graph
 * @returns {{ graph: object, anomalies: AnomalyFlag[] }}
 */
function runAnomalyDetection(graph) {
  const allFlags = [];

  const detectors = [
    { name: 'fan-out',        fn: detectFanOut },
    { name: 'fan-in',         fn: detectFanIn },
    { name: 'loop',           fn: detectLoops },
    { name: 'large-transfer', fn: detectLargeTransfers },
  ];

  for (const { name, fn } of detectors) {
    try {
      const flags = fn(graph);
      allFlags.push(...flags);
      console.log(`[anomaly/${name}] Found ${flags.length} flag(s).`);
    } catch (err) {
      console.error(`[anomaly/${name}] Detector threw an error:`, err.message);
    }
  }

  // ── Annotate nodes ──────────────────────────────────────────────────────────
  // Build a lookup for faster annotation
  const nodeMap = {};
  for (const node of graph.nodes) {
    nodeMap[node.id] = node;
  }
  const edgeMap = {};
  for (const edge of graph.edges) {
    edgeMap[edge.id] = edge;
  }

  for (const flag of allFlags) {
    // Annotate node
    if (flag.nodeId && nodeMap[flag.nodeId]) {
      const node = nodeMap[flag.nodeId];
      node.anomalies.push(flag);
      node.role = 'flagged'; // Override role for visual coloring
    }
    // Annotate edge (for large-transfer flags)
    if (flag.edgeId && edgeMap[flag.edgeId]) {
      const edge = edgeMap[flag.edgeId];
      if (!edge.anomalies) edge.anomalies = [];
      edge.anomalies.push(flag);
      edge.flagged = true;
    }
  }

  // Compute a simple risk score for each node (0–100)
  for (const node of graph.nodes) {
    node.riskScore = computeRiskScore(node.anomalies);
  }

  return {
    graph,
    anomalies: allFlags,
  };
}

/**
 * Simple additive risk score.  Designed to be explainable in a project viva:
 * - Each 'high' anomaly adds 40 points
 * - Each 'medium' anomaly adds 20 points
 * - Capped at 100
 */
function computeRiskScore(anomalies) {
  const score = anomalies.reduce((sum, flag) => {
    return sum + (flag.severity === 'high' ? 40 : 20);
  }, 0);
  return Math.min(score, 100);
}

module.exports = { runAnomalyDetection };
