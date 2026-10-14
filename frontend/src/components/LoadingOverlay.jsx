/**
 * LoadingOverlay.jsx — Full-area loading spinner shown while the graph is fetching.
 */

export default function LoadingOverlay({ address }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <div className="loading-text">Tracing money flows…</div>
      {address && (
        <div className="loading-sub mono" style={{ fontSize: 11 }}>
          {address.slice(0, 10)}…{address.slice(-6)}
        </div>
      )}
      <div className="loading-sub">Fetching transactions from Etherscan</div>
    </div>
  );
}
