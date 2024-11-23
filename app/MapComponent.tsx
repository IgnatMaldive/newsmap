'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { Skeleton } from '../components/ui/skeleton';

// Types for props
interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  article: {
    fields: {
      headline: string;
      trailText: string;
    };
    webUrl: string;
  };
}

interface MapComponentProps {
  markers: MarkerData[];
  selectedSection: string;
  coordinates: [number, number];
}

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <Skeleton className="w-full h-[600px]" /> }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapComponent({ markers, selectedSection, coordinates }: MapComponentProps) {
  const [icon, setIcon] = useState<L.Icon | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIcon(
        new L.Icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        })
      );
    }
  }, []);

  return (
    <MapContainer
      center={coordinates}
      zoom={selectedSection === 'world' ? 2 : 4}
      className="w-full h-[600px]"
      key={selectedSection}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={icon}
        >
          <Popup>
            <div className="max-w-xs">
              <h3 className="font-semibold">{marker.article.fields.headline}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {marker.article.fields.trailText}
              </p>
              <a
                href={marker.article.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                Read more
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
