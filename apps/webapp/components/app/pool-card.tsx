import { useErc20Name, useErc20Symbol } from "@/lib/generated/blockchain";
import type { Address } from "viem";
import { BlockExplorerLink } from "../blockchain/block-explorer-link";
import { Card } from "../ui/card";

interface PoolCardProps {
  address: string
  fee: number
  token0: string
  token1: string
  observationsCount: number
}

export function PoolCard({address,fee, token0, token1, observationsCount}:PoolCardProps){
  const {data:token0Name} = useErc20Name({
    address: token0 as Address
  })
  const {data:token0Symbol} = useErc20Symbol({
    address: token0 as Address
  })

  const {data:token1Name} = useErc20Name({
    address: token1 as Address
  })
  const {data:token1Symbol} = useErc20Symbol({
    address: token1 as Address
  })

  return (
  <Card className="flex flex-col gap-y-1 border-2 p-6  shadow-lg transition hover:scale-105">
    <h2><BlockExplorerLink className="no-underline underline-offset-2 hover:underline" address={address as Address} >{token0Symbol}/{token1Symbol} Pool</BlockExplorerLink></h2>
    <p>Token0: <BlockExplorerLink className="no-underline underline-offset-2 hover:underline" address={token0 as Address} >{token0Name}</BlockExplorerLink></p>
    <p>Token1: <BlockExplorerLink className="no-underline underline-offset-2 hover:underline" address={token1 as Address} >{token1Name}</BlockExplorerLink></p>
      <p>Fee: <span className="font-semibold">{fee}</span></p>
      <p>Observations: <span className="font-semibold"> {observationsCount}</span></p>
  </Card>
  )

}