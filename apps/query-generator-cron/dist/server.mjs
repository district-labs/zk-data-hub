var __getProtoOf = Object.getPrototypeOf;
var __reflectGet = Reflect.get;
var __superGet = (cls, obj, key) => __reflectGet(__getProtoOf(cls), key, obj);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/cron-jobs/axiom-query/send-axiom-query.ts
import { CronJob } from "cron";
import "dotenv/config";

// src/actions/axiom-query/send-axiom-query.ts
import { createPublicClient, http } from "viem";
import { goerli } from "viem/chains";

// src/constants.ts
var UNIV3_POOL_TEST_WETH_USDC = "0xDd4bc61c941CE0e14560c87403E24Fdb94864eFB";
var UNIV3_POOL_TEST_RIZZ_USDC = "0x33E205Fab2d5C9f542860073A190A6d8365A932e";
var UNIV3_POOL_TEST_DIS_USDC = "0xc8EE7720c11038a2Af75B40f4F7989B912584cCB";
var UNI_V3_TEST_POOLS = [
  UNIV3_POOL_TEST_WETH_USDC,
  UNIV3_POOL_TEST_RIZZ_USDC,
  UNIV3_POOL_TEST_DIS_USDC
];

// src/env.ts
import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { isAddress } from "viem";
import { z } from "zod";
var env = createEnv({
  server: {
    GOERLI_PROVIDER_URL: z.string().url(),
    GOERLI_PRIVATE_KEY: z.string().min(64).max(66),
    CALLBACK_ADDRESS: z.string().refine((value) => isAddress(value))
  },
  runtimeEnv: {
    GOERLI_PROVIDER_URL: process.env.GOERLI_PROVIDER_URL,
    GOERLI_PRIVATE_KEY: process.env.GOERLI_PRIVATE_KEY,
    CALLBACK_ADDRESS: process.env.CALLBACK_ADDRESS
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true
});

// src/lib/axiom-v2/index.ts
import {
  Axiom,
  bytes32
} from "@axiom-crypto/core";

// src/lib/axiom-v2/circuit/index.ts
import {
  AxiomCircuitRunner,
  DEFAULT_CIRCUIT_CONFIG,
  autoConfigCircuit
} from "@axiom-crypto/core/halo2-js";
import {
  CircuitScaffold,
  getHalo2LibWasm,
  getHalo2Wasm
} from "@axiom-crypto/core/halo2-js/js";
import { ethers, keccak256, solidityPacked } from "ethers";

// src/lib/axiom-v2/utils/index.ts
var convertToBytes32 = (inputArray) => {
  const result = [];
  for (let i = 0; i < inputArray.length; i += 32) {
    const slice = inputArray.slice(i, i + 32);
    const hex = "0x" + Buffer.from(slice).toString("hex").padStart(64, "0");
    result.push(hex);
  }
  return result;
};
var convertToBytes = (inputArray) => {
  const hex = Buffer.from(inputArray).toString("hex");
  return hex;
};

// src/lib/axiom-v2/circuit/index.ts
var MyAxiomCircuit = class extends CircuitScaffold {
  /// Construct your circuit by providing a JSON-RPC provider URL along with your circuit code.
  constructor(provider, myCircuitCode) {
    super({ shouldTime: false });
    this.provider = new ethers.JsonRpcProvider(provider);
    this.config = DEFAULT_CIRCUIT_CONFIG;
    this.config.numVirtualInstance = 2;
    this.myCircuitCode = myCircuitCode;
  }
  /// Constructors cannot be async, so the rest of the setup is here.
  setup() {
    return __async(this, null, function* () {
      this.halo2wasm = yield getHalo2Wasm(0);
      __superGet(MyAxiomCircuit.prototype, this, "newCircuitFromConfig").call(this, this.config);
      if (this.halo2Lib)
        this.halo2Lib.free();
      this.halo2Lib = getHalo2LibWasm(this.halo2wasm);
    });
  }
  /// Finds optimal configuration for your circuit to give best proving times.
  // eslint-disable-next-line
  tune() {
    return __async(this, null, function* () {
      autoConfigCircuit(this.halo2wasm, this.config);
    });
  }
  loadPrebuilt(config, pkey, vkey) {
    this.config = config;
    this.pkey = pkey;
    this.vkey = vkey;
    super.loadParams();
    this.halo2wasm.loadPk(pkey);
    this.halo2wasm.loadVk(vkey);
  }
  /// The circuit needs a default input to be able to run once and precompute
  /// some information (this is called the proving key).
  build(defaultInputs2) {
    return __async(this, null, function* () {
      const { results } = yield AxiomCircuitRunner(
        this.halo2wasm,
        this.halo2Lib,
        this.config,
        this.provider
      ).build(this.myCircuitCode, defaultInputs2);
      this.tune();
      this.newCircuitFromConfig(this.config);
      const { numUserInstances } = yield AxiomCircuitRunner(
        this.halo2wasm,
        this.halo2Lib,
        this.config,
        this.provider
      ).run(this.myCircuitCode, defaultInputs2, results);
      yield this.keygen();
      this.resultLen = numUserInstances / 2;
      this.vkey = this.halo2wasm.getVk();
      this.pkey = this.halo2wasm.getPk();
    });
  }
  run(inputs) {
    return __async(this, null, function* () {
      const runner = AxiomCircuitRunner(
        this.halo2wasm,
        this.halo2Lib,
        this.config,
        this.provider
      );
      const { orderedDataQuery, results } = yield runner.build(
        this.myCircuitCode,
        inputs
      );
      const { numUserInstances } = yield runner.run(
        this.myCircuitCode,
        inputs,
        results
      );
      this.prove();
      this.resultLen = numUserInstances / 2;
      this.subqueries = orderedDataQuery;
    });
  }
  getProvingKey() {
    if (!this.pkey)
      throw new Error("You need to build your circuit first!");
    return this.pkey;
  }
  getVerifyingKey() {
    if (!this.vkey)
      throw new Error("You need to build your circuit first!");
    return this.vkey;
  }
  getPartialVkey() {
    if (!this.vkey)
      throw new Error("You need to build your circuit first!");
    const vkey = this.halo2wasm.getPartialVk();
    return convertToBytes32(vkey);
  }
  getQuerySchema() {
    if (!this.vkey)
      throw new Error("You need to build your circuit first!");
    const partialVk = this.halo2wasm.getPartialVk();
    const vk = convertToBytes32(partialVk);
    const packed = solidityPacked(
      ["uint8", "uint16", "uint8", "bytes32[]"],
      [this.config.k, this.resultLen, vk.length, vk]
    );
    return keccak256(packed);
  }
  getComputeProof() {
    if (!this.proof || !this.resultLen)
      throw new Error("No proof generated");
    let proofString = "";
    const instances = this.getInstances();
    for (let i = 0; i < this.resultLen; i++) {
      const instanceHi = BigInt(instances[2 * i]);
      const instanceLo = BigInt(instances[2 * i + 1]);
      const instance = instanceHi * BigInt(2 ** 128) + instanceLo;
      const instanceString = instance.toString(16).padStart(64, "0");
      proofString += instanceString;
    }
    proofString += convertToBytes(this.proof);
    return "0x" + proofString;
  }
  getComputeQuery() {
    const vkey = this.getPartialVkey();
    const computeProof = this.getComputeProof();
    return {
      k: this.config.k,
      resultLen: this.resultLen,
      vkey,
      computeProof
    };
  }
  getDataQuery() {
    return __async(this, null, function* () {
      if (!this.subqueries) {
        throw new Error("You must run your circuit first!");
      }
      const network = yield this.provider.getNetwork();
      const sourceChainId = network.chainId.toString();
      return {
        sourceChainId,
        subqueries: this.subqueries
      };
    });
  }
  generateQuery(axiom2, callback) {
    return __async(this, null, function* () {
      const dataQuery = yield this.getDataQuery();
      const computeQuery = this.getComputeQuery();
      const query = axiom2.query.new();
      query.setBuiltDataQuery(dataQuery);
      query.setComputeQuery(computeQuery);
      query.setCallback(callback);
      const built = yield query.build();
      const payment = yield query.calculateFee();
      return {
        query,
        builtQuery: built,
        payment
      };
    });
  }
};

// src/lib/axiom-v2/circuit/circuit.ts
var myCircuitFn = (halo2Lib, axiomData, myInputs) => __async(void 0, null, function* () {
  const { constant } = halo2Lib;
  const { getStorage, addToCallback } = axiomData;
  const { poolBlockNumber, poolAddress } = myInputs;
  const slot0Slot = constant(0);
  const observationsSlot = constant(8);
  const storage = getStorage(poolBlockNumber, poolAddress);
  const observationsSlotValue = storage.slot(observationsSlot);
  const slot0SlotValue = storage.slot(slot0Slot);
  addToCallback(poolAddress);
  addToCallback(poolBlockNumber);
  addToCallback(observationsSlotValue);
  addToCallback(observationsSlot);
  addToCallback(slot0SlotValue);
  addToCallback(slot0Slot);
});

// src/lib/axiom-v2/index.ts
var axiom = new Axiom({
  providerUri: env.GOERLI_PROVIDER_URL,
  privateKey: env.GOERLI_PRIVATE_KEY,
  version: "v2",
  chainId: 5,
  // Goerli
  mock: true
  // generate Mock proofs for faster development
});
var defaultInputs = {
  poolBlockNumber: 10076470,
  poolAddress: "0x5c33044BdBbE55dAb3d526CE70F908aAF6990373"
};
function generateQuery(loadedCircuit, poolBlockNumber, poolAddress, callbackAddr) {
  return __async(this, null, function* () {
    const callback = {
      target: callbackAddr,
      extraData: bytes32(0)
    };
    const input = {
      poolBlockNumber,
      poolAddress
    };
    yield loadedCircuit.run(input);
    return loadedCircuit.generateQuery(axiom, callback);
  });
}
var axiomMain = (_0, _1) => __async(void 0, [_0, _1], function* ({ poolAddress, poolBlockNumber }, callbackAddr) {
  const customCircuit = new MyAxiomCircuit(
    env.GOERLI_PROVIDER_URL,
    myCircuitFn
  );
  yield customCircuit.setup();
  yield customCircuit.build(defaultInputs);
  const querySchema = customCircuit.getQuerySchema();
  console.log("Query schema: ", querySchema);
  const { query, builtQuery, payment } = yield generateQuery(
    customCircuit,
    poolBlockNumber,
    poolAddress,
    callbackAddr
  );
  console.log("Query built with the following params:", builtQuery);
  console.log(
    "Sending a Query to AxiomV2QueryMock with payment amount (wei):",
    payment
  );
  const queryId = yield query.sendOnchainQuery(
    payment,
    (receipt) => {
      console.log("receipt", receipt);
    }
  );
  console.log(
    "View your Query on Axiom Explorer:",
    `https://explorer.axiom.xyz/v2/goerli/mock/query/${queryId}`
  );
  return queryId;
});

// src/actions/axiom-query/send-axiom-query.ts
function sendAxiomQuery() {
  return __async(this, null, function* () {
    try {
      const client = createPublicClient({
        chain: goerli,
        transport: http(env.GOERLI_PROVIDER_URL)
      });
      const blockNumber = yield client.getBlockNumber();
      for (let i = 0; i < UNI_V3_TEST_POOLS.length; i++) {
        yield axiomMain(
          {
            poolBlockNumber: Number(blockNumber),
            poolAddress: UNI_V3_TEST_POOLS[i]
          },
          env.CALLBACK_ADDRESS
        );
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  });
}

// src/cron-jobs/axiom-query/send-axiom-query.ts
var jobSendAxiomQuery = new CronJob(
  "0 */30 * * * *",
  // cronTime
  function() {
    return __async(this, null, function* () {
      console.log("Sending Axiom queries");
      yield sendAxiomQuery();
    });
  },
  // onTick
  null,
  // onComplete
  true,
  // start
  "America/Los_Angeles"
  // timeZone
);

// src/server.ts
jobSendAxiomQuery.start();
//# sourceMappingURL=server.mjs.map