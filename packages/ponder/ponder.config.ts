import type { Config } from "@ponder/core";
import { http } from "viem";

export const config: Config = {
  networks: [
    {
      name: "goerli",
      chainId: 5,
      transport: http(process.env.PONDER_RPC_URL_GOERLI),
    },
  ],
  contracts: [
    {
      name: "UniswapV3TwapOracle",
      network: "goerli",
      address: "0x74F89Ef626fF297FF6E1eB2A2C6A470ef1bc92DA",
      abi: "./abis/UniswapV3TwapOracle.json",
      startBlock: 10055200,
    },
  ],
};
