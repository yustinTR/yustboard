import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasNewsApiKey: !!process.env.NEWS_API_KEY,
    keyLength: process.env.NEWS_API_KEY?.length || 0,
    keyPrefix: process.env.NEWS_API_KEY?.substring(0, 8) || 'not found'
  })
}