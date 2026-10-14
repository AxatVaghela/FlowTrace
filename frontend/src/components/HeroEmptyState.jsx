/**
 * HeroEmptyState.jsx — Extraordinary welcome screen with interactive case studies.
 */

import { PRESET_SCENARIOS } from './PresetBar';

export default function HeroEmptyState({ onSelectScenario }) {
  return (
    <div className="empty-hero-state">
      <div className="hero-radar">
        <span>⟁</span>
      </div>

      <h1 className="hero-title">On-Chain Money Flow Intelligence</h1>
      <p className="hero-desc">
        FlowTrace maps real Ethereum transaction flows, traces multi-hop fund movements, and runs graph heuristic algorithms to expose mixing, wash trading, and exploit drains.
      </p>

      {/* Forensic Case Studies Grid */}
      <div className="hero-scenarios-grid">
        {PRESET_SCENARIOS.slice(0, 4).map((scenario) => (
          <div
            key={scenario.id}
            className="scenario-card"
            style={{ '--card-accent': scenario.color }}
            onClick={() => onSelectScenario(scenario)}
          >
            <div className="scenario-badge" style={{ color: scenario.color }}>
              {scenario.tag}
            </div>
            <div className="scenario-name">{scenario.label}</div>
            <div className="scenario-summary">{scenario.desc}</div>
            <div className="scenario-footer">
              <span className="mono" style={{ fontSize: 10 }}>
                {scenario.address.slice(0, 8)}…{scenario.address.slice(-6)}
              </span>
              <span>Launch Trace ↗</span>
            </div>
          </div>
        ))}
      </div>

      {/* Anomaly Heuristic Framework Explainer */}
      <div style={{ width: '100%', marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
          Autonomous Heuristics Engine
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--anom-fanout)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>⚡</span> Fan-Out Burst
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Detects rapid 1-hour distribution to ≥4 recipient wallets forwarding ≥70% of inbound capital (mixer / peel-chain pattern).
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--anom-fanin)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>📥</span> Fan-In Convergence
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Identifies collection wallets where ≥4 independent entities funnel capital simultaneously into a single hub.
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--anom-loop)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🔄</span> Circular Wash Loop
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              DFS-based cycle detection uncovering funds returning to their origin via 1–4 hops within 24 hours (volume inflation).
            </div>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--anom-large)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🐋</span> Outlier Transfer
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Calculates robust median baseline per wallet to catch sudden outlier outflows exceeding 3× historical baseline.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
