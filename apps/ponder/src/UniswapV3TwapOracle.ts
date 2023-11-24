import { ponder } from "@/generated";
import { goerliClient } from "./client";
import { getPoolInfo } from "./utils";

ponder.on(
  "UniswapV3TwapOracle:ObservationStored",
  async ({ event, context }) => {
    const { BlockInfo, PoolBlock, UniswapV3Pool } = context.entities;

    const block = await goerliClient.getBlock({
      blockNumber: event.params.blockNumber,
    });

    const pool = await UniswapV3Pool.findUnique({
      id: event.params.pool,
    });

    if (!pool) {
      const poolInfo = await getPoolInfo(event.params.pool, goerliClient);

      if (!poolInfo.success) {
        // If the pool doesn't have a fee, token0, or token1, don't store the block info
        return;
      }

      await UniswapV3Pool.create({
        id: event.params.pool,
        data: {
          fee: poolInfo.fee,
          token0: poolInfo.token0,
          token1: poolInfo.token1,
        },
      });
    }

    await BlockInfo.upsert({
      id: Number(event.params.blockNumber),
      create: {
        timestamp: Number(block.timestamp),
      },
      update: {
        timestamp: Number(block.timestamp),
      },
    });

    await PoolBlock.create({
      id: `${event.params.pool}-${event.params.blockNumber.toString()}`,
      data: {
        block: Number(event.params.blockNumber),
        pool: event.params.pool,
      },
    });
  },
);
