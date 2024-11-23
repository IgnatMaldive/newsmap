'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { fetchNews } from './actions';
import type { NewsArticle, NewsMarker } from './types';
import { AlertCircle, Newspaper } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

const SECTION_COORDINATES: Record<string, [number, number]> = {
  world: [0, 0],
  uk: [55.3781, -3.4360],
  us: [37.0902, -95.7129],
  australia: [-25.2744, 133.7751],
};

export default function NewsMap() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('world');

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchNews(selectedSection);
      if (result.success) {
        setArticles(result.articles || []); // Ensure articles is an array
      } else {
        setError(result.error || 'Failed to fetch news');
      }
      setLoading(false);
    };
    loadNews();
  }, [selectedSection]);

  const markers: NewsMarker[] = articles
    .filter((article) => article.location)
    .map((article) => ({
      id: article.id,
      lat: article.location![0],
      lng: article.location![1],
      article,
    }));

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Guardian News Map</CardTitle>
          <CardDescription>Latest news stories plotted by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {Object.keys(SECTION_COORDINATES).map((section) => (
              <Button
                key={section}
                variant={selectedSection === section ? 'default' : 'outline'}
                onClick={() => setSelectedSection(section)}
              >
                {section.toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-[2fr_1fr] gap-4">
        <Card className="h-[600px]">
          <CardContent className="p-0">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <MapComponent
                markers={markers}
                selectedSection={selectedSection}
                coordinates={SECTION_COORDINATES[selectedSection]}
              />
            )}
          </CardContent>
        </Card>

        <Card className="h-[600px] overflow-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Latest Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-24" />
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <Card key={article.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2">{article.fields.headline}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {article.fields.trailText}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>{article.sectionId}</span>
                        <a
                          href={article.webUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Read more
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
