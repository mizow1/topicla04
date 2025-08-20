"use client"

import { createContext, useContext } from 'react'
import { useSites } from '@/hooks/use-sites'
import { Site } from '@/types/database'

interface SiteContextType {
  sites: Site[]
  currentSite: Site | null
  setCurrentSite: (site: Site | null) => void
  loading: boolean
  createSite: (name: string, url: string, description?: string) => Promise<Site>
  updateSite: (id: string, updates: Partial<Omit<Site, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Site>
  deleteSite: (id: string) => Promise<void>
  refreshSites: () => Promise<void>
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const siteHook = useSites()

  return (
    <SiteContext.Provider value={siteHook}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSiteContext() {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error('useSiteContext must be used within a SiteProvider')
  }
  return context
}