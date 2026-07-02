import type { Metadata } from "next"
import { AuthProvider } from "@/providers/auth-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "EasyHR - Admin Portal",
  description: "Manage your workforce with executive precision.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
