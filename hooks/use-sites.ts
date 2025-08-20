"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Site } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

export function useSites() {
  const [sites, setSites] = useState<Site[]>([])
  const [currentSite, setCurrentSite] = useState<Site | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchSites()
    }
  }, [user])

  const fetchSites = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSites(data || [])
      
      // 現在のサイトが設定されていない場合、最初のサイトを選択
      if (!currentSite && data && data.length > 0) {
        setCurrentSite(data[0])
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSite = async (name: string, url: string, description?: string) => {
    if (!user) throw new Error('ユーザーが認証されていません')

    try {
      const { data, error } = await supabase
        .from('sites')
        .insert({
          user_id: user.id,
          name,
          url,
          description
        })
        .select()
        .single()

      if (error) throw error

      await fetchSites()
      setCurrentSite(data)
      return data
    } catch (error) {
      console.error('Error creating site:', error)
      throw error
    }
  }

  const updateSite = async (id: string, updates: Partial<Omit<Site, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchSites()
      if (currentSite?.id === id) {
        setCurrentSite(data)
      }
      return data
    } catch (error) {
      console.error('Error updating site:', error)
      throw error
    }
  }

  const deleteSite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchSites()
      if (currentSite?.id === id) {
        setCurrentSite(sites.length > 1 ? sites.find(s => s.id !== id) || null : null)
      }
    } catch (error) {
      console.error('Error deleting site:', error)
      throw error
    }
  }

  return {
    sites,
    currentSite,
    setCurrentSite,
    loading,
    createSite,
    updateSite,
    deleteSite,
    refreshSites: fetchSites
  }
}