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
