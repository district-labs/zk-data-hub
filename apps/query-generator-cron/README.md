# ZK Data Hub Query Generator
 
This app contains a [circuit](src/lib/axiom-v2/circuit/index.ts) for generating proofs for the ZK Data Hub, along with a cron job that creates proofs every 30 minutes.

## Getting Started

### Install

```
pnpm install
```

### Environment Variables

```
# Goerli RPC URL
GOERLI_PROVIDER_URL

# Private Key used to send Axiom V2 queries on Goerli
GOERLI_PRIVATE_KEY

# Uniswap V3 TWAP Oracle Address
CALLBACK_ADDRESS
```

### Run

```
pnpm dev
```

### Build

```
pnpm build
```
