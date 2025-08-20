import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          user_id: string
          name: string
          url: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          url: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          url?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      site_urls: {
        Row: {
          id: string
          site_id: string
          url: string
          title: string | null
          meta_description: string | null
          content: string | null
          scraped_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          url: string
          title?: string | null
          meta_description?: string | null
          content?: string | null
          scraped_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          url?: string
          title?: string | null
          meta_description?: string | null
          content?: string | null
          scraped_at?: string | null
          created_at?: string
        }
      }
      topic_clusters: {
        Row: {
          id: string
          site_id: string
          name: string
          description: string | null
          parent_id: string | null
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          name: string
          description?: string | null
          parent_id?: string | null
          level: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          site_id: string
          cluster_id: string | null
          title: string
          meta_description: string | null
          content: string
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          cluster_id?: string | null
          title: string
          meta_description?: string | null
          content: string
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          cluster_id?: string | null
          title?: string
          meta_description?: string | null
          content?: string
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}