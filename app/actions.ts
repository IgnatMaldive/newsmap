'use server'

import { NewsResponse, NewsArticle } from './types'
import { extractLocation } from './utils/extractLocation'

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY || 'test'
const GUARDIAN_API_URL = 'https://content.guardianapis.com/search'

export async function fetchNews(section: string = 'world') {
  try {
    const params = new URLSearchParams({
      'api-key': GUARDIAN_API_KEY,
      'section': section,
      'show-fields': 'headline,trailText,thumbnail,bodyText',
      'page-size': '50',
    })

    const response = await fetch(`${GUARDIAN_API_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 600 } // Cache for 10 minutes
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json() as NewsResponse
    
    if (data.response.status !== 'ok') {
      throw new Error(data.response.message || 'Failed to fetch news')
    }

    const articlesWithLocation = await Promise.all(data.response.results.map(async (article) => {
      const location = await extractLocation(article.fields.bodyText || article.fields.trailText);
      return {
        ...article,
        location
      } as NewsArticle;
    }));

    return { success: true, articles: articlesWithLocation }
  } catch (error) {
    console.error('Error fetching news:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch news'
    }
  }
}

