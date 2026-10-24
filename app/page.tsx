import Link from 'next/link';
import { getArticles, getCategories, getSiteSettings } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import AdPlacement from '@/components/AdPlacement';

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const pageSize = 7; // 1 featured + 6 grid articles

  const [articlesData, categories, settings] = await Promise.all([
    getArticles({ page: currentPage, pageSize, status: 'published' }),
    getCategories({ includeCounts: true }),
    getSiteSettings(),
  ]);

  const { articles, totalPages } = articlesData;
  const featuredArticle = currentPage === 1 && articles.length > 0 ? articles[0] : null;
  const standardArticles = currentPage === 1 ? articles.slice(1) : articles;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Category Pills Bar */}
      {categories.length > 0 && (
        <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mr-2 shrink-0">
            Topics:
          </span>
          <Link
            href="/"
            className="rounded-full bg-stone-900 px-3.5 py-1 text-xs font-medium text-white transition-colors"
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="rounded-full bg-stone-100 px-3.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900 shrink-0"
            >
              {cat.name}
              {typeof cat.article_count === 'number' && (
                <span className="ml-1 text-stone-400">({cat.article_count})</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Top Banner Ad if configured */}
      <AdPlacement
        placement="header"
        adCode={settings.ad_header_code}
        adsEnabled={settings.ads_enabled}
      />

      {/* Empty State */}
      {articles.length === 0 ? (
        <div className="my-16 text-center py-12 rounded-lg border border-dashed border-stone-200 bg-white p-8">
          <h2 className="font-serif text-xl font-bold text-stone-800">
            No Published Articles Yet
          </h2>
          <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">
            Fresh articles, tutorials, and insights are being prepared. Check back shortly!
          </p>
        </div>
      ) : (
        <div>
          {/* Featured Hero Article (Only on page 1) */}
          {featuredArticle && (
            <div className="mb-12">
              <ArticleCard article={featuredArticle} featured={true} />
            </div>
          )}

          {/* Standard Grid of Articles */}
          {standardArticles.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {standardArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Feed Ad Slot */}
          <AdPlacement
            placement="after_content"
            adCode={settings.ad_after_content_code}
            adsEnabled={settings.ads_enabled}
          />

          {/* Crawlable Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/"
          />
        </div>
      )}
    </main>
  );
}
