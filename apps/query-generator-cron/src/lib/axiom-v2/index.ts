// import { env } from "@/env.mjs";
import {
  Axiom,
  BuiltQueryV2,
  QueryBuilderV2,
  bytes32,
} from "@axiom-crypto/core";
import { ethers } from "ethers";
import type { Address } from "viem";
import { env } from "../../env";
import { MyAxiomCircuit } from "./circuit";
import { myCircuitFn, type MyInputs } from "./circuit/circuit";

// Axiom SDK
const axiom = new Axiom({
  providerUri: env.GOERLI_PROVIDER_URL,
  privateKey: env.GOERLI_PRIVATE_KEY,
  version: "v2",
  chainId: 5, // Goerli
  mock: true, // generate Mock proofs for faster development
});

const defaultInputs: MyInputs = {
  poolBlockNumber: 10076470,
  poolAddress: "0x5c33044BdBbE55dAb3d526CE70F908aAF6990373",
};

async function generateQuery(
  loadedCircuit: MyAxiomCircuit,
  poolBlockNumber: number,
  poolAddress: string,
  callbackAddr: string,
): Promise<{
  query: QueryBuilderV2;
  builtQuery: BuiltQueryV2;
  payment: string;
}> {
  const callback = {
    target: callbackAddr,
    extraData: bytes32(0),
  };
  const input: MyInputs = {
    poolBlockNumber,
    poolAddress,
  };
  await loadedCircuit.run(input);
  return loadedCircuit.generateQuery(axiom, callback);
}

export const axiomMain = async (
  { poolAddress, poolBlockNumber }: MyInputs,
  callbackAddr: Address,
) => {
  const customCircuit = new MyAxiomCircuit(
    env.GOERLI_PROVIDER_URL,
    myCircuitFn,
  );
  await customCircuit.setup();

  // This only needs to be done once to lock the structure of your circuit.
  await customCircuit.build(defaultInputs);
  const querySchema = customCircuit.getQuerySchema();
  console.log("Query schema: ", querySchema);

  const { query, builtQuery, payment } = await generateQuery(
    customCircuit,
    poolBlockNumber,
    poolAddress,
    callbackAddr,
  );
  console.log("Query built with the following params:", builtQuery);

  console.log(
    "Sending a Query to AxiomV2QueryMock with payment amount (wei):",
    payment,
  );

  const queryId = await query.sendOnchainQuery(
    payment,
    (receipt: ethers.ContractTransactionReceipt) => {
      // You can do something here once you've received the receipt
      console.log("receipt", receipt);
    },
  );

  console.log(
    "View your Query on Axiom Explorer:",
    `https://explorer.axiom.xyz/v2/goerli/mock/query/${queryId}`,
  );

  return queryId;
};
