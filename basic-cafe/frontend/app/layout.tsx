import type { Metadata } from "next"
import { Inter_Tight } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
const interTight = Inter_Tight({ variable: "--font-sans", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] })
export const metadata: Metadata = { title: "Basic Cafe", description: "Cafeteria administration system" }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
