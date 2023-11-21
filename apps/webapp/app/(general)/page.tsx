"use client"

import { PoolCard } from "@/components/app/pool-card"
import { LinkComponent } from "@/components/shared/link-component"
import { env } from "@/env.mjs"
import { allPoolsWithBlocks } from "@/lib/ponder/queries/pools"
import { useQuery } from "@tanstack/react-query"
import request from "graphql-request"

export default function HomePage() {
  const {data:poolData, isLoading, isError} = useQuery({
    queryKey: ["allPoolsWithBlocks"],
    queryFn: async () => request(env.NEXT_PUBLIC_PONDER_URL,allPoolsWithBlocks )
  })

  console.log(poolData?.uniswapV3Pools)

  if(poolData?.uniswapV3Pools )
  return (
    <div className="container relative mt-20 px-0">
      <div className="grid grid-cols-4 gap-5 px-12">
        {isLoading ? <div className="p-6">Loading...</div> :
         poolData?.uniswapV3Pools.length > 0 && poolData?.uniswapV3Pools.map(({id,fee,token0,token1, blocks}) => <LinkComponent key={id} href={`/pool/${id}`}><PoolCard  address={id} fee={fee} token0={token0} token1={token1} observationsCount={blocks.length} /></LinkComponent>)
          } 

      </div>
    </div>
  )
}
