'use client'

import React from 'react'

import { FiUsers } from 'react-icons/fi'
import Link from 'next/link'

const SocialWidget = React.memo(function SocialWidget() {
  return (
    <div className="h-full backdrop-blur-xl bg-white/15 dark:bg-gray-900/15 border border-white/25 dark:border-gray-700/25 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Header with purple gradient for social */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm text-white">
        <h3 className="text-lg font-medium tracking-wide flex items-center gap-2">
          <FiUsers className="h-5 w-5" />
          Social Media
        </h3>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-4 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-purple-500/15 border border-purple-400/30 text-purple-600 dark:text-purple-400 p-6 rounded-2xl backdrop-blur-sm">
            <FiUsers className="mx-auto mb-4 h-12 w-12" />
            <p className="text-sm font-medium mb-2">
              Social media integratie komt binnenkort
            </p>
            <p className="text-xs opacity-75">
              Twitter, Instagram en LinkedIn feeds
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Material button */}
      <div className="px-6 py-4 bg-white/10 dark:bg-gray-800/15 backdrop-blur-sm border-t border-white/20 dark:border-gray-600/20">
        <Link
          href="/dashboard/social"
          className="block w-full text-center bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium py-3 px-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] border border-purple-400/30 backdrop-blur-sm"
        >
          Bekijk social dashboard
        </Link>
      </div>
    </div>
  )
});

export default SocialWidget;