import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Share2, Tag } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, getSiteSettings } from '@/lib/data';
import { generateArticleSchema } from '@/lib/seo';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ArticleCard from '@/components/ArticleCard';
import AdPlacement from '@/components/AdPlacement';

interface ArticlePageProps {
  params: Promise<{
    categorySlug: string;
    articleSlug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { articleSlug } = await params;
  const [article, settings] = await Promise.all([
    getArticleBySlug(articleSlug),
    getSiteSettings(),
  ]);

  if (!article) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false },
    };
  }

  const title = article.seo_title || article.title;
  const description = article.meta_description || article.excerpt || settings.default_meta_description;
  const canonicalUrl = article.canonical_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gorajon.site'}/${article.category?.slug || 'article'}/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.author_name || settings.default_author_name],
      section: article.category?.name,
      images: article.featured_image_url
        ? [{ url: article.featured_image_url, alt: article.featured_image_alt || article.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featured_image_url ? [article.featured_image_url] : [],
    },
    robots: {
      index: !article.noindex,
      follow: !article.noindex,
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { categorySlug, articleSlug } = await params;

  const [article, settings] = await Promise.all([
    getArticleBySlug(articleSlug),
    getSiteSettings(),
  ]);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.id, article.category_id, 3);
  const jsonLd = generateArticleSchema(article, settings);

  const wordCount = article.content.split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const updatedDate =
    article.updated_at && article.published_at && new Date(article.updated_at).getTime() - new Date(article.published_at).getTime() > 86400000
      ? new Date(article.updated_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

  const breadcrumbItems = [
    ...(article.category
      ? [{ name: article.category.name, url: `/category/${article.category.slug}` }]
      : []),
    ...(article.subcategory
      ? [{ name: article.subcategory.name, url: `/category/${article.category?.slug}/${article.subcategory.slug}` }]
      : []),
    { name: article.title, url: `/${categorySlug}/${article.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Article Header */}
        <header className="mb-8">
          {article.category && (
            <div className="mb-3 flex items-center gap-2">
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900"
              >
                <Tag className="h-3 w-3" />
                {article.category.name}
              </Link>
              {article.subcategory && (
                <>
                  <span className="text-stone-300">/</span>
                  <Link
                    href={`/category/${article.category.slug}/${article.subcategory.slug}`}
                    className="text-xs text-stone-500 hover:text-stone-900"
                  >
                    {article.subcategory.name}
                  </Link>
                </>
              )}
            </div>
          )}

          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl md:text-5xl leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-stone-600 font-serif italic border-l-2 border-stone-200 pl-4 py-1">
              {article.excerpt}
            </p>
          )}

          {/* Author and Date Meta */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-stone-100 py-3 text-xs text-stone-500">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-stone-800">
                <User className="h-3.5 w-3.5 text-stone-400" />
                {article.author_name || settings.default_author_name}
              </span>

              {publishedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-stone-400" />
                  Published {publishedDate}
                </span>
              )}

              {updatedDate && (
                <span className="hidden sm:inline-block text-stone-400">
                  (Updated {updatedDate})
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-stone-400" />
                {readMinutes} min read
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400">{settings.site_name}</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image_url && (
          <figure className="mb-10 overflow-hidden rounded-lg bg-stone-100">
            <div className="relative aspect-16/9 w-full">
              <Image
                src={article.featured_image_url}
                alt={article.featured_image_alt || article.title}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {article.featured_image_alt && (
              <figcaption className="p-2 text-center text-xs text-stone-400">
                {article.featured_image_alt}
              </figcaption>
            )}
          </figure>
        )}

        {/* Top Content Ad */}
        <AdPlacement
          placement="in_content"
          adCode={settings.ad_in_content_code}
          adsEnabled={settings.ads_enabled}
        />

        {/* Article Body Content */}
        <article className="prose-content">
          <MarkdownRenderer content={article.content} />
        </article>

        {/* Bottom Content Ad */}
        <AdPlacement
          placement="after_content"
          adCode={settings.ad_after_content_code}
          adsEnabled={settings.ads_enabled}
        />

        {/* Article Footer & Author Bio */}
        <footer className="mt-12 border-t border-stone-200 pt-8">
          <div className="rounded-lg bg-stone-50 p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-stone-800 text-white flex items-center justify-center font-serif text-lg font-bold shrink-0">
              {(article.author_name || 'G')[0]}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Written by {article.author_name || settings.default_author_name}
              </h3>
              <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                Contributing editor at {settings.site_name}. Writing on software architecture, thoughtful technology, and digital culture.
              </p>
            </div>
          </div>
        </footer>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 border-t border-stone-200 pt-10">
            <h2 className="font-serif text-xl font-bold tracking-tight text-stone-900 mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
