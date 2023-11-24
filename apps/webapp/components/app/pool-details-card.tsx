"use client"

import { FaExternalLinkAlt } from "react-icons/fa"
import type { Address } from "viem"

import { useErc20Name, useErc20Symbol } from "@/lib/generated/blockchain"

import { BlockExplorerLink } from "../blockchain/block-explorer-link"
import { Card } from "../ui/card"
import { CalculatePoolPriceDialog } from "./calculate-pool-price-dialog"

interface PoolDetailsCardProps {
  address: string
  token0: string
  token1: string
  fee: number
  observationsCount: number
  blocks: {
    id: number
    timestamp: number
  }[]
}

// We're only using pools from Goerli
const CHAIN_ID = 5

export function PoolDetailsCard({
  address,
  token0,
  token1,
  fee,
  observationsCount,
  blocks,
}: PoolDetailsCardProps) {
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
    <Card className="flex flex-col gap-y-1 border-2 p-6  shadow-sm">
      <div className="mb-2 flex flex-col gap-y-3">
        <div className="flex items-center gap-x-4">
          <h2 className="text-2xl font-semibold">
            {token0Symbol}/{token1Symbol}{" "}
            <span className="ml-1 rounded-lg bg-gray-700 p-1.5 text-base text-zinc-100">
              {fee / 10000}%
            </span>
          </h2>
          <BlockExplorerLink
            blockExplorerUrl="https://goerli.etherscan.io/"
            address={address as `0x${string}`}
          >
            <FaExternalLinkAlt className="h-4 w-4 text-black hover:underline dark:text-white" />
          </BlockExplorerLink>
        </div>
        <div className="flex gap-x-1">
          <BlockExplorerLink
            className="no-underline hover:underline"
            blockExplorerUrl="https://goerli.etherscan.io/"
            address={token0 as `0x${string}`}
          >
            {token0Name}
          </BlockExplorerLink>{" "}
          /
          <BlockExplorerLink
            className="no-underline hover:underline"
            blockExplorerUrl="https://goerli.etherscan.io/"
            address={token1 as `0x${string}`}
          >
            {token1Name}
          </BlockExplorerLink>
        </div>
        <p className="flex gap-x-1">
          Observations stored:
          <span className="font-semibold"> {observationsCount}</span>
        </p>
      </div>
      <CalculatePoolPriceDialog
        blocks={blocks}
        poolAddress={address}
        token0={token0}
        token1={token1}
      />
    </Card>
  )
}
