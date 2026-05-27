"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

function ThemeColorMetaUpdater() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'theme-color')
      document.head.appendChild(meta)
    }
    const color = resolvedTheme === 'dark' ? '#030a16' : '#f5fafb'
    meta.setAttribute('content', color)
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorMetaUpdater />
      {children}
    </NextThemesProvider>
  )
}
