# ZK Data Hub WebApp

This example app reads the stored observations of Uniswap V3 pools from the ZK Data Hub using [ponder](https://github.com/0xOlias/ponder) and lets users calculate the time-weighted average price (TWAP) of a given pool over a given time period with on-chain verified data powered by [Axiom V2](https://www.axiom.xyz/) proofs.

## Getting Started

### Install

```
pnpm install
```

### Environment Variables

The app uses [t3-env](https://github.com/t3-oss/t3-env) to validate environment variables. View [env.mjs](env.mjs) for more details. Create a `.env` file in the root directory of the project and add the following variables to it:

```
# ZK Data Hub Ponder URL
NEXT_PUBLIC_PONDER_URL

# Alchemy API Key
NEXT_PUBLIC_ALCHEMY_API_KEY

# Website URL
NEXT_PUBLIC_SITE_URL

# Uniswap V3 TWAP Oracle Address
NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS
```

### Run

```
pnpm dev
```

### Build

```
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Built With

This web app was built with [create-turbo-eth](https://github.com/turbo-eth/create-turbo-eth), a CLI tool to create [TurboETH](https://github.com/turbo-eth/template-web3-app) apps from templates. To learn more about TurboETH, check out the [TurboETH docs](https://docs.turboeth.xyz/overview).
