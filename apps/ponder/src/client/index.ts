import { createPublicClient, http } from "viem";
import { goerli } from "viem/chains";

export const goerliClient = createPublicClient({
  chain: goerli,
  transport: http(process.env.PONDER_RPC_URL_GOERLI),
});
