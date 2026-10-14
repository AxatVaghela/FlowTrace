/**
 * routes/graph.js — GET /api/graph & GET /api/graph/samples
 *
 * Query parameters:
 *   address  {string}  Required (or scenario ID). The seed Ethereum address to trace.
 *   depth    {number}  Optional. BFS expansion depth (default 1, max 2).
 *   scenario {string}  Optional. Specific scenario ID ('mixer-peel-chain', 'wash-trading-loop', etc.)
 */

const express = require('express');
const router  = express.Router();
const { buildGraph }            = require('../graph/graphBuilder');
const { runAnomalyDetection }   = require('../anomaly/index');
const { getBalance, NETWORK }   = require('../ingestion/etherscanClient');
const { getSampleScenario, listSampleScenarios } = require('../graph/sampleScenarios');

// Basic Ethereum address validation (0x + 40 hex chars)
const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/**
 * GET /api/graph/samples — list available pre-configured sample datasets.
 */
router.get('/samples', (req, res) => {
  res.json({
    samples: listSampleScenarios(),
  });
});

/**
 * GET /api/graph — trace an address or load a sample scenario.
 */
router.get('/', async (req, res) => {
  const { address, depth: depthStr, scenario: scenarioId } = req.query;

  // 1. Check if direct scenario requested or address matches a scenario
  const directScenario = scenarioId ? getSampleScenario(scenarioId) : getSampleScenario(address);

  if (directScenario) {
    console.log(`[/api/graph] Serving sample scenario: ${directScenario.id}`);
    
    // Deep clone the scenario graph
    const rawGraph = {
      nodes: directScenario.nodes.map(n => ({ ...n, anomalies: [] })),
      edges: directScenario.edges.map(e => ({ ...e })),
    };

    const { graph: annotatedGraph, anomalies } = runAnomalyDetection(rawGraph);

    return res.json({
      nodes:     annotatedGraph.nodes,
      edges:     annotatedGraph.edges,
      anomalies,
      meta: {
        seedAddress:  directScenario.seedAddress.toLowerCase(),
        depth:        parseInt(depthStr || '1', 10),
        nodeCount:    annotatedGraph.nodes.length,
        edgeCount:    annotatedGraph.edges.length,
        anomalyCount: anomalies.length,
        network:      'scenario-dataset',
        dataSource:   'sample',
        scenarioId:   directScenario.id,
        scenarioTitle: directScenario.title,
        scenarioDescription: directScenario.description,
        entityName:   directScenario.entityName,
        fetchedAt:    new Date().toISOString(),
      },
    });
  }

  // ── Input validation for live address ──────────────────────────────────────
  if (!address) {
    return res.status(400).json({ error: 'Query parameter `address` or `scenario` is required.' });
  }

  const cleanAddr = address.trim().toLowerCase();
  if (!ETH_ADDRESS_RE.test(cleanAddr)) {
    return res.status(400).json({ error: 'Invalid Ethereum address format. Must be 0x followed by 40 hex characters.' });
  }

  const depth = Math.min(parseInt(depthStr || '1', 10), 2);

  console.log(`[/api/graph] Live trace: address=${cleanAddr} depth=${depth}`);

  try {
    // Build the transaction graph from Etherscan
    const graph = await buildGraph(cleanAddr, depth);

    // If no transactions found or rate-limited without key, fallback to sample scenario
    if (graph.nodes.length <= 1 && graph.edges.length === 0) {
      console.log(`[/api/graph] No live transactions retrieved for ${cleanAddr}. Falling back to default demo dataset.`);
      const fallbackScenario = getSampleScenario('mixer-peel-chain');
      
      const rawGraph = {
        nodes: fallbackScenario.nodes.map(n => ({
          ...n,
          id: n.role === 'seed' ? cleanAddr : n.id,
          label: n.role === 'seed' ? `${cleanAddr.slice(0, 6)}…${cleanAddr.slice(-4)}` : n.label,
          anomalies: [],
        })),
        edges: fallbackScenario.edges.map(e => ({
          ...e,
          source: e.source === fallbackScenario.seedAddress ? cleanAddr : e.source,
          target: e.target === fallbackScenario.seedAddress ? cleanAddr : e.target,
        })),
      };

      const { graph: annotatedGraph, anomalies } = runAnomalyDetection(rawGraph);

      return res.json({
        nodes:     annotatedGraph.nodes,
        edges:     annotatedGraph.edges,
        anomalies,
        meta: {
          seedAddress:  cleanAddr,
          depth,
          nodeCount:    annotatedGraph.nodes.length,
          edgeCount:    annotatedGraph.edges.length,
          anomalyCount: anomalies.length,
          network:      NETWORK,
          dataSource:   'simulated-fallback',
          note:         'No live on-chain history found or Etherscan key not configured. Loaded forensic demo trace for demonstration.',
          fetchedAt:    new Date().toISOString(),
        },
      });
    }

    // Enrich seed node with balance
    try {
      const seedNode = graph.nodes.find((n) => n.id === cleanAddr);
      if (seedNode) {
        seedNode.balance = await getBalance(cleanAddr);
      }
    } catch (_) {}

    // Run anomaly detection
    const { graph: annotatedGraph, anomalies } = runAnomalyDetection(graph);

    return res.json({
      nodes:     annotatedGraph.nodes,
      edges:     annotatedGraph.edges,
      anomalies,
      meta: {
        seedAddress:  cleanAddr,
        depth,
        nodeCount:    annotatedGraph.nodes.length,
        edgeCount:    annotatedGraph.edges.length,
        anomalyCount: anomalies.length,
        network:      NETWORK,
        dataSource:   'live',
        fetchedAt:    new Date().toISOString(),
      },
    });

  } catch (err) {
    console.error('[/api/graph] Live fetch error:', err.message);

    // Fallback to sample dataset instead of crashing
    const fallbackScenario = getSampleScenario('mixer-peel-chain');
    const rawGraph = {
      nodes: fallbackScenario.nodes.map(n => ({ ...n, anomalies: [] })),
      edges: fallbackScenario.edges.map(e => ({ ...e })),
    };
    const { graph: annotatedGraph, anomalies } = runAnomalyDetection(rawGraph);

    return res.json({
      nodes:     annotatedGraph.nodes,
      edges:     annotatedGraph.edges,
      anomalies,
      meta: {
        seedAddress:  fallbackScenario.seedAddress,
        depth:        1,
        nodeCount:    annotatedGraph.nodes.length,
        edgeCount:    annotatedGraph.edges.length,
        anomalyCount: anomalies.length,
        network:      NETWORK,
        dataSource:   'simulated-fallback',
        errorReason:  err.message,
        fetchedAt:    new Date().toISOString(),
      },
    });
  }
});

module.exports = router;
