// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import { Script, console2 } from "forge-std/Script.sol";
import { UniswapV3TwapOracle } from "../../src/axiom-v2/UniswapV3TwapOracle.sol";

contract UniswapV3TwapOracleDeploy is Script {
    address public constant AXIOM_V2_QUERY_GOERLI_MOCK_ADDR = 0xf15cc7B983749686Cd1eCca656C3D3E46407DC1f;
    uint64 public constant CHAIN_ID = 5;
    bytes32 public constant QUERY_SCHEMA = 0x79f88a07732a00f4b28e0b65686713c24adf9745fff9cd39bd63a28175e0d8fc;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        UniswapV3TwapOracle uniswapV3TwapOracle = new UniswapV3TwapOracle(
            AXIOM_V2_QUERY_GOERLI_MOCK_ADDR,
            CHAIN_ID,
            QUERY_SCHEMA
        );

        console2.log("UniswapV3TwapOracle deployed at address: ", address(uniswapV3TwapOracle));
        vm.stopBroadcast();
    }
}
