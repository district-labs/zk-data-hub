// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import { ZkDataHub } from "../ZkDataHub.sol";

/// @title Zk Data Hub Adapter
contract ZkDataHubAdapter {
    address public zkDataHub;

    constructor(address _zkDataHub) {
        zkDataHub = _zkDataHub;
    }

    function _getBlockData(uint256 blockNumber) internal view returns (bytes32) {
        return ZkDataHub(zkDataHub).blockData(blockNumber);
    }

    function _getAccountData(
        address account,
        uint256 blockNumber
    )
        internal
        view
        returns (uint64 nonce, uint96 balance, bytes32 storageRoot, bytes32 codeHash)
    {
        return ZkDataHub(zkDataHub).accountData(account, blockNumber);
    }

    function _getStorageData(address poolAddress, uint256 blockNumber, uint256 slot) internal view returns (uint256) {
        return ZkDataHub(zkDataHub).storageData(poolAddress, blockNumber, slot);
    }
}
