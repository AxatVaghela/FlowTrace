/**
 * useGraph.js — Custom hook for managing on-chain graph queries, scenario datasets, and exports.
 */

import { useState, useCallback } from 'react';

function transformGraph(data) {
  return {
    nodes: (data.nodes || []).map((n) => ({
      ...n,
      _flagged: n.role === 'flagged' || (n.anomalies && n.anomalies.length > 0),
      _isSeed:  n.role === 'seed',
      _risk:    n.riskScore || 0,
    })),
    links: (data.edges || []).map((e) => ({
      ...e,
      source:   e.source,
      target:   e.target,
      _value:   e.totalValueEth || 0,
      _flagged: e.flagged || (e.anomalies && e.anomalies.length > 0),
    })),
    anomalies: data.anomalies || [],
    meta:      data.meta || {},
  };
}

export function useGraph() {
  const [graphData,      setGraphData]      = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [lastAddress,    setLastAddress]    = useState('');
  const [activeScenario, setActiveScenario] = useState(null);

  /** Fetch graph for address or scenario */
  const fetchGraph = useCallback(async (addressOrScenario, depth = 1, isScenario = false) => {
    if (!addressOrScenario) return;

    setLoading(true);
    setError(null);
    setLastAddress(addressOrScenario);

    try {
      const url = isScenario
        ? `/api/graph?scenario=${encodeURIComponent(addressOrScenario)}&depth=${depth}`
        : `/api/graph?address=${encodeURIComponent(addressOrScenario)}&depth=${depth}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok && !data.nodes) {
        throw new Error(data.error || `Server returned status ${res.status}`);
      }

      setGraphData(transformGraph(data));
      if (data.meta?.scenarioId) {
        setActiveScenario(data.meta.scenarioId);
      } else {
        setActiveScenario(null);
      }
    } catch (err) {
      console.error('Fetch graph error:', err);
      setError(err.message || 'Error connecting to FlowTrace API backend.');
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Export graph intelligence report as JSON */
  const exportReport = useCallback(() => {
    if (!graphData) return;
    const report = {
      title: 'FlowTrace On-Chain Forensic Intelligence Report',
      exportedAt: new Date().toISOString(),
      meta: graphData.meta,
      anomalies: graphData.anomalies,
      entities: graphData.nodes.map((n) => ({
        address: n.id,
        entity: n.entity || 'Unknown',
        role: n.role,
        riskScore: n.riskScore,
        totalInEth: n.totalIn,
        totalOutEth: n.totalOut,
        flags: n.anomalies,
      })),
      flowEdges: graphData.links.map((l) => ({
        source: l.source?.id || l.source,
        target: l.target?.id || l.target,
        totalValueEth: l.totalValueEth,
        txCount: l.txCount,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowtrace_report_${graphData.meta?.seedAddress || 'dossier'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [graphData]);

  return {
    graphData,
    loading,
    error,
    lastAddress,
    activeScenario,
    fetchGraph,
    exportReport,
    reset: () => {
      setGraphData(null);
      setError(null);
      setActiveScenario(null);
    },
  };
}
