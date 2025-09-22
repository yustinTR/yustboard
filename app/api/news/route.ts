import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth/auth"

// NewsAPI.org - Free tier: 100 requests per day
const NEWS_API_KEY = process.env.NEWS_API_KEY || ''
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'general'
    const country = searchParams.get('country') || 'us' // Default to US for more content
    const page = searchParams.get('page') || '1'
    
    if (!NEWS_API_KEY) {
      return NextResponse.json({
        articles: [],
        message: 'News API key not configured. Get a free key at https://newsapi.org'
      })
    }


    // Fetch real news from NewsAPI
    const url = new URL(NEWS_API_URL)
    url.searchParams.append('country', country)
    url.searchParams.append('category', category)
    url.searchParams.append('pageSize', '12')
    url.searchParams.append('page', page)
    url.searchParams.append('apiKey', NEWS_API_KEY)

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`News API responded with status: ${response.status} - ${errorData.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    
    return NextResponse.json({
      articles: data.articles || []
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}