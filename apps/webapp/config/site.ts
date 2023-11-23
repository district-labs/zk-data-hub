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

export const SITE_CANONICAL = "https://turboeth.xyz"

export const siteConfig: SiteConfig = {
  name: "Zk Data Hub",
  title: "Zk Data Hub",
  emoji: "⚡",
  description:
    "Zk Data Hub is a decentralized data hub for Zk applications. It provides a simple interface for developers to query data from Zk applications.",
  localeDefault: "en",
  links: {
    docs: "",
    discord: "",
    twitter: "",
    github: "",
  },
}
