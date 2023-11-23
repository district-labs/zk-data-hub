import type { Address } from "viem"

import { useErc20Name, useErc20Symbol } from "@/lib/generated/blockchain"

import { Card } from "../ui/card"

interface PoolCardProps {
  fee: number
  token0: string
  token1: string
  observationsCount: number
}

// We're only using pools from Goerli
const CHAIN_ID = 5

export function PoolCard({
  fee,
  token0,
  token1,
  observationsCount,
}: PoolCardProps) {
  const { data: token0Name } = useErc20Name({
    address: token0 as Address,
    chainId: CHAIN_ID,
  })
  const { data: token0Symbol } = useErc20Symbol({
    address: token0 as Address,
    chainId: CHAIN_ID,
  })

  const { data: token1Name } = useErc20Name({
    address: token1 as Address,
    chainId: CHAIN_ID,
  })
  const { data: token1Symbol } = useErc20Symbol({
    address: token1 as Address,
    chainId: CHAIN_ID,
  })

  return (
    <Card className="flex flex-col gap-y-1 border-2 p-6  shadow-lg transition hover:scale-105">
      <h2 className="font-semibold">
        {token0Symbol}/{token1Symbol} Pool
      </h2>
      <p>
        Token0: <span className="font-semibold">{token0Name}</span>
      </p>
      <p>
        Token1: <span className="font-semibold">{token1Name}</span>
      </p>
      <p>
        Fee: <span className="font-semibold">{fee}</span>
      </p>
      <p>
        Observations:{" "}
        <span className="font-semibold"> {observationsCount}</span>
      </p>
    </Card>
  )
}
