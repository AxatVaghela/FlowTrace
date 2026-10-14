/**
 * App.jsx — FlowTrace v2.0 Main Cyber Forensic Workspace.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import SearchBar        from './components/SearchBar';
import PresetBar, { PRESET_SCENARIOS } from './components/PresetBar';
import GraphView        from './components/GraphView';
import SidePanel        from './components/SidePanel';
import HeroEmptyState   from './components/HeroEmptyState';
import { useGraph }     from './hooks/useGraph';

export default function App() {
  const {
    graphData,
    loading,
    error,
    lastAddress,
    activeScenario,
    fetchGraph,
    exportReport,
    reset,
  } = useGraph();

  const [selectedNode, setSelectedNode] = useState(null);
  const [graphDims,    setGraphDims]    = useState({ width: 0, height: 0 });
  const [minEthFilter, setMinEthFilter] = useState(0);
  const canvasAreaRef = useRef(null);

  // Re-measure canvas on window resize or panel toggle
  useEffect(() => {
    function measure() {
      if (canvasAreaRef.current) {
        const rect = canvasAreaRef.current.getBoundingClientRect();
        setGraphDims({ width: rect.width, height: rect.height });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selectedNode]);

  // Launch custom address trace
  const handleSearch = useCallback((address, depth) => {
    setSelectedNode(null);
    fetchGraph(address, depth, false);
  }, [fetchGraph]);

  // Launch pre-configured forensic scenario
  const handleSelectScenario = useCallback((scenario) => {
    setSelectedNode(null);
    fetchGraph(scenario.id, 1, true);
  }, [fetchGraph]);

  // Node click handler
  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const hasGraph = graphData && graphData.nodes && graphData.nodes.length > 0;

  // Calculate total flow volume in current graph
  const totalVolumeEth = (graphData?.links || []).reduce(
    (sum, l) => sum + (l.totalValueEth || l._value || 0),
    0
  );

  return (
    <div className="cyber-app">
      {/* ── Top Intelligence Header ───────────────────────────────── */}
      <header className="cyber-header">
        <a href="/" className="brand-section" onClick={(e) => { e.preventDefault(); reset(); }}>
          <div className="brand-logo">⟁</div>
          <div className="brand-info">
            <div className="brand-name">
              <span>FLOWTRACE</span>
              <span className="brand-tag">v2.0 PRO</span>
            </div>
            <div className="brand-subtitle">On-Chain Forensic Visualizer & Anomaly Engine</div>
          </div>
        </a>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} loading={loading} initialAddress={lastAddress} />

        {/* Header Actions */}
        <div className="header-actions">
          <div className="status-pill">
            <span className="pulse-dot" />
            <span>HEURISTICS ENGINE ONLINE</span>
          </div>

          {hasGraph && (
            <button
              type="button"
              className="cyber-btn-ghost"
              onClick={exportReport}
              title="Download Forensic Dossier as JSON"
            >
              <span>📥</span>
              <span>Export Report</span>
            </button>
          )}
        </div>
      </header>

      {/* ── Curated Forensic Case Studies Marquee ──────────────────── */}
      <PresetBar
        activeScenario={activeScenario}
        onSelectScenario={handleSelectScenario}
        loading={loading}
      />

      {/* ── Main Forensic Workspace ───────────────────────────────── */}
      <main className="workspace-grid">
        <div className="canvas-container" ref={canvasAreaRef}>

          {/* Loading Hologram Overlay */}
          {loading && (
            <div className="cyber-loader">
              <div className="hologram-ring" />
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--neon-cyan)' }}>
                EXECUTING ON-CHAIN GRAPH TRAVERSAL…
              </div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Analyzing multi-hop fund routes and anomaly vectors for: {lastAddress.slice(0, 10)}…
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && !loading && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid var(--neon-crimson)',
                borderRadius: 8,
                padding: '10px 20px',
                color: '#fca5a5',
                fontSize: 13,
                zIndex: 40,
                backdropFilter: 'blur(10px)',
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Empty / Welcome State */}
          {!hasGraph && !loading && (
            <HeroEmptyState onSelectScenario={handleSelectScenario} />
          )}

          {/* Render Active Force Graph */}
          {hasGraph && !loading && (
            <>
              <GraphView
                graphData={graphData}
                onNodeClick={handleNodeClick}
                width={graphDims.width}
                height={graphDims.height}
                minEthFilter={minEthFilter}
              />

              {/* Bottom Floating Stats Bar */}
              <div className="floating-stats-bar">
                <div className="stat-item">
                  <span className="stat-label">Target Entity:</span>
                  <span className="stat-val" style={{ color: 'var(--neon-cyan)' }}>
                    {graphData.meta?.entityName || graphData.meta?.seedAddress?.slice(0, 8) + '…'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Nodes:</span>
                  <span className="stat-val">{graphData.nodes.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Edges:</span>
                  <span className="stat-val">{graphData.links.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label" style={{ color: 'var(--neon-crimson)' }}>🚨 Anomalies:</span>
                  <span className="stat-val" style={{ color: 'var(--neon-crimson)' }}>
                    {graphData.anomalies.length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Volume:</span>
                  <span className="stat-val" style={{ color: '#34d399' }}>
                    {totalVolumeEth.toFixed(2)} ETH
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Data Mode:</span>
                  <span className="brand-tag">
                    {graphData.meta?.dataSource === 'sample' ? 'FORENSIC DEMO DATA' : 'LIVE ON-CHAIN'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right Sliding Intelligence Dossier ──────────────────── */}
        {selectedNode && (
          <SidePanel
            node={selectedNode}
            allEdges={graphData?.links || []}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </main>
    </div>
  );
}
