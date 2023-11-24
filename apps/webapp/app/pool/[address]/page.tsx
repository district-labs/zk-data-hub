"use client"

import { env } from "@/env.mjs"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import { getPoolInfo } from "@/lib/ponder/queries/pools"
import { Skeleton } from "@/components/ui/skeleton"
import { PoolDetailsCard } from "@/components/app/pool-details-card"
import { PoolObservationCard } from "@/components/app/pool-observation-card"

interface PoolPageProps {
  params: { address: string }
}

export default function PoolPage({ params }: PoolPageProps) {
  const { data: poolInfo, isLoading } = useQuery({
    queryKey: ["getPoolInfo", params.address],
    queryFn: async () =>
      request(env.NEXT_PUBLIC_PONDER_URL, getPoolInfo, {
        poolId: params.address,
      }),
  })

  if (!isLoading && !poolInfo?.uniswapV3Pool) {
    return (
      <div className="mt-72 w-full text-center text-xl font-semibold">
        Pool not found
      </div>
    )
  }

  return (
    <div className="container relative mt-12 px-6 sm:px-10">
      {isLoading ? (
        <Skeleton className="h-52 w-full" />
      ) : (
        poolInfo?.uniswapV3Pool && (
          <PoolDetailsCard
            address={params.address}
            fee={poolInfo.uniswapV3Pool.fee}
            token0={poolInfo.uniswapV3Pool.token0}
            token1={poolInfo.uniswapV3Pool.token1}
            blocks={poolInfo.uniswapV3Pool.blocks.map(({ block }) => ({
              id: block?.id || 0,
              timestamp: block?.timestamp || 0,
            }))}
            observationsCount={poolInfo.uniswapV3Pool.blocks.length}
          />
        )
      )}
      <div className="mt-6 grid grid-cols-1 gap-5  sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array(12)
            .fill(null)
            .map((_, i) => <Skeleton key={i} className="h-36 w-full" />)
        ) : poolInfo?.uniswapV3Pool &&
          poolInfo.uniswapV3Pool.blocks.length > 0 ? (
          poolInfo.uniswapV3Pool.blocks.map(({ block }) =>
            !block ? null : (
              <PoolObservationCard
                key={block.id}
                poolAddress={params.address}
                blockNumber={block.id}
                timestamp={block.timestamp}
                token0={poolInfo.uniswapV3Pool?.token0 as string}
                token1={poolInfo.uniswapV3Pool?.token1 as string}
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
