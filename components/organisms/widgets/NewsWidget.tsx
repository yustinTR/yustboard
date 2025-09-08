'use client'

import React, { useEffect, useState } from 'react'
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

  const fetchNews = async () => {
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
  }

  useEffect(() => {
    fetchNews()
  }, [selectedCategory, selectedCountry])

  return (
    <div className="h-[600px] backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/10 overflow-hidden flex flex-col">
      <div className="p-4 bg-gradient-to-r from-purple-500/80 to-purple-600/80 backdrop-blur-sm text-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <FiFileText className="h-5 w-5" />
            Nieuws
          </h3>
          <button
            onClick={fetchNews}
            disabled={loading}
            className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-2 mt-3">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {countries.map((country) => (
              <button
                key={country.value}
                className={`h-7 px-2 text-xs rounded-lg transition-all duration-200 whitespace-nowrap ${
                  selectedCountry === country.value 
                    ? "bg-white/20 text-white" 
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
                onClick={() => setSelectedCountry(country.value)}
              >
                {country.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`px-2 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/10 text-white/80 border border-white/20 hover:bg-white/15 hover:text-white"
                }`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-white/5 backdrop-blur-sm space-y-3">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <FiRefreshCw className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        )}
        
        {error && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-8">
            {error}
          </div>
        )}
        
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Geen nieuws gevonden
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Voeg NEWS_API_KEY toe aan je .env bestand
            </p>
            <a 
              href="https://newsapi.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-purple-500 hover:text-purple-400 underline"
            >
              Gratis API key verkrijgen →
            </a>
          </div>
        )}
        
        {!loading && !error && articles.map((article, index) => (
          <div 
            key={index} 
            className="space-y-2 pb-3 border-b border-white/10 dark:border-gray-700/30 last:border-0 hover:bg-white/5 dark:hover:bg-gray-800/20 p-2 rounded-lg transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            {article.urlToImage && (
              <img 
                src={article.urlToImage} 
                alt={article.title}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
            
            <div className="space-y-1">
              <h3 className="font-medium text-sm line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">
                {article.title}
              </h3>
              
              {article.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {article.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-1">
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
                  className="h-7 w-7 hover:bg-white/10 dark:hover:bg-gray-800/20 rounded-lg transition-all duration-200 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-purple-500"
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
      
      <div className="p-3 bg-white/5 dark:bg-gray-800/20 backdrop-blur-sm border-t border-white/10 dark:border-gray-700/30 text-center flex-shrink-0">
        <Link 
          href="/dashboard/news" 
          className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center justify-center hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"
        >
          Alle nieuws bekijken
          <FiExternalLink className="ml-1 h-3 w-3" />
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