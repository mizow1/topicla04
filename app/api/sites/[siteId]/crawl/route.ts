import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { crawlAndStoreSiteUrls } from '@/lib/site-crawler'

export async function POST(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証確認
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { siteId } = params
    
    // サイト情報取得
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', session.user.id)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // URLクロール実行
    const crawlResults = await crawlAndStoreSiteUrls(siteId, site.url)

    return NextResponse.json({
      success: true,
      crawledUrls: crawlResults.length,
      results: crawlResults
    })
  } catch (error) {
    console.error('Crawl error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}