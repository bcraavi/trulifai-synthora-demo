'use client'

import { useState } from 'react'
import {
  Search, Shield, AlertTriangle, CheckCircle, XCircle, Globe, Users,
  Eye, TrendingUp, Bot, Zap, FileText, Building2, ExternalLink,
  ChevronDown, ChevronUp, Loader2, Twitter, Facebook, Share2
} from 'lucide-react'
import { TrustBadge } from './TrustBadge'

interface DeepVerifyResult {
  success: boolean
  verifiedAt: string
  methodology: string
  overallTrustScore: number
  trustLevel: 'verified' | 'caution' | 'alert'
  componentScores: {
    sourceCredibility: number
    propagandaFree: number
    institutionalBacking: number
    socialMediaClean: number
  }
  sourceEvaluation: {
    domain: string
    overallCredibility: number
    authorCredentials: {
      identified: boolean
      name?: string
      expertise?: string
      verifiedExpert: boolean
    }
    lateralReading: {
      mentionedBy: string[]
      wikipediaEntry: boolean
      journalisticStandards: boolean
      referencedByAcademia: boolean
    }
    transparency: {
      hasAboutPage: boolean
      ownershipDisclosed: boolean
      contactInfoAvailable: boolean
      fundingDisclosed: boolean
      physicalAddress: boolean
    }
    mediaBias: {
      politicalLeaning: string
      factualReporting: string
      mbfcRating?: string
      adFontesScore?: number
    }
  }
  socialMediaForensics?: {
    viralAnalysis: {
      spreadVelocity: string
      amplificationScore: number
      botLikelihood: number
      crossPlatformSpread: string[]
    }
    toxicityAnalysis: {
      overallToxicity: number
      categories: Record<string, number>
      indicatesCoordinatedActivity: boolean
    }
    accountAnalysis?: {
      accountAge: string
      followerCount: number
      postFrequency: string
      botIndicators: string[]
      verifiedAccount: boolean
    }
  }
  propagandaAnalysis: {
    isPropaganda: boolean
    propagandaScore: number
    techniques: {
      name: string
      detected: boolean
      confidence: number
      examples: string[]
    }[]
    narrativeAnalysis: {
      oversimplified: boolean
      blackAndWhiteThinking: boolean
      singlePerspective: boolean
      emotionalManipulation: boolean
      lacksNuance: boolean
    }
    redFlags: string[]
    prepackagedContent: {
      detected: boolean
      likelySource?: string
    }
  }
  institutionsCheck: {
    officialSourceCheck: {
      crsReference: boolean
      cboReference: boolean
      gaoReference: boolean
      blsDataVerified: boolean
      congressGovReference: boolean
    }
    factCheckerResults: {
      source: string
      rating: string
      url: string
      date: string
    }[]
    institutionalConfidence: number
  }
  recommendations: string[]
  complianceNote: string
}

export function DeepVerify() {
  const [inputType, setInputType] = useState<'url' | 'social'>('url')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState<'twitter' | 'facebook' | 'tiktok' | 'instagram'>('twitter')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DeepVerifyResult | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    source: true,
    social: false,
    propaganda: false,
    institutions: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleVerify = async () => {
    setLoading(true)
    setResult(null)

    try {
      const body = inputType === 'url'
        ? { url, content }
        : {
          url: `https://${platform}.com/post`,
          socialMediaPost: { platform, content }
        }

      const response = await fetch('/api/deep-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      setResult(data)
      setExpandedSections({ source: true, social: !!data.socialMediaForensics, propaganda: true, institutions: true })
    } catch (error) {
      console.error('Verification failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-congress-blue" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Congressional-Grade Deep Verification
          </h2>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Multi-layered verification using the same methods as Congressional staff: source evaluation,
          lateral reading, social media forensics, propaganda detection, and trusted institution cross-referencing.
        </p>

        {/* Input Type Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setInputType('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inputType === 'url'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
          >
            <Globe className="w-4 h-4" />
            URL / Article
          </button>
          <button
            onClick={() => setInputType('social')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inputType === 'social'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
          >
            <Share2 className="w-4 h-4" />
            Social Media Post
          </button>
        </div>

        {inputType === 'url' ? (
          <div className="space-y-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to verify (e.g., https://example.com/article)"
              className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Optional: Paste article content for deeper analysis (propaganda detection, claim verification)"
              rows={4}
              className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(['twitter', 'facebook', 'tiktok', 'instagram'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${platform === p
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                >
                  {p === 'twitter' && <Twitter className="w-3 h-3" />}
                  {p === 'facebook' && <Facebook className="w-3 h-3" />}
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the social media post content here for forensic analysis..."
              rows={6}
              className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading || (inputType === 'url' ? !url : !content)}
          className="mt-4 btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Deep Verification...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Run Congressional-Grade Verification
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Overall Score Card */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Verification Complete
                </h3>
                <p className="text-sm text-slate-500">
                  {result.sourceEvaluation.domain} • Verified {new Date(result.verifiedAt).toLocaleString()}
                </p>
              </div>
              <TrustBadge level={result.trustLevel} score={result.overallTrustScore} size="lg" />
            </div>

            {/* Component Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <ScoreCard
                label="Source Credibility"
                score={result.componentScores.sourceCredibility}
                icon={Globe}
              />
              <ScoreCard
                label="Propaganda-Free"
                score={result.componentScores.propagandaFree}
                icon={Eye}
              />
              <ScoreCard
                label="Institutional Backing"
                score={result.componentScores.institutionalBacking}
                icon={Building2}
              />
              <ScoreCard
                label="Social Media Clean"
                score={result.componentScores.socialMediaClean}
                icon={Users}
              />
            </div>

            {/* Recommendations */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Staff Recommendations
              </h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <span className="mt-0.5">{rec}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-4 italic">{result.complianceNote}</p>
            </div>
          </div>

          {/* Source Evaluation */}
          <CollapsibleSection
            title="Source Evaluation & Lateral Reading"
            icon={Globe}
            expanded={expandedSections.source}
            onToggle={() => toggleSection('source')}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Credibility & Bias */}
              <div>
                <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Media Bias Assessment</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Political Leaning</span>
                    <BiasIndicator leaning={result.sourceEvaluation.mediaBias.politicalLeaning} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Factual Reporting</span>
                    <span className={`text-sm font-medium ${getFactualColor(result.sourceEvaluation.mediaBias.factualReporting)}`}>
                      {result.sourceEvaluation.mediaBias.factualReporting.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  {result.sourceEvaluation.mediaBias.adFontesScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Ad Fontes Score</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {result.sourceEvaluation.mediaBias.adFontesScore}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transparency Check */}
              <div>
                <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Transparency Check</h5>
                <div className="space-y-2">
                  {Object.entries(result.sourceEvaluation.transparency).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                      </span>
                      {value ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lateral Reading */}
              <div className="md:col-span-2">
                <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Lateral Reading Results</h5>
                <div className="flex flex-wrap gap-2">
                  {result.sourceEvaluation.lateralReading.wikipediaEntry && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                      Wikipedia Entry
                    </span>
                  )}
                  {result.sourceEvaluation.lateralReading.journalisticStandards && (
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
                      Follows Journalistic Standards
                    </span>
                  )}
                  {result.sourceEvaluation.lateralReading.referencedByAcademia && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                      Academic References
                    </span>
                  )}
                  {result.sourceEvaluation.lateralReading.mentionedBy.map((source, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded">
                      Cited by {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Social Media Forensics */}
          {result.socialMediaForensics && (
            <CollapsibleSection
              title="Social Media Forensics"
              icon={Users}
              expanded={expandedSections.social}
              onToggle={() => toggleSection('social')}
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Viral Analysis */}
                <div>
                  <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Viral Spread Analysis
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Spread Pattern</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${result.socialMediaForensics.viralAnalysis.spreadVelocity === 'organic'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : result.socialMediaForensics.viralAnalysis.spreadVelocity === 'suspicious'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {result.socialMediaForensics.viralAnalysis.spreadVelocity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Amplification Score</span>
                      <span className="text-sm font-medium">{result.socialMediaForensics.viralAnalysis.amplificationScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Cross-Platform</span>
                      <span className="text-xs text-slate-500">
                        {result.socialMediaForensics.viralAnalysis.crossPlatformSpread.join(', ') || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bot Analysis */}
                <div>
                  <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Bot Detection
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Bot Likelihood</span>
                        <span className="text-sm font-medium">{result.socialMediaForensics.viralAnalysis.botLikelihood}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${result.socialMediaForensics.viralAnalysis.botLikelihood > 50 ? 'bg-red-500' :
                              result.socialMediaForensics.viralAnalysis.botLikelihood > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          style={{ width: `${result.socialMediaForensics.viralAnalysis.botLikelihood}%` }}
                        />
                      </div>
                    </div>
                    {result.socialMediaForensics.accountAnalysis?.botIndicators.map((indicator, i) => (
                      <div key={i} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {indicator}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toxicity */}
                <div>
                  <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Toxicity Analysis
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(result.socialMediaForensics.toxicityAnalysis.categories).slice(0, 4).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-xs">{Math.round(value * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${value > 0.5 ? 'bg-red-500' : value > 0.25 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {result.socialMediaForensics.toxicityAnalysis.indicatesCoordinatedActivity && (
                      <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Indicates coordinated activity
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Propaganda Detection */}
          <CollapsibleSection
            title="Propaganda Detection"
            icon={Eye}
            expanded={expandedSections.propaganda}
            onToggle={() => toggleSection('propaganda')}
            badge={result.propagandaAnalysis.isPropaganda ? 'DETECTED' : undefined}
            badgeColor={result.propagandaAnalysis.isPropaganda ? 'red' : undefined}
          >
            <div className="space-y-6">
              {/* Propaganda Score */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${result.propagandaAnalysis.propagandaScore > 50 ? 'text-red-600' :
                      result.propagandaAnalysis.propagandaScore > 25 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                    {result.propagandaAnalysis.propagandaScore}%
                  </div>
                  <div className="text-xs text-slate-500">Propaganda Score</div>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${result.propagandaAnalysis.propagandaScore > 50 ? 'bg-red-500' :
                          result.propagandaAnalysis.propagandaScore > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      style={{ width: `${result.propagandaAnalysis.propagandaScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Detected Techniques */}
              <div>
                <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Propaganda Techniques Detected</h5>
                <div className="grid md:grid-cols-2 gap-2">
                  {result.propagandaAnalysis.techniques.map((technique, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${technique.detected
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${technique.detected ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                          {technique.name}
                        </span>
                        {technique.detected ? (
                          <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded">
                            {technique.confidence}% confidence
                          </span>
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      {technique.detected && technique.examples.length > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Examples: "{technique.examples[0]}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              {result.propagandaAnalysis.redFlags.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h5 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Red Flags
                  </h5>
                  <ul className="space-y-1">
                    {result.propagandaAnalysis.redFlags.map((flag, i) => (
                      <li key={i} className="text-sm text-red-600 dark:text-red-400">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Trusted Institutions */}
          <CollapsibleSection
            title="Trusted Institutions Cross-Reference"
            icon={Building2}
            expanded={expandedSections.institutions}
            onToggle={() => toggleSection('institutions')}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Official Source References */}
              <div>
                <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Official Source References</h5>
                <div className="space-y-2">
                  {Object.entries(result.institutionsCheck.officialSourceCheck).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {key === 'crsReference' ? 'Congressional Research Service (CRS)' :
                          key === 'cboReference' ? 'Congressional Budget Office (CBO)' :
                            key === 'gaoReference' ? 'Government Accountability Office (GAO)' :
                              key === 'blsDataVerified' ? 'Bureau of Labor Statistics (BLS)' :
                                'Congress.gov Reference'}
                      </span>
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="text-xs text-slate-400">Not found</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fact-Checker Results */}
              <div>
                <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">Third-Party Fact-Checks</h5>
                {result.institutionsCheck.factCheckerResults.length > 0 ? (
                  <div className="space-y-2">
                    {result.institutionsCheck.factCheckerResults.map((fc, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{fc.source}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${fc.rating.includes('True') ? 'bg-emerald-100 text-emerald-700' :
                              fc.rating.includes('False') ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {fc.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{fc.date}</span>
                          <a href={fc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No existing fact-checks found for this content.</p>
                )}

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                    Institutional Confidence Score
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {result.institutionsCheck.institutionalConfidence}%
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  )
}

// Helper Components
function CollapsibleSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
  badge,
  badgeColor,
}: {
  title: string
  icon: any
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  badge?: string
  badgeColor?: 'red' | 'amber' | 'emerald'
}) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-congress-blue" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{title}</span>
          {badge && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${badgeColor === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                badgeColor === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
              {badge}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      {expanded && (
        <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}

function ScoreCard({ label, score, icon: Icon }: { label: string; score: number; icon: any }) {
  const color = score >= 75 ? 'emerald' : score >= 50 ? 'amber' : 'red'
  return (
    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <Icon className={`w-5 h-5 mx-auto mb-2 text-${color}-500`} />
      <div className={`text-xl font-bold text-${color}-600`}>{Math.round(score)}%</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function BiasIndicator({ leaning }: { leaning: string }) {
  const positions: Record<string, { position: number; color: string }> = {
    'far-left': { position: 0, color: 'bg-blue-700' },
    'left': { position: 16.6, color: 'bg-blue-500' },
    'left-center': { position: 33.3, color: 'bg-blue-300' },
    'center': { position: 50, color: 'bg-slate-400' },
    'right-center': { position: 66.6, color: 'bg-red-300' },
    'right': { position: 83.3, color: 'bg-red-500' },
    'far-right': { position: 100, color: 'bg-red-700' },
    'unknown': { position: 50, color: 'bg-slate-300' },
  }

  const { position, color } = positions[leaning] || positions['unknown']

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gradient-to-r from-blue-500 via-slate-300 to-red-500 rounded-full relative">
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 ${color} rounded-full border-2 border-white shadow`}
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
        {leaning.replace('-', ' ')}
      </span>
    </div>
  )
}

function getFactualColor(rating: string): string {
  switch (rating) {
    case 'very-high': return 'text-emerald-600'
    case 'high': return 'text-emerald-500'
    case 'mostly-factual': return 'text-lime-600'
    case 'mixed': return 'text-amber-600'
    case 'low': return 'text-red-500'
    case 'very-low': return 'text-red-700'
    default: return 'text-slate-500'
  }
}
