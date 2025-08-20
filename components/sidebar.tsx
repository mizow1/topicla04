"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Globe, FileText, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", href: "/dashboard" },
  { icon: Globe, label: "サイト管理", href: "/sites" },
  { icon: FileText, label: "トピッククラスター", href: "/clusters" },
  { icon: BarChart3, label: "記事管理", href: "/articles" },
  { icon: Settings, label: "設定", href: "/settings" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && <h2 className="text-lg font-bold font-serif text-sidebar-foreground">SEO Cluster Pro</h2>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
              isCollapsed ? "px-2" : "px-4"
            }`}
          >
            <item.icon size={20} />
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="ghost"
          className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3">ログアウト</span>}
        </Button>
      </div>
    </div>
  )
}
