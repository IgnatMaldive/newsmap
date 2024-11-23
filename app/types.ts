export interface NewsArticle {
  id: string
  sectionId: string
  webTitle: string
  webUrl: string
  fields: {
    headline: string
    trailText: string
    thumbnail?: string
    bodyText: string
  }
  location?: [number, number]
}

export interface NewsResponse {
  response: {
    status: string
    results: NewsArticle[]
    message?: string
  }
}

export interface NewsMarker {
  id: string
  lat: number
  lng: number
  article: NewsArticle
}

export interface NewsSuccessResponse {
  success: true
  articles: NewsArticle[]
}

export interface NewsErrorResponse {
  success: false
  error: string
}

export type NewsActionResponse = NewsSuccessResponse | NewsErrorResponse

