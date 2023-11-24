## ZK Data Hub Contracts

The contracts for the ZK Data Hub are split in two versions:
- [Axiom V1](packages/contracts/src/axiom-v1): The first version of the data hub, supporting Axiom V1 proofs.
- [Axiom V2](packages/contracts/src/axiom-v2): The up to date version of the data hub, supporting Axiom V2 proofs.

The UniV3 TWAP oracle is implemented in the [UniswapV3TwapOracle.sol](src/axiom-v2/UniswapV3TwapOracle.sol) contract.

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
source .env
forge script script/deploy/UniswapV3TwapOracleDeploy.s.sol  --rpc-url $GOERLI_RPC_URL --broadcast --verify 
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
