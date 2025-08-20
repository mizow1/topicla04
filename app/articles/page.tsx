import { DashboardLayout } from "@/components/dashboard-layout"
import { SiteSelector } from "@/components/site-selector"
import { ArticleList } from "@/components/article-list"
import { AuthGuard } from "@/components/auth-guard"
import { SiteProvider } from "@/contexts/SiteContext"

export default function ArticlesPage() {
  return (
    <AuthGuard>
      <SiteProvider>
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold font-serif text-foreground">記事管理</h1>
              <SiteSelector />
            </div>
            <ArticleList />
          </div>
        </DashboardLayout>
      </SiteProvider>
    </AuthGuard>
  )
}
