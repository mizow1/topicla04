import { DashboardLayout } from "@/components/dashboard-layout"
import { SiteSelector } from "@/components/site-selector"
import { TopicClusterTree } from "@/components/topic-cluster-tree"
import { AuthGuard } from "@/components/auth-guard"
import { SiteProvider } from "@/contexts/SiteContext"

export default function ClustersPage() {
  return (
    <AuthGuard>
      <SiteProvider>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold font-serif text-foreground">トピッククラスター</h1>
              <SiteSelector />
            </div>
            <TopicClusterTree />
          </div>
        </DashboardLayout>
      </SiteProvider>
    </AuthGuard>
  )
}
