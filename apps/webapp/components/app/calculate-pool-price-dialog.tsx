import { useMemo, useState } from "react"
import { env } from "@/env.mjs"
import type { Address } from "viem"

import {
  useErc20Decimals,
  useErc20Symbol,
  useUniswapV3TwapOracleGetTwaSqrtPriceX96,
} from "@/lib/generated/blockchain"
import { formatDate, formatUniV3sqrtPriceX96 } from "@/lib/utils"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Skeleton } from "../ui/skeleton"

interface CalculatePoolPriceDialogProps {
  poolAddress: string
  token0: string
  token1: string
  blocks: {
    id: number
    timestamp: number
  }[]
}

export function CalculatePoolPriceDialog({
  poolAddress,
  blocks,
  token0,
  token1,
}: CalculatePoolPriceDialogProps) {
  const [startBlock, setStartBlock] = useState<number>()
  const [endBlock, setEndBlock] = useState<number>()

  // If endBlock is set, we only want to show blocks that are less than endBlock
  const startBlocks = useMemo(
    () => (endBlock ? blocks.filter(({ id }) => id <= endBlock) : blocks),
    [blocks, endBlock]
  )

  // If startBlock is set, we only want to show blocks that are greater than startBlock
  const endBlocks = useMemo(
    () => (startBlock ? blocks.filter(({ id }) => id >= startBlock) : blocks),
    [blocks, startBlock]
  )

  const { data: token0Symbol } = useErc20Symbol({
    chainId: 5,
    address: token0 as Address,
  })

  const { data: token1Symbol } = useErc20Symbol({
    chainId: 5,
    address: token1 as Address,
  })

  const { data: token0Decimals } = useErc20Decimals({
    chainId: 5,
    address: token0 as Address,
  })

  const { data: token1Decimals } = useErc20Decimals({
    chainId: 5,
    address: token1 as Address,
  })

  const { data, error, isLoading } = useUniswapV3TwapOracleGetTwaSqrtPriceX96({
    chainId: 5,
    address: env.NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS as Address,
    args:
      startBlock && endBlock
        ? [poolAddress as Address, BigInt(startBlock), BigInt(endBlock)]
        : undefined,
    enabled: Boolean(startBlock && endBlock),
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-12 sm:h-10">Calculate Average Price</Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] sm:w-full">
        <DialogTitle>
          Select two blocks to calculate the average price
        </DialogTitle>
        <div className="mb-1 flex flex-col items-center justify-between gap-x-8 gap-y-4 pt-2 sm:flex-row">
          <Select
            onValueChange={(value) => setStartBlock(Number(value))}
            value={startBlock?.toString()}
          >
            <SelectTrigger className="h-14">
              <SelectValue placeholder="start block" />
            </SelectTrigger>
            <SelectContent className="h-80">
              {startBlocks.map(({ id, timestamp }) => (
                <SelectItem
                  className="flex flex-col"
                  key={id}
                  value={id.toString()}
                >
                  <div>Block: {id}</div>
                  <div className="text-gray-400">
                    {formatDate(timestamp * 1000, {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setEndBlock(Number(value))}
            value={endBlock?.toString()}
          >
            <SelectTrigger className="h-14">
              <SelectValue placeholder="end block" />
            </SelectTrigger>
            <SelectContent className="h-80">
              {endBlocks.map(({ id, timestamp }) => (
                <SelectItem
                  className="flex flex-col hover:bg-neutral-200"
                  key={id}
                  value={id.toString()}
                >
                  <div>Block: {id}</div>
                  <div className="text-gray-400">
                    {formatDate(timestamp * 1000, {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isLoading && <Skeleton className="h-16 w-full" />}
        {data &&
          token0Decimals &&
          token1Decimals &&
          token0Symbol &&
          token1Symbol && (
            <div className="flex w-full flex-col">
              <span className="font-semibold">Pool Average Price:</span>
              <p className="font-semibold">
                {`1 ${token0Symbol} = ${formatUniV3sqrtPriceX96(
                  token0Decimals,
                  token1Decimals,
                  data[0]
                ).toString()} ${token1Symbol}`}
              </p>
              <p className="font-semibold">
                {`1 ${token1Symbol} = ${formatUniV3sqrtPriceX96(
                  token0Decimals,
                  token1Decimals,
                  data[0],
                  true
                ).toString()} ${token0Symbol}`}
              </p>
            </div>
          )}
        {error && <div className="text-red-500">Error: {error.message}</div>}
      </DialogContent>
    </Dialog>
  )
}
