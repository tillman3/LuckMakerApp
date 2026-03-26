import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

const SITE_URL = 'https://luckmaker3000.com';

const GAME_IDS = [
  'powerball', 'mega_millions', 'lotto_texas', 'texas_two_step',
  'cash_five', 'pick3', 'daily4', 'all_or_nothing',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${SITE_URL}/games`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/results`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_URL}/generator`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${SITE_URL}/tracker`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const gamePages = GAME_IDS.map(id => ({
    url: `${SITE_URL}/games/${id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  const blogIndex = [
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
  ];

  const blogPosts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date || now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...gamePages, ...blogIndex, ...blogPosts];
}
