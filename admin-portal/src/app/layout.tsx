import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/providers/auth-provider"
import { SupabaseProvider } from "@/providers/supabase-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "EasyHR - Admin Portal",
  description: "Manage your workforce with executive precision.",
  icons: { icon: "/logo.svg" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <SupabaseProvider>
            {children}
          </SupabaseProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
