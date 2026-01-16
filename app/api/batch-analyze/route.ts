import { NextRequest, NextResponse } from 'next/server'

// Constituent Mail Batch Analysis API
// Simulates analyzing multiple URLs/claims from constituent correspondence

interface BatchItem {
  id: string
  type: 'url' | 'claim'
  content: string
}

interface BatchRequest {
  items: BatchItem[]
  generateResponses?: boolean
}

interface AnalyzedItem {
  id: string
  type: 'url' | 'claim'
  content: string
  verdict: 'true' | 'mostly_true' | 'mixed' | 'mostly_false' | 'false' | 'unverified'
  confidence: number
  trustScore: number
  explanation: string
  sources: string[]
  suggestedResponse?: string
}

// Known misinformation patterns (for demo)
const KNOWN_MISINFO = [
  { pattern: /congress.*raise.*salary/i, verdict: 'false' as const, explanation: 'Congressional salaries are governed by the Ethics Reform Act of 1989 and require specific legislation to change.' },
  { pattern: /bill.*secret/i, verdict: 'mostly_false' as const, explanation: 'All legislation is publicly available on Congress.gov. Committee markups may be closed but final bills are public.' },
  { pattern: /voted.*against.*veterans/i, verdict: 'mixed' as const, explanation: 'Voting records should be verified on Congress.gov. Many bills have complex provisions that don\'t reduce to simple characterizations.' },
  { pattern: /foreign.*own.*land/i, verdict: 'unverified' as const, explanation: 'Land ownership regulations vary by state and type. Verify specific claims with USDA or state agencies.' },
]

const RESPONSE_TEMPLATES: Record<string, string> = {
  'false': `Thank you for bringing this to our attention. After reviewing the claim, we found it to be inaccurate. [EXPLANATION]

You can verify this information through official government sources:
- Congress.gov for legislative records
- Official agency websites for policy details

We appreciate your engagement and encourage you to reach out with any other questions.`,

  'mostly_false': `Thank you for your message. The claim you referenced contains significant inaccuracies, though it may include some elements of truth taken out of context. [EXPLANATION]

For accurate information, we recommend:
- Checking Congress.gov for official bill text
- Reviewing CRS reports for nonpartisan analysis

Please don't hesitate to contact us for clarification on any policy matters.`,

  'mixed': `Thank you for writing. The claim you mentioned is partially accurate but requires important context. [EXPLANATION]

For a complete picture, you may want to review:
- The full text of relevant legislation on Congress.gov
- Nonpartisan analyses from CBO or CRS

We're happy to discuss this further if you have questions.`,

  'unverified': `Thank you for your inquiry. We were unable to fully verify the claim you mentioned, as it requires additional context or sourcing. [EXPLANATION]

We recommend consulting:
- Official government sources for policy information
- Established fact-checking organizations for disputed claims

Feel free to follow up if you'd like more specific information.`,

  'true': `Thank you for your message. The information you referenced is accurate. [EXPLANATION]

For additional details, you can find more information at:
- Congress.gov
- Relevant agency websites

We appreciate your interest in staying informed about government activities.`,

  'mostly_true': `Thank you for reaching out. The claim you mentioned is largely accurate, with some minor caveats. [EXPLANATION]

For complete details, please see:
- Official government records on Congress.gov
- Agency press releases and fact sheets

Don't hesitate to contact us if you need any clarification.`,
}

function analyzeClaim(item: BatchItem): AnalyzedItem {
  // Check against known misinformation patterns
  for (const misinfo of KNOWN_MISINFO) {
    if (misinfo.pattern.test(item.content)) {
      const trustScore = misinfo.verdict === 'false' ? 15 :
        misinfo.verdict === 'mostly_false' ? 30 :
          misinfo.verdict === 'mixed' ? 50 :
            misinfo.verdict === 'unverified' ? 45 : 70

      return {
        ...item,
        verdict: misinfo.verdict,
        confidence: 85 + Math.floor(Math.random() * 10),
        trustScore,
        explanation: misinfo.explanation,
        sources: ['congress.gov', 'factcheck.org', 'politifact.com'].slice(0, 2),
      }
    }
  }

  // Default analysis for unknown claims
  const verdicts: AnalyzedItem['verdict'][] = ['true', 'mostly_true', 'mixed', 'unverified']
  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)]

  const trustScore = verdict === 'true' ? 85 + Math.floor(Math.random() * 10) :
    verdict === 'mostly_true' ? 70 + Math.floor(Math.random() * 15) :
      verdict === 'mixed' ? 50 + Math.floor(Math.random() * 15) :
        45 + Math.floor(Math.random() * 20)

  return {
    ...item,
    verdict,
    confidence: 60 + Math.floor(Math.random() * 30),
    trustScore,
    explanation: 'Claim analyzed against available sources and fact-check databases.',
    sources: ['reuters.com', 'apnews.com', 'congress.gov'].slice(0, 1 + Math.floor(Math.random() * 2)),
  }
}

function analyzeUrl(item: BatchItem): AnalyzedItem {
  // Source credibility check
  let trustScore = 60
  let explanation = 'Source analyzed for credibility and content accuracy.'

  try {
    const domain = new URL(item.content).hostname.replace('www.', '')

    if (domain.includes('.gov')) {
      trustScore = 90 + Math.floor(Math.random() * 8)
      explanation = 'Official government source with high credibility.'
    } else if (['reuters.com', 'apnews.com'].some(s => domain.includes(s))) {
      trustScore = 85 + Math.floor(Math.random() * 10)
      explanation = 'Wire service with strong editorial standards.'
    } else if (['snopes.com', 'politifact.com', 'factcheck.org'].some(s => domain.includes(s))) {
      trustScore = 88 + Math.floor(Math.random() * 8)
      explanation = 'Established fact-checking organization.'
    } else if (['nytimes.com', 'washingtonpost.com', 'wsj.com', 'bbc.com'].some(s => domain.includes(s))) {
      trustScore = 75 + Math.floor(Math.random() * 12)
      explanation = 'Major news outlet with editorial oversight.'
    } else if (['facebook.com', 'twitter.com', 'x.com', 'tiktok.com'].some(s => domain.includes(s))) {
      trustScore = 25 + Math.floor(Math.random() * 20)
      explanation = 'Social media post - requires verification of original source.'
    } else {
      trustScore = 40 + Math.floor(Math.random() * 30)
      explanation = 'Source credibility could not be fully established. Recommend cross-referencing.'
    }
  } catch {
    trustScore = 30
    explanation = 'Invalid URL or unable to analyze source.'
  }

  const verdict: AnalyzedItem['verdict'] =
    trustScore >= 80 ? 'true' :
      trustScore >= 65 ? 'mostly_true' :
        trustScore >= 50 ? 'mixed' :
          trustScore >= 35 ? 'unverified' : 'mostly_false'

  return {
    ...item,
    verdict,
    confidence: 70 + Math.floor(Math.random() * 25),
    trustScore,
    explanation,
    sources: ['source_credibility_database', 'content_analysis'],
  }
}

function generateResponse(item: AnalyzedItem): string {
  const template = RESPONSE_TEMPLATES[item.verdict] || RESPONSE_TEMPLATES['unverified']
  return template.replace('[EXPLANATION]', item.explanation)
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json()

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    if (body.items.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 items per batch' },
        { status: 400 }
      )
    }

    // Analyze each item
    const results: AnalyzedItem[] = body.items.map((item, index) => {
      const itemWithId = {
        ...item,
        id: item.id || `item_${index + 1}`,
      }

      const analyzed = item.type === 'url'
        ? analyzeUrl(itemWithId)
        : analyzeClaim(itemWithId)

      if (body.generateResponses) {
        analyzed.suggestedResponse = generateResponse(analyzed)
      }

      return analyzed
    })

    // Summary statistics
    const summary = {
      total: results.length,
      verified: results.filter(r => r.verdict === 'true' || r.verdict === 'mostly_true').length,
      disputed: results.filter(r => r.verdict === 'false' || r.verdict === 'mostly_false').length,
      needsReview: results.filter(r => r.verdict === 'mixed' || r.verdict === 'unverified').length,
      averageTrustScore: Math.round(results.reduce((sum, r) => sum + r.trustScore, 0) / results.length),
    }

    // Identify high-priority items (low trust or disputed)
    const highPriority = results
      .filter(r => r.trustScore < 50 || r.verdict === 'false' || r.verdict === 'mostly_false')
      .map(r => r.id)

    return NextResponse.json({
      success: true,
      analyzedAt: new Date().toISOString(),
      summary,
      highPriorityItems: highPriority,
      results,
      recommendations: [
        highPriority.length > 0
          ? `${highPriority.length} item(s) flagged for priority review`
          : 'No high-priority items detected',
        summary.needsReview > 0
          ? `${summary.needsReview} item(s) require additional verification`
          : null,
        'Consider cross-referencing disputed claims with Congress.gov or CRS reports',
      ].filter(Boolean),
    })

  } catch (error) {
    console.error('Batch analysis error:', error)
    return NextResponse.json(
      { error: 'Batch analysis failed', details: String(error) },
      { status: 500 }
    )
  }
}
