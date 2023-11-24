import type { Address, PublicClient } from "viem";
import { uniswapV3PoolABI } from "../abis/UniswapV3Pool";

export async function getPoolInfo(
  poolAddress: Address,
  publicClient: PublicClient,
) {
  try {
    const [fee, token0, token1] = await Promise.all([
      publicClient.readContract({
        abi: uniswapV3PoolABI,
        address: poolAddress,
        functionName: "fee",
      }),
      publicClient.readContract({
        abi: uniswapV3PoolABI,
        address: poolAddress,
        functionName: "token0",
      }),
      publicClient.readContract({
        abi: uniswapV3PoolABI,
        address: poolAddress,
        functionName: "token1",
      }),
    ]);

    return { success: true, fee, token0, token1 } as const;
  } catch (e) {
    console.error(e);
    // If the pool doesn't have a fee, token0, or token1, don't store the block info
    return { success: false } as const;
  }
}
