'use client'

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FiUsers } from 'react-icons/fi'
import Link from 'next/link'

const SocialWidget = React.memo(function SocialWidget() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FiUsers className="h-5 w-5" />
          Social Media
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Social media integratie komt binnenkort
          </p>
          <p className="text-xs text-muted-foreground">
            Twitter, Instagram en LinkedIn feeds
          </p>
        </div>
      </CardContent>
      
      <div className="p-3 border-t border-border text-center">
        <Link 
          href="/dashboard/social" 
          className="text-sm text-primary hover:underline"
        >
          Bekijk social dashboard →
        </Link>
      </div>
    </Card>
  )
});

export default SocialWidget;