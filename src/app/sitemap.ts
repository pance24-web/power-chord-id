import type { MetadataRoute } from 'next';
import { INITIAL_SONGS } from '../data/songs';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const songUrls: MetadataRoute.Sitemap = INITIAL_SONGS.map((song) => ({
    url: `${SITE_URL}/chord/${encodeURIComponent(song.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/?tab=catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/?tab=artists`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...songUrls,
  ];
}
