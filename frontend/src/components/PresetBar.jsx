/**
 * PresetBar.jsx — Top cyber marquee with curated forensic scenarios.
 */

export const PRESET_SCENARIOS = [
  {
    id: 'mixer-peel-chain',
    label: '🚨 Mixer Peel-Chain',
    tag: 'FAN-OUT',
    color: 'var(--anom-fanout)',
    address: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a',
    desc: 'Lazarus protocol drain split across 10 burner proxies',
  },
  {
    id: 'wash-trading-loop',
    label: '🔄 Wash Trading Ring',
    tag: 'LOOP',
    color: 'var(--anom-loop)',
    address: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
    desc: '4-node circular cycle inflating NFT trading volume',
  },
  {
    id: 'exchange-inflow',
    label: '📥 CEX Inflow Hub',
    tag: 'FAN-IN',
    color: 'var(--anom-fanin)',
    address: '0x28c6c06298d514db089934071355e5743bf21d60',
    desc: 'Binance hot wallet converging 12 depositor inflows',
  },
  {
    id: 'whale-siphon',
    label: '🐋 Whale Treasury Drain',
    tag: 'LARGE XFER',
    color: 'var(--anom-large)',
    address: '0x3cd751e6b0078be393132286c442345e5dc49699',
    desc: 'Sudden 1,285x median outlier transfer draining treasury',
  },
  {
    id: 'vitalik-live',
    label: '⚡ Vitalik Buterin EOA',
    tag: 'LIVE',
    color: 'var(--neon-cyan)',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    desc: 'Active Ethereum founder wallet with diverse counterparty flows',
  },
];

export default function PresetBar({ activeScenario, onSelectScenario, loading }) {
  return (
    <div className="preset-bar">
      <div className="preset-title">
        <span style={{ color: 'var(--neon-cyan)' }}>✦</span> Curated Forensic Cases:
      </div>

      {PRESET_SCENARIOS.map((scenario) => {
        const isActive = activeScenario === scenario.id;
        return (
          <button
            key={scenario.id}
            type="button"
            className={`preset-chip ${isActive ? 'active' : ''}`}
            onClick={() => onSelectScenario(scenario)}
            disabled={loading}
            title={`${scenario.desc} (${scenario.address})`}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: scenario.color,
                boxShadow: `0 0 6px ${scenario.color}`,
              }}
            />
            <span>{scenario.label}</span>
            <span className="preset-tag">{scenario.tag}</span>
          </button>
        );
      })}
    </div>
  );
}
