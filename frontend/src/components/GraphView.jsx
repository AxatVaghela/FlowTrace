/**
 * GraphView.jsx — Cyber forensic graph canvas with particle physics and floating controls HUD.
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

// Semantic Color Config
const COLOR_SEED    = '#f59e0b';
const COLOR_FLAGGED = '#ef4444';
const COLOR_NORMAL  = '#00f2fe';

function getNodeColor(node) {
  if (node._isSeed || node.role === 'seed') return COLOR_SEED;
  if (node._flagged || node.role === 'flagged') return COLOR_FLAGGED;
  return COLOR_NORMAL;
}

function getNodeRadius(node) {
  const volume = (node.totalIn || 0) + (node.totalOut || 0);
  if (node._isSeed) return Math.min(8 + Math.log1p(volume) * 2.5, 20);
  return Math.min(5 + Math.log1p(volume) * 2.0, 16);
}

function getLinkWidth(link) {
  const val = link.totalValueEth || link._value || 0;
  return Math.min(1.0 + Math.log1p(val) * 1.5, 6);
}

function getLinkColor(link) {
  if (link._flagged || link.flagged) return 'rgba(239, 68, 68, 0.85)';
  return 'rgba(0, 242, 254, 0.4)';
}

export default function GraphView({ graphData, onNodeClick, width, height, minEthFilter = 0 }) {
  const fgRef = useRef();
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, node: null });
  const [showLabels, setShowLabels] = useState(true);
  const [isPhysicsPaused, setIsPhysicsPaused] = useState(false);

  // Filter links and nodes by minimum ETH volume
  const filteredData = {
    nodes: graphData?.nodes || [],
    links: (graphData?.links || []).filter(
      (link) => (link.totalValueEth || link._value || 0) >= minEthFilter
    ),
  };

  // Center view on graph update
  useEffect(() => {
    if (fgRef.current && graphData?.nodes?.length > 0) {
      setTimeout(() => {
        try {
          fgRef.current.zoomToFit(400, 60);
        } catch (_) {}
      }, 500);
    }
  }, [graphData]);

  const handleNodeHover = useCallback((node) => {
    setHovered(node || null);
  }, []);

  const handleMouseMove = useCallback((e) => {
    setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
  }, []);

  // Custom Node Canvas Drawing with Radar Pulsing and Glowing Halos
  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      const radius    = getNodeRadius(node);
      const color     = getNodeColor(node);
      const isHovered = hovered && hovered.id === node.id;
      const isFlagged = node._flagged || node.role === 'flagged';
      const isSeed    = node._isSeed || node.role === 'seed';

      // Outer Glowing Ring / Radar
      ctx.save();
      if (isFlagged || isHovered || isSeed) {
        ctx.shadowBlur  = isHovered ? 25 : 18;
        ctx.shadowColor = color;
      }

      // Main Node Body
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Seed Node Accent Ring
      if (isSeed) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 2.0 / globalScale;
        ctx.stroke();
      }

      // Flagged Danger Pulse Wave
      if (isFlagged) {
        const pulse = 0.4 + 0.3 * Math.sin(Date.now() / 300);
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.lineWidth   = 2.0 / globalScale;
        ctx.stroke();
      }

      ctx.restore();

      // Node Label
      if (showLabels && (globalScale > 0.8 || isHovered || isSeed || isFlagged)) {
        const label = node.entity || node.label || `${node.id.slice(0, 6)}…${node.id.slice(-4)}`;
        const fontSize = Math.max(3.5, 11 / globalScale);
        ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", monospace`;
        ctx.fillStyle = isFlagged ? '#fca5a5' : isSeed ? '#fde68a' : '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(label, node.x, node.y + radius + fontSize + 2);
      }
    },
    [hovered, showLabels]
  );

  // Zoom Controls
  const handleZoomIn = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() * 1.3, 300);
  };

  const handleZoomOut = () => {
    if (fgRef.current) fgRef.current.zoom(fgRef.current.zoom() / 1.3, 300);
  };

  const handleFit = () => {
    if (fgRef.current) fgRef.current.zoomToFit(400, 60);
  };

  const togglePhysics = () => {
    if (fgRef.current) {
      if (isPhysicsPaused) {
        fgRef.current.resumeAnimation();
      } else {
        fgRef.current.pauseAnimation();
      }
      setIsPhysicsPaused(!isPhysicsPaused);
    }
  };

  if (!graphData) return null;

  return (
    <div style={{ width, height, position: 'relative' }} onMouseMove={handleMouseMove}>
      <ForceGraph2D
        ref={fgRef}
        width={width}
        height={height}
        graphData={filteredData}
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => 'replace'}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, getNodeRadius(node) + 4, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkWidth={getLinkWidth}
        linkColor={getLinkColor}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={0.9}
        linkDirectionalArrowColor={getLinkColor}
        linkDirectionalParticles={(link) => (link._flagged || link.flagged ? 4 : 2)}
        linkDirectionalParticleWidth={(link) => (link._flagged || link.flagged ? 3 : 1.8)}
        linkDirectionalParticleSpeed={(link) => 0.006 + Math.min((link.totalValueEth || 0) * 0.0005, 0.02)}
        linkDirectionalParticleColor={(link) =>
          link._flagged || link.flagged ? 'rgba(239, 68, 68, 0.95)' : 'rgba(0, 242, 254, 0.9)'
        }
        onNodeHover={handleNodeHover}
        onNodeClick={(node) => onNodeClick && onNodeClick(node)}
        nodeLabel=""
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.25}
        warmupTicks={80}
        cooldownTicks={150}
        backgroundColor="transparent"
      />

      {/* Floating Canvas Controls HUD */}
      <div className="floating-hud">
        <div className="hud-section-title">Canvas Physics & View</div>
        <div className="hud-btn-group">
          <button className="hud-btn" onClick={handleZoomIn} title="Zoom in">🔍 +</button>
          <button className="hud-btn" onClick={handleZoomOut} title="Zoom out">🔍 −</button>
          <button className="hud-btn" onClick={handleFit} title="Fit graph in view">⛶ Fit</button>
        </div>
        <div className="hud-btn-group">
          <button
            className={`hud-btn ${isPhysicsPaused ? 'active' : ''}`}
            onClick={togglePhysics}
            title="Pause/Resume Force Layout Physics"
          >
            {isPhysicsPaused ? '▶ Resume' : '⏸ Freeze'}
          </button>
          <button
            className={`hud-btn ${showLabels ? 'active' : ''}`}
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle Node Name Labels"
          >
            🏷 Labels
          </button>
        </div>
      </div>

      {/* Floating Legend */}
      <div className="floating-legend">
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Forensic Legend
        </div>
        <div className="legend-row">
          <span className="legend-pill" style={{ background: COLOR_SEED, boxShadow: `0 0 8px ${COLOR_SEED}` }} />
          <span>Seed Target Entity</span>
        </div>
        <div className="legend-row">
          <span className="legend-pill" style={{ background: COLOR_FLAGGED, boxShadow: `0 0 8px ${COLOR_FLAGGED}` }} />
          <span>Flagged / Anomaly Node</span>
        </div>
        <div className="legend-row">
          <span className="legend-pill" style={{ background: COLOR_NORMAL, boxShadow: `0 0 8px ${COLOR_NORMAL}` }} />
          <span>Normal Counterparty</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 6, marginTop: 2 }}>
          ⚡ Particle speed = Flow velocity<br />
          🔴 Red links = High-risk transfers
        </div>
      </div>

      {/* Interactive Cyber Tooltip */}
      {hovered && (
        <div
          className="cyber-tooltip"
          style={{
            left: Math.min(tooltip.x + 16, window.innerWidth - 340),
            top: Math.min(tooltip.y - 10, window.innerHeight - 150),
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 12, color: getNodeColor(hovered) }}>
              {hovered.entity || (hovered._isSeed ? 'Seed Entity' : hovered._flagged ? 'Flagged Entity' : 'Wallet Node')}
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Risk: {hovered.riskScore ?? 0}/100
            </span>
          </div>

          <div className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0', wordBreak: 'break-all' }}>
            {hovered.id}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6, fontSize: 11 }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Inflow: </span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{(hovered.totalIn || 0).toFixed(2)} ETH</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Outflow: </span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>{(hovered.totalOut || 0).toFixed(2)} ETH</span>
            </div>
          </div>

          {hovered.anomalies && hovered.anomalies.length > 0 && (
            <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
              {hovered.anomalies.map((a, i) => (
                <div key={i} style={{ fontSize: 10, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>⚠</span>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{a.type}:</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
