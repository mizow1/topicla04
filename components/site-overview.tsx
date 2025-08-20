"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, FileText, Globe, TrendingUp, Loader2, RefreshCw } from "lucide-react"
import { useSiteContext } from "@/contexts/SiteContext"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface SiteStats {
  urlCount: number
  clusterCount: number
  articleCount: number
  draftCount: number
  publishedCount: number
  lastCrawl?: string
}

export function SiteOverview() {
  const { currentSite } = useSiteContext()
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [crawling, setCrawling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (currentSite) {
      fetchSiteStats()
    }
  }, [currentSite])

  const fetchSiteStats = async () => {
    if (!currentSite) return

    setLoading(true)
    try {
      const [urlsRes, clustersRes, articlesRes] = await Promise.all([
        supabase.from('site_urls').select('id, created_at').eq('site_id', currentSite.id),
        supabase.from('topic_clusters').select('id').eq('site_id', currentSite.id),
        supabase.from('articles').select('id, status').eq('site_id', currentSite.id)
      ])

      const urlCount = urlsRes.data?.length || 0
      const clusterCount = clustersRes.data?.length || 0
      const articles = articlesRes.data || []
      const articleCount = articles.length
      const draftCount = articles.filter(a => a.status === 'draft').length
      const publishedCount = articles.filter(a => a.status === 'published').length

      // 最新のクロール日時
      const lastCrawl = urlsRes.data && urlsRes.data.length > 0 
        ? urlsRes.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : undefined

      setStats({
        urlCount,
        clusterCount,
        articleCount,
        draftCount,
        publishedCount,
        lastCrawl
      })
    } catch (error) {
      console.error('Error fetching site stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCrawlSite = async () => {
    if (!currentSite) return

    setCrawling(true)
    try {
      const response = await fetch(`/api/sites/${currentSite.id}/crawl`, {
        method: 'POST'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "クロール完了",
          description: `${result.crawledUrls}件の新しいURLを取得しました。`
        })
        await fetchSiteStats()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "クロールに失敗しました。",
        variant: "destructive"
      })
    } finally {
      setCrawling(false)
    }
  }
  if (!currentSite) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">サイトを選択してください</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* サイト情報カード */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">サイト情報</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{currentSite.name}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.lastCrawl 
              ? `最終更新: ${new Date(stats.lastCrawl).toLocaleDateString('ja-JP')}`
              : '未クロール'
            }
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>取得済みURL</span>
              <span className="font-medium">{stats?.urlCount || 0}</span>
            </div>
            <div className="mt-2">
              <Button 
                size="sm" 
                onClick={handleCrawlSite}
                disabled={crawling}
                className="w-full"
              >
                {crawling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {crawling ? 'クロール中...' : 'サイトクロール'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* トピッククラスター */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">トピッククラスター</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{stats?.clusterCount || 0}</div>
          <p className="text-xs text-muted-foreground">アクティブなクラスター</p>
          {stats?.clusterCount === 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                まず、サイトをクロールしてからクラスター分析を実行してください。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 記事統計 */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">記事統計</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{stats?.articleCount || 0}</div>
          <p className="text-xs text-muted-foreground">生成済み記事</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>下書き</span>
              <span className="font-medium">{stats?.draftCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>公開済み</span>
              <span className="font-medium">{stats?.publishedCount || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* サイト詳細 */}
      <Card className="md:col-span-2 lg:col-span-3 bg-card border-border">
        <CardHeader>
          <CardTitle className="font-serif">サイト詳細</CardTitle>
          <CardDescription>
            URL: {currentSite.url}
            {currentSite.description && (
              <>
                <br />
                説明: {currentSite.description}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.urlCount === 0 ? (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  次のステップ
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>1. 上のボタンでサイトをクロールしてURLとコンテンツを取得</li>
                  <li>2. トピッククラスターページでAI分析を実行</li>
                  <li>3. 提案されたクラスターから記事を生成</li>
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  取得済みデータ
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {stats.urlCount}件のURLを取得済み</li>
                  <li>• {stats.clusterCount}個のトピッククラスターを作成済み</li>
                  <li>• {stats.articleCount}件の記事を生成済み</li>
                </ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={fetchSiteStats}
                disabled={loading}
                variant="outline" 
                className="border-border bg-transparent"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <RefreshCw className="mr-2 h-4 w-4" />
                更新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
