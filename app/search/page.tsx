import { Metadata } from 'next';
import { Search as SearchIcon } from 'lucide-react';
import { getArticles } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  return {
    title: query ? `Search results for "${query}"` : 'Search Articles',
    description: `Search articles and tutorials on Go Rajon`,
    robots: {
      index: false, // Prevent crawl bloat on search query URLs as per PRD
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const query = resolved.q?.trim() || '';
  const currentPage = Number(resolved.page) || 1;
  const pageSize = 9;

  let articles: any[] = [];
  let totalPages = 1;
  let total = 0;

  if (query) {
    const result = await getArticles({
      search: query,
      page: currentPage,
      pageSize,
      status: 'published',
    });
    articles = result.articles;
    totalPages = result.totalPages;
    total = result.total;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Search Header Form */}
      <div className="mx-auto max-w-2xl text-center mb-10">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Search Go Rajon
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Search published articles, architectural deep dives, and tutorials.
        </p>

        <form action="/search" method="GET" className="mt-6 flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by topic, title, or keywords..."
              required
              className="w-full rounded-md border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            Search
          </button>
        </form>
      </div>

      {/* Query Status or Empty Results */}
      {query ? (
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-3 text-xs text-stone-500">
            <span>
              Found <strong className="text-stone-900">{total}</strong> article{total === 1 ? '' : 's'} matching &ldquo;{query}&rdquo;
            </span>
          </div>

          {articles.length === 0 ? (
            <div className="my-12 rounded-lg border border-dashed border-stone-200 bg-white p-10 text-center">
              <h2 className="font-serif text-lg font-bold text-stone-800">
                No Results Found for &ldquo;{query}&rdquo;
              </h2>
              <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
                Try searching with broader terms, verifying your spelling, or exploring our topic categories on the homepage.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/search"
                searchParams={{ q: query }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="my-12 text-center text-sm text-stone-400">
          Enter a term above to explore published articles.
        </div>
      )}
    </main>
  );
}
