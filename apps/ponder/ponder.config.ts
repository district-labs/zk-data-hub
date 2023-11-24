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
      address: process.env.UNI_V3_TWAP_ORACLE_ADDRESS as `0x${string}`,
      abi: "./abis/UniswapV3TwapOracle.json",
      startBlock: 10055200,
    },
  ],
};
