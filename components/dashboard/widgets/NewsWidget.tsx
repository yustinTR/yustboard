'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Newspaper, ExternalLink, RefreshCw, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'

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

export default function NewsWidget() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [selectedCountry, setSelectedCountry] = useState('us')

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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Newspaper className="h-5 w-5" />
            Nieuws
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchNews}
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="space-y-2 mt-3">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {countries.map((country) => (
              <Button
                key={country.value}
                variant={selectedCountry === country.value ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setSelectedCountry(country.value)}
              >
                {country.label}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-3">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {error && (
          <div className="text-center text-sm text-muted-foreground py-8">
            {error}
          </div>
        )}
        
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              Geen nieuws gevonden
            </p>
            <p className="text-xs text-muted-foreground">
              Voeg NEWS_API_KEY toe aan je .env bestand
            </p>
            <a 
              href="https://newsapi.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Gratis API key verkrijgen →
            </a>
          </div>
        )}
        
        {!loading && !error && articles.map((article, index) => (
          <div key={index} className="space-y-2 pb-3 border-b last:border-0">
            {article.urlToImage && (
              <img 
                src={article.urlToImage} 
                alt={article.title}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
            
            <div className="space-y-1">
              <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                {article.title}
              </h3>
              
              {article.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {article.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{article.source.name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(article.publishedAt), { 
                      addSuffix: true,
                      locale: nl 
                    })}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}