// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Site
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
interface SiteConfig {
  name: string
  title: string
  emoji: string
  description: string
  localeDefault: string
  links: {
    docs: string
    discord: string
    twitter: string
    github: string
  }
}

export const siteConfig: SiteConfig = {
  name: "Zk Data Hub",
  title: "Zk Data Hub",
  emoji: "⛓️",
  description:
    "Zk Data Hub is a decentralized data hub for Zk applications. It provides a simple interface for developers to query data from Zk applications.",
  localeDefault: "en",
  links: {
    docs: "https://github.com/district-labs/zk-data-hub",
    discord: "https://discord.com/invite/k3yuxqahtJ",
    twitter: "https://twitter.com/districtfi",
    github: "https://github.com/district-labs/zk-data-hub",
  },
}
