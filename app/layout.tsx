import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter, DM_Sans } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Flex Reviews Dashboard",
  description: "Guest reviews management system for Flex Living properties",
  keywords: "Flex Living, reviews, property management, guest feedback",
  authors: [{ name: "Flex Living" }],
  openGraph: {
    title: "Flex Reviews Dashboard",
    description: "Manage and display guest reviews for Flex Living properties",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSans.variable} antialiased`}>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="font-sans">
        {children}
        <Toaster 
          position="top-right"
          richColors
          expand
          closeButton
        />
      </body>
    </html>
  )
}
