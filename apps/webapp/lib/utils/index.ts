import { env } from "@/env.mjs"
// @ts-ignore
import univ3prices from "@thanpolas/univ3prices"
import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  input: string | number,
  options: Intl.DateTimeFormatOptions = {
    minute: "2-digit",
    hour: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", options)
}
export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${path}`
}

export function trimFormattedBalance(
  balance: string | undefined,
  decimals = 4
) {
  if (!balance) {
    return "0"
  }
  const [integer, decimal] = balance.split(".")
  if (!decimal) return integer

  const trimmedDecimal = decimal.slice(0, decimals)
  return `${integer}.${trimmedDecimal}`
}

export function truncateEthAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatUniV3sqrtPriceX96(
  token0Decimals: number | undefined,
  token1Decimals: number | undefined,
  sqrtPriceX96: bigint | undefined,
  inverse = false
) {
  if (!token0Decimals || !token1Decimals || !sqrtPriceX96) return "0"

  // eslint-disable-next-line
  const price: string = univ3prices(
    [token0Decimals, token1Decimals],
    sqrtPriceX96.toString()
  ).toAuto({
    decimalPlaces: 2,
    reverse: inverse,
  })

  return price
}
