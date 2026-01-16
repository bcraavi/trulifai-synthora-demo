'use client'

import { useState } from 'react'
import { ExternalLink, Clock, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { TrustBadge, VerificationSummary } from './TrustBadge'

interface Article {
  _id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  topic?: string
  trulifai: {
    trustScore: number
    trustLevel: 'verified' | 'caution' | 'alert'
    aiProbability: number
    flaggedClaims: string[]
    sourceCredibility: number
    verifiedAt: string
  }
}

export function ArticleCard({ article }: { article: Article }) {
  const [expanded, setExpanded] = useState(false)

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-xl">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {article.topic && (
                <span className="text-xs font-medium px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                  {article.topic}
                </span>
              )}
              <TrustBadge
                level={article.trulifai.trustLevel}
                score={article.trulifai.trustScore}
                size="sm"
              />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
              {article.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {article.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Source
          </a>
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Verification Details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View Verification Details
          </>
        )}
      </button>

      {/* Expanded Verification Details */}
      {expanded && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <VerificationSummary
            trustScore={article.trulifai.trustScore}
            trustLevel={article.trulifai.trustLevel}
            sourceCredibility={article.trulifai.sourceCredibility}
            aiProbability={article.trulifai.aiProbability}
            flaggedClaims={article.trulifai.flaggedClaims}
          />
          <div className="mt-3 text-xs text-slate-500">
            Verified: {new Date(article.trulifai.verifiedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

export function ArticleCardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
          <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
      <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  )
}
