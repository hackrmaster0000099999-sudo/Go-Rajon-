import { MetadataRoute } from 'next';
import { getArticles, getCategories, getAllStaticPages } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gorajon.site';

  // 1. Static Core Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. Static Policy Pages
  const pages = await getAllStaticPages();
  const pageRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // 3. Category Archive Pages
  const categories = await getCategories({ includeCounts: false });
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Published Articles (strictly excluding drafts, scheduled future dates, and noindex)
  const articlesResult = await getArticles({ pageSize: 1000, status: 'published' });
  const articleRoutes: MetadataRoute.Sitemap = articlesResult.articles
    .filter((a) => !a.noindex)
    .map((article) => ({
      url: `${baseUrl}/${article.category?.slug || 'article'}/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at || article.created_at),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...pageRoutes];
}
