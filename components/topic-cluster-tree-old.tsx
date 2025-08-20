"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight, FileText, Plus, Sparkles, TrendingUp } from "lucide-react"
import { useSiteContext } from "@/contexts/SiteContext"
import { supabase } from "@/lib/supabase"
import { TopicCluster, TopicClusterAnalysis, ArticleProposal } from "@/types/database"
import { useToast } from "@/hooks/use-toast"

interface ClusterNode extends TopicCluster {
  articles: ArticleProposal[]
  children?: ClusterNode[]
  isExpanded?: boolean
}

interface AnalysisDisplayProps {
  analysis: TopicClusterAnalysis
  onSaveCluster: (cluster: any) => void
}

const mockClusterData: ClusterNode[] = [
  {
    id: "1",
    title: "Webデザイン基礎",
    type: "pillar",
    isExpanded: true,
    articles: [
      {
        id: "1-main",
        title: "Webデザインの基本原則と最新トレンド2024",
        metaDescription: "Webデザインの基本原則から最新トレンドまで、初心者から上級者まで役立つ包括的なガイド",
        tags: ["Webデザイン", "UI/UX", "トレンド"],
        status: "published",
        wordCount: 25000,
      },
    ],
    children: [
      {
        id: "1-1",
        title: "カラーパレット設計",
        type: "cluster",
        articles: [
          {
            id: "1-1-1",
            title: "効果的なカラーパレットの作り方",
            metaDescription: "ブランドイメージを強化するカラーパレット設計の実践的手法",
            tags: ["カラー", "ブランディング", "デザイン理論"],
            status: "generated",
            wordCount: 22000,
          },
          {
            id: "1-1-2",
            title: "アクセシビリティを考慮した色選択",
            metaDescription: "視覚障害者にも配慮したWebサイトの色彩設計ガイド",
            tags: ["アクセシビリティ", "カラー", "ユーザビリティ"],
            status: "draft",
          },
        ],
      },
      {
        id: "1-2",
        title: "レスポンシブデザイン",
        type: "cluster",
        articles: [
          {
            id: "1-2-1",
            title: "モバイルファーストデザインの実践",
            metaDescription: "スマートフォン時代に対応したレスポンシブデザインの設計手法",
            tags: ["レスポンシブ", "モバイル", "CSS"],
            status: "draft",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "SEO最適化",
    type: "pillar",
    isExpanded: false,
    articles: [
      {
        id: "2-main",
        title: "SEO完全ガイド：検索エンジン最適化の全て",
        metaDescription: "検索エンジン最適化の基礎から応用まで、実践的なSEO戦略を解説",
        tags: ["SEO", "検索エンジン", "マーケティング"],
        status: "published",
        wordCount: 28000,
      },
    ],
    children: [
      {
        id: "2-1",
        title: "キーワード戦略",
        type: "cluster",
        articles: [
          {
            id: "2-1-1",
            title: "ロングテールキーワードの活用法",
            metaDescription: "競合の少ないロングテールキーワードで検索上位を狙う戦略",
            tags: ["キーワード", "SEO戦略", "コンテンツマーケティング"],
            status: "draft",
          },
        ],
      },
    ],
  },
]

export function TopicClusterTree() {
  const [clusters, setClusters] = useState<ClusterNode[]>(mockClusterData)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  const toggleExpanded = (clusterId: string) => {
    setClusters((prev) =>
      prev.map((cluster) => (cluster.id === clusterId ? { ...cluster, isExpanded: !cluster.isExpanded } : cluster)),
    )
  }

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    )
  }

  const getStatusColor = (status: Article["status"]) => {
    switch (status) {
      case "published":
        return "bg-accent text-accent-foreground"
      case "generated":
        return "bg-chart-4 text-white"
      case "draft":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: Article["status"]) => {
    switch (status) {
      case "published":
        return "公開済み"
      case "generated":
        return "生成済み"
      case "draft":
        return "下書き"
      default:
        return "未作成"
    }
  }

  const renderArticle = (article: Article, level = 0) => (
    <div key={article.id} className={`border-l-2 border-border pl-4 ml-${level * 4}`}>
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
        <Checkbox
          checked={selectedArticles.includes(article.id)}
          onCheckedChange={() => toggleArticleSelection(article.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight">{article.title}</h4>
            <Badge className={`text-xs ${getStatusColor(article.status)}`}>{getStatusText(article.status)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{article.metaDescription}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            {article.wordCount && (
              <span className="text-xs text-muted-foreground">{article.wordCount.toLocaleString()}文字</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderCluster = (cluster: ClusterNode, level = 0) => (
    <div key={cluster.id} className="space-y-3">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => toggleExpanded(cluster.id)} className="p-1 h-6 w-6">
                {cluster.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </Button>
              <CardTitle className={`text-lg ${cluster.type === "pillar" ? "font-serif text-primary" : "font-medium"}`}>
                {cluster.title}
              </CardTitle>
              <Badge variant={cluster.type === "pillar" ? "default" : "secondary"} className="text-xs">
                {cluster.type === "pillar" ? "ピラー" : "クラスター"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              <Plus size={14} className="mr-1" />
              記事追加
            </Button>
          </div>
        </CardHeader>

        {cluster.isExpanded && (
          <CardContent className="pt-0 space-y-4">
            {/* メイン記事 */}
            {cluster.articles.map((article) => renderArticle(article, level))}

            {/* 子クラスター */}
            {cluster.children?.map((child) => (
              <div key={child.id} className="ml-4 space-y-3">
                <div className="flex items-center gap-2 py-2">
                  <FileText size={16} className="text-muted-foreground" />
                  <h3 className="font-medium text-secondary-foreground">{child.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    クラスター
                  </Badge>
                </div>
                <div className="space-y-3">{child.articles.map((article) => renderArticle(article, level + 1))}</div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {selectedArticles.length > 0 && (
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedArticles.length}件の記事が選択されています</span>
              <div className="flex gap-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  選択した記事を生成
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedArticles([])} className="border-border">
                  選択解除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">{clusters.map((cluster) => renderCluster(cluster))}</div>
    </div>
  )
}
