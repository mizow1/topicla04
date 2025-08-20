import * as cheerio from 'cheerio'
import { supabase } from './supabase'
import { SiteUrl } from '@/types/database'

export interface CrawlResult {
  url: string
  title: string
  metaDescription: string
  content: string
  success: boolean
  error?: string
}

export async function crawlUrl(url: string): Promise<CrawlResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // メタデータ取得
    const title = $('title').text().trim() || ''
    const metaDescription = $('meta[name="description"]').attr('content') || ''

    // コンテンツ取得（不要なタグを除去）
    $('script, style, nav, header, footer, aside, .navigation, .menu').remove()
    const content = $('body').text().replace(/\s+/g, ' ').trim()

    return {
      url,
      title,
      metaDescription,
      content,
      success: true
    }
  } catch (error) {
    console.error(`Error crawling ${url}:`, error)
    return {
      url,
      title: '',
      metaDescription: '',
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function discoverSiteUrls(baseUrl: string): Promise<string[]> {
  try {
    const response = await fetch(baseUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const discoveredUrls = new Set<string>()
    const baseDomain = new URL(baseUrl).hostname

    // サイトマップを確認
    try {
      const sitemapUrl = `${new URL(baseUrl).origin}/sitemap.xml`
      const sitemapResponse = await fetch(sitemapUrl)
      if (sitemapResponse.ok) {
        const sitemapXml = await sitemapResponse.text()
        const $sitemap = cheerio.load(sitemapXml)
        $sitemap('url > loc').each((_, elem) => {
          const url = $(elem).text().trim()
          if (url && new URL(url).hostname === baseDomain) {
            discoveredUrls.add(url)
          }
        })
      }
    } catch (error) {
      console.log('Sitemap not found or inaccessible')
    }

    // robots.txtを確認
    try {
      const robotsUrl = `${new URL(baseUrl).origin}/robots.txt`
      const robotsResponse = await fetch(robotsUrl)
      if (robotsResponse.ok) {
        const robotsText = await robotsResponse.text()
        const sitemapMatches = robotsText.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi)
        
        for (const match of sitemapMatches || []) {
          const sitemapUrl = match.replace(/Sitemap:\s*/i, '')
          try {
            const sitemapResponse = await fetch(sitemapUrl)
            if (sitemapResponse.ok) {
              const sitemapXml = await sitemapResponse.text()
              const $sitemap = cheerio.load(sitemapXml)
              $sitemap('url > loc').each((_, elem) => {
                const url = $(elem).text().trim()
                if (url && new URL(url).hostname === baseDomain) {
                  discoveredUrls.add(url)
                }
              })
            }
          } catch (error) {
            console.log(`Error fetching sitemap: ${sitemapUrl}`)
          }
        }
      }
    } catch (error) {
      console.log('robots.txt not found or inaccessible')
    }

    // HTMLから内部リンクを抽出
    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href')
      if (href) {
        try {
          const fullUrl = new URL(href, baseUrl).href
          const urlObj = new URL(fullUrl)
          
          if (urlObj.hostname === baseDomain && 
              !fullUrl.includes('#') && 
              !fullUrl.includes('?') &&
              !fullUrl.match(/\.(jpg|jpeg|png|gif|pdf|zip|doc|docx)$/i)) {
            discoveredUrls.add(fullUrl)
          }
        } catch (error) {
          // 無効なURLはスキップ
        }
      }
    })

    // ベースURLも含める
    discoveredUrls.add(baseUrl)

    return Array.from(discoveredUrls).slice(0, 50) // 最大50URLに制限
  } catch (error) {
    console.error('Error discovering URLs:', error)
    return [baseUrl] // 最低でもベースURLは返す
  }
}

export async function crawlAndStoreSiteUrls(siteId: string, baseUrl: string): Promise<SiteUrl[]> {
  // 既存のURLを取得
  const { data: existingUrls } = await supabase
    .from('site_urls')
    .select('url')
    .eq('site_id', siteId)

  const existingUrlSet = new Set(existingUrls?.map(u => u.url) || [])

  // 新しいURLを発見
  const discoveredUrls = await discoverSiteUrls(baseUrl)
  const newUrls = discoveredUrls.filter(url => !existingUrlSet.has(url))

  console.log(`発見された新しいURL: ${newUrls.length}件`)

  // 新しいURLをクロール
  const crawlResults: SiteUrl[] = []
  for (const url of newUrls) {
    const result = await crawlUrl(url)
    
    if (result.success) {
      try {
        const { data, error } = await supabase
          .from('site_urls')
          .insert({
            site_id: siteId,
            url: result.url,
            title: result.title,
            meta_description: result.metaDescription,
            content: result.content,
            scraped_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        if (data) crawlResults.push(data)
      } catch (error) {
        console.error(`Error storing URL ${url}:`, error)
      }
    }

    // レート制限のため少し待機
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return crawlResults
}

export async function getSiteContent(siteId: string): Promise<string> {
  const { data: siteUrls, error } = await supabase
    .from('site_urls')
    .select('title, meta_description, content')
    .eq('site_id', siteId)

  if (error) {
    console.error('Error fetching site content:', error)
    return ''
  }

  if (!siteUrls || siteUrls.length === 0) {
    return ''
  }

  // サイトの全コンテンツを結合
  const combinedContent = siteUrls.map(url => {
    const parts = []
    if (url.title) parts.push(`タイトル: ${url.title}`)
    if (url.meta_description) parts.push(`説明: ${url.meta_description}`)
    if (url.content) parts.push(`内容: ${url.content.substring(0, 1000)}`) // 内容は1000文字まで
    return parts.join('\n')
  }).join('\n\n---\n\n')

  return combinedContent
}