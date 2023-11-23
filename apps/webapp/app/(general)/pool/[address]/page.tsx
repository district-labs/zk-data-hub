"use client"

import { env } from "@/env.mjs"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import { PoolDetailsCard } from "@/components/app/pool-details-card"
import { PoolObservationCard } from "@/components/app/pool-observation-card"
import { getPoolInfo } from "@/lib/ponder/queries/pools"

interface PoolPageProps {
  params: { address: string }
}

export default function PoolPage({ params }: PoolPageProps) {
  const {
    data: poolInfo,
    isLoading,
  } = useQuery({
    queryKey: ["getPoolInfo", params.address],
    queryFn: async () =>
      request(env.NEXT_PUBLIC_PONDER_URL, getPoolInfo, {
        poolId: params.address,
      }),
  })

  if (isLoading) return <div>Loading...</div>

  if (!poolInfo?.uniswapV3Pool) {
    return <div>Pool not found</div>
  }

  const { blocks, fee, token0, token1 } = poolInfo.uniswapV3Pool

  return (
    <div className="container relative mt-20 px-0">
      <PoolDetailsCard
        address={params.address}
        fee={fee}
        token0={token0}
        token1={token1}
        blocks={blocks.map(({ block }) => ({
          id: block?.id || 0,
          timestamp: block?.timestamp || 0,
        }))}
        observationsCount={blocks.length}
      />
      <div className="mt-6 grid grid-cols-4 gap-5">
        {blocks.length > 0 ? (
          blocks.map(({ block }) =>
            !block ? null : (
              <PoolObservationCard
                key={block.id}
                poolAddress={params.address}
                blockNumber={block.id}
                timestamp={block.timestamp}
                token0={token0}
                token1={token1}
              />
            )
          )
        ) : (
          <div>No observations found...</div>
        )}
      </div>
    </div>
  )
}
