# ZK Data Hub

![image](https://github.com/district-labs/zk-data-hub/assets/18421017/07c2784f-3340-450e-aed8-7c4a223f3e92)

This proof of concept application is a data hub for ZK (Zero-Knowledge) proofs using [Axiom V2](https://www.axiom.xyz/). It is implemented through the [UniswapV3TwapOracle.sol](packages/contracts/src/axiom-v2/UniswapV3TwapOracle.sol) contract. The hub functions as a Uniswap V3 TWAP (Time-Weighted Average Price) oracle, receiving Axiom V2 proofs of Uniswap V3 pools' states, represented as two storage slots:
- [Observations Slot (0x8)](https://docs.uniswap.org/contracts/v3/reference/core/libraries/Oracle): This slot contains data about the cumulative tick, liquidity, timestamp, and the observation index of the pool.
- [Slot0 (0x0)](https://docs.uniswap.org/contracts/v3/reference/core/interfaces/pool/IUniswapV3PoolState#slot0): Slot0 holds information about the current tick, pool price, and other related data.

The hub allows for the reuse of proofs related to Uniswap V3 pools' states. Anyone can submit a new proof for any pool at any block, and the data will become available on-chain. In this model, new proofs are generated and submitted to the hub every 30 minutes, although external entities can also generate and submit new proofs.

Additionally, the `UniswapV3TwapOracle` contract offers utility functions. For instance, `getTwaSqrtPriceX96` enables the retrieval of the time-weighted average price between two blocks (or the instant price if the blocks are the same). Another function, `getTwaLiquidity`, returns the time-weighted average inverse liquidity for a given pool between two blocks, applicable only if the `secondsPerLiquidityCumulativeX128` differs between these blocks.

The circuit for generating these proofs can be found [here](apps/query-generator-cron/src/lib/axiom-v2/circuit/index.ts).

## Contracts

The contracts are situated in the [packages/contracts](packages/contracts) directory.

## AxiomV2 Circuit and Query Generator

The circuit for generating proofs, along with a cron job that creates proofs every 30 minutes, is located in the [apps/query-generator-cron](apps/query-generator-cron/src/lib/axiom-v2/circuit/index.ts) directory.

## Webapp

The web application is located in the [apps/webapp](apps/webapp) directory.

## Ponder App

The Ponder application, used to index `UniswapV3TwapOracle` events, is housed in the [apps/ponder](apps/ponder) directory.
