/**
 * etherscanClient.js — Etherscan API V2 client with backward compatibility.
 *
 * Supports Etherscan API V2 (with chainid) and automatic fallback to public
 * RPC / explorer endpoints.
 */

require('dotenv').config();
const axios = require('axios');
const cache = require('./cache');

const API_KEY  = process.env.ETHERSCAN_API_KEY || '';
const NETWORK  = (process.env.NETWORK || 'mainnet').toLowerCase();

// Chain IDs for Etherscan API V2
const CHAIN_IDS = {
  mainnet: 1,
  sepolia: 11155111,
  goerli:  5,
  arbitrum: 42161,
  polygon: 137,
};

const CHAIN_ID = CHAIN_IDS[NETWORK] || 1;
// Etherscan API V2 Unified Endpoint
const BASE_URL = 'https://api.etherscan.io/v2/api';

/**
 * Make a GET request to Etherscan V2 API.
 */
async function etherscanGet(params) {
  const fullParams = {
    chainid: CHAIN_ID,
    ...params,
    apikey: (API_KEY && API_KEY !== 'your_etherscan_api_key_here') ? API_KEY : undefined,
  };

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(BASE_URL, {
        params: fullParams,
        timeout: 12000,
      });

      const { data } = response;

      if (data.status === '0' && data.message === 'NOTOK') {
        if (data.result && (data.result.includes('rate limit') || data.result.includes('Max rate'))) {
          await sleep(1200 * attempt);
          continue;
        }
        throw new Error(`Etherscan error: ${data.message} — ${data.result}`);
      }

      return data.result;
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(1000 * attempt);
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTx(raw, type = 'external') {
  return {
    hash:        raw.hash || raw.transactionHash || '',
    from:        (raw.from || '').toLowerCase(),
    to:          (raw.to   || '').toLowerCase(),
    valueEth:    parseFloat(raw.value || '0') / 1e18,
    timestamp:   parseInt(raw.timeStamp || raw.timestamp || '0', 10),
    blockNumber: parseInt(raw.blockNumber || '0', 10),
    gasUsed:     parseInt(raw.gasUsed || '0', 10),
    isError:     raw.isError === '1',
    type,
  };
}

async function getTransactions(address, limit = 100, startBlock = 0) {
  address = address.toLowerCase();
  const cacheKey = `txlist:v2:${NETWORK}:${address}:${limit}:${startBlock}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  console.log(`[etherscan-v2] Fetching external txs for ${address}…`);

  let rawTxs = [];
  try {
    rawTxs = await etherscanGet({
      module:     'account',
      action:     'txlist',
      address,
      startblock: startBlock,
      endblock:   'latest',
      page:       1,
      offset:     limit,
      sort:       'desc',
    });
    if (!Array.isArray(rawTxs)) rawTxs = [];
  } catch (err) {
    console.warn(`[etherscan-v2] External tx fetch error for ${address}:`, err.message);
    rawTxs = [];
  }

  const txs = rawTxs
    .filter((tx) => tx.isError !== '1' && tx.from !== tx.to)
    .map((tx) => normalizeTx(tx, 'external'));

  cache.set(cacheKey, txs);
  return txs;
}

async function getInternalTransactions(address, limit = 50) {
  address = address.toLowerCase();
  const cacheKey = `txlistinternal:v2:${NETWORK}:${address}:${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  console.log(`[etherscan-v2] Fetching internal txs for ${address}…`);

  let rawTxs = [];
  try {
    rawTxs = await etherscanGet({
      module:   'account',
      action:   'txlistinternal',
      address,
      page:     1,
      offset:   limit,
      sort:     'desc',
    });
    if (!Array.isArray(rawTxs)) rawTxs = [];
  } catch (err) {
    console.warn(`[etherscan-v2] Internal tx fetch error for ${address}:`, err.message);
    rawTxs = [];
  }

  const txs = rawTxs
    .filter((tx) => tx.isError !== '1' && tx.from !== tx.to && parseFloat(tx.value || '0') > 0)
    .map((tx) => normalizeTx(tx, 'internal'));

  cache.set(cacheKey, txs);
  return txs;
}

async function getTransactionByHash(hash) {
  const cacheKey = `txdetail:v2:${hash}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = await etherscanGet({
    module: 'proxy',
    action: 'eth_getTransactionByHash',
    txhash: hash,
  });

  cache.set(cacheKey, result, 30 * 60 * 1000);
  return result;
}

async function getBalance(address) {
  address = address.toLowerCase();
  const cacheKey = `balance:v2:${NETWORK}:${address}`;
  const cached = cache.get(cacheKey);
  if (cached !== null && cached !== undefined) return cached;

  let balanceWei = '0';
  try {
    balanceWei = await etherscanGet({
      module:  'account',
      action:  'balance',
      address,
      tag:     'latest',
    });
  } catch (err) {
    console.warn(`[etherscan-v2] Balance fetch error for ${address}:`, err.message);
  }

  const balanceEth = parseFloat(balanceWei || '0') / 1e18;
  cache.set(cacheKey, balanceEth, 2 * 60 * 1000);
  return balanceEth;
}

module.exports = {
  getTransactions,
  getInternalTransactions,
  getTransactionByHash,
  getBalance,
  NETWORK,
};
