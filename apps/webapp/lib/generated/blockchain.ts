import {
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
  UseContractWriteConfig,
  usePrepareContractWrite,
  UsePrepareContractWriteConfig,
  useContractEvent,
  UseContractEventConfig,
} from "wagmi"
import {
  ReadContractResult,
  WriteContractMode,
  PrepareWriteContractResult,
} from "wagmi/actions"

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UniswapV3TwapOracle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const uniswapV3TwapOracleABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "_axiomV2QueryAddress",
        internalType: "address",
        type: "address",
      },
      {
        name: "_callbackSourceChainId",
        internalType: "uint64",
        type: "uint64",
      },
      {
        name: "_axiomCallbackQuerySchema",
        internalType: "bytes32",
        type: "bytes32",
      },
    ],
  },
  { type: "error", inputs: [], name: "InvalidObservationOrder" },
  { type: "error", inputs: [], name: "InvalidObservationsSlot" },
  { type: "error", inputs: [], name: "InvalidObservationsSlotValue" },
  { type: "error", inputs: [], name: "InvalidSlot0Slot" },
  { type: "error", inputs: [], name: "InvalidSlot0SlotValue" },
  {
    type: "error",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "ObservationAlreadyStored",
  },
  {
    type: "error",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "ObservationNotStored",
  },
  {
    type: "error",
    inputs: [
      { name: "pool", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "Slot0NotStored",
  },
  { type: "error", inputs: [], name: "T" },
  { type: "error", inputs: [], name: "UnchangedCumulativeLiquidity" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "sourceChainId",
        internalType: "uint64",
        type: "uint64",
        indexed: true,
      },
      {
        name: "callerAddr",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "querySchema",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "queryId",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "axiomResults",
        internalType: "bytes32[]",
        type: "bytes32[]",
        indexed: false,
      },
    ],
    name: "AxiomV2Call",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pool", internalType: "address", type: "address", indexed: true },
      {
        name: "blockNumber",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
    ],
    name: "ObservationStored",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "axiomCallbackQuerySchema",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "sourceChainId", internalType: "uint64", type: "uint64" },
      { name: "callerAddr", internalType: "address", type: "address" },
      { name: "querySchema", internalType: "bytes32", type: "bytes32" },
      { name: "queryId", internalType: "uint256", type: "uint256" },
      { name: "axiomResults", internalType: "bytes32[]", type: "bytes32[]" },
      { name: "callbackExtraData", internalType: "bytes", type: "bytes" },
    ],
    name: "axiomV2Callback",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "axiomV2QueryAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "callbackSourceChainId",
    outputs: [{ name: "", internalType: "uint64", type: "uint64" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "poolAddress", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "getObservation",
    outputs: [
      {
        name: "observation",
        internalType: "struct Oracle.Observation",
        type: "tuple",
        components: [
          { name: "blockTimestamp", internalType: "uint32", type: "uint32" },
          { name: "tickCumulative", internalType: "int56", type: "int56" },
          {
            name: "secondsPerLiquidityCumulativeX128",
            internalType: "uint160",
            type: "uint160",
          },
          { name: "initialized", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "poolAddress", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "getSlot0",
    outputs: [
      {
        name: "slot0",
        internalType: "struct UniswapV3Pool.Slot0",
        type: "tuple",
        components: [
          { name: "sqrtPriceX96", internalType: "uint160", type: "uint160" },
          { name: "tick", internalType: "int24", type: "int24" },
          { name: "observationIndex", internalType: "uint16", type: "uint16" },
          {
            name: "observationCardinality",
            internalType: "uint16",
            type: "uint16",
          },
          {
            name: "observationCardinalityNext",
            internalType: "uint16",
            type: "uint16",
          },
          { name: "feeProtocol", internalType: "uint8", type: "uint8" },
          { name: "unlocked", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "poolAddress", internalType: "address", type: "address" },
      { name: "startBlockNumber", internalType: "uint256", type: "uint256" },
      { name: "endBlockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "getTwaLiquidity",
    outputs: [
      { name: "twaLiquidity", internalType: "uint160", type: "uint160" },
      {
        name: "startObservation",
        internalType: "struct Oracle.Observation",
        type: "tuple",
        components: [
          { name: "blockTimestamp", internalType: "uint32", type: "uint32" },
          { name: "tickCumulative", internalType: "int56", type: "int56" },
          {
            name: "secondsPerLiquidityCumulativeX128",
            internalType: "uint160",
            type: "uint160",
          },
          { name: "initialized", internalType: "bool", type: "bool" },
        ],
      },
      {
        name: "endObservation",
        internalType: "struct Oracle.Observation",
        type: "tuple",
        components: [
          { name: "blockTimestamp", internalType: "uint32", type: "uint32" },
          { name: "tickCumulative", internalType: "int56", type: "int56" },
          {
            name: "secondsPerLiquidityCumulativeX128",
            internalType: "uint160",
            type: "uint160",
          },
          { name: "initialized", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "poolAddress", internalType: "address", type: "address" },
      { name: "startBlockNumber", internalType: "uint256", type: "uint256" },
      { name: "endBlockNumber", internalType: "uint256", type: "uint256" },
    ],
    name: "getTwaSqrtPriceX96",
    outputs: [
      { name: "sqrtPriceX96", internalType: "uint160", type: "uint160" },
      {
        name: "startObservation",
        internalType: "struct Oracle.Observation",
        type: "tuple",
        components: [
          { name: "blockTimestamp", internalType: "uint32", type: "uint32" },
          { name: "tickCumulative", internalType: "int56", type: "int56" },
          {
            name: "secondsPerLiquidityCumulativeX128",
            internalType: "uint160",
            type: "uint160",
          },
          { name: "initialized", internalType: "bool", type: "bool" },
        ],
      },
      {
        name: "endObservation",
        internalType: "struct Oracle.Observation",
        type: "tuple",
        components: [
          { name: "blockTimestamp", internalType: "uint32", type: "uint32" },
          { name: "tickCumulative", internalType: "int56", type: "int56" },
          {
            name: "secondsPerLiquidityCumulativeX128",
            internalType: "uint160",
            type: "uint160",
          },
          { name: "initialized", internalType: "bool", type: "bool" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "poolAddress", internalType: "address", type: "address" },
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "slot", internalType: "uint256", type: "uint256" },
    ],
    name: "poolStorageSlots",
    outputs: [{ name: "slotValue", internalType: "uint256", type: "uint256" }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20ABI = [
  {
    type: "event",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "spender", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    name: "Approval",
  },
  {
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
    name: "Transfer",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__.
 */
export function useUniswapV3TwapOracleRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"axiomCallbackQuerySchema"`.
 */
export function useUniswapV3TwapOracleAxiomCallbackQuerySchema<
  TFunctionName extends "axiomCallbackQuerySchema",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "axiomCallbackQuerySchema",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"axiomV2QueryAddress"`.
 */
export function useUniswapV3TwapOracleAxiomV2QueryAddress<
  TFunctionName extends "axiomV2QueryAddress",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "axiomV2QueryAddress",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"callbackSourceChainId"`.
 */
export function useUniswapV3TwapOracleCallbackSourceChainId<
  TFunctionName extends "callbackSourceChainId",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "callbackSourceChainId",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"getObservation"`.
 */
export function useUniswapV3TwapOracleGetObservation<
  TFunctionName extends "getObservation",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "getObservation",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"getSlot0"`.
 */
export function useUniswapV3TwapOracleGetSlot0<
  TFunctionName extends "getSlot0",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "getSlot0",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"getTwaLiquidity"`.
 */
export function useUniswapV3TwapOracleGetTwaLiquidity<
  TFunctionName extends "getTwaLiquidity",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "getTwaLiquidity",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"getTwaSqrtPriceX96"`.
 */
export function useUniswapV3TwapOracleGetTwaSqrtPriceX96<
  TFunctionName extends "getTwaSqrtPriceX96",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "getTwaSqrtPriceX96",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"poolStorageSlots"`.
 */
export function useUniswapV3TwapOraclePoolStorageSlots<
  TFunctionName extends "poolStorageSlots",
  TSelectData = ReadContractResult<typeof uniswapV3TwapOracleABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<
      typeof uniswapV3TwapOracleABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: uniswapV3TwapOracleABI,
    functionName: "poolStorageSlots",
    ...config,
  } as UseContractReadConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__.
 */
export function useUniswapV3TwapOracleWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof uniswapV3TwapOracleABI,
          string
        >["request"]["abi"],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<
        typeof uniswapV3TwapOracleABI,
        TFunctionName,
        TMode
      > & {
        abi?: never
      } = {} as any
) {
  return useContractWrite<typeof uniswapV3TwapOracleABI, TFunctionName, TMode>({
    abi: uniswapV3TwapOracleABI,
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"axiomV2Callback"`.
 */
export function useUniswapV3TwapOracleAxiomV2Callback<
  TMode extends WriteContractMode = undefined
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof uniswapV3TwapOracleABI,
          "axiomV2Callback"
        >["request"]["abi"],
        "axiomV2Callback",
        TMode
      > & { functionName?: "axiomV2Callback" }
    : UseContractWriteConfig<
        typeof uniswapV3TwapOracleABI,
        "axiomV2Callback",
        TMode
      > & {
        abi?: never
        functionName?: "axiomV2Callback"
      } = {} as any
) {
  return useContractWrite<
    typeof uniswapV3TwapOracleABI,
    "axiomV2Callback",
    TMode
  >({
    abi: uniswapV3TwapOracleABI,
    functionName: "axiomV2Callback",
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__.
 */
export function usePrepareUniswapV3TwapOracleWrite<
  TFunctionName extends string
>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof uniswapV3TwapOracleABI, TFunctionName>,
    "abi"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: uniswapV3TwapOracleABI,
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof uniswapV3TwapOracleABI,
    TFunctionName
  >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `functionName` set to `"axiomV2Callback"`.
 */
export function usePrepareUniswapV3TwapOracleAxiomV2Callback(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof uniswapV3TwapOracleABI,
      "axiomV2Callback"
    >,
    "abi" | "functionName"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: uniswapV3TwapOracleABI,
    functionName: "axiomV2Callback",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof uniswapV3TwapOracleABI,
    "axiomV2Callback"
  >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__.
 */
export function useUniswapV3TwapOracleEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof uniswapV3TwapOracleABI, TEventName>,
    "abi"
  > = {} as any
) {
  return useContractEvent({
    abi: uniswapV3TwapOracleABI,
    ...config,
  } as UseContractEventConfig<typeof uniswapV3TwapOracleABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `eventName` set to `"AxiomV2Call"`.
 */
export function useUniswapV3TwapOracleAxiomV2CallEvent(
  config: Omit<
    UseContractEventConfig<typeof uniswapV3TwapOracleABI, "AxiomV2Call">,
    "abi" | "eventName"
  > = {} as any
) {
  return useContractEvent({
    abi: uniswapV3TwapOracleABI,
    eventName: "AxiomV2Call",
    ...config,
  } as UseContractEventConfig<typeof uniswapV3TwapOracleABI, "AxiomV2Call">)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link uniswapV3TwapOracleABI}__ and `eventName` set to `"ObservationStored"`.
 */
export function useUniswapV3TwapOracleObservationStoredEvent(
  config: Omit<
    UseContractEventConfig<typeof uniswapV3TwapOracleABI, "ObservationStored">,
    "abi" | "eventName"
  > = {} as any
) {
  return useContractEvent({
    abi: uniswapV3TwapOracleABI,
    eventName: "ObservationStored",
    ...config,
  } as UseContractEventConfig<
    typeof uniswapV3TwapOracleABI,
    "ObservationStored"
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Read<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi"
  > = {} as any
) {
  return useContractRead({ abi: erc20ABI, ...config } as UseContractReadConfig<
    typeof erc20ABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"allowance"`.
 */
export function useErc20Allowance<
  TFunctionName extends "allowance",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "allowance",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"balanceOf"`.
 */
export function useErc20BalanceOf<
  TFunctionName extends "balanceOf",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "balanceOf",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"decimals"`.
 */
export function useErc20Decimals<
  TFunctionName extends "decimals",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "decimals",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"name"`.
 */
export function useErc20Name<
  TFunctionName extends "name",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "name",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"symbol"`.
 */
export function useErc20Symbol<
  TFunctionName extends "symbol",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "symbol",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"totalSupply"`.
 */
export function useErc20TotalSupply<
  TFunctionName extends "totalSupply",
  TSelectData = ReadContractResult<typeof erc20ABI, TFunctionName>
>(
  config: Omit<
    UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any
) {
  return useContractRead({
    abi: erc20ABI,
    functionName: "totalSupply",
    ...config,
  } as UseContractReadConfig<typeof erc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Write<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof erc20ABI, string>["request"]["abi"],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof erc20ABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, TFunctionName, TMode>({
    abi: erc20ABI,
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function useErc20Approve<TMode extends WriteContractMode = undefined>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          "approve"
        >["request"]["abi"],
        "approve",
        TMode
      > & { functionName?: "approve" }
    : UseContractWriteConfig<typeof erc20ABI, "approve", TMode> & {
        abi?: never
        functionName?: "approve"
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, "approve", TMode>({
    abi: erc20ABI,
    functionName: "approve",
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function useErc20Transfer<TMode extends WriteContractMode = undefined>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          "transfer"
        >["request"]["abi"],
        "transfer",
        TMode
      > & { functionName?: "transfer" }
    : UseContractWriteConfig<typeof erc20ABI, "transfer", TMode> & {
        abi?: never
        functionName?: "transfer"
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, "transfer", TMode>({
    abi: erc20ABI,
    functionName: "transfer",
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function useErc20TransferFrom<
  TMode extends WriteContractMode = undefined
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof erc20ABI,
          "transferFrom"
        >["request"]["abi"],
        "transferFrom",
        TMode
      > & { functionName?: "transferFrom" }
    : UseContractWriteConfig<typeof erc20ABI, "transferFrom", TMode> & {
        abi?: never
        functionName?: "transferFrom"
      } = {} as any
) {
  return useContractWrite<typeof erc20ABI, "transferFrom", TMode>({
    abi: erc20ABI,
    functionName: "transferFrom",
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__.
 */
export function usePrepareErc20Write<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>,
    "abi"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"approve"`.
 */
export function usePrepareErc20Approve(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, "approve">,
    "abi" | "functionName"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: "approve",
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, "approve">)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function usePrepareErc20Transfer(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, "transfer">,
    "abi" | "functionName"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: "transfer",
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, "transfer">)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link erc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function usePrepareErc20TransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof erc20ABI, "transferFrom">,
    "abi" | "functionName"
  > = {} as any
) {
  return usePrepareContractWrite({
    abi: erc20ABI,
    functionName: "transferFrom",
    ...config,
  } as UsePrepareContractWriteConfig<typeof erc20ABI, "transferFrom">)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__.
 */
export function useErc20Event<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, TEventName>,
    "abi"
  > = {} as any
) {
  return useContractEvent({
    abi: erc20ABI,
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Approval"`.
 */
export function useErc20ApprovalEvent(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, "Approval">,
    "abi" | "eventName"
  > = {} as any
) {
  return useContractEvent({
    abi: erc20ABI,
    eventName: "Approval",
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, "Approval">)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link erc20ABI}__ and `eventName` set to `"Transfer"`.
 */
export function useErc20TransferEvent(
  config: Omit<
    UseContractEventConfig<typeof erc20ABI, "Transfer">,
    "abi" | "eventName"
  > = {} as any
) {
  return useContractEvent({
    abi: erc20ABI,
    eventName: "Transfer",
    ...config,
  } as UseContractEventConfig<typeof erc20ABI, "Transfer">)
}
