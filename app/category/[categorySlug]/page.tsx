import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticles, getCategoryBySlug, getSubcategories, getSiteSettings } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Breadcrumbs from '@/components/Breadcrumbs';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const [category, settings] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSiteSettings(),
  ]);

  if (!category) {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false },
    };
  }

  const title = `${category.name} Articles`;
  const description = category.description || `Read the latest articles and tutorials in ${category.name} on ${settings.site_name}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${category.name} | ${settings.site_name}`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gorajon.site'}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const pageSize = 9;

  const [category, subcategories] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSubcategories(),
  ]);

  if (!category) {
    notFound();
  }

  const categorySubcategories = subcategories.filter((s) => s.category_id === category.id);

  const { articles, totalPages, total } = await getArticles({
    categorySlug: category.slug,
    page: currentPage,
    pageSize,
    status: 'published',
  });

  const breadcrumbs = [
    { name: category.name, url: `/category/${category.slug}` },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Category Header */}
      <header className="mb-8 border-b border-stone-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Category
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            {category.description}
          </p>
        )}

        {/* Subcategories list */}
        {categorySubcategories.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-stone-400 font-medium">Sub-topics:</span>
            {categorySubcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${category.slug}/${sub.slug}`}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Articles Listing */}
      {articles.length === 0 ? (
        <div className="my-12 rounded-lg border border-dashed border-stone-200 bg-white p-8 text-center">
          <h2 className="font-serif text-lg font-bold text-stone-800">
            No Articles in {category.name} Yet
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Articles in this category are being prepared. Check back soon.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-900 underline underline-offset-4"
            >
              Browse all topics
            </Link>
          </div>
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
            basePath={`/category/${category.slug}`}
          />
        </div>
      )}
    </main>
  );
}
