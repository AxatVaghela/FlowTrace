/**
 * routes/tx.js — GET /api/tx/:hash
 *
 * Returns full detail for a single transaction by its hash.
 * Used by the frontend side panel for drill-down.
 *
 * Response: raw Etherscan proxy response + human-readable fields.
 */

const express = require('express');
const router  = express.Router();
const { getTransactionByHash } = require('../ingestion/etherscanClient');

const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

router.get('/:hash', async (req, res) => {
  const { hash } = req.params;

  if (!TX_HASH_RE.test(hash)) {
    return res.status(400).json({ error: 'Invalid transaction hash format.' });
  }

  try {
    const txDetail = await getTransactionByHash(hash);

    if (!txDetail) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // Parse and enrich for convenience
    const valueEth = txDetail.value
      ? parseInt(txDetail.value, 16) / 1e18
      : 0;

    return res.json({
      hash:        txDetail.hash,
      from:        txDetail.from,
      to:          txDetail.to,
      valueEth:    parseFloat(valueEth.toFixed(8)),
      blockNumber: parseInt(txDetail.blockNumber, 16),
      gas:         parseInt(txDetail.gas,         16),
      gasPrice:    parseInt(txDetail.gasPrice,     16),
      nonce:       parseInt(txDetail.nonce,        16),
      raw: txDetail,
    });
  } catch (err) {
    console.error('[/api/tx] Error:', err.message);
    return res.status(500).json({
      error: 'Failed to fetch transaction detail.',
      detail: err.message,
    });
  }
});

module.exports = router;
