import "@/styles/app.css"
import "@/styles/globals.css"

import { ReactNode } from "react"
import { env } from "@/env.mjs"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { NetworkStatus } from "@/components/blockchain/network-status"
import { WalletConnect } from "@/components/blockchain/wallet-connect"
import { Footer } from "@/components/layout/footer"
import { SiteHeader } from "@/components/layout/site-header"
import RootProvider from "@/components/providers/root-provider"

const url = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(url),
  title: `${siteConfig.name} - ${siteConfig.description}`,
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#feefc4",
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: url?.toString(),
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <RootProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <NetworkStatus />
          <div className="fixed bottom-6 right-6">
            <WalletConnect />
          </div>
        </RootProvider>
      </body>
    </html>
  )
}
