'use client'

import { CheckCircle, AlertTriangle, XCircle, Shield } from 'lucide-react'

interface TrustBadgeProps {
  level: 'verified' | 'caution' | 'alert'
  score: number
  showScore?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TrustBadge({ level, score, showScore = true, size = 'md' }: TrustBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  }

  const config = {
    verified: {
      icon: CheckCircle,
      label: 'Verified',
      classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    caution: {
      icon: AlertTriangle,
      label: 'Caution',
      classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    alert: {
      icon: XCircle,
      label: 'Alert',
      classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    },
  }

  const { icon: Icon, label, classes } = config[level]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${sizeClasses[size]} ${classes}`}
    >
      <Icon size={iconSize[size]} />
      <span>{label}</span>
      {showScore && (
        <span className="opacity-75">({score}%)</span>
      )}
    </span>
  )
}

export function TrustScoreRing({ score, size = 60 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}

export function VerificationSummary({
  trustScore,
  trustLevel,
  sourceCredibility,
  aiProbability,
  flaggedClaims = []
}: {
  trustScore: number
  trustLevel: 'verified' | 'caution' | 'alert'
  sourceCredibility: number
  aiProbability: number
  flaggedClaims?: string[]
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-congress-blue" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">TrulifAI Verification</span>
        </div>
        <TrustBadge level={trustLevel} score={trustScore} />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{trustScore}%</div>
          <div className="text-xs text-slate-500">Trust Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{sourceCredibility}%</div>
          <div className="text-xs text-slate-500">Source Credibility</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{aiProbability}%</div>
          <div className="text-xs text-slate-500">AI Probability</div>
        </div>
      </div>

      {flaggedClaims.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
            {flaggedClaims.length} claim(s) need verification:
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            {flaggedClaims.map((claim, i) => (
              <li key={i} className="flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 text-amber-500 flex-shrink-0" />
                {claim}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
