export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  user_id: string
  name: string
  url: string
  description?: string
  created_at: string
  updated_at: string
}

export interface SiteUrl {
  id: string
  site_id: string
  url: string
  title?: string
  meta_description?: string
  content?: string
  scraped_at?: string
  created_at: string
}

export interface TopicCluster {
  id: string
  site_id: string
  name: string
  description?: string
  parent_id?: string
  level: number
  created_at: string
  updated_at: string
  children?: TopicCluster[]
  articles?: ArticleProposal[]
}

export interface Article {
  id: string
  site_id: string
  cluster_id?: string
  title: string
  meta_description?: string
  content: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface ArticleProposal {
  title: string
  metaDescription: string
  tags: string[]
}

export interface TopicClusterAnalysis {
  siteAnalysis: string
  seoStrategy: string
  topicClusters: {
    name: string
    description: string
    level: number
    articles: ArticleProposal[]
    subClusters?: {
      name: string
      description: string
      level: number
      articles: ArticleProposal[]
    }[]
  }[]
}

export interface SiteAnalysisRequest {
  siteId: string
  urls: string[]
  additionalCount?: number
  existingClusters?: string[]
}