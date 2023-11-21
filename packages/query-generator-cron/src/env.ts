import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";

import { z } from "zod";

export const env = createEnv({
  server: {
    GOERLI_PROVIDER_URL: z.string().url(),
    GOERLI_PRIVATE_KEY: z.string().min(64).max(66),
  },
  runtimeEnv: {
    GOERLI_PROVIDER_URL: process.env.GOERLI_PROVIDER_URL,
    GOERLI_PRIVATE_KEY: process.env.GOERLI_PRIVATE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
