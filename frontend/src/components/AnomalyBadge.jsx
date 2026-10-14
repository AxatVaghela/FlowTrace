/**
 * AnomalyBadge.jsx — Renders a single anomaly flag card in the side panel.
 *
 * Props:
 *   anomaly: { type, severity, reason, metadata }
 */

const TYPE_LABELS = {
  'fan-out':        'Fan-Out Burst',
  'fan-in':         'Fan-In Convergence',
  'loop':           'Circular Flow',
  'large-transfer': 'Large Transfer',
};

const TYPE_DESCRIPTIONS = {
  'fan-out':
    'Funds received and rapidly redistributed to many addresses — a pattern seen in mixing and peel-chain operations.',
  'fan-in':
    'Many addresses sent funds here within a short window — typical of collection wallets aggregating before moving funds.',
  'loop':
    'Funds left this address and returned via intermediaries — indicative of wash-trading or circular shuffling.',
  'large-transfer':
    'A transfer significantly larger than the historical average for this address.',
};

export default function AnomalyBadge({ anomaly }) {
  const label = TYPE_LABELS[anomaly.type]   || anomaly.type;
  const desc  = TYPE_DESCRIPTIONS[anomaly.type] || '';
  const cssType = anomaly.type === 'large-transfer' ? 'large-transfer' : anomaly.type;

  return (
    <div className={`anomaly-badge ${cssType}`}>
      <div className="badge-top">
        <span className={`badge-type ${cssType}`}>{label}</span>
        <span className={`badge-sev ${anomaly.severity}`}>{anomaly.severity}</span>
      </div>
      <div className="badge-reason">{anomaly.reason}</div>
      {desc && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>
          {desc}
        </div>
      )}
    </div>
  );
}
