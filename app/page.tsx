'use client'

import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { ArticleCard, ArticleCardSkeleton } from './components/ArticleCard'
import { BatchAnalyzer } from './components/BatchAnalyzer'
import { Dashboard } from './components/Dashboard'
import { DeepVerify } from './components/DeepVerify'
import { RefreshCw, Filter, Search } from 'lucide-react'

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

export default function Home() {
  const [activeTab, setActiveTab] = useState('feed')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'verified' | 'caution' | 'alert'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/articles?limit=20')
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchArticles()
    }
  }, [activeTab])

  const filteredArticles = articles.filter(article => {
    // Trust level filter
    if (filter !== 'all' && article.trulifai.trustLevel !== filter) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
      )
    }

    return true
  })

  const stats = {
    total: articles.length,
    verified: articles.filter(a => a.trulifai.trustLevel === 'verified').length,
    caution: articles.filter(a => a.trulifai.trustLevel === 'caution').length,
    alert: articles.filter(a => a.trulifai.trustLevel === 'alert').length,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="card p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Filters and Refresh */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {(['all', 'verified', 'caution', 'alert'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          filter === f
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {f !== 'all' && (
                          <span className="ml-1 opacity-60">
                            ({f === 'verified' ? stats.verified : f === 'caution' ? stats.caution : stats.alert})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={fetchArticles}
                    disabled={loading}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm">
                <span className="text-slate-500">
                  Showing <span className="font-medium text-slate-700 dark:text-slate-300">{filteredArticles.length}</span> of {articles.length} articles
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-slate-600 dark:text-slate-400">{stats.verified} verified</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-slate-600 dark:text-slate-400">{stats.caution} caution</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-slate-600 dark:text-slate-400">{stats.alert} alert</span>
                </span>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Filter className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
                    No articles match your filters
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analyze' && <BatchAnalyzer />}

        {activeTab === 'deepverify' && <DeepVerify />}

        {activeTab === 'dashboard' && <Dashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>
              Congressional Intelligence Platform • Demo Version
            </div>
            <div className="flex items-center gap-4">
              <span>Powered by TrulifAI + SynthoraAI</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span>Data refreshed every 60 seconds</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
