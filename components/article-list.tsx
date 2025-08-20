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
import { FileText, Search, Download, Eye, Edit, Loader2, Plus, Trash2 } from "lucide-react"
import { useSiteContext } from "@/contexts/SiteContext"
import { useArticles } from "@/hooks/use-articles"
import { useToast } from "@/hooks/use-toast"
import { Article } from "@/types/database"
import { ArticleGenerator } from "./article-generator"

export function ArticleList() {
  const { currentSite } = useSiteContext()
  const { articles, loading, publishArticle, unpublishArticle, deleteArticle } = useArticles()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)
  const { toast } = useToast()

  const getStatusColor = (status: Article["status"]) => {
    switch (status) {
      case "published":
        return "bg-accent text-accent-foreground"
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
      case "draft":
        return "下書き"
      default:
        return "未作成"
    }
  }

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.meta_description && article.meta_description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || article.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getArticlesByStatus = (status: Article["status"]) =>
    filteredArticles.filter((article) => article.status === status)

  const handlePublish = async (article: Article) => {
    try {
      if (article.status === "published") {
        await unpublishArticle(article.id)
        toast({
          title: "記事を下書きに戻しました",
          description: `「${article.title}」を下書きに戻しました。`
        })
      } else {
        await publishArticle(article.id)
        toast({
          title: "記事を公開しました",
          description: `「${article.title}」を公開しました。`
        })
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "記事の状態変更に失敗しました。",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (article: Article) => {
    if (!confirm(`「${article.title}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    try {
      await deleteArticle(article.id)
      toast({
        title: "記事を削除しました",
        description: `「${article.title}」を削除しました。`
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "記事の削除に失敗しました。",
        variant: "destructive"
      })
    }
  }

  const handleDownload = (article: Article) => {
    const blob = new Blob([article.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.title}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderArticleCard = (article: Article) => (
    <Card key={article.id} className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-serif leading-tight mb-2">{article.title}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {article.meta_description || "メタディスクリプションなし"}
            </CardDescription>
          </div>
          <Badge className={`ml-4 ${getStatusColor(article.status)}`}>
            {getStatusText(article.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>文字数: {article.content.length.toLocaleString()}</span>
          <span>
            作成: {new Date(article.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>

        <div className="flex gap-2 pt-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setPreviewArticle(article)}
            className="border-border bg-transparent"
          >
            <Eye size={14} className="mr-1" />
            プレビュー
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDownload(article)}
            className="border-border bg-transparent"
          >
            <Download size={14} className="mr-1" />
            ダウンロード
          </Button>

          <Button 
            size="sm" 
            onClick={() => handlePublish(article)}
            className={article.status === "published" 
              ? "bg-muted hover:bg-muted/90 text-muted-foreground" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }
          >
            {article.status === "published" ? "下書きに戻す" : "公開"}
          </Button>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleDelete(article)}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 size={14} className="mr-1" />
            削除
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (!currentSite) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">サイトを選択してください</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>記事を読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 新規作成ボタン */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-serif">記事一覧</h2>
        <ArticleGenerator 
          trigger={
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={16} className="mr-2" />
              新しい記事を作成
            </Button>
          }
        />
      </div>

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
                <SelectItem value="published">公開済み</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 記事一覧 */}
      {filteredArticles.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">記事がありません</h3>
            <p className="text-muted-foreground mb-4">
              {articles.length === 0 
                ? "まだ記事が作成されていません。トピッククラスターから記事を生成するか、上のボタンから新しい記事を作成してください。"
                : "検索条件に一致する記事が見つかりません。"
              }
            </p>
            {articles.length === 0 && (
              <ArticleGenerator 
                trigger={
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus size={16} className="mr-2" />
                    最初の記事を作成
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">全て ({filteredArticles.length})</TabsTrigger>
            <TabsTrigger value="draft">下書き ({getArticlesByStatus("draft").length})</TabsTrigger>
            <TabsTrigger value="published">公開済み ({getArticlesByStatus("published").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredArticles.map(renderArticleCard)}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {getArticlesByStatus("draft").map(renderArticleCard)}
            </div>
          </TabsContent>

          <TabsContent value="published" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {getArticlesByStatus("published").map(renderArticleCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* プレビューダイアログ */}
      {previewArticle && (
        <Dialog open={!!previewArticle} onOpenChange={() => setPreviewArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] bg-popover border-border">
            <DialogHeader>
              <DialogTitle className="font-serif">{previewArticle.title}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="prose prose-sm max-w-none">
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: previewArticle.content
                      .replace(/\n/g, '<br>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-2 mt-4">$1</h1>')
                      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mb-2 mt-3">$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-md font-bold mb-1 mt-2">$1</h3>')
                  }}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}