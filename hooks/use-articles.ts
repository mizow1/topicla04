"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Article } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { useSiteContext } from '@/contexts/SiteContext'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { currentSite } = useSiteContext()

  useEffect(() => {
    if (user && currentSite) {
      fetchArticles()
    }
  }, [user, currentSite])

  const fetchArticles = async () => {
    if (!currentSite) return

    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateArticle = async (
    title: string, 
    metaDescription: string, 
    tags: string[], 
    clusterId?: string
  ): Promise<Article> => {
    if (!currentSite) throw new Error('サイトが選択されていません')

    const response = await fetch('/api/articles/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        siteId: currentSite.id,
        title,
        metaDescription,
        tags,
        clusterId
      })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error)
    }

    await fetchArticles()
    return result.article
  }

  const updateArticle = async (id: string, updates: Partial<Article>): Promise<Article> => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchArticles()
      return data
    } catch (error) {
      console.error('Error updating article:', error)
      throw error
    }
  }

  const deleteArticle = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchArticles()
    } catch (error) {
      console.error('Error deleting article:', error)
      throw error
    }
  }

  const publishArticle = async (id: string): Promise<Article> => {
    return updateArticle(id, { status: 'published' })
  }

  const unpublishArticle = async (id: string): Promise<Article> => {
    return updateArticle(id, { status: 'draft' })
  }

  return {
    articles,
    loading,
    generateArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    refreshArticles: fetchArticles
  }
}