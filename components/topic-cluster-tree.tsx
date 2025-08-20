"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight, FileText, Plus, Sparkles, TrendingUp, Loader2 } from "lucide-react"
import { useSiteContext } from "@/contexts/SiteContext"
import { supabase } from "@/lib/supabase"
import { TopicCluster, TopicClusterAnalysis, ArticleProposal } from "@/types/database"
import { useToast } from "@/hooks/use-toast"
import { ClusterActions } from "./cluster-actions"
import { ArticleGenerator } from "./article-generator"

interface ClusterNode extends TopicCluster {
  articles?: ArticleProposal[]
  children?: ClusterNode[]
  isExpanded?: boolean
}

interface AnalysisDisplayProps {
  analysis: TopicClusterAnalysis
  onSaveCluster: (cluster: any) => void
}

function AnalysisDisplay({ analysis, onSaveCluster }: AnalysisDisplayProps) {
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  const toggleArticleSelection = (articleKey: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleKey) 
        ? prev.filter(key => key !== articleKey)
        : [...prev, articleKey]
    )
  }

  const handleSaveSelectedClusters = async () => {
    // 選択された記事が属するクラスターを保存
    for (const cluster of analysis.topicClusters) {
      const hasSelectedArticles = cluster.articles.some((_, index) => 
        selectedArticles.includes(`${cluster.name}-main-${index}`)
      )
      
      if (hasSelectedArticles || cluster.subClusters?.some(sub =>
        sub.articles.some((_, index) => selectedArticles.includes(`${cluster.name}-${sub.name}-${index}`))
      )) {
        await onSaveCluster(cluster)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 分析結果サマリー */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Sparkles className="h-5 w-5 text-primary" />
            AI分析結果
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                サイト分析
              </h4>
              <p className="text-sm text-muted-foreground">{analysis.siteAnalysis}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                SEO戦略
              </h4>
              <p className="text-sm text-muted-foreground">{analysis.seoStrategy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 選択バー */}
      {selectedArticles.length > 0 && (
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedArticles.length}件の記事が選択されています</span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveSelectedClusters} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  選択したクラスターを保存
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedArticles([])} className="border-border">
                  選択解除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* トピッククラスター一覧 */}
      <div className="space-y-4">
        {analysis.topicClusters.map((cluster, clusterIndex) => (
          <Card key={clusterIndex} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-primary">{cluster.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
                </div>
                <Badge variant="default" className="text-xs">ピラー</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* メイン記事 */}
              {cluster.articles.map((article, articleIndex) => {
                const articleKey = `${cluster.name}-main-${articleIndex}`
                return (
                  <div key={articleKey} className="border-l-2 border-primary/20 pl-4">
                    <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                      <Checkbox
                        checked={selectedArticles.includes(articleKey)}
                        onCheckedChange={() => toggleArticleSelection(articleKey)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm leading-tight">{article.title}</h4>
                          <div className="flex gap-2">
                            <ArticleGenerator
                              defaultTitle={article.title}
                              defaultMetaDescription={article.metaDescription}
                              defaultTags={article.tags}
                              clusterId={undefined} // クラスター保存後に設定
                              trigger={
                                <Badge className="text-xs bg-primary/20 text-primary cursor-pointer hover:bg-primary/30">
                                  記事生成
                                </Badge>
                              }
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{article.metaDescription}</p>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* サブクラスター */}
              {cluster.subClusters?.map((subCluster, subIndex) => (
                <div key={subIndex} className="ml-4 space-y-3">
                  <div className="flex items-center gap-2 py-2">
                    <FileText size={16} className="text-muted-foreground" />
                    <h3 className="font-medium text-secondary-foreground">{subCluster.name}</h3>
                    <Badge variant="secondary" className="text-xs">クラスター</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{subCluster.description}</p>
                  
                  <div className="space-y-3">
                    {subCluster.articles.map((article, articleIndex) => {
                      const articleKey = `${cluster.name}-${subCluster.name}-${articleIndex}`
                      return (
                        <div key={articleKey} className="border-l-2 border-secondary/20 pl-4 ml-4">
                          <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                            <Checkbox
                              checked={selectedArticles.includes(articleKey)}
                              onCheckedChange={() => toggleArticleSelection(articleKey)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-sm leading-tight">{article.title}</h4>
                                <div className="flex gap-2">
                                  <ArticleGenerator
                                    defaultTitle={article.title}
                                    defaultMetaDescription={article.metaDescription}
                                    defaultTags={article.tags}
                                    clusterId={undefined} // クラスター保存後に設定
                                    trigger={
                                      <Badge className="text-xs bg-secondary/20 text-secondary-foreground cursor-pointer hover:bg-secondary/30">
                                        記事生成
                                      </Badge>
                                    }
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{article.metaDescription}</p>
                              <div className="flex flex-wrap gap-1">
                                {article.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function TopicClusterTree() {
  const { currentSite } = useSiteContext()
  const [clusters, setClusters] = useState<ClusterNode[]>([])
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<TopicClusterAnalysis | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (currentSite) {
      fetchClusters()
    }
  }, [currentSite])

  const fetchClusters = async () => {
    if (!currentSite) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('topic_clusters')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('level', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error

      // ツリー構造に変換
      const clusterMap = new Map<string, ClusterNode>()
      const rootClusters: ClusterNode[] = []

      data?.forEach(cluster => {
        const node: ClusterNode = {
          ...cluster,
          children: [],
          isExpanded: true
        }
        clusterMap.set(cluster.id, node)

        if (cluster.parent_id) {
          const parent = clusterMap.get(cluster.parent_id)
          if (parent) {
            parent.children = parent.children || []
            parent.children.push(node)
          }
        } else {
          rootClusters.push(node)
        }
      })

      setClusters(rootClusters)
    } catch (error) {
      console.error('Error fetching clusters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalysisComplete = (newAnalysis: TopicClusterAnalysis) => {
    setAnalysis(newAnalysis)
  }

  const handleSaveCluster = async (clusterData: any) => {
    if (!currentSite) return

    try {
      // メインクラスターを保存
      const { data: mainCluster, error: mainError } = await supabase
        .from('topic_clusters')
        .insert({
          site_id: currentSite.id,
          name: clusterData.name,
          description: clusterData.description,
          level: clusterData.level,
        })
        .select()
        .single()

      if (mainError) throw mainError

      // サブクラスターがある場合は保存
      if (clusterData.subClusters) {
        for (const subCluster of clusterData.subClusters) {
          await supabase
            .from('topic_clusters')
            .insert({
              site_id: currentSite.id,
              name: subCluster.name,
              description: subCluster.description,
              parent_id: mainCluster.id,
              level: subCluster.level,
            })
        }
      }

      toast({
        title: "クラスター保存完了",
        description: `「${clusterData.name}」を保存しました。`
      })

      await fetchClusters()
    } catch (error) {
      toast({
        title: "エラー",
        description: "クラスターの保存に失敗しました。",
        variant: "destructive"
      })
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
    <div className="space-y-6">
      <ClusterActions 
        onAnalysisComplete={handleAnalysisComplete}
        onRefresh={fetchClusters}
      />

      {analysis && (
        <AnalysisDisplay 
          analysis={analysis} 
          onSaveCluster={handleSaveCluster}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>読み込み中...</span>
        </div>
      ) : clusters.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">保存済みクラスター</h3>
          {clusters.map((cluster) => (
            <Card key={cluster.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-primary">{cluster.name}</CardTitle>
                    {cluster.description && (
                      <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
                    )}
                  </div>
                  <Badge variant={cluster.level === 0 ? "default" : "secondary"} className="text-xs">
                    {cluster.level === 0 ? "ピラー" : "クラスター"}
                  </Badge>
                </div>
              </CardHeader>
              {cluster.children && cluster.children.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">サブクラスター:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cluster.children.map((child) => (
                        <div key={child.id} className="p-2 bg-muted/50 rounded">
                          <span className="text-sm font-medium">{child.name}</span>
                          {child.description && (
                            <p className="text-xs text-muted-foreground mt-1">{child.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            まだクラスターが作成されていません。<br />
            上のボタンから新しいクラスターを生成してください。
          </p>
        </div>
      )}
    </div>
  )
}