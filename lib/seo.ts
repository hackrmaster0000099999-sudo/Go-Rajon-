import { Article, Category, SiteSettings } from './types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gorajon.site';

export function getBaseUrl(): string {
  return SITE_URL.replace(/\/$/, '');
}

/**
 * Generate JSON-LD for the WebSite and Organization
 */
export function generateWebSiteSchema(settings: SiteSettings) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: settings.site_name,
        description: settings.site_description,
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
        inLanguage: ['en-US', 'bn-BD'],
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: settings.site_name,
        url: baseUrl,
        logo: settings.logo_url
          ? {
              '@type': 'ImageObject',
              url: settings.logo_url,
            }
          : undefined,
        contactPoint: {
          '@type': 'ContactPoint',
          email: settings.contact_email,
          contactType: 'editorial inquiries',
        },
      },
    ],
  };
}

/**
 * Generate JSON-LD for an Article / BlogPosting
 */
export function generateArticleSchema(article: Article, settings: SiteSettings) {
  const baseUrl = getBaseUrl();
  const articleUrl = `${baseUrl}/${article.category?.slug || 'article'}/${article.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.seo_title || article.title,
    description: article.meta_description || article.excerpt,
    image: article.featured_image_url ? [article.featured_image_url] : undefined,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author_name || settings.default_author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: settings.site_name,
      logo: settings.logo_url
        ? {
            '@type': 'ImageObject',
            url: settings.logo_url,
          }
        : undefined,
    },
    articleSection: article.category?.name,
    inLanguage: article.content.match(/[\u0980-\u09FF]/) ? 'bn-BD' : 'en-US',
  };
}

/**
 * Generate JSON-LD BreadcrumbList
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}
