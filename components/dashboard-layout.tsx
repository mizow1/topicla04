"use client"

import type { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
