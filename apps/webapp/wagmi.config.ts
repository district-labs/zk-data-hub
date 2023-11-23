import { defineConfig } from "@wagmi/cli"
import { foundry, react } from "@wagmi/cli/plugins"
import { erc20ABI } from "wagmi"

export default defineConfig({
  out: "lib/generated/blockchain.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20ABI,
    },
  ],
  plugins: [
    react(),
    foundry({
      project: "../../packages/contracts",
      include: ["UniswapV3TwapOracle.json"],
    }),
  ],
})
