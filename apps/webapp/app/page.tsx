"use client"

import { env } from "@/env.mjs"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

import { PoolCard } from "@/components/app/pool-card"
import { LinkComponent } from "@/components/shared/link-component"
import { Skeleton } from "@/components/ui/skeleton"
import { allPoolsWithBlocks } from "@/lib/ponder/queries/pools"

export default function HomePage() {
  const {
    data: poolData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["allPoolsWithBlocks"],
    queryFn: async () =>
      request(env.NEXT_PUBLIC_PONDER_URL, allPoolsWithBlocks),
  })

  return (
    <div className="container mt-12 px-6 sm:px-10">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2  md:grid-cols-3 xl:grid-cols-4">
        {isError ? (
          <div className="text-red-500">{error.message}</div>
        ) : isLoading ? (
          Array(8)
            .fill(null)
            .map((_, i) => <Skeleton key={i} className="h-44 w-full" />)
        ) : poolData?.uniswapV3Pools && poolData?.uniswapV3Pools?.length > 0 ? (
          poolData?.uniswapV3Pools.map(
            ({ id, fee, token0, token1, blocks }) => (
              <LinkComponent key={id} href={`/pool/${id}`}>
                <PoolCard
                  fee={fee}
                  token0={token0}
                  token1={token1}
                  observationsCount={blocks.length}
                />
              </LinkComponent>
            )
          )
        ) : (
          <div>No pools found...</div>
        )}
      </div>
    </div>
  )
}
