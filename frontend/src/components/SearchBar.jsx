/**
 * SearchBar.jsx — Search bar with address input, depth selector and trace button.
 */

import { useState } from 'react';

export default function SearchBar({ onSearch, loading, initialAddress = '' }) {
  const [address, setAddress] = useState(initialAddress);
  const [depth, setDepth] = useState('1');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    onSearch(trimmed, parseInt(depth, 10));
  }

  return (
    <form className="search-container" onSubmit={handleSubmit} id="search-form">
      <div className="search-input-box">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <input
          id="address-input"
          className="cyber-input mono"
          type="text"
          placeholder="0x... Target Address or Contract"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          disabled={loading}
        />
      </div>

      <select
        id="depth-select"
        className="cyber-select"
        value={depth}
        onChange={(e) => setDepth(e.target.value)}
        disabled={loading}
        title="Graph BFS Expansion Depth"
      >
        <option value="1">1 Hop (Fast)</option>
        <option value="2">2 Hops (Deep)</option>
      </select>

      <button
        id="trace-btn"
        className="cyber-btn-primary"
        type="submit"
        disabled={loading || !address.trim()}
      >
        {loading ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spinHolo 0.7s linear infinite',
              }}
            />
            Tracing…
          </>
        ) : (
          <>
            <span>⚡</span>
            <span>Trace Flow</span>
          </>
        )}
      </button>
    </form>
  );
}
