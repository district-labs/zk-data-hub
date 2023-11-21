import { createPublicClient, http } from "viem";
import { goerli } from "viem/chains";
import { CALLBACK_ADDR, UNI_V3_TEST_POOLS } from "../../constants";
import { env } from "../../env";
import { axiomMain } from "../../lib/axiom-v2";

export async function sendAxiomQuery() {
  try {
    const client = createPublicClient({
      chain: goerli,
      transport: http(env.GOERLI_PROVIDER_URL),
    });

    const blockNumber = await client.getBlockNumber();

    for (let i = 0; i < UNI_V3_TEST_POOLS.length; i++) {
      await axiomMain(
        {
          poolBlockNumber: Number(blockNumber),
          poolAddress: UNI_V3_TEST_POOLS[i],
        },
        CALLBACK_ADDR,
      );
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}
