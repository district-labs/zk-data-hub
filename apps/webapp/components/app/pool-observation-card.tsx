import { env } from "@/env.mjs"
import type { Address } from "viem"

import {
  useErc20Decimals,
  useUniswapV3TwapOracleGetSlot0,
} from "@/lib/generated/blockchain"
import { formatDate, formatUniV3sqrtPriceX96 } from "@/lib/utils"

import { Card } from "../ui/card"

interface PoolObservationCardProps {
  token0: string
  token1: string
  poolAddress: string
  blockNumber: number
  timestamp: number
}

const CHAIN_ID = 5

export function PoolObservationCard({
  blockNumber,
  timestamp,
  poolAddress,
  token0,
  token1,
}: PoolObservationCardProps) {
  const { data } = useUniswapV3TwapOracleGetSlot0({
    chainId: CHAIN_ID,
    address: env.NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS as Address,
    args: [poolAddress as Address, BigInt(blockNumber)],
  })

  const { data: token0Decimals } = useErc20Decimals({
    chainId: CHAIN_ID,
    address: token0 as Address,
  })

  const { data: token1Decimals } = useErc20Decimals({
    chainId: CHAIN_ID,
    address: token1 as Address,
  })

  return (
    <Card className="flex flex-col gap-y-1 border-2 p-6 shadow-sm">
      <h2 className="font-semibold">Block</h2>
      <p>
        Block Number: <span className="font-semibold">{blockNumber}</span>
      </p>
      <p>
        Timestamp:{" "}
        <span className="font-semibold">{formatDate(timestamp * 1000)}</span>
      </p>
      <p>
        Price:{" "}
        <span className="font-semibold">
          {formatUniV3sqrtPriceX96(
            token0Decimals,
            token1Decimals,
            data?.sqrtPriceX96
          )}
        </span>
      </p>
    </Card>
  )
}
