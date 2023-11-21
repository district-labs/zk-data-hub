import { AxiomData } from "@axiom-crypto/core/halo2-js";

/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself (see below).
/// They will be auto-parsed into `MyCircuitInputs` type.
export interface MyInputs {
  poolAddress: string;
  poolBlockNumber: number;
}

/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself (see below).
export interface MyCircuitInputs {
  poolBlockNumber: any;
  poolAddress: any;
}

export type MyCircuitCode = (
  halo2Lib: any,
  axiomData: AxiomData,
  myInputs: MyCircuitInputs,
) => Promise<void>;

export const myCircuitFn: MyCircuitCode = async (
  halo2Lib: any,
  axiomData: AxiomData,
  myInputs: MyCircuitInputs,
  // eslint-disable-next-line
) => {
  // ==== Imports to make circuit code work. DO NOT REMOVE. ====
  // These are a list of available standard functions. Once you're finished with your circuit, you can remove the ones the linter says you don't use.
  const { constant } = halo2Lib;
  // These are a list of available functions for getting Ethereum data. Once you're finished with your circuit, you can remove the ones the linter says you don't use.
  const { getStorage, addToCallback } = axiomData;
  // ==== End of imports ====

  // Below is the actual circuit code.
  // Currently doc-hints are not supported in the IDE (coming soon!); for dochints you can write this code in repl.axiom.xyz first and then paste it here.
  // For more detailed docs and a list of all data and compute functions, see our docs at:
  //
  // docs.axiom.xyz/axiom-repl/axiom-repl
  //
  const { poolBlockNumber, poolAddress } = myInputs;

  // Uniswap V3 Pool Observations slot
  const observationsSlot = constant(8);

  // fetch storage data
  const storage = getStorage(poolBlockNumber, poolAddress);

  // access the value at storage slot `observationsSlot`
  const slotValue = storage.slot(observationsSlot);

  addToCallback(poolAddress);
  addToCallback(poolBlockNumber);
  addToCallback(slotValue);
  addToCallback(observationsSlot);

  // If I wanted to do additional computations on the results I got above, I'd do it here.

  // This is the end of the circuit!
};
