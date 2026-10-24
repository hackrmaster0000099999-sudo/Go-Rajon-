import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticles, getCategoryBySlug, getSubcategoryBySlug, getSiteSettings } from '@/lib/data';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import Breadcrumbs from '@/components/Breadcrumbs';

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const [sub, settings] = await Promise.all([
    getSubcategoryBySlug(categorySlug, subcategorySlug),
    getSiteSettings(),
  ]);

  if (!sub) {
    return {
      title: 'Topic Not Found',
      robots: { index: false, follow: false },
    };
  }

  const title = `${sub.name} Articles`;
  const description = sub.description || `Read in-depth articles on ${sub.name} at ${settings.site_name}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${sub.name} | ${settings.site_name}`,
      description,
      type: 'website',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gorajon.site'}/category/${categorySlug}/${subcategorySlug}`,
    },
  };
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const pageSize = 9;

  const [category, subcategory] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getSubcategoryBySlug(categorySlug, subcategorySlug),
  ]);

  if (!category || !subcategory) {
    notFound();
  }

  const { articles, totalPages } = await getArticles({
    categorySlug: category.slug,
    subcategorySlug: subcategory.slug,
    page: currentPage,
    pageSize,
    status: 'published',
  });

  const breadcrumbs = [
    { name: category.name, url: `/category/${category.slug}` },
    { name: subcategory.name, url: `/category/${category.slug}/${subcategory.slug}` },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <header className="mb-8 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <Link href={`/category/${category.slug}`} className="hover:text-stone-700">
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-stone-600">Sub-topic</span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {subcategory.name}
        </h1>
        {subcategory.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            {subcategory.description}
          </p>
        )}
      </header>

      {/* Articles Listing */}
      {articles.length === 0 ? (
        <div className="my-12 rounded-lg border border-dashed border-stone-200 bg-white p-8 text-center">
          <h2 className="font-serif text-lg font-bold text-stone-800">
            No Articles in {subcategory.name} Yet
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Check out other topics in {category.name} while new stories are being authored.
          </p>
          <div className="mt-4">
            <Link
              href={`/category/${category.slug}`}
              className="text-xs font-semibold text-stone-900 underline underline-offset-4"
            >
              Browse all {category.name} articles
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
            basePath={`/category/${category.slug}/${subcategory.slug}`}
          />
        </div>
      )}
    </main>
  );
}
