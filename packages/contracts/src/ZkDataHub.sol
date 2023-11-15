// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 <0.9.0;

import { IAxiomV1Query } from "axiom-v1-contracts/contracts/interfaces/IAxiomV1Query.sol";
import { Oracle } from "@uniswap/v3-core/contracts/libraries/Oracle.sol";

/// @title ZK Data Hub
contract ZkDataHub {
    struct AccountData {
        uint64 nonce;
        uint96 balance;
        bytes32 storageRoot;
        bytes32 codeHash;
    }

    struct AxiomResponseStruct {
        bytes32 keccakBlockResponse;
        bytes32 keccakAccountResponse;
        bytes32 keccakStorageResponse;
        IAxiomV1Query.BlockResponse[] blockResponses;
        IAxiomV1Query.AccountResponse[] accountResponses;
        IAxiomV1Query.StorageResponse[] storageResponses;
    }

    address public axiomV1Query;

    mapping(uint256 blockNumber => bytes32 blockHash) public blockData;

    mapping(address account => mapping(uint256 blockNumber => AccountData)) public accountData;

    /// @dev The address of the contract that is requesting the data
    mapping(address contractAddress => mapping(uint256 blockNumber => mapping(uint256 slot => uint256 slotValue)))
        public storageData;

    event BlockStored(uint256 indexed blockNumber, bytes32 indexed blockHash);

    event AccountStored(
        address indexed account,
        uint256 indexed blockNumber,
        uint256 indexed accountNonce,
        uint256 accountBalance,
        bytes32 accountStorageRoot,
        bytes32 accountCodeHash
    );

    event StorageStored(
        address indexed contractAddress, uint256 indexed blockNumber, uint256 indexed slot, uint256 slotValue
    );

    /// @dev Axiom ZK Proof Response is invalid
    error InvalidProof();

    /// @notice Initialize the smart contract
    /// @param _axiomV1Query The address of the AxiomV1Query contract
    constructor(address _axiomV1Query) {
        axiomV1Query = _axiomV1Query;
    }

    function storeQueryResponse(AxiomResponseStruct calldata axiomResponse) external {
        _validateAxiomData(axiomResponse);

        // Store the block responses
        for (uint256 i = 0; i < axiomResponse.blockResponses.length; i++) {
            IAxiomV1Query.BlockResponse memory blockResponse = axiomResponse.blockResponses[i];
            blockData[blockResponse.blockNumber] = blockResponse.blockHash;
            emit BlockStored(blockResponse.blockNumber, blockResponse.blockHash);
        }

        // Store the account responses
        for (uint256 i = 0; i < axiomResponse.accountResponses.length; i++) {
            IAxiomV1Query.AccountResponse memory accountResponse = axiomResponse.accountResponses[i];
            accountData[accountResponse.addr][accountResponse.blockNumber] = AccountData(
                accountResponse.nonce, accountResponse.balance, accountResponse.storageRoot, accountResponse.codeHash
            );
            emit AccountStored(
                accountResponse.addr,
                accountResponse.blockNumber,
                accountResponse.nonce,
                accountResponse.balance,
                accountResponse.storageRoot,
                accountResponse.codeHash
            );
        }

        // Store the storage responses
        for (uint256 i = 0; i < axiomResponse.storageResponses.length; i++) {
            IAxiomV1Query.StorageResponse memory storageResponse = axiomResponse.storageResponses[i];
            storageData[storageResponse.addr][storageResponse.blockNumber][storageResponse.slot] = storageResponse.value;
            emit StorageStored(
                storageResponse.addr, storageResponse.blockNumber, storageResponse.slot, storageResponse.value
            );
        }
    }

    /// @notice Validate the Axiom ZK Proof Response. Reverts if the proof is invalid or if there are no storage
    /// responses
    /// @param axiomResponse The Axiom ZK Proof Response
    function _validateAxiomData(AxiomResponseStruct calldata axiomResponse) internal view returns (bool isValidProof) {
        isValidProof = IAxiomV1Query(axiomV1Query).areResponsesValid(
            axiomResponse.keccakBlockResponse,
            axiomResponse.keccakAccountResponse,
            axiomResponse.keccakStorageResponse,
            axiomResponse.blockResponses,
            axiomResponse.accountResponses,
            axiomResponse.storageResponses
        );

        if (!isValidProof) revert InvalidProof();
    }
}
