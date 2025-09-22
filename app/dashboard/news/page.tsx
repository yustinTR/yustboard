'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { FiFileText, FiExternalLink, FiRefreshCw, FiCalendar, FiChevronLeft } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

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

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [selectedCountry, setSelectedCountry] = useState('us')
  const [page, setPage] = useState(1)

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
    { value: 'us', label: '🇺🇸 Verenigde Staten' },
    { value: 'nl', label: '🇳🇱 Nederland' },
    { value: 'gb', label: '🇬🇧 Verenigd Koninkrijk' },
    { value: 'de', label: '🇩🇪 Duitsland' },
    { value: 'fr', label: '🇫🇷 Frankrijk' },
    { value: 'it', label: '🇮🇹 Italië' },
    { value: 'es', label: '🇪🇸 Spanje' },
    { value: 'ca', label: '🇨🇦 Canada' },
    { value: 'au', label: '🇦🇺 Australië' }
  ]

  const fetchNews = useCallback(async (pageNum = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/news?category=${selectedCategory}&country=${selectedCountry}&page=${pageNum}`)
      if (!response.ok) throw new Error('Failed to fetch news')
      
      const data = await response.json()
      if (pageNum === 1) {
        setArticles(data.articles || [])
      } else {
        setArticles(prev => [...prev, ...(data.articles || [])])
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setError('Nieuws kon niet worden geladen')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedCountry])

  useEffect(() => {
    setPage(1)
    fetchNews(1)
  }, [selectedCategory, selectedCountry, fetchNews])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchNews(nextPage)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <FiChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FiFileText className="h-8 w-8" />
              Nieuws
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setPage(1)
              fetchNews(1)
            }}
            disabled={loading}
          >
            <FiRefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Land:</span>
            {countries.map((country) => (
              <Button
                key={country.value}
                variant={selectedCountry === country.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCountry(country.value)}
                className="text-xs"
              >
                {country.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Categorie:</span>
            {categories.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-center text-sm text-destructive py-8">
          {error}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <FiFileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            Geen nieuws gevonden
          </p>
          <p className="text-sm text-muted-foreground">
            Probeer een ander land of categorie
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <article key={index} className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all transition-colors">
            {article.urlToImage && (
              <Image
                src={article.urlToImage}
                alt={article.title}
                width={400}
                height={192}
                className="w-full h-48 object-cover"
                unoptimized={true}
              />
            )}
            
            <div className="p-6">
              <h2 className="font-semibold text-lg mb-2 line-clamp-2">
                {article.title}
              </h2>
              
              {article.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {article.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span className="font-medium">{article.source.name}</span>
                <span className="flex items-center gap-1">
                  <FiCalendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(article.publishedAt), { 
                    addSuffix: true,
                    locale: nl 
                  })}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(article.url, '_blank')}
              >
                Lees meer
                <FiExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {articles.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Laden...
              </>
            ) : (
              'Meer laden'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}