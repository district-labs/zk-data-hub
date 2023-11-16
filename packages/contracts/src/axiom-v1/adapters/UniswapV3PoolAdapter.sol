// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import { Oracle } from "@uniswap/v3-core/contracts/libraries/Oracle.sol";
import { UniswapV3Pool } from "@uniswap/v3-core/contracts/UniswapV3Pool.sol";
import { ZkDataHubAdapter } from "./ZkDataHubAdapter.sol";

/// @title Uniswap V3 Pool Adapter
contract UniswapV3PoolAdapter is ZkDataHubAdapter {
    /*//////////////////////////////////////////////////////////////////////////
                                  CONSTANTS
    //////////////////////////////////////////////////////////////////////////*/

    uint8 private constant POOL_SLOT0_SLOT = 0;
    uint8 private constant POOL_OBSERVATIONS_SLOT = 8;

    /*//////////////////////////////////////////////////////////////////////////
                                CUSTOM ERRORS
    //////////////////////////////////////////////////////////////////////////*/

    /// @dev observation not yet stored under the observations mapping
    error ObservationNotStored(address pool, uint256 blockNumber);

    /// @dev slot0 not yet stored under the slot0 mapping
    error Slot0NotStored(address pool, uint256 blockNumber);

    /// @dev start observation block number is greater than the end observation block number
    error InvalidObservationOrder();

    /*//////////////////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////////////////*/

    constructor(address _zkDataHub) ZkDataHubAdapter(_zkDataHub) { }

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
        observation = _unpackObservation(_getStorageData(poolAddress, blockNumber, POOL_OBSERVATIONS_SLOT));

        if (observation.blockTimestamp == 0) {
            revert ObservationNotStored(poolAddress, blockNumber);
        }
    }

    function getSlot0(
        address poolAddress,
        uint256 blockNumber
    )
        public
        view
        returns (UniswapV3Pool.Slot0 memory slot0)
    {
        slot0 = _unpackSlot0(_getStorageData(poolAddress, blockNumber, POOL_SLOT0_SLOT));

        if (slot0.sqrtPriceX96 == 0) {
            revert Slot0NotStored(poolAddress, blockNumber);
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

    /// @notice Unpack an observation from a storage response value
    /// @param slotValue The storage response value
    /// @return observation The unpacked observation struct
    function _unpackObservation(uint256 slotValue) internal pure returns (Oracle.Observation memory) {
        return Oracle.Observation({
            blockTimestamp: uint32(slotValue),
            tickCumulative: int56(uint56(slotValue >> 32)),
            secondsPerLiquidityCumulativeX128: uint160(slotValue >> 88),
            initialized: true
        });
    }

    function _unpackSlot0(uint256 slotValue) internal pure returns (UniswapV3Pool.Slot0 memory) {
        return UniswapV3Pool.Slot0({
            sqrtPriceX96: uint160(slotValue),
            tick: int24(uint24(slotValue >> 160)),
            observationIndex: uint16(slotValue >> 184),
            observationCardinality: uint16(slotValue >> 200),
            observationCardinalityNext: uint16(slotValue >> 216),
            feeProtocol: uint8(slotValue >> 232),
            unlocked: slotValue >> 240 == 1
        });
    }
}
