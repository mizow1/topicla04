"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Globe, Loader2 } from "lucide-react"
import { useSiteContext } from "@/contexts/SiteContext"
import { useToast } from "@/hooks/use-toast"

export function SiteSelector() {
  const { sites, currentSite, setCurrentSite, createSite } = useSiteContext()
  const [newSiteName, setNewSiteName] = useState("")
  const [newSiteUrl, setNewSiteUrl] = useState("")
  const [newSiteDescription, setNewSiteDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // URLからサイト名を自動生成（ユーザーが入力していない場合）
      const siteName = newSiteName || new URL(newSiteUrl).hostname
      
      await createSite(siteName, newSiteUrl, newSiteDescription)
      
      toast({
        title: "サイト追加成功",
        description: `${siteName} を追加しました。`
      })
      
      setNewSiteName("")
      setNewSiteUrl("")
      setNewSiteDescription("")
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "エラー",
        description: error.message || "サイトの追加に失敗しました。",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Globe className="text-muted-foreground" size={20} />
        {sites.length > 0 ? (
          <Select
            value={currentSite?.id || ""}
            onValueChange={(value) => {
              const site = sites.find((s) => s.id === value)
              if (site) setCurrentSite(site)
            }}
          >
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="サイトを選択" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground">
            サイトを追加してください
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="border-border bg-transparent">
            <Plus size={16} className="mr-2" />
            サイト追加
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-popover border-border">
          <DialogHeader>
            <DialogTitle className="font-serif">新しいサイトを追加</DialogTitle>
            <DialogDescription>分析したいサイトのURLを入力してください</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">サイト名（オプション）</Label>
              <Input
                id="site-name"
                placeholder="例: 私のブログ"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-url">サイトURL</Label>
              <Input
                id="site-url"
                type="url"
                placeholder="https://example.com"
                value={newSiteUrl}
                onChange={(e) => setNewSiteUrl(e.target.value)}
                required
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">説明（オプション）</Label>
              <Textarea
                id="site-description"
                placeholder="サイトの説明を入力..."
                value={newSiteDescription}
                onChange={(e) => setNewSiteDescription(e.target.value)}
                className="bg-input border-border"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                追加
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
