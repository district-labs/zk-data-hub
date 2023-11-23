import { createEnv } from "@t3-oss/env-nextjs"
import { isAddress } from "viem"
import { z } from "zod"

export const env = createEnv({
  server: {
    PROVIDER_URI_GOERLI: z.string().url(),
    PRIVATE_KEY: z.string(),
    // Iron session requires a secret of at least 32 characters
    NEXTAUTH_SECRET: z
      .string()
      .min(32)
      .default("complex_password_at_least_32_characters_long"),
  },
  client: {
    NEXT_PUBLIC_PONDER_URL: z.string().url(),
    NEXT_PUBLIC_USE_PUBLIC_PROVIDER: z.enum(["true", "false"]).default("true"),
    NEXT_PUBLIC_PROD_NETWORKS_DEV: z.enum(["true", "false"]).default("false"),
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS: z
      .string()
      .refine((value) => isAddress(value)),
  },
  runtimeEnv: {
    PROVIDER_URI_GOERLI: process.env.PROVIDER_URI_GOERLI,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    NEXT_PUBLIC_PONDER_URL: process.env.NEXT_PUBLIC_PONDER_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_PROD_NETWORKS_DEV: process.env.NEXT_PUBLIC_PROD_NETWORKS_DEV,
    NEXT_PUBLIC_USE_PUBLIC_PROVIDER:
      process.env.NEXT_PUBLIC_USE_PUBLIC_PROVIDER,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS:
      process.env.NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS,
  },
})
