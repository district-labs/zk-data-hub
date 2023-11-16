// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import { Oracle } from "@uniswap/v3-core/contracts/libraries/Oracle.sol";
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

    /// @notice Mapping of keccak256(poolAddress, blockNumber) => observation
    /// @dev observation.blockNumber == 0 indicates that the observation is not yet initialized
    mapping(bytes32 observationHash => Oracle.Observation observation) public observations;

    /*//////////////////////////////////////////////////////////////////////////
                                  CONSTANTS
    //////////////////////////////////////////////////////////////////////////*/

    uint256 private constant POOL_OBSERVATIONS_SLOT = 8;

    /*//////////////////////////////////////////////////////////////////////////
                                   EVENTS
    //////////////////////////////////////////////////////////////////////////*/

    event ObservationStored(address indexed pool, uint256 indexed blockNumber);

    /*//////////////////////////////////////////////////////////////////////////
                                CUSTOM ERRORS
    //////////////////////////////////////////////////////////////////////////*/

    /// @dev observation not yet stored under the observations mapping
    error ObservationNotStored(address pool, uint256 blockNumber);

    error InvalidSlotValue();

    error InvalidObservationsSlot();

    /// @dev start observation block number is greater than the end observation block number
    error InvalidObservationOrder();

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
        observation = observations[_getObservationHash(poolAddress, blockNumber)];
        if (observation.blockTimestamp == 0) {
            revert ObservationNotStored(poolAddress, blockNumber);
        }
    }

    /// @notice Get the time weighted average tick for a given pool and block number range
    /// @param poolAddress The address of the pool
    /// @param startBlockNumber The start block number of the range
    /// @param endBlockNumber The end block number of the range
    /// @return twaTick The time weighted average tick
    /// @return startObservation The observation at the start block number
    /// @return endObservation The observation at the end block number
    function getTwaTick(
        address poolAddress,
        uint256 startBlockNumber,
        uint256 endBlockNumber
    )
        external
        view
        returns (int24 twaTick, Oracle.Observation memory startObservation, Oracle.Observation memory endObservation)
    {
        startObservation = getObservation(poolAddress, startBlockNumber);
        endObservation = getObservation(poolAddress, endBlockNumber);

        twaTick = _calculateTwaTick(startObservation, endObservation);
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
        startObservation = getObservation(poolAddress, startBlockNumber);
        endObservation = getObservation(poolAddress, endBlockNumber);

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

    /// @notice Calculate the time weighted average tick for a given observation range
    /// @param startObservation The observation at the start block number
    /// @param endObservation The observation at the end block number
    /// @return twaTick The time weighted average tick
    function _calculateTwaTick(
        Oracle.Observation memory startObservation,
        Oracle.Observation memory endObservation
    )
        internal
        pure
        returns (int24 twaTick)
    {
        if (startObservation.blockTimestamp >= endObservation.blockTimestamp) revert InvalidObservationOrder();

        uint32 secondsElapsed = endObservation.blockTimestamp - startObservation.blockTimestamp;

        twaTick =
            int24((endObservation.tickCumulative - startObservation.tickCumulative) / int56(uint56(secondsElapsed)));
    }

    /// @notice Get the observation hash for a given pool and block number
    /// @param poolAddress The address of the pool
    /// @param blockNumber The block number of the observation
    /// @return observationHash The observation hash
    function _getObservationHash(address poolAddress, uint256 blockNumber) internal pure returns (bytes32) {
        return keccak256(abi.encode(poolAddress, blockNumber));
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

        if( observationsSlotValue == 0 ) revert InvalidSlotValue();
        if( observationsSlot != POOL_OBSERVATIONS_SLOT) revert InvalidObservationsSlot();

        Oracle.Observation memory observation = _unpackObservation(observationsSlotValue);

        observations[_getObservationHash(poolAddress, blockNumber)] = observation;

        emit ObservationStored(poolAddress, blockNumber);
    }

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
