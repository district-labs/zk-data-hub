// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import { Oracle } from "@uniswap/v3-core/contracts/libraries/Oracle.sol";
import { TickMath } from "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import { UniswapV3Pool } from "@uniswap/v3-core/contracts/UniswapV3Pool.sol";
import { AxiomV2Client } from "./abstracts/AxiomV2Client.sol";

/// @title Uniswap V3 Twap Oracle
/// @notice A contract that stores historical Uniswap V3 observations proved by ZK proofs using Axiom and calculates
/// time weighted average ticks and time weighted average inverse liquidity
/// @dev This contract is intended to be used in combination with an off-chain system that provides proofs for new
/// observations
contract UniswapV3TwapOracle is AxiomV2Client {
    /*//////////////////////////////////////////////////////////////////////////
                                PUBLIC STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    uint64 public callbackSourceChainId;
    bytes32 public axiomCallbackQuerySchema;

    /// @notice The mapping of Uniswap V3 pool addresses to block numbers to storage slots to storage slot values.
    /// Allowing the storage of different slots of any pool at any block number.
    mapping(address poolAddress => mapping(uint256 blockNumber => mapping(uint256 slot => uint256 slotValue))) public
        poolStorageSlots;

    /*//////////////////////////////////////////////////////////////////////////
                                  CONSTANTS
    //////////////////////////////////////////////////////////////////////////*/

    uint256 private constant POOL_SLOT_0 = 0;
    uint256 private constant POOL_OBSERVATIONS_SLOT = 8;

    /*//////////////////////////////////////////////////////////////////////////
                                   EVENTS
    //////////////////////////////////////////////////////////////////////////*/

    event ObservationStored(address indexed pool, uint256 indexed blockNumber);

    /*//////////////////////////////////////////////////////////////////////////
                                CUSTOM ERRORS
    //////////////////////////////////////////////////////////////////////////*/

    /// @dev observation not yet stored under the poolStorageSlots mapping
    error ObservationNotStored(address pool, uint256 blockNumber);

    /// @dev slot0 not yet stored under the poolStorageSlots mapping
    error Slot0NotStored(address pool, uint256 blockNumber);

    /// @dev observations slot has to be equal to POOL_OBSERVATIONS_SLOT
    error InvalidObservationsSlot();

    /// @dev observations slot value cannot be 0
    error InvalidObservationsSlotValue();

    /// @dev slot0 slot has to be equal to POOL_SLOT_0
    error InvalidSlot0Slot();

    /// @dev slot0 slot value cannot be 0
    error InvalidSlot0SlotValue();

    /// @dev start observation block number is greater than the end observation block number
    error InvalidObservationOrder();

    /// @dev the observation of a given pool and block number has already been stored
    error ObservationAlreadyStored(address pool, uint256 blockNumber);

    /// @dev the two observations have the same secondsPerLiquidityCumulativeX128 value
    error UnchangedCumulativeLiquidity();

    /*//////////////////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Initialize the smart contract
    constructor(
        address _axiomV2QueryAddress,
        uint64 _callbackSourceChainId,
        bytes32 _axiomCallbackQuerySchema
    )
        AxiomV2Client(_axiomV2QueryAddress)
    {
        callbackSourceChainId = _callbackSourceChainId;
        axiomCallbackQuerySchema = _axiomCallbackQuerySchema;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                READ FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Get the observation for a given pool and block number
    /// @param poolAddress The address of the pool
    /// @param blockNumber The block number of the observation
    /// @return observation The observation struct
    function getObservation(
        address poolAddress,
        uint256 blockNumber
    )
        public
        view
        returns (Oracle.Observation memory observation)
    {
        uint256 observationSlotValue = poolStorageSlots[poolAddress][blockNumber][POOL_OBSERVATIONS_SLOT];

        if (observationSlotValue == 0) {
            revert ObservationNotStored(poolAddress, blockNumber);
        }

        observation = _unpackObservation(observationSlotValue);
    }

    /// @notice Get the slot0 for a given pool and block number
    /// @param poolAddress The address of the pool
    /// @param blockNumber The block number of the slot0
    /// @return slot0 The slot0 struct
    function getSlot0(
        address poolAddress,
        uint256 blockNumber
    )
        public
        view
        returns (UniswapV3Pool.Slot0 memory slot0)
    {
        uint256 slot0SlotValue = poolStorageSlots[poolAddress][blockNumber][POOL_SLOT_0];

        if (slot0SlotValue == 0) {
            revert Slot0NotStored(poolAddress, blockNumber);
        }

        slot0 = _unpackSlot0(slot0SlotValue);
    }

    /// @notice Get the time weighted average price for a given pool and block number range
    /// @param poolAddress The address of the pool
    /// @param startBlockNumber The start block number of the range
    /// @param endBlockNumber The end block number of the range
    /// @return sqrtPriceX96 The time weighted average price
    /// @return startObservation The observation at the start block number
    /// @return endObservation The observation at the end block number
    function getTwaSqrtPriceX96(
        address poolAddress,
        uint256 startBlockNumber,
        uint256 endBlockNumber
    )
        external
        view
        returns (
            uint160 sqrtPriceX96,
            Oracle.Observation memory startObservation,
            Oracle.Observation memory endObservation
        )
    {
        if (startBlockNumber > endBlockNumber) {
            revert InvalidObservationOrder();
        }

        startObservation = getObservation(poolAddress, startBlockNumber);
        endObservation = getObservation(poolAddress, endBlockNumber);

        if (
            startObservation.tickCumulative == endObservation.tickCumulative
                || startObservation.blockTimestamp == endObservation.blockTimestamp
        ) {
            UniswapV3Pool.Slot0 memory slot0 = getSlot0(poolAddress, endBlockNumber);
            sqrtPriceX96 = slot0.sqrtPriceX96;
        } else {
            sqrtPriceX96 = _calculateTwaSqrtPriceX96(startObservation, endObservation);
        }
    }

    /// @notice Get the time weighted average inverse liquidity for a given pool and block number range
    /// @param poolAddress The address of the pool
    /// @param startBlockNumber The start block number of the range
    /// @param endBlockNumber The end block number of the range
    /// @return twaLiquidity The time weighted average inverse liquidity
    /// @return startObservation The observation at the start block number
    /// @return endObservation The observation at the end block number
    function getTwaLiquidity(
        address poolAddress,
        uint256 startBlockNumber,
        uint256 endBlockNumber
    )
        external
        view
        returns (
            uint160 twaLiquidity,
            Oracle.Observation memory startObservation,
            Oracle.Observation memory endObservation
        )
    {
        if (startBlockNumber > endBlockNumber) {
            revert InvalidObservationOrder();
        }

        startObservation = getObservation(poolAddress, startBlockNumber);
        endObservation = getObservation(poolAddress, endBlockNumber);

        if (startObservation.secondsPerLiquidityCumulativeX128 == endObservation.secondsPerLiquidityCumulativeX128) {
            revert UnchangedCumulativeLiquidity();
        }

        twaLiquidity = _calculateTwaLiquidity(startObservation, endObservation);
    }

    /*//////////////////////////////////////////////////////////////////////////
                              INTERNAL READ FUNCTIONS
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Calculate the time weighted average inverse liquidity for a given observation range
    /// @param startObservation The observation at the start block number
    /// @param endObservation The observation at the end block number
    /// @return twaLiquidity The time weighted average inverse liquidity
    function _calculateTwaLiquidity(
        Oracle.Observation memory startObservation,
        Oracle.Observation memory endObservation
    )
        internal
        pure
        returns (uint160 twaLiquidity)
    {
        if (startObservation.blockTimestamp >= endObservation.blockTimestamp) revert InvalidObservationOrder();

        uint32 secondsElapsed = endObservation.blockTimestamp - startObservation.blockTimestamp;

        twaLiquidity = ((uint160(1) << 128) * secondsElapsed)
            / (endObservation.secondsPerLiquidityCumulativeX128 - startObservation.secondsPerLiquidityCumulativeX128);
    }

    /// @notice Calculate the time weighted average price for a given observation range
    /// @param startObservation The observation at the start block number
    /// @param endObservation The observation at the end block number
    /// @return sqrtPriceX96 The time weighted average price
    function _calculateTwaSqrtPriceX96(
        Oracle.Observation memory startObservation,
        Oracle.Observation memory endObservation
    )
        internal
        pure
        returns (uint160 sqrtPriceX96)
    {
        uint32 secondsElapsed = endObservation.blockTimestamp - startObservation.blockTimestamp;

        int24 twaTick =
            int24((endObservation.tickCumulative - startObservation.tickCumulative) / int56(uint56(secondsElapsed)));

        sqrtPriceX96 = TickMath.getSqrtRatioAtTick(twaTick);
    }

    /// @notice Unpack an observation from a storage response value
    /// @param observation The observation uint256 storage response value
    /// @return observation The unpacked observation struct
    function _unpackObservation(uint256 observation) internal pure returns (Oracle.Observation memory) {
        return Oracle.Observation({
            blockTimestamp: uint32(observation),
            tickCumulative: int56(uint56(observation >> 32)),
            secondsPerLiquidityCumulativeX128: uint160(observation >> 88),
            initialized: true
        });
    }

    /// @notice Unpack a slot0 from a storage response value
    /// @param slot0 The slot0 uint256 storage response value
    /// @return slot0 The unpacked slot0 struct
    function _unpackSlot0(uint256 slot0) internal pure returns (UniswapV3Pool.Slot0 memory) {
        return UniswapV3Pool.Slot0({
            sqrtPriceX96: uint160(slot0),
            tick: int24(int256(slot0 >> 160)),
            observationIndex: uint16(slot0 >> 184),
            observationCardinality: uint16(slot0 >> 200),
            observationCardinalityNext: uint16(slot0 >> 216),
            feeProtocol: uint8(slot0 >> 232),
            unlocked: slot0 >> 240 == 1
        });
    }

    /// @notice Axiom V2 callback function, called by the Axiom V2 query contract
    function _axiomV2Callback(
        uint64 sourceChainId,
        address callerAddr,
        bytes32 querySchema,
        uint256 queryId,
        bytes32[] calldata axiomResults,
        bytes calldata extraData
    )
        internal
        virtual
        override
    {
        // Parse results
        address poolAddress = address(uint160(uint256(axiomResults[0])));
        uint32 blockNumber = uint32(uint256(axiomResults[1]));
        uint256 observationsSlotValue = uint256(axiomResults[2]);
        uint256 observationsSlot = uint256(axiomResults[3]);
        uint256 slot0SlotValue = uint256(axiomResults[4]);
        uint256 slot0Slot = uint256(axiomResults[5]);

        if (observationsSlotValue == 0) revert InvalidObservationsSlotValue();
        if (observationsSlot != POOL_OBSERVATIONS_SLOT) revert InvalidObservationsSlot();

        if (slot0SlotValue == 0) revert InvalidSlot0SlotValue();
        if (slot0Slot != POOL_SLOT_0) revert InvalidSlot0Slot();

        if (poolStorageSlots[poolAddress][blockNumber][POOL_OBSERVATIONS_SLOT] != 0) {
            revert ObservationAlreadyStored(poolAddress, blockNumber);
        }

        poolStorageSlots[poolAddress][blockNumber][POOL_OBSERVATIONS_SLOT] = observationsSlotValue;
        poolStorageSlots[poolAddress][blockNumber][POOL_SLOT_0] = slot0SlotValue;

        emit ObservationStored(poolAddress, blockNumber);
    }

    /// @notice Validate the Axiom V2 call
    /// @param sourceChainId The source chain id of the Axiom V2 call
    /// @param callerAddr The caller address of the Axiom V2 call
    /// @param querySchema The query schema of the Axiom V2 call
    function _validateAxiomV2Call(
        uint64 sourceChainId,
        address callerAddr,
        bytes32 querySchema
    )
        internal
        virtual
        override
    {
        require(sourceChainId == callbackSourceChainId, "AxiomV2: caller sourceChainId mismatch");
        require(querySchema == axiomCallbackQuerySchema, "AxiomV2: query schema mismatch");
    }
}
