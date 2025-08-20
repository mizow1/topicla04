import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_AI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

export async function analyzeContent(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('AI分析に失敗しました')
  }
}

export async function generateTopicClusters(siteContent: string, existingClusters?: string[]): Promise<any> {
  const existingClustersText = existingClusters?.length 
    ? `\n\n既存のクラスター（重複や矛盾を避けてください）:\n${existingClusters.join('\n')}`
    : ''

  const prompt = `
以下のサイトコンテンツを分析し、SEOのトピッククラスター理論に基づいてコンテンツ戦略を提案してください。

サイトコンテンツ:
${siteContent}
${existingClustersText}

以下の形式でJSON形式で回答してください:
{
  "siteAnalysis": "サイトの概要と性質の分析",
  "seoStrategy": "SEO評価向上のための記事作成方針",
  "topicClusters": [
    {
      "name": "メイントピック名",
      "description": "トピックの説明",
      "level": 0,
      "articles": [
        {
          "title": "記事タイトル",
          "metaDescription": "メタディスクリプション（160文字以内）",
          "tags": ["タグ1", "タグ2"]
        }
      ],
      "subClusters": [
        {
          "name": "サブトピック名",
          "description": "サブトピックの説明",
          "level": 1,
          "articles": [
            {
              "title": "記事タイトル",
              "metaDescription": "メタディスクリプション",
              "tags": ["タグ1", "タグ2"]
            }
          ]
        }
      ]
    }
  ]
}

重要な指示:
1. 既存のクラスターと重複や矛盾しないようにしてください
2. トピッククラスター理論に基づき、メイントピックとサブトピックの階層構造を明確にしてください
3. 各記事は具体的で実用的なタイトルにしてください
4. メタディスクリプションは検索結果でクリックしたくなるような魅力的な内容にしてください
5. タグは関連するキーワードを含めてください
`

  const response = await analyzeContent(prompt)
  
  try {
    // JSONの前後の余分なテキストを除去
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Valid JSON not found in response')
    }
    
    return JSON.parse(jsonMatch[0])
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError)
    console.error('Raw Response:', response)
    throw new Error('AI応答の解析に失敗しました')
  }
}

export async function generateArticle(title: string, metaDescription: string, tags: string[], siteContext: string): Promise<string> {
  const prompt = `
以下の情報に基づいて、SEO最適化された高品質な記事を2万文字以上で作成してください。

記事タイトル: ${title}
メタディスクリプション: ${metaDescription}
タグ: ${tags.join(', ')}
サイトコンテキスト: ${siteContext}

記事の構成:
1. 導入部（問題提起、記事の概要）
2. 詳細な本文（複数のセクション）
3. 実践的な情報やアドバイス
4. まとめ

フォーマット要件:
- Markdown形式で作成
- H2、H3、H4、H5、p、ul、ol、bタグを適切に使用
- 読みやすい構造で見出しを階層化
- 具体例や実用的な情報を豊富に含める
- SEOを意識したキーワードの自然な配置
- 2万文字以上の詳細な内容

記事を作成してください:
`

  return await analyzeContent(prompt)
}