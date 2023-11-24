import { createEnv } from "@t3-oss/env-nextjs"
import { isAddress } from "viem"
import { z } from "zod"

export const env = createEnv({
  client: {
    NEXT_PUBLIC_PONDER_URL: z.string().url(),
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS: z
      .string()
      .refine((value) => isAddress(value)),
  },
  runtimeEnv: {
    NEXT_PUBLIC_PONDER_URL: process.env.NEXT_PUBLIC_PONDER_URL,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS:
      process.env.NEXT_PUBLIC_UNI_V3_TWAP_ORACLE_ADDRESS,
  },
})
