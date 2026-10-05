import type { MetadataRoute } from 'next';
import { INITIAL_SONGS } from '../data/songs';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://powerchord.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const songUrls: MetadataRoute.Sitemap = INITIAL_SONGS.map((song) => ({
    url: `${baseUrl}/?song=${encodeURIComponent(song.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/?tab=catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=artists`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...songUrls,
  ];
}
