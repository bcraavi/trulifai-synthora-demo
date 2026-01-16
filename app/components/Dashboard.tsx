'use client'

import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, Globe, Shield } from 'lucide-react'

interface DashboardStats {
  articlesAnalyzed: number
  averageTrustScore: number
  misinfoDetected: number
  sourcesMonitored: number
}

export function Dashboard() {
  // Mock stats for demo
  const stats: DashboardStats = {
    articlesAnalyzed: 2847,
    averageTrustScore: 78,
    misinfoDetected: 23,
    sourcesMonitored: 200,
  }

  const recentAlerts = [
    {
      id: 1,
      type: 'misinfo',
      title: 'Viral claim about HR-4521 funding',
      description: 'False claim spreading about infrastructure bill allocation',
      time: '2 hours ago',
      severity: 'high',
    },
    {
      id: 2,
      type: 'foreign',
      title: 'Coordinated narrative detected',
      description: 'Unusual amplification pattern on Taiwan policy discussion',
      time: '5 hours ago',
      severity: 'medium',
    },
    {
      id: 3,
      type: 'ai',
      title: 'AI-generated content flagged',
      description: 'Advocacy letter appears to be AI-generated',
      time: '8 hours ago',
      severity: 'low',
    },
  ]

  const topSources = [
    { name: 'Congress.gov', score: 98, articles: 342 },
    { name: 'Reuters', score: 92, articles: 287 },
    { name: 'AP News', score: 91, articles: 256 },
    { name: 'White House', score: 97, articles: 189 },
    { name: 'BBC', score: 82, articles: 178 },
  ]

  const trendingTopics = [
    { topic: 'Infrastructure', mentions: 156, trend: 'up' },
    { topic: 'Healthcare', mentions: 134, trend: 'up' },
    { topic: 'Foreign Policy', mentions: 98, trend: 'down' },
    { topic: 'Climate', mentions: 87, trend: 'up' },
    { topic: 'Economy', mentions: 76, trend: 'stable' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Articles Analyzed"
          value={stats.articlesAnalyzed.toLocaleString()}
          subtext="Last 7 days"
          color="blue"
        />
        <StatCard
          icon={Shield}
          label="Avg Trust Score"
          value={`${stats.averageTrustScore}%`}
          subtext="+2% from last week"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Misinfo Detected"
          value={stats.misinfoDetected.toString()}
          subtext="Flagged for review"
          color="amber"
        />
        <StatCard
          icon={Globe}
          label="Sources Monitored"
          value={stats.sourcesMonitored.toString()}
          subtext="Government & news"
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Recent Alerts
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        alert.type === 'misinfo' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        alert.type === 'foreign' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {alert.type === 'misinfo' ? 'Misinformation' :
                         alert.type === 'foreign' ? 'Foreign Influence' : 'AI Content'}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {alert.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all alerts →
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Sources */}
          <div className="card">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Top Trusted Sources
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {topSources.map((source, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 w-4">{i + 1}</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{source.articles}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      source.score >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {source.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="card">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Trending Topics
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {trendingTopics.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{item.mentions}</span>
                    <span className={`text-xs ${
                      item.trend === 'up' ? 'text-emerald-500' :
                      item.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                    }`}>
                      {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Briefing Preview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Daily Intelligence Briefing Preview
          </h3>
          <span className="text-xs text-slate-500">
            Next delivery: 6:00 AM UTC
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
          <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
{`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 DAILY INTELLIGENCE BRIEFING
   January 16, 2026 | House Judiciary Committee
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP VERIFIED STORIES
────────────────────
✅ Senate advances bipartisan infrastructure...
✅ White House announces new AI policy framework...
⚠️ Healthcare bill faces committee challenges...

MISINFORMATION ALERTS
─────────────────────
🔴 Viral claim about HR-4521 funding DEBUNKED
   Fact-checkers: PolitiFact, Snopes, FactCheck.org

NARRATIVE WATCH
───────────────
📊 Your tracked bills mentioned 47 times today
   • 38 accurate representations
   • 9 contain misleading framing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}
          </pre>
        </div>

        <button className="mt-4 btn-primary">
          Configure Briefing Preferences
        </button>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: any
  label: string
  value: string
  subtext: string
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  }

  return (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{subtext}</div>
    </div>
  )
}
