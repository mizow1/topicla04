import { DashboardLayout } from "@/components/dashboard-layout"
import { SiteSelector } from "@/components/site-selector"
import { SiteOverview } from "@/components/site-overview"
import { AuthGuard } from "@/components/auth-guard"
import { SiteProvider } from "@/contexts/SiteContext"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <SiteProvider>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold font-serif text-foreground">ダッシュボード</h1>
              <SiteSelector />
            </div>
            <SiteOverview />
          </div>
        </DashboardLayout>
      </SiteProvider>
    </AuthGuard>
  )
}
