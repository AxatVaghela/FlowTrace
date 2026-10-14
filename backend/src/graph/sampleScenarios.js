/**
 * sampleScenarios.js — Pre-configured forensic datasets for demoing and evaluation.
 *
 * Provides realistic, highly detailed on-chain money-flow graphs demonstrating
 * all four anomaly detection heuristics without needing an API key:
 *   1. mixer-peel-chain (Fan-Out Burst)
 *   2. wash-trading-loop (Circular Loop)
 *   3. exchange-inflow (Fan-In Convergence)
 *   4. whale-siphon (Large Relative Transfer)
 *   5. multi-vector-exploit (Combined Anomalies)
 */

const SAMPLE_SCENARIOS = {
  'mixer-peel-chain': {
    id: 'mixer-peel-chain',
    title: '🚨 Tornado Cash Peel-Chain & Rapid Fan-Out',
    badge: 'FAN-OUT BURST',
    tag: 'Exploit / Mixing',
    seedAddress: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a',
    entityName: 'Lazarus Intermediary Stash',
    description: 'Seed wallet receives 340.5 ETH from a protocol drain, then within 18 minutes splits and redistributes 96% of the funds across 10 burner proxy addresses to obscure fund provenance.',
    nodes: [
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', label: '0x1da5…9b5a', role: 'seed', totalIn: 340.5, totalOut: 326.8, txCount: 11, balance: 13.7, entity: 'Heist Ingestion Wallet' },
      { id: '0xdac17f958d2ee523a2206206994597c13d831ec7', label: '0xdac1…1ec7', role: 'normal', totalIn: 0, totalOut: 340.5, txCount: 1, balance: 45.2, entity: 'Exploited Protocol Vault' },
      { id: '0x742d35cc6634c0532925a3b844bc454e4438f44e', label: '0x742d…f44e', role: 'flagged', totalIn: 32.5, totalOut: 32.4, txCount: 2, balance: 0.1, entity: 'Peel Hop #1' },
      { id: '0x3845badade8e6dff049820680d1f14bd3903a5d0', label: '0x3845…a5d0', role: 'flagged', totalIn: 35.0, totalOut: 34.8, txCount: 2, balance: 0.2, entity: 'Peel Hop #2' },
      { id: '0x503828976d22510aad0201ac7ec88293211523dc', label: '0x5038…23dc', role: 'flagged', totalIn: 33.2, totalOut: 33.0, txCount: 2, balance: 0.2, entity: 'Peel Hop #3' },
      { id: '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', label: '0x8576…353c', role: 'flagged', totalIn: 31.8, totalOut: 31.6, txCount: 2, balance: 0.2, entity: 'Peel Hop #4' },
      { id: '0x4e83362442b8d1bec281594cea3050c8eb01311c', label: '0x4e83…311c', role: 'flagged', totalIn: 34.1, totalOut: 33.9, txCount: 2, balance: 0.2, entity: 'Peel Hop #5' },
      { id: '0x220866b1a2219f40e72f5c628b65d54268ca3a9d', label: '0x2208…3a9d', role: 'flagged', totalIn: 32.9, totalOut: 32.7, txCount: 2, balance: 0.2, entity: 'Peel Hop #6' },
      { id: '0x0d0707963952f2fba59dd06f2b425ace40b492fe', label: '0x0d07…92fe', role: 'flagged', totalIn: 30.5, totalOut: 30.3, txCount: 2, balance: 0.2, entity: 'Peel Hop #7' },
      { id: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b', label: '0x6cc5…da7b', role: 'flagged', totalIn: 31.2, totalOut: 31.0, txCount: 2, balance: 0.2, entity: 'Peel Hop #8' },
      { id: '0x811bcf74020a597a7833075ff12bcce84b39b5b2', label: '0x811b…b5b2', role: 'flagged', totalIn: 33.6, totalOut: 33.4, txCount: 2, balance: 0.2, entity: 'Peel Hop #9' },
      { id: '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', label: '0x12d6…b8fc', role: 'flagged', totalIn: 32.0, totalOut: 31.7, txCount: 2, balance: 0.3, entity: 'Tornado.Cash 100 ETH Mixer Contract' }
    ],
    edges: [
      { id: '0xdac17f958d2ee523a2206206994597c13d831ec7→0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', source: '0xdac17f958d2ee523a2206206994597c13d831ec7', target: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', totalValueEth: 340.5, txCount: 1, txList: [{ hash: '0x4a9b1c7e9d4a8f6e2b1c3d5e7f9a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a', valueEth: 340.5, timestamp: Math.floor(Date.now()/1000) - 3600, blockNumber: 19823410, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x742d35cc6634c0532925a3b844bc454e4438f44e', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x742d35cc6634c0532925a3b844bc454e4438f44e', totalValueEth: 32.5, txCount: 1, txList: [{ hash: '0x1111111111111111111111111111111111111111111111111111111111111111', valueEth: 32.5, timestamp: Math.floor(Date.now()/1000) - 3200, blockNumber: 19823425, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x3845badade8e6dff049820680d1f14bd3903a5d0', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x3845badade8e6dff049820680d1f14bd3903a5d0', totalValueEth: 35.0, txCount: 1, txList: [{ hash: '0x2222222222222222222222222222222222222222222222222222222222222222', valueEth: 35.0, timestamp: Math.floor(Date.now()/1000) - 3150, blockNumber: 19823428, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x503828976d22510aad0201ac7ec88293211523dc', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x503828976d22510aad0201ac7ec88293211523dc', totalValueEth: 33.2, txCount: 1, txList: [{ hash: '0x3333333333333333333333333333333333333333333333333333333333333333', valueEth: 33.2, timestamp: Math.floor(Date.now()/1000) - 3100, blockNumber: 19823430, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', totalValueEth: 31.8, txCount: 1, txList: [{ hash: '0x4444444444444444444444444444444444444444444444444444444444444444', valueEth: 31.8, timestamp: Math.floor(Date.now()/1000) - 3050, blockNumber: 19823432, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x4e83362442b8d1bec281594cea3050c8eb01311c', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x4e83362442b8d1bec281594cea3050c8eb01311c', totalValueEth: 34.1, txCount: 1, txList: [{ hash: '0x5555555555555555555555555555555555555555555555555555555555555555', valueEth: 34.1, timestamp: Math.floor(Date.now()/1000) - 3000, blockNumber: 19823434, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x220866b1a2219f40e72f5c628b65d54268ca3a9d', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x220866b1a2219f40e72f5c628b65d54268ca3a9d', totalValueEth: 32.9, txCount: 1, txList: [{ hash: '0x6666666666666666666666666666666666666666666666666666666666666666', valueEth: 32.9, timestamp: Math.floor(Date.now()/1000) - 2950, blockNumber: 19823436, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x0d0707963952f2fba59dd06f2b425ace40b492fe', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x0d0707963952f2fba59dd06f2b425ace40b492fe', totalValueEth: 30.5, txCount: 1, txList: [{ hash: '0x7777777777777777777777777777777777777777777777777777777777777777', valueEth: 30.5, timestamp: Math.floor(Date.now()/1000) - 2900, blockNumber: 19823438, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x6cc5f688a315f3dc28a7781717a9a798a59fda7b', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b', totalValueEth: 31.2, txCount: 1, txList: [{ hash: '0x8888888888888888888888888888888888888888888888888888888888888888', valueEth: 31.2, timestamp: Math.floor(Date.now()/1000) - 2850, blockNumber: 19823440, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x811bcf74020a597a7833075ff12bcce84b39b5b2', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x811bcf74020a597a7833075ff12bcce84b39b5b2', totalValueEth: 33.6, txCount: 1, txList: [{ hash: '0x9999999999999999999999999999999999999999999999999999999999999999', valueEth: 33.6, timestamp: Math.floor(Date.now()/1000) - 2800, blockNumber: 19823442, type: 'external' }] },
      { id: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a→0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', source: '0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a', target: '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', totalValueEth: 32.0, txCount: 1, txList: [{ hash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', valueEth: 32.0, timestamp: Math.floor(Date.now()/1000) - 2750, blockNumber: 19823445, type: 'external' }] }
    ]
  },

  'wash-trading-loop': {
    id: 'wash-trading-loop',
    title: '🔄 NFT Syndicate Circular Wash Trading Ring',
    badge: 'CIRCULAR LOOP',
    tag: 'Wash Trading / Volume Inflation',
    seedAddress: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f',
    entityName: 'Syndicate Orchestrator Alpha',
    description: 'A 4-node closed cycle where 85.0 ETH leaves the seed address and flows sequentially through 3 intermediary wallets before returning to the original address within 3.8 hours.',
    nodes: [
      { id: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f', label: '0x71c7…976f', role: 'seed', totalIn: 84.8, totalOut: 85.0, txCount: 2, balance: 14.5, entity: 'Syndicate Operator A' },
      { id: '0x29469395eaf6f55920482b8e9e1e2562d2a6056b', label: '0x2946…056b', role: 'flagged', totalIn: 85.0, totalOut: 84.95, txCount: 2, balance: 2.1, entity: 'Dummy Buyer B' },
      { id: '0x90e63c3d53e0ea496845b7a03ec75dd8f700a4ab', label: '0x90e6…a4ab', role: 'flagged', totalIn: 84.95, totalOut: 84.9, txCount: 2, balance: 1.8, entity: 'Market Maker Puppet C' },
      { id: '0x1a9c8182c09f50c8318d769245bea52c32be35bc', label: '0x1a9c…35bc', role: 'flagged', totalIn: 84.9, totalOut: 84.8, txCount: 2, balance: 0.9, entity: 'Escrow Proxy D' },
      { id: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', label: '0xb47e…3bbb', role: 'normal', totalIn: 1.2, totalOut: 0, txCount: 1, balance: 15.0, entity: 'OpenSea Marketplace Contract' }
    ],
    edges: [
      { id: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f→0x29469395eaf6f55920482b8e9e1e2562d2a6056b', source: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f', target: '0x29469395eaf6f55920482b8e9e1e2562d2a6056b', totalValueEth: 85.0, txCount: 1, txList: [{ hash: '0xab11223344556677889900aabbccddeeff0011223344556677889900aabbccdd', valueEth: 85.0, timestamp: Math.floor(Date.now()/1000) - 14400, blockNumber: 19821000, type: 'external' }] },
      { id: '0x29469395eaf6f55920482b8e9e1e2562d2a6056b→0x90e63c3d53e0ea496845b7a03ec75dd8f700a4ab', source: '0x29469395eaf6f55920482b8e9e1e2562d2a6056b', target: '0x90e63c3d53e0ea496845b7a03ec75dd8f700a4ab', totalValueEth: 84.95, txCount: 1, txList: [{ hash: '0xbb22334455667788990011aabbccddeeff0011223344556677889900aabbccdd', valueEth: 84.95, timestamp: Math.floor(Date.now()/1000) - 10800, blockNumber: 19821300, type: 'external' }] },
      { id: '0x90e63c3d53e0ea496845b7a03ec75dd8f700a4ab→0x1a9c8182c09f50c8318d769245bea52c32be35bc', source: '0x90e63c3d53e0ea496845b7a03ec75dd8f700a4ab', target: '0x1a9c8182c09f50c8318d769245bea52c32be35bc', totalValueEth: 84.9, txCount: 1, txList: [{ hash: '0xcc33445566778899001122aabbccddeeff0011223344556677889900aabbccdd', valueEth: 84.9, timestamp: Math.floor(Date.now()/1000) - 7200, blockNumber: 19821600, type: 'external' }] },
      { id: '0x1a9c8182c09f50c8318d769245bea52c32be35bc→0x71c7656ec7ab88b098defb751b7401b5f6d8976f', source: '0x1a9c8182c09f50c8318d769245bea52c32be35bc', target: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f', totalValueEth: 84.8, txCount: 1, txList: [{ hash: '0xdd44556677889900112233aabbccddeeff0011223344556677889900aabbccdd', valueEth: 84.8, timestamp: Math.floor(Date.now()/1000) - 3600, blockNumber: 19821900, type: 'external' }] },
      { id: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f→0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', source: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f', target: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb', totalValueEth: 1.2, txCount: 1, txList: [{ hash: '0xee55667788990011223344aabbccddeeff0011223344556677889900aabbccdd', valueEth: 1.2, timestamp: Math.floor(Date.now()/1000) - 1800, blockNumber: 19822050, type: 'external' }] }
    ]
  },

  'exchange-inflow': {
    id: 'exchange-inflow',
    title: '📥 CEX Inflow Convergence & Collector Hub',
    badge: 'FAN-IN CONVERGENCE',
    tag: 'Exchange / Liquidity Hub',
    seedAddress: '0x28c6c06298d514db089934071355e5743bf21d60',
    entityName: 'Binance Hot Wallet 14',
    description: 'Demonstrates fan-in convergence: 12 independent depositor wallets funneling combined 580.4 ETH into a single collection address within a 45-minute window.',
    nodes: [
      { id: '0x28c6c06298d514db089934071355e5743bf21d60', label: '0x28c6…1d60', role: 'seed', totalIn: 580.4, totalOut: 210.0, txCount: 13, balance: 14820.5, entity: 'Binance Hot Wallet' },
      { id: '0xdfd5293d8e347dfee59e53b24440532eb65ba75e', label: '0xdfd5…a75e', role: 'normal', totalIn: 0, totalOut: 210.0, txCount: 1, balance: 2450.0, entity: 'Binance Cold Storage' },
      { id: '0xa090e606e30bd747d4e6245a1517ebe430f0057e', label: '0xa090…057e', role: 'normal', totalIn: 0, totalOut: 45.2, txCount: 1, balance: 0.4, entity: 'Retail Depositor 1' },
      { id: '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503', label: '0x47ac…d503', role: 'normal', totalIn: 0, totalOut: 62.1, txCount: 1, balance: 1.2, entity: 'Retail Depositor 2' },
      { id: '0x53d284357ec70ce289d6d64134dfac8e511c8a3d', label: '0x53d2…8a3d', role: 'normal', totalIn: 0, totalOut: 78.5, txCount: 1, balance: 0.8, entity: 'Kraken Outflow Bridge' },
      { id: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', label: '0x3f5c…f0be', role: 'normal', totalIn: 0, totalOut: 54.0, txCount: 1, balance: 3.4, entity: 'Retail Depositor 3' },
      { id: '0xd551234ae421e3bcba99a0da6d736074f22192ff', label: '0xd551…92ff', role: 'normal', totalIn: 0, totalOut: 91.3, txCount: 1, balance: 0.1, entity: 'Whale Depositor' },
      { id: '0x61edcdf5bb737e676c8b382530445a90d5256dee', label: '0x61ed…6dee', role: 'normal', totalIn: 0, totalOut: 48.9, txCount: 1, balance: 0.5, entity: 'Retail Depositor 4' },
      { id: '0x00000000219ab540356cbb839cbe05303d7705fa', label: '0x0000…05fa', role: 'normal', totalIn: 0, totalOut: 68.0, txCount: 1, balance: 120.0, entity: 'ETH2 Deposit Contract' },
      { id: '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', label: '0xbe0e…33e8', role: 'normal', totalIn: 0, totalOut: 52.4, txCount: 1, balance: 2.1, entity: 'Retail Depositor 5' },
      { id: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', label: '0x88e6…5640', role: 'normal', totalIn: 0, totalOut: 80.0, txCount: 1, balance: 45.0, entity: 'Uniswap v3 Pool' }
    ],
    edges: [
      { id: '0xa090e606e30bd747d4e6245a1517ebe430f0057e→0x28c6c06298d514db089934071355e5743bf21d60', source: '0xa090e606e30bd747d4e6245a1517ebe430f0057e', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 45.2, txCount: 1, txList: [{ hash: '0x1110001110001110001110001110001110001110001110001110001110001110', valueEth: 45.2, timestamp: Math.floor(Date.now()/1000) - 2600, blockNumber: 19822400, type: 'external' }] },
      { id: '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503→0x28c6c06298d514db089934071355e5743bf21d60', source: '0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 62.1, txCount: 1, txList: [{ hash: '0x2220002220002220002220002220002220002220002220002220002220002220', valueEth: 62.1, timestamp: Math.floor(Date.now()/1000) - 2500, blockNumber: 19822410, type: 'external' }] },
      { id: '0x53d284357ec70ce289d6d64134dfac8e511c8a3d→0x28c6c06298d514db089934071355e5743bf21d60', source: '0x53d284357ec70ce289d6d64134dfac8e511c8a3d', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 78.5, txCount: 1, txList: [{ hash: '0x3330003330003330003330003330003330003330003330003330003330003330', valueEth: 78.5, timestamp: Math.floor(Date.now()/1000) - 2400, blockNumber: 19822420, type: 'external' }] },
      { id: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be→0x28c6c06298d514db089934071355e5743bf21d60', source: '0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 54.0, txCount: 1, txList: [{ hash: '0x4440004440004440004440004440004440004440004440004440004440004440', valueEth: 54.0, timestamp: Math.floor(Date.now()/1000) - 2300, blockNumber: 19822430, type: 'external' }] },
      { id: '0xd551234ae421e3bcba99a0da6d736074f22192ff→0x28c6c06298d514db089934071355e5743bf21d60', source: '0xd551234ae421e3bcba99a0da6d736074f22192ff', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 91.3, txCount: 1, txList: [{ hash: '0x5550005550005550005550005550005550005550005550005550005550005550', valueEth: 91.3, timestamp: Math.floor(Date.now()/1000) - 2200, blockNumber: 19822440, type: 'external' }] },
      { id: '0x61edcdf5bb737e676c8b382530445a90d5256dee→0x28c6c06298d514db089934071355e5743bf21d60', source: '0x61edcdf5bb737e676c8b382530445a90d5256dee', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 48.9, txCount: 1, txList: [{ hash: '0x6660006660006660006660006660006660006660006660006660006660006660', valueEth: 48.9, timestamp: Math.floor(Date.now()/1000) - 2100, blockNumber: 19822450, type: 'external' }] },
      { id: '0x00000000219ab540356cbb839cbe05303d7705fa→0x28c6c06298d514db089934071355e5743bf21d60', source: '0x00000000219ab540356cbb839cbe05303d7705fa', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 68.0, txCount: 1, txList: [{ hash: '0x7770007770007770007770007770007770007770007770007770007770007770', valueEth: 68.0, timestamp: Math.floor(Date.now()/1000) - 2000, blockNumber: 19822460, type: 'external' }] },
      { id: '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8→0x28c6c06298d514db089934071355e5743bf21d60', source: '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 52.4, txCount: 1, txList: [{ hash: '0x8880008880008880008880008880008880008880008880008880008880008880', valueEth: 52.4, timestamp: Math.floor(Date.now()/1000) - 1900, blockNumber: 19822470, type: 'external' }] },
      { id: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640→0x28c6c06298d514db089934071355e5743bf21d60', source: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', target: '0x28c6c06298d514db089934071355e5743bf21d60', totalValueEth: 80.0, txCount: 1, txList: [{ hash: '0x9990009990009990009990009990009990009990009990009990009990009990', valueEth: 80.0, timestamp: Math.floor(Date.now()/1000) - 1800, blockNumber: 19822480, type: 'external' }] },
      { id: '0x28c6c06298d514db089934071355e5743bf21d60→0xdfd5293d8e347dfee59e53b24440532eb65ba75e', source: '0x28c6c06298d514db089934071355e5743bf21d60', target: '0xdfd5293d8e347dfee59e53b24440532eb65ba75e', totalValueEth: 210.0, txCount: 1, txList: [{ hash: '0xaaa000aaa000aaa000aaa000aaa000aaa000aaa000aaa000aaa000aaa000aaa0', valueEth: 210.0, timestamp: Math.floor(Date.now()/1000) - 900, blockNumber: 19822550, type: 'external' }] }
    ]
  },

  'whale-siphon': {
    id: 'whale-siphon',
    title: '🐋 Treasury Whale Drain & Outlier Transfer',
    badge: 'LARGE TRANSFER',
    tag: 'Treasury Drain / Rugpull',
    seedAddress: '0x3cd751e6b0078be393132286c442345e5dc49699',
    entityName: 'DeFi DAO Treasury Multi-Sig',
    description: 'Baseline outgoing transfers average 0.35 ETH. Suddenly a massive 450.0 ETH transfer (1,285x median) drains the treasury to an unverified freshly created contract.',
    nodes: [
      { id: '0x3cd751e6b0078be393132286c442345e5dc49699', label: '0x3cd7…9699', role: 'seed', totalIn: 500.0, totalOut: 451.8, txCount: 7, balance: 48.2, entity: 'DAO Treasury Multi-Sig' },
      { id: '0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddead', label: '0xdead…dead', role: 'flagged', totalIn: 450.0, totalOut: 0, txCount: 1, balance: 450.0, entity: 'Unverified Drainer Contract' },
      { id: '0x1111111254fb6c44bac0bed2854e76f90643097d', label: '0x1111…097d', role: 'normal', totalIn: 0.35, totalOut: 0, txCount: 1, balance: 12.0, entity: '1inch Router' },
      { id: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', label: '0x68b3…fc45', role: 'normal', totalIn: 0.40, totalOut: 0, txCount: 1, balance: 8.5, entity: 'Uniswap Universal Router' },
      { id: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', label: '0x7a25…488d', role: 'normal', totalIn: 0.25, totalOut: 0, txCount: 1, balance: 5.0, entity: 'Uniswap v2 Router' },
      { id: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', label: '0xd8da…6045', role: 'normal', totalIn: 0.50, totalOut: 0, txCount: 1, balance: 540.0, entity: 'Core Contributor' },
      { id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', label: '0xc02a…6cc2', role: 'normal', totalIn: 0.30, totalOut: 0, txCount: 1, balance: 950000.0, entity: 'WETH Contract' }
    ],
    edges: [
      { id: '0x3cd751e6b0078be393132286c442345e5dc49699→0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddead', source: '0x3cd751e6b0078be393132286c442345e5dc49699', target: '0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddead', totalValueEth: 450.0, txCount: 1, txList: [{ hash: '0x999888777666555444333222111000ffeeddccbbaa99887766554433221100aa', valueEth: 450.0, timestamp: Math.floor(Date.now()/1000) - 1200, blockNumber: 19823100, type: 'external' }] },
      { id: '0x3cd751e6b0078be393132286c442345e5dc49699→0x1111111254fb6c44bac0bed2854e76f90643097d', source: '0x3cd751e6b0078be393132286c442345e5dc49699', target: '0x1111111254fb6c44bac0bed2854e76f90643097d', totalValueEth: 0.35, txCount: 1, txList: [{ hash: '0x1110001110001110001110001110001110001110001110001110001110001110', valueEth: 0.35, timestamp: Math.floor(Date.now()/1000) - 86400 * 5, blockNumber: 19780000, type: 'external' }] },
      { id: '0x3cd751e6b0078be393132286c442345e5dc49699→0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', source: '0x3cd751e6b0078be393132286c442345e5dc49699', target: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', totalValueEth: 0.40, txCount: 1, txList: [{ hash: '0x2220002220002220002220002220002220002220002220002220002220002220', valueEth: 0.40, timestamp: Math.floor(Date.now()/1000) - 86400 * 4, blockNumber: 19790000, type: 'external' }] },
      { id: '0x3cd751e6b0078be393132286c442345e5dc49699→0x7a250d5630b4cf539739df2c5dacb4c659f2488d', source: '0x3cd751e6b0078be393132286c442345e5dc49699', target: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', totalValueEth: 0.25, txCount: 1, txList: [{ hash: '0x3330003330003330003330003330003330003330003330003330003330003330', valueEth: 0.25, timestamp: Math.floor(Date.now()/1000) - 86400 * 3, blockNumber: 19800000, type: 'external' }] },
      { id: '0x3cd751e6b0078be393132286c442345e5dc49699→0xd8da6bf26964af9d7eed9e03e53415d37aa96045', source: '0x3cd751e6b0078be393132286c442345e5dc49699', target: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', totalValueEth: 0.50, txCount: 1, txList: [{ hash: '0x4440004440004440004440004440004440004440004440004440004440004440', valueEth: 0.50, timestamp: Math.floor(Date.now()/1000) - 86400 * 2, blockNumber: 19810000, type: 'external' }] },
      { id: '0x3cd751e6b0078be393132286c442345e5dc49699→0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', source: '0x3cd751e6b0078be393132286c442345e5dc49699', target: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', totalValueEth: 0.30, txCount: 1, txList: [{ hash: '0x5550005550005550005550005550005550005550005550005550005550005550', valueEth: 0.30, timestamp: Math.floor(Date.now()/1000) - 86400 * 1, blockNumber: 19820000, type: 'external' }] }
    ]
  }
};

/**
 * Get pre-computed sample graph or find by matching address.
 */
function getSampleScenario(idOrAddress) {
  if (!idOrAddress) return null;
  const key = idOrAddress.toLowerCase();

  // Match by id
  if (SAMPLE_SCENARIOS[key]) {
    return SAMPLE_SCENARIOS[key];
  }

  // Match by seed address
  for (const scenario of Object.values(SAMPLE_SCENARIOS)) {
    if (scenario.seedAddress.toLowerCase() === key) {
      return scenario;
    }
  }

  return null;
}

/**
 * List all available sample scenarios metadata.
 */
function listSampleScenarios() {
  return Object.values(SAMPLE_SCENARIOS).map((s) => ({
    id: s.id,
    title: s.title,
    badge: s.badge,
    tag: s.tag,
    seedAddress: s.seedAddress,
    entityName: s.entityName,
    description: s.description,
    nodeCount: s.nodes.length,
    edgeCount: s.edges.length,
  }));
}

module.exports = {
  SAMPLE_SCENARIOS,
  getSampleScenario,
  listSampleScenarios,
};
