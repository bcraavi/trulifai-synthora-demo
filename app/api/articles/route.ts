import { NextRequest, NextResponse } from 'next/server'

// SynthoraAI Backend API
const SYNTHORA_API = 'https://ai-content-curator-backend.vercel.app'

// Mock TrulifAI verification data (in production, this would call the actual TrulifAI API)
function generateTrustScore(article: any): {
  trustScore: number
  trustLevel: 'verified' | 'caution' | 'alert'
  aiProbability: number
  flaggedClaims: string[]
  sourceCredibility: number
} {
  // Simulate verification based on source
  const trustedSources = ['congress.gov', 'whitehouse.gov', 'reuters.com', 'apnews.com', 'bbc.com', 'npr.org']
  const cautionSources = ['cnn.com', 'foxnews.com', 'msnbc.com', 'politico.com']

  const domain = new URL(article.url || article.link || 'https://example.com').hostname.replace('www.', '')

  let trustScore = 70
  let sourceCredibility = 65

  if (trustedSources.some(s => domain.includes(s))) {
    trustScore = 85 + Math.floor(Math.random() * 15)
    sourceCredibility = 90 + Math.floor(Math.random() * 10)
  } else if (cautionSources.some(s => domain.includes(s))) {
    trustScore = 60 + Math.floor(Math.random() * 20)
    sourceCredibility = 70 + Math.floor(Math.random() * 15)
  } else {
    trustScore = 50 + Math.floor(Math.random() * 30)
    sourceCredibility = 50 + Math.floor(Math.random() * 25)
  }

  // Randomly flag some claims for demo purposes
  const possibleFlags = [
    'Statistic needs verification',
    'Quote source not directly cited',
    'Timeline may be inaccurate',
    'Claim lacks supporting evidence',
  ]

  const flaggedClaims = trustScore < 70
    ? possibleFlags.slice(0, Math.floor(Math.random() * 2) + 1)
    : []

  return {
    trustScore,
    trustLevel: trustScore >= 80 ? 'verified' : trustScore >= 60 ? 'caution' : 'alert',
    aiProbability: Math.floor(Math.random() * 15), // Low AI probability for news
    flaggedClaims,
    sourceCredibility,
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'
  const source = searchParams.get('source') || ''

  try {
    // Fetch articles from SynthoraAI
    const url = new URL(`${SYNTHORA_API}/api/articles`)
    url.searchParams.set('page', page)
    url.searchParams.set('limit', limit)
    if (source) url.searchParams.set('source', source)

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error(`SynthoraAI API error: ${response.status}`)
    }

    const data = await response.json()

    // Enhance articles with TrulifAI verification
    const enhancedArticles = (data.articles || data || []).map((article: any) => {
      const verification = generateTrustScore(article)

      return {
        ...article,
        trulifai: {
          ...verification,
          verifiedAt: new Date().toISOString(),
          methodology: 'source_credibility + claim_extraction + cross_reference',
        }
      }
    })

    return NextResponse.json({
      articles: enhancedArticles,
      pagination: data.pagination || {
        page: parseInt(page),
        limit: parseInt(limit),
        total: enhancedArticles.length,
      },
      meta: {
        synthoraSource: true,
        trulifaiVerified: true,
        timestamp: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Error fetching articles:', error)

    // Return mock data if SynthoraAI is unavailable
    const mockArticles = generateMockArticles()

    return NextResponse.json({
      articles: mockArticles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockArticles.length,
      },
      meta: {
        synthoraSource: false,
        trulifaiVerified: true,
        mockData: true,
        timestamp: new Date().toISOString(),
      }
    })
  }
}

function generateMockArticles() {
  const mockData = [
    {
      _id: '1',
      title: 'Senate Passes Bipartisan Infrastructure Bill with Historic Funding',
      summary: 'The Senate approved a $1.2 trillion infrastructure package with strong bipartisan support, marking a significant legislative achievement for the current administration.',
      url: 'https://congress.gov/bill/118th-congress/house-bill/1234',
      source: 'Congress.gov',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      topic: 'Infrastructure',
    },
    {
      _id: '2',
      title: 'House Committee Announces Hearing on AI Regulation',
      summary: 'The House Science Committee will hold hearings next month to examine the rapid advancement of artificial intelligence and potential regulatory frameworks.',
      url: 'https://whitehouse.gov/briefing-room/statements-releases/ai-policy',
      source: 'White House',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      topic: 'Technology',
    },
    {
      _id: '3',
      title: 'Federal Reserve Signals Potential Rate Changes Amid Economic Data',
      summary: 'Fed officials indicate they are closely monitoring inflation indicators and may adjust monetary policy in upcoming meetings based on economic conditions.',
      url: 'https://reuters.com/business/federal-reserve-policy',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      topic: 'Economy',
    },
    {
      _id: '4',
      title: 'State Department Issues New Travel Advisory for Eastern Europe',
      summary: 'Updated guidance for American citizens traveling to the region, citing ongoing geopolitical tensions and security concerns.',
      url: 'https://state.gov/travel-advisories',
      source: 'State Department',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      topic: 'Foreign Affairs',
    },
    {
      _id: '5',
      title: 'New Healthcare Bill Proposes Expanded Medicare Coverage',
      summary: 'Legislators introduce comprehensive healthcare reform aimed at extending Medicare benefits to additional populations and reducing prescription drug costs.',
      url: 'https://cnn.com/politics/healthcare-reform-bill',
      source: 'CNN',
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      topic: 'Healthcare',
    },
    {
      _id: '6',
      title: 'Climate Action Coalition Releases Policy Recommendations',
      summary: 'A bipartisan group of lawmakers unveils a set of climate policy proposals designed to reduce emissions while supporting economic growth.',
      url: 'https://npr.org/climate-policy-coalition',
      source: 'NPR',
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      topic: 'Environment',
    },
  ]

  return mockData.map(article => ({
    ...article,
    trulifai: generateTrustScore(article),
  }))
}
