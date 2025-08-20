"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Search, Download, Eye, Edit, Loader2, Plus } from "lucide-react"
import { useSiteContext } from "@/contexts/SiteContext"
import { useArticles } from "@/hooks/use-articles"
import { useToast } from "@/hooks/use-toast"
import { Article } from "@/types/database"
import { ArticleGenerator } from "./article-generator"

const mockArticles: Article[] = [
  {
    id: "1",
    title: "Webデザインの基本原則と最新トレンド2024",
    metaDescription: "Webデザインの基本原則から最新トレンドまで、初心者から上級者まで役立つ包括的なガイド",
    tags: ["Webデザイン", "UI/UX", "トレンド"],
    status: "published",
    wordCount: 25000,
    cluster: "Webデザイン基礎",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "効果的なカラーパレットの作り方",
    metaDescription: "ブランドイメージを強化するカラーパレット設計の実践的手法",
    tags: ["カラー", "ブランディング", "デザイン理論"],
    status: "generated",
    wordCount: 22000,
    cluster: "Webデザイン基礎",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-14",
  },
  {
    id: "3",
    title: "アクセシビリティを考慮した色選択",
    metaDescription: "視覚障害者にも配慮したWebサイトの色彩設計ガイド",
    tags: ["アクセシビリティ", "カラー", "ユーザビリティ"],
    status: "draft",
    wordCount: 0,
    cluster: "Webデザイン基礎",
    createdAt: "2024-01-13",
    updatedAt: "2024-01-13",
  },
  {
    id: "4",
    title: "SEO完全ガイド：検索エンジン最適化の全て",
    metaDescription: "検索エンジン最適化の基礎から応用まで、実践的なSEO戦略を解説",
    tags: ["SEO", "検索エンジン", "マーケティング"],
    status: "published",
    wordCount: 28000,
    cluster: "SEO最適化",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-11",
  },
]

export function ArticleList() {
  const [articles] = useState<Article[]>(mockArticles)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [clusterFilter, setClusterFilter] = useState<string>("all")

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

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.metaDescription.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || article.status === statusFilter
    const matchesCluster = clusterFilter === "all" || article.cluster === clusterFilter

    return matchesSearch && matchesStatus && matchesCluster
  })

  const clusters = Array.from(new Set(articles.map((article) => article.cluster)))

  const getArticlesByStatus = (status: Article["status"]) =>
    filteredArticles.filter((article) => article.status === status)

  const renderArticleCard = (article: Article) => (
    <Card key={article.id} className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-serif leading-tight mb-2">{article.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">{article.metaDescription}</CardDescription>
          </div>
          <Badge className={`ml-4 ${getStatusColor(article.status)}`}>{getStatusText(article.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>クラスター: {article.cluster}</span>
          <span>{article.wordCount > 0 ? `${article.wordCount.toLocaleString()}文字` : "未生成"}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>作成: {article.createdAt}</span>
          <span>更新: {article.updatedAt}</span>
        </div>

        <div className="flex gap-2 pt-2">
          {article.status === "generated" || article.status === "published" ? (
            <>
              <Button size="sm" variant="outline" className="border-border bg-transparent">
                <Eye size={14} className="mr-1" />
                プレビュー
              </Button>
              <Button size="sm" variant="outline" className="border-border bg-transparent">
                <Download size={14} className="mr-1" />
                ダウンロード
              </Button>
            </>
          ) : (
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <FileText size={14} className="mr-1" />
              記事を生成
            </Button>
          )}
          <Button size="sm" variant="outline" className="border-border bg-transparent">
            <Edit size={14} className="mr-1" />
            編集
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-serif">記事を検索・フィルター</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  placeholder="記事タイトルや内容で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-input border-border">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全てのステータス</SelectItem>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="generated">生成済み</SelectItem>
                <SelectItem value="published">公開済み</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clusterFilter} onValueChange={setClusterFilter}>
              <SelectTrigger className="w-[180px] bg-input border-border">
                <SelectValue placeholder="クラスター" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全てのクラスター</SelectItem>
                {clusters.map((cluster) => (
                  <SelectItem key={cluster} value={cluster}>
                    {cluster}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 記事一覧 */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="all">全て ({filteredArticles.length})</TabsTrigger>
          <TabsTrigger value="draft">下書き ({getArticlesByStatus("draft").length})</TabsTrigger>
          <TabsTrigger value="generated">生成済み ({getArticlesByStatus("generated").length})</TabsTrigger>
          <TabsTrigger value="published">公開済み ({getArticlesByStatus("published").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{filteredArticles.map(renderArticleCard)}</div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getArticlesByStatus("draft").map(renderArticleCard)}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getArticlesByStatus("generated").map(renderArticleCard)}
          </div>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getArticlesByStatus("published").map(renderArticleCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
