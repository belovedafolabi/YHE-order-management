import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { LoadingAnimation } from "@/components/loading-animation"
import { GridBackground } from "@/components/grid-background"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YHE OrderTrack - Order Management System",
  description:
    "Track and manage your orders with ease. Upload designs, check order status, and get real-time updates on your purchases.",
  keywords: [
    "order tracking",
    "order management",
    "custom t-shirts",
    "design upload",
    "order status",
    "print status",
    "shipping tracking",
    "YHE OrderTrack",
    "online orders",
    "product management",
    "custom designs",
    "t-shirt printing",
    "order details",
    "customer orders",
  ],
  authors: [{ name: "YHE OrderTrack", url: "https://yhe-pi.vercel.app" }],
  creator: "YHE OrderTrack",
  publisher: "YHE OrderTrack",
  applicationName: "YHE OrderTrack - Order Management System",
  openGraph: {
    title: "YHE OrderTrack - Order Management System",
    description:
      "Track and manage your orders with ease. Upload designs, check order status, and get real-time updates on your purchases.",
    type: "website",
    url: "https://yhe-pi.vercel.app",
    images: ["/images/yhe-OG.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@YHEOrderTrack",
    title: "YHE OrderTrack - Order Management System",
    description:
      "Track and manage your orders with ease. Upload designs, check order status, and get real-time updates on your purchases.",
    images: ["/images/yhe-OG.png"],
  },
  generator: "yhe-pi.vercel.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider>
          <GridBackground />
          <Suspense fallback={<div>Loading...</div>}>
            <LoadingAnimation />
          </Suspense>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
