/**
 * SidePanel.jsx — Intelligence Dossier with Risk Gauge, Multi-Tab Analytics, Ledger & Viva Notes.
 */

import { useState } from 'react';

function getRiskCategory(score) {
  if (score >= 60) return { label: 'CRITICAL RISK', class: 'high', desc: 'Active malicious / mixing behavior detected' };
  if (score >= 30) return { label: 'ELEVATED SUSPICION', class: 'medium', desc: 'Moderate anomalous flow patterns detected' };
  return { label: 'LOW RISK', class: 'low', desc: 'Standard counterparty behavior' };
}

export default function SidePanel({ node, allEdges = [], onClose }) {
  const [activeTab, setActiveTab] = useState('anomalies');

  if (!node) return null;

  const riskScore = node.riskScore ?? 0;
  const riskInfo = getRiskCategory(riskScore);
  const anomalies = node.anomalies || [];

  // Extract all incoming and outgoing transactions connected to this node
  const relatedEdges = allEdges.filter(
    (e) => e.source === node.id || e.target === node.id || e.source?.id === node.id || e.target?.id === node.id
  );

  const transactions = relatedEdges.flatMap((e) => {
    const isOut = (e.source === node.id || e.source?.id === node.id);
    const counterparty = isOut ? (e.target?.id || e.target) : (e.source?.id || e.source);
    return (e.txList || []).map((tx) => ({
      ...tx,
      direction: isOut ? 'OUTGOING' : 'INCOMING',
      counterparty,
    }));
  });

  const netFlow = (node.totalIn || 0) - (node.totalOut || 0);

  return (
    <div className="intelligence-panel">
      {/* Header */}
      <div className="dossier-header">
        <div className="dossier-title">
          <span style={{ color: 'var(--neon-cyan)' }}>🔍</span>
          <span>Entity Dossier</span>
        </div>
        <button className="panel-close-btn" onClick={onClose} title="Close Panel">
          ✕
        </button>
      </div>

      {/* Target Address Banner */}
      <div style={{ padding: '14px 20px', background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--neon-cyan)' }}>
            {node.entity || (node.role === 'seed' ? 'Seed Target Wallet' : 'Counterparty Entity')}
          </span>
          <span className="brand-tag">
            {node.role === 'seed' ? 'SEED NODE' : node.role === 'flagged' ? 'FLAGGED' : 'NORMAL'}
          </span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
          {node.id}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={() => navigator.clipboard.writeText(node.id)}
            className="cyber-btn-ghost"
            style={{ height: 26, fontSize: 10, padding: '0 8px' }}
          >
            📋 Copy
          </button>
          <a
            href={`https://etherscan.io/address/${node.id}`}
            target="_blank"
            rel="noreferrer"
            className="cyber-btn-ghost"
            style={{ height: 26, fontSize: 10, padding: '0 8px', textDecoration: 'none' }}
          >
            Etherscan ↗
          </a>
        </div>
      </div>

      {/* Radial Risk Meter Card */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="risk-meter-card">
          <div className={`radial-score ${riskInfo.class}`}>
            <span>{riskScore}</span>
          </div>
          <div className="risk-meta">
            <span className="risk-label-tag">Risk Assessment Engine</span>
            <span className="risk-verdict">{riskInfo.label}</span>
            <span className="risk-subtext">{riskInfo.desc}</span>
          </div>
        </div>
      </div>

      {/* Dossier Navigation Tabs */}
      <div className="dossier-tabs">
        <button
          className={`dossier-tab ${activeTab === 'anomalies' ? 'active' : ''}`}
          onClick={() => setActiveTab('anomalies')}
        >
          🚨 Flags ({anomalies.length})
        </button>
        <button
          className={`dossier-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`dossier-tab ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          📜 Ledger ({transactions.length})
        </button>
        <button
          className={`dossier-tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          🧠 Viva Notes
        </button>
      </div>

      {/* Tab Contents */}
      <div className="dossier-content">
        {/* TAB 1: ANOMALIES */}
        {activeTab === 'anomalies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {anomalies.length === 0 ? (
              <div style={{ padding: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, color: 'var(--neon-emerald)', fontSize: 12 }}>
                ✓ Clean Profile: No suspicious heuristics triggered for this address in the current graph snapshot.
              </div>
            ) : (
              anomalies.map((anom, idx) => (
                <div key={idx} className={`dossier-anomaly-card ${anom.type}`}>
                  <div className="anomaly-card-top">
                    <span className="anomaly-type-title" style={{ color: `var(--anom-${anom.type.replace('-', '')})` }}>
                      {anom.type.toUpperCase()}
                    </span>
                    <span className={`sev-badge ${anom.severity}`}>
                      {anom.severity} SEVERITY
                    </span>
                  </div>
                  <div className="anomaly-reason-body">{anom.reason}</div>
                  <div className="viva-note">
                    <span style={{ fontWeight: 700 }}>Forensic Rationale: </span>
                    {anom.type === 'fan-out' && 'Matches peel-chain / mixer scattering to obscure origin.'}
                    {anom.type === 'fan-in' && 'Matches collector wallet pooling funds from multiple independent senders.'}
                    {anom.type === 'loop' && 'Indicates circular flow / wash trading inflating metrics.'}
                    {anom.type === 'large-transfer' && 'Outlier transfer deviating significantly from median baseline.'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
                <span className="stat-label">Total Inflow</span>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                  {(node.totalIn || 0).toFixed(4)} ETH
                </div>
              </div>
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
                <span className="stat-label">Total Outflow</span>
                <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#f87171', marginTop: 4 }}>
                  {(node.totalOut || 0).toFixed(4)} ETH
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Net Flow Balance Delta:</span>
                <span className="mono" style={{ fontWeight: 700, color: netFlow >= 0 ? '#34d399' : '#f87171' }}>
                  {netFlow >= 0 ? '+' : ''}{netFlow.toFixed(4)} ETH
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Wallet Balance:</span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--neon-cyan)' }}>
                  {node.balance !== undefined ? `${node.balance.toFixed(4)} ETH` : '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Counterparties Count:</span>
                <span className="mono" style={{ fontWeight: 700, color: '#fff' }}>
                  {relatedEdges.length} entities
                </span>
              </div>
            </div>

            {/* Inflow vs Outflow Ratio Bar */}
            <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14 }}>
              <span className="stat-label">Inflow vs Outflow Proportion</span>
              <div style={{ height: 8, width: '100%', background: '#f87171', borderRadius: 99, overflow: 'hidden', display: 'flex', marginTop: 8 }}>
                <div
                  style={{
                    height: '100%',
                    background: '#34d399',
                    width: `${((node.totalIn || 0) / Math.max((node.totalIn || 0) + (node.totalOut || 0), 0.0001)) * 100}%`,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                <span>Inflow (Green)</span>
                <span>Outflow (Red)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEDGER */}
        {activeTab === 'ledger' && (
          <div className="ledger-container">
            {transactions.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                No individual transaction hashes recorded in this snapshot.
              </div>
            ) : (
              transactions.map((tx, i) => (
                <div key={i} className="ledger-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`ledger-direction ${tx.direction === 'OUTGOING' ? 'out' : 'in'}`}>
                        {tx.direction}
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-primary)' }}>
                        {tx.valueEth ? `${tx.valueEth.toFixed(3)} ETH` : '0 ETH'}
                      </span>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      To/From: {tx.counterparty ? `${tx.counterparty.slice(0, 6)}…${tx.counterparty.slice(-4)}` : '—'}
                    </span>
                  </div>
                  {tx.hash && (
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mono"
                      style={{ fontSize: 10, color: 'var(--neon-cyan)', textDecoration: 'none' }}
                      title={tx.hash}
                    >
                      {tx.hash.slice(0, 6)}… ↗
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: VIVA NOTES */}
        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontWeight: 800, color: 'var(--neon-cyan)', marginBottom: 6 }}>
                🎓 Viva Presentation Summary
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                This node is evaluated against four independent on-chain money-flow heuristics implemented in pure JavaScript graph data structures:
              </p>
              <ul style={{ paddingLeft: 18, marginTop: 8, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li><strong>Sliding Window Analysis:</strong> Checks transaction burst density within 1-hour windows.</li>
                <li><strong>DFS Cycle Traversal:</strong> Traverses directed edges up to 4 hops to identify closed wash-trading loops.</li>
                <li><strong>Median Relative Outflow:</strong> Computes historical median to prevent single large transactions from skewing the baseline.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
