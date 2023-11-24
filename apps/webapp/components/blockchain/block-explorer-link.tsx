import { HTMLAttributes } from "react"
import { Address, useNetwork } from "wagmi"

import { cn } from "@/lib/utils"

interface BlockExplorerLinkProps extends HTMLAttributes<HTMLSpanElement> {
  address: Address | undefined
  showExplorerName?: boolean
  blockExplorerUrl?: string
  type?: "address" | "tx"
}

export const BlockExplorerLink = ({
  address,
  children,
  className,
  blockExplorerUrl,
  showExplorerName,
  type = "address",
  ...props
}: BlockExplorerLinkProps) => {
  const { chain } = useNetwork()
  const blockExplorer = chain?.blockExplorers?.default

  const blockExplorerUrlFinal = blockExplorerUrl ?? blockExplorer?.url

  if (!address) return null

  return (
    <span
      className={cn("overflow-x-auto font-medium underline", className)}
      {...props}
    >
      {blockExplorerUrlFinal && (
        <a
          href={`${blockExplorerUrlFinal}/${type}/${address}`}
          rel="noreferrer"
          target="_blank"
        >
          {showExplorerName && blockExplorer
            ? blockExplorer.name
            : children ?? address}
        </a>
      )}
    </span>
  )
}
