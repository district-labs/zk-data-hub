"use client"

import Link from "next/link"

import { siteConfig } from "@/config/site"

export function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden bg-gradient-to-br from-black to-stone-500 bg-clip-text text-2xl font-bold text-transparent dark:from-stone-100 dark:to-yellow-200 sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
    </div>
  )
}

interface NavMenuListItemProps {
  name: string
  description: string
  href: string
  lightImage: string
  darkImage: string
}
