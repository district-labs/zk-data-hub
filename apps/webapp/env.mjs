import { createEnv } from "@t3-oss/env-nextjs"
import { isAddress } from "viem"
import { z } from "zod"

export const env = createEnv({
  server: {
    // Iron session requires a secret of at least 32 characters
    NEXTAUTH_SECRET: z
      .string()
      .min(32)
      .default("complex_password_at_least_32_characters_long"),
  },
  client: {
    NEXT_PUBLIC_PONDER_URL: z.string().url(),
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS: z
      .string()
      .refine((value) => isAddress(value)),
  },
  runtimeEnv: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_PONDER_URL: process.env.NEXT_PUBLIC_PONDER_URL,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS:
      process.env.NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS,
  },
})
