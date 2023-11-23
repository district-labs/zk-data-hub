// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Networks
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
import { env } from "@/env.mjs"
import { Chain, ChainProviderFn, configureChains } from "wagmi"
import { goerli as goerliNoIcon } from "wagmi/chains"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { publicProvider } from "wagmi/providers/public"

const goerli = {
  ...goerliNoIcon,
  iconUrl: "/icons/NetworkEthereumTest.svg",
}

export const CHAINS: Chain[] = [goerli]

const PROVIDERS: ChainProviderFn<Chain>[] = []

if (env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  if (!env.NEXT_PUBLIC_ALCHEMY_API_KEY)
    throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not defined")
  PROVIDERS.push(
    alchemyProvider({
      apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    })
  )
}

// Fallback to public provider
// Only include public provider if no other providers are available.
if (PROVIDERS.length === 0 || env.NEXT_PUBLIC_USE_PUBLIC_PROVIDER === "true") {
  PROVIDERS.push(publicProvider())
}

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  CHAINS,
  PROVIDERS
)
