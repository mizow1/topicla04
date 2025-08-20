import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getSiteContent } from '@/lib/site-crawler'
import { generateTopicClusters } from '@/lib/gemini'

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
    const body = await request.json()
    const { additionalCount = 5 } = body
    
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

    // 既存のクラスター取得
    const { data: existingClusters } = await supabase
      .from('topic_clusters')
      .select('name')
      .eq('site_id', siteId)

    const existingClusterNames = existingClusters?.map(c => c.name) || []

    // サイトコンテンツ取得
    const siteContent = await getSiteContent(siteId)
    
    if (!siteContent) {
      return NextResponse.json({ 
        error: 'No content found. Please crawl the site first.' 
      }, { status: 400 })
    }

    // AI分析実行
    const analysis = await generateTopicClusters(siteContent, existingClusterNames)

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}