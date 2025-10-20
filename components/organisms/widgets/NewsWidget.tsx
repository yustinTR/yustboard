'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { FiFileText, FiExternalLink, FiRefreshCw, FiCalendar } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const NewsModal = dynamic(() => import('./NewsModal'), { ssr: false })

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    name: string
  }
  category?: string
}

const NewsWidget = React.memo(function NewsWidget() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [selectedCountry, setSelectedCountry] = useState('us')
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const categories = [
    { value: 'general', label: 'Algemeen' },
    { value: 'business', label: 'Zakelijk' },
    { value: 'technology', label: 'Tech' },
    { value: 'sports', label: 'Sport' },
    { value: 'health', label: 'Gezondheid' },
    { value: 'science', label: 'Wetenschap' },
    { value: 'entertainment', label: 'Entertainment' }
  ]

  const countries = [
    { value: 'us', label: '🇺🇸 VS' },
    { value: 'nl', label: '🇳🇱 NL' },
    { value: 'gb', label: '🇬🇧 UK' },
    { value: 'de', label: '🇩🇪 DE' }
  ]

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/news?category=${selectedCategory}&country=${selectedCountry}`)
      if (!response.ok) throw new Error('Failed to fetch news')
      
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Error fetching news:', error)
      setError('Nieuws kon niet worden geladen')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedCountry])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with purple gradient for news */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500/90 to-violet-500/90 backdrop-blur-sm text-white flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
            <FiFileText className="h-5 w-5" />
            Nieuws
          </h3>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer hover:scale-105"
          >
            <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {countries.map((country) => (
              <button
                key={country.value}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 whitespace-nowrap border backdrop-blur-sm ${
                  selectedCountry === country.value
                    ? "bg-white/30 text-white border-white/40"
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setSelectedCountry(country.value)}
              >
                {country.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300 whitespace-nowrap border backdrop-blur-sm ${
                  selectedCategory === cat.value
                    ? "bg-white/30 text-white border-white/40"
                    : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
                }`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="h-8 w-8 animate-spin text-purple-500 mr-3" />
            <span className="text-gray-600 dark:text-gray-400 text-sm">Loading news...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/15 border border-red-400/30 text-red-600 dark:text-red-400 p-4 rounded-2xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="bg-yellow-500/15 border border-yellow-400/30 text-yellow-600 dark:text-yellow-400 p-4 rounded-2xl backdrop-blur-sm">
              <p className="text-sm font-medium mb-2">Geen nieuws gevonden</p>
              <p className="text-xs mb-3">Voeg NEWS_API_KEY toe aan je .env bestand</p>
              <a
                href="https://newsapi.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-500 hover:text-purple-400 underline font-medium"
              >
                Gratis API key verkrijgen →
              </a>
            </div>
          </div>
        )}

        {!loading && !error && articles.slice(0, 3).map((article, index) => (
          <div
            key={index}
            className="bg-white/20 dark:bg-gray-800/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            {article.urlToImage && (
              <div className="mb-3">
                <Image
                  src={article.urlToImage}
                  alt={article.title}
                  width={400}
                  height={200}
                  className="w-full h-32 object-cover rounded-xl"
                />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2 leading-snug text-gray-900 dark:text-gray-100">
                {article.title}
              </h3>

              {article.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {article.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <span className="font-medium">{article.source.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(article.publishedAt), {
                      addSuffix: true,
                      locale: nl
                    })}
                  </span>
                </div>

                <button
                  className="bg-white/20 dark:bg-gray-700/20 hover:bg-white/30 dark:hover:bg-gray-600/30 p-2 rounded-lg transition-all duration-300 text-gray-600 dark:text-gray-400 hover:text-purple-500 border border-white/30 dark:border-gray-600/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(article.url, '_blank');
                  }}
                >
                  <FiExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <Link
          href="/dashboard/news"
          className="block w-full text-center bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-purple-400/30 backdrop-blur-sm"
        >
          Alle nieuws bekijken
        </Link>
      </div>

      {/* News Modal - only render after client-side hydration */}
      {isMounted && (
        <NewsModal
          article={selectedArticle}
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  )
});

export default NewsWidget;