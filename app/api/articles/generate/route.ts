import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateArticle } from '@/lib/gemini'
import { getSiteContent } from '@/lib/site-crawler'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証確認
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { siteId, title, metaDescription, tags, clusterId } = body

    if (!siteId || !title || !metaDescription || !tags) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

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

    // サイトコンテキスト取得
    const siteContext = await getSiteContent(siteId)

    // AI記事生成
    const articleContent = await generateArticle(title, metaDescription, tags, siteContext)

    // 記事をデータベースに保存
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        site_id: siteId,
        cluster_id: clusterId || null,
        title,
        meta_description: metaDescription,
        content: articleContent,
        status: 'draft'
      })
      .select()
      .single()

    if (articleError) throw articleError

    return NextResponse.json({
      success: true,
      article
    })
  } catch (error) {
    console.error('Article generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}