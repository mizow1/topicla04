"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, FileText, Tag, X } from "lucide-react"
import { useArticles } from "@/hooks/use-articles"
import { useToast } from "@/hooks/use-toast"

interface ArticleGeneratorProps {
  defaultTitle?: string
  defaultMetaDescription?: string
  defaultTags?: string[]
  clusterId?: string
  trigger?: React.ReactNode
}

export function ArticleGenerator({ 
  defaultTitle = "",
  defaultMetaDescription = "",
  defaultTags = [],
  clusterId,
  trigger
}: ArticleGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(defaultTitle)
  const [metaDescription, setMetaDescription] = useState(defaultMetaDescription)
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  
  const { generateArticle } = useArticles()
  const { toast } = useToast()

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleGenerate = async () => {
    if (!title.trim() || !metaDescription.trim()) {
      toast({
        title: "入力エラー",
        description: "タイトルとメタディスクリプションは必須です。",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await generateArticle(title, metaDescription, tags, clusterId)
      
      toast({
        title: "記事生成完了",
        description: `「${title}」の記事を生成しました。記事管理ページで確認できます。`
      })
      
      setIsOpen(false)
      // フォームをリセット
      setTitle("")
      setMetaDescription("")
      setTags([])
    } catch (error) {
      toast({
        title: "生成エラー",
        description: error instanceof Error ? error.message : "記事の生成に失敗しました。",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <FileText size={16} className="mr-2" />
      記事を生成
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-popover border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">記事生成</DialogTitle>
          <DialogDescription>
            AIが2万文字以上の詳細な記事を自動生成します
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="article-title">記事タイトル</Label>
              <Input
                id="article-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="SEOに効果的な記事タイトルを入力"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-description">メタディスクリプション</Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="検索結果に表示される説明文（160文字以内推奨）"
                className="bg-input border-border"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {metaDescription.length}/160文字
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">タグ</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="関連するキーワードを追加"
                  className="bg-input border-border"
                />
                <Button 
                  type="button" 
                  onClick={handleAddTag}
                  variant="outline"
                  size="sm"
                >
                  <Tag size={14} className="mr-1" />
                  追加
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">生成される記事の特徴</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 2万文字以上の詳細なコンテンツ</li>
              <li>• H2、H3、H4、H5の適切な見出し構造</li>
              <li>• SEOを意識したキーワード配置</li>
              <li>• 実用的な情報と具体例を豊富に含む</li>
              <li>• Markdown形式で生成</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={loading || !title.trim() || !metaDescription.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  生成中（数分かかります）...
                </>
              ) : (
                <>
                  <FileText size={16} className="mr-2" />
                  記事を生成
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}