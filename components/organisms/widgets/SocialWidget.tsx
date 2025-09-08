'use client'

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/molecules/card'
import { FiUsers } from 'react-icons/fi'
import Link from 'next/link'

const SocialWidget = React.memo(function SocialWidget() {
  return (
    <Card className="h-full flex flex-col backdrop-blur-md bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 shadow-xl shadow-black/10">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/80 to-purple-600/80 backdrop-blur-sm text-white border-b border-white/20 dark:border-gray-700/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FiUsers className="h-5 w-5" />
          Social Media
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur-sm">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Social media integratie komt binnenkort
          </p>
          <p className="text-xs text-muted-foreground">
            Twitter, Instagram en LinkedIn feeds
          </p>
        </div>
      </CardContent>
      
      <div className="p-3 border-t border-white/20 dark:border-gray-700/30 bg-white/5 backdrop-blur-sm text-center">
        <Link 
          href="/dashboard/social" 
          className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center justify-center hover:bg-white/10 dark:hover:bg-gray-800/20 px-3 py-1 rounded-lg transition-all duration-200"
        >
          Bekijk social dashboard →
        </Link>
      </div>
    </Card>
  )
});

export default SocialWidget;