"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw, BarChart3, Loader2 } from "lucide-react"
import { useSiteContext } from "@/contexts/SiteContext"
import { useToast } from "@/hooks/use-toast"
import { TopicClusterAnalysis } from "@/types/database"

interface ClusterActionsProps {
  onAnalysisComplete?: (analysis: TopicClusterAnalysis) => void
  onRefresh?: () => void
}

export function ClusterActions({ onAnalysisComplete, onRefresh }: ClusterActionsProps) {
  const { currentSite } = useSiteContext()
  const [isGenerating, setIsGenerating] = useState(false)
  const [clusterCount, setClusterCount] = useState("5")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleGenerateClusters = async () => {
    if (!currentSite) {
      toast({
        title: "エラー",
        description: "サイトを選択してください。",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/sites/${currentSite.id}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          additionalCount: parseInt(clusterCount),
          customPrompt: customPrompt || undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "分析完了",
          description: "トピッククラスター分析が完了しました。"
        })
        
        onAnalysisComplete?.(result.analysis)
        setIsDialogOpen(false)
        setCustomPrompt("")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "分析に失敗しました。",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!currentSite}
          >
            <Plus size={16} className="mr-2" />
            新しいクラスター生成
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-popover border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">トピッククラスター生成</DialogTitle>
            <DialogDescription>
              サイトの内容を分析して、SEOに効果的なトピッククラスターを自動生成します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cluster-count">生成するクラスター数</Label>
                <Input
                  id="cluster-count"
                  type="number"
                  min="1"
                  max="20"
                  value={clusterCount}
                  onChange={(e) => setClusterCount(e.target.value)}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">推奨: 3-8個のクラスター</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-prompt">カスタム指示（オプション）</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="特定のトピックに焦点を当てたい場合や、避けたいトピックがある場合は記入してください"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="bg-input border-border min-h-[100px]"
                />
              </div>
            </div>

            <Card className="bg-muted/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">生成される内容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    ピラー記事
                  </Badge>
                  <span className="text-muted-foreground">各クラスターの中心となる包括的な記事</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    クラスター記事
                  </Badge>
                  <span className="text-muted-foreground">ピラー記事を支援する詳細な記事群</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    記事構成
                  </Badge>
                  <span className="text-muted-foreground">タイトル、メタディスクリプション、タグ</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isGenerating}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleGenerateClusters}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <BarChart3 size={16} className="mr-2" />
                    クラスター生成
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        variant="outline" 
        className="border-border bg-transparent"
        onClick={onRefresh}
        disabled={!currentSite}
      >
        <RefreshCw size={16} className="mr-2" />
        分析を更新
      </Button>
    </div>
  )
}
