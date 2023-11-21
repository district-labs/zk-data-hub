import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://zk-data-hub-production.up.railway.app/",
  documents: ["./**/*.ts", "!src/gql/**/*"],
  generates: {
    "gql/": {
      preset: "client",
      plugins: [],
    },
  },
}

export default config
