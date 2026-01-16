import { NextRequest, NextResponse } from 'next/server'

// This simulates the TrulifAI verification API
// In production, this would call the actual TrulifAI backend

interface VerificationRequest {
  url: string
  content?: string
  checkAiGenerated?: boolean
  checkClaims?: boolean
  checkSourceCredibility?: boolean
}

interface ClaimVerification {
  claim: string
  verdict: 'true' | 'mostly_true' | 'mixed' | 'mostly_false' | 'false' | 'unverified'
  confidence: number
  evidence: string[]
  sources: string[]
}

// Source credibility tiers (from TrulifAI)
const SOURCE_TIERS: Record<string, { tier: number; score: number; category: string }> = {
  'congress.gov': { tier: 1, score: 98, category: 'Government' },
  'whitehouse.gov': { tier: 1, score: 97, category: 'Government' },
  'state.gov': { tier: 1, score: 96, category: 'Government' },
  'cbo.gov': { tier: 1, score: 98, category: 'Government' },
  'gao.gov': { tier: 1, score: 98, category: 'Government' },
  'reuters.com': { tier: 2, score: 92, category: 'Wire Service' },
  'apnews.com': { tier: 2, score: 92, category: 'Wire Service' },
  'snopes.com': { tier: 2, score: 90, category: 'Fact-Checker' },
  'politifact.com': { tier: 2, score: 90, category: 'Fact-Checker' },
  'factcheck.org': { tier: 2, score: 90, category: 'Fact-Checker' },
  'bbc.com': { tier: 3, score: 82, category: 'Established News' },
  'nytimes.com': { tier: 3, score: 80, category: 'Established News' },
  'washingtonpost.com': { tier: 3, score: 80, category: 'Established News' },
  'wsj.com': { tier: 3, score: 82, category: 'Established News' },
  'npr.org': { tier: 3, score: 81, category: 'Established News' },
  'cnn.com': { tier: 3, score: 75, category: 'Cable News' },
  'foxnews.com': { tier: 3, score: 72, category: 'Cable News' },
  'msnbc.com': { tier: 3, score: 73, category: 'Cable News' },
  'politico.com': { tier: 4, score: 70, category: 'Political News' },
  'thehill.com': { tier: 4, score: 68, category: 'Political News' },
}

function getSourceCredibility(url: string): { tier: number; score: number; category: string } {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    for (const [key, value] of Object.entries(SOURCE_TIERS)) {
      if (domain.includes(key)) {
        return value
      }
    }
    return { tier: 5, score: 55, category: 'General Web' }
  } catch {
    return { tier: 6, score: 40, category: 'Unknown' }
  }
}

function extractClaims(content: string): string[] {
  // Simulated claim extraction - in production uses LLM
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
  const claimIndicators = ['said', 'according to', 'reported', 'stated', 'announced', 'claimed', 'percent', 'million', 'billion', '$']

  return sentences
    .filter(s => claimIndicators.some(indicator => s.toLowerCase().includes(indicator)))
    .slice(0, 5)
    .map(s => s.trim())
}

function verifyClaim(claim: string): ClaimVerification {
  // Simulated verification - in production uses Fact Check API + web search
  const verdicts: ClaimVerification['verdict'][] = ['true', 'mostly_true', 'mixed', 'mostly_false', 'false', 'unverified']
  const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)]

  const evidenceSources = [
    'Congressional Budget Office analysis',
    'Bureau of Labor Statistics data',
    'Reuters fact-check',
    'Associated Press verification',
    'Official government statement',
    'Academic study from peer-reviewed journal',
  ]

  return {
    claim,
    verdict: randomVerdict,
    confidence: 60 + Math.floor(Math.random() * 35),
    evidence: evidenceSources.slice(0, 2 + Math.floor(Math.random() * 2)),
    sources: ['cbo.gov', 'reuters.com', 'congress.gov'].slice(0, 1 + Math.floor(Math.random() * 2)),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json()

    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Get source credibility
    const sourceCredibility = getSourceCredibility(body.url)

    // Simulate content extraction if not provided
    const content = body.content || 'Sample content for verification. The bill would allocate $50 billion for infrastructure. According to officials, this represents a 30% increase from previous funding levels.'

    // Extract and verify claims
    const claims = extractClaims(content)
    const verifiedClaims = claims.map(verifyClaim)

    // Calculate overall trust score
    const claimScores = verifiedClaims.map(c => {
      switch (c.verdict) {
        case 'true': return 100
        case 'mostly_true': return 80
        case 'mixed': return 60
        case 'unverified': return 50
        case 'mostly_false': return 30
        case 'false': return 10
        default: return 50
      }
    })

    const avgClaimScore = claimScores.length > 0
      ? claimScores.reduce((a, b) => a + b, 0) / claimScores.length
      : 70

    // Calculate final score (weighted)
    const finalScore = Math.round(
      (sourceCredibility.score * 0.4) +
      (avgClaimScore * 0.4) +
      (70 * 0.2) // Objectivity placeholder
    )

    // AI detection simulation
    const aiDetection = body.checkAiGenerated !== false ? {
      isAiGenerated: false,
      aiProbability: 5 + Math.floor(Math.random() * 15),
      humanProbability: 80 + Math.floor(Math.random() * 15),
      confidence: 'high' as const,
      detectorUsed: 'winston_ai',
    } : null

    // Determine trust level
    let trustLevel: 'verified' | 'caution' | 'alert'
    if (finalScore >= 80) trustLevel = 'verified'
    else if (finalScore >= 60) trustLevel = 'caution'
    else trustLevel = 'alert'

    const response = {
      success: true,
      url: body.url,
      verifiedAt: new Date().toISOString(),

      // Overall assessment
      trustScore: finalScore,
      trustLevel,
      confidenceInterval: {
        low: finalScore - 8,
        high: Math.min(finalScore + 8, 100),
      },

      // Source analysis
      sourceCredibility: {
        ...sourceCredibility,
        domain: new URL(body.url).hostname,
      },

      // Claim verification
      claims: verifiedClaims,
      claimsSummary: {
        total: verifiedClaims.length,
        verified: verifiedClaims.filter(c => c.verdict === 'true' || c.verdict === 'mostly_true').length,
        disputed: verifiedClaims.filter(c => c.verdict === 'false' || c.verdict === 'mostly_false').length,
        unverified: verifiedClaims.filter(c => c.verdict === 'unverified' || c.verdict === 'mixed').length,
      },

      // AI detection
      aiDetection,

      // Recommendations
      recommendations: generateRecommendations(trustLevel, verifiedClaims),

      // Methodology
      methodology: {
        sourcingWeight: 0.40,
        claimVerificationWeight: 0.40,
        objectivityWeight: 0.20,
        servicesUsed: ['source_credibility_db', 'claim_extraction_llm', 'fact_check_api', 'web_search'],
      },
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: String(error) },
      { status: 500 }
    )
  }
}

function generateRecommendations(
  trustLevel: 'verified' | 'caution' | 'alert',
  claims: ClaimVerification[]
): string[] {
  const recommendations: string[] = []

  if (trustLevel === 'alert') {
    recommendations.push('Exercise caution when citing this source')
    recommendations.push('Cross-reference key claims with official government sources')
  } else if (trustLevel === 'caution') {
    recommendations.push('Verify specific statistics with primary sources')
  }

  const unverifiedClaims = claims.filter(c => c.verdict === 'unverified')
  if (unverifiedClaims.length > 0) {
    recommendations.push(`${unverifiedClaims.length} claim(s) require additional verification`)
  }

  const falseClaims = claims.filter(c => c.verdict === 'false' || c.verdict === 'mostly_false')
  if (falseClaims.length > 0) {
    recommendations.push(`Warning: ${falseClaims.length} claim(s) disputed by fact-checkers`)
  }

  if (trustLevel === 'verified' && recommendations.length === 0) {
    recommendations.push('Source and claims verified - suitable for citation')
  }

  return recommendations
}
