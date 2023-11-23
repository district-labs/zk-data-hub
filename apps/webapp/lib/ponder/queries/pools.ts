import { graphql } from "@/gql"

export const allPoolsWithBlocks = graphql(/* GraphQL */ `
  query getPools {
    uniswapV3Pools {
      id
      token0
      token1
      fee
      blocks {
        block {
          id
          timestamp
        }
      }
    }
  }
`)

export const getPoolInfo = graphql(/* GraphQL */ `
  query getPoolInfo($poolId: String!) {
    uniswapV3Pool(id: $poolId) {
      id
      token0
      token1
      fee
      blocks {
        block {
          id
          timestamp
        }
      }
    }
  }
`)
