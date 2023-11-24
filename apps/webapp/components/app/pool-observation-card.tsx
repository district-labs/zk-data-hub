import { env } from "@/env.mjs"
import type { Address } from "viem"

import {
  useErc20Decimals,
  useErc20Symbol,
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

  const { data: token0Symbol } = useErc20Symbol({
    address: token0 as Address,
    chainId: CHAIN_ID,
  })

  const { data: token1Decimals } = useErc20Decimals({
    chainId: CHAIN_ID,
    address: token1 as Address,
  })

  const { data: token1Symbol } = useErc20Symbol({
    address: token1 as Address,
    chainId: CHAIN_ID,
  })

  return (
    <Card className="flex flex-col gap-y-2 border-2 p-6 shadow-sm">
      <p>
        Block Number: <span className="font-semibold">{blockNumber}</span>
      </p>
      <p>
        Timestamp:{" "}
        <span className="font-semibold">{formatDate(timestamp * 1000)}</span>
      </p>
      {token0Symbol &&
      token1Symbol &&
      token0Decimals &&
      token1Decimals &&
      data?.sqrtPriceX96 ? (
        <>
          <p className="font-semibold">
            {`1 ${token0Symbol} = ${formatUniV3sqrtPriceX96(
              token0Decimals,
              token1Decimals,
              data?.sqrtPriceX96
            ).toString()} ${token1Symbol}`}
          </p>
          <p className="font-semibold">
            {`1 ${token1Symbol} = ${formatUniV3sqrtPriceX96(
              token0Decimals,
              token1Decimals,
              data?.sqrtPriceX96,
              true
            ).toString()} ${token0Symbol}`}
          </p>
        </>
      ) : null}
    </Card>
  )
}
