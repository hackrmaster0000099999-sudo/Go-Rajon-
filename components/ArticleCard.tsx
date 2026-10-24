import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/types';
import { Calendar, Clock } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const categorySlug = article.category?.slug || 'general';
  const articleHref = `/${categorySlug}/${article.slug}`;

  // Estimate reading time (approx 200 words per minute)
  const wordCount = article.content.split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  if (featured) {
    return (
      <article className="group grid grid-cols-1 gap-6 border-b border-stone-200 pb-10 lg:grid-cols-12 lg:gap-8">
        {article.featured_image_url && (
          <div className="relative aspect-16/10 overflow-hidden rounded-lg bg-stone-100 lg:col-span-7">
            <Link href={articleHref} tabIndex={-1}>
              <Image
                src={article.featured_image_url}
                alt={article.featured_image_alt || article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-300 group-hover:scale-102"
                referrerPolicy="no-referrer"
                priority
              />
            </Link>
          </div>
        )}

        <div className={`flex flex-col justify-center ${article.featured_image_url ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          {article.category && (
            <Link
              href={`/category/${article.category.slug}`}
              className="inline-block text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900"
            >
              {article.category.name}
            </Link>
          )}

          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            <Link
              href={articleHref}
              className="transition-colors hover:text-stone-700"
            >
              {article.title}
            </Link>
          </h2>

          {article.excerpt && (
            <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
              {article.excerpt}
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-stone-500">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readMinutes} min read
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col justify-between border-b border-stone-100 pb-8 sm:border-b-0 sm:pb-0">
      <div>
        {article.featured_image_url && (
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-md bg-stone-100 mb-3">
            <Link href={articleHref} tabIndex={-1}>
              <Image
                src={article.featured_image_url}
                alt={article.featured_image_alt || article.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>
        )}

        {article.category && (
          <div className="flex items-center gap-2">
            <Link
              href={`/category/${article.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900"
            >
              {article.category.name}
            </Link>
            {article.subcategory && (
              <>
                <span className="text-stone-300">/</span>
                <Link
                  href={`/category/${article.category.slug}/${article.subcategory.slug}`}
                  className="text-xs text-stone-400 hover:text-stone-700"
                >
                  {article.subcategory.name}
                </Link>
              </>
            )}
          </div>
        )}

        <h3 className="mt-1.5 font-serif text-lg font-bold leading-snug tracking-tight text-stone-900">
          <Link
            href={articleHref}
            className="transition-colors hover:text-stone-700"
          >
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
            {article.excerpt}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 text-xs text-stone-400">
        {formattedDate && <span>{formattedDate}</span>}
        <span>•</span>
        <span>{readMinutes} min read</span>
      </div>
    </article>
  );
}
