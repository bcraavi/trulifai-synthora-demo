'use client'

import { useState } from 'react'
import { Upload, FileText, Link, Loader2, CheckCircle, XCircle, AlertTriangle, Copy, Download } from 'lucide-react'
import { TrustBadge } from './TrustBadge'

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

interface BatchResult {
  success: boolean
  analyzedAt: string
  summary: {
    total: number
    verified: number
    disputed: number
    needsReview: number
    averageTrustScore: number
  }
  highPriorityItems: string[]
  results: AnalyzedItem[]
  recommendations: string[]
}

export function BatchAnalyzer() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BatchResult | null>(null)
  const [selectedItem, setSelectedItem] = useState<AnalyzedItem | null>(null)

  const parseInput = (text: string): { id: string; type: 'url' | 'claim'; content: string }[] => {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.map((line, index) => {
      const trimmed = line.trim()
      const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      return {
        id: `item_${index + 1}`,
        type: isUrl ? 'url' : 'claim',
        content: trimmed,
      }
    })
  }

  const handleAnalyze = async () => {
    const items = parseInput(input)
    if (items.length === 0) return

    setLoading(true)
    setResults(null)
    setSelectedItem(null)

    try {
      const response = await fetch('/api/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, generateResponses: true }),
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'true':
      case 'mostly_true':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'false':
      case 'mostly_false':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
    }
  }

  const getVerdictLabel = (verdict: string) => {
    const labels: Record<string, string> = {
      'true': 'True',
      'mostly_true': 'Mostly True',
      'mixed': 'Mixed',
      'mostly_false': 'Mostly False',
      'false': 'False',
      'unverified': 'Unverified',
    }
    return labels[verdict] || verdict
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadReport = () => {
    if (!results) return

    const report = `CONSTITUENT MAIL ANALYSIS REPORT
Generated: ${new Date(results.analyzedAt).toLocaleString()}

SUMMARY
-------
Total Items Analyzed: ${results.summary.total}
Verified: ${results.summary.verified}
Disputed: ${results.summary.disputed}
Needs Review: ${results.summary.needsReview}
Average Trust Score: ${results.summary.averageTrustScore}%

${results.highPriorityItems.length > 0 ? `HIGH PRIORITY ITEMS: ${results.highPriorityItems.join(', ')}` : ''}

DETAILED RESULTS
----------------
${results.results.map(item => `
[${item.id}] ${item.type.toUpperCase()}
Content: ${item.content}
Verdict: ${getVerdictLabel(item.verdict)} (${item.trustScore}% trust score)
Confidence: ${item.confidence}%
Explanation: ${item.explanation}
${item.suggestedResponse ? `\nSuggested Response:\n${item.suggestedResponse}` : ''}
---`).join('\n')}

RECOMMENDATIONS
---------------
${results.recommendations.join('\n')}
`

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `constituent-analysis-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-congress-blue" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Constituent Mail Analyzer
          </h2>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Paste URLs or claims from constituent correspondence (one per line). The system will verify each item and generate suggested responses.
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter URLs or claims (one per line):

https://example.com/article-about-policy
Congress voted to give themselves a 40% raise
The new bill will cost taxpayers $500 billion
https://twitter.com/user/status/123456`}
          className="w-full h-48 p-4 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            {parseInput(input).length} item(s) detected
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || parseInput(input).length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyze Batch
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Analysis Summary
              </h3>
              <button
                onClick={downloadReport}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {results.summary.total}
                </div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{results.summary.verified}</div>
                <div className="text-xs text-emerald-600">Verified</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.summary.disputed}</div>
                <div className="text-xs text-red-600">Disputed</div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{results.summary.needsReview}</div>
                <div className="text-xs text-amber-600">Needs Review</div>
              </div>
              <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {results.summary.averageTrustScore}%
                </div>
                <div className="text-xs text-primary-600">Avg Trust</div>
              </div>
            </div>

            {results.highPriorityItems.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  {results.highPriorityItems.length} high-priority item(s) require attention
                </div>
              </div>
            )}
          </div>

          {/* Results List */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                Detailed Results
              </h3>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.results.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 cursor-pointer transition-colors ${selectedItem?.id === item.id
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                >
                  <div className="flex items-start gap-3">
                    {getVerdictIcon(item.verdict)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                          {item.type === 'url' ? <Link className="w-3 h-3 inline mr-1" /> : null}
                          {item.type.toUpperCase()}
                        </span>
                        <TrustBadge
                          level={item.trustScore >= 80 ? 'verified' : item.trustScore >= 60 ? 'caution' : 'alert'}
                          score={item.trustScore}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                        {item.content}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {getVerdictLabel(item.verdict)} • {item.confidence}% confidence
                      </p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedItem?.id === item.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                      <div>
                        <div className="text-xs font-medium text-slate-500 mb-1">Explanation</div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{item.explanation}</p>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-slate-500 mb-1">Sources</div>
                        <div className="flex flex-wrap gap-2">
                          {item.sources.map((source, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>

                      {item.suggestedResponse && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-medium text-slate-500">Suggested Response</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(item.suggestedResponse!)
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg whitespace-pre-wrap">
                            {item.suggestedResponse}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
