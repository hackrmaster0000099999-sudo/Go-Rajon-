import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g. "/" or "/category/technology"
  searchParams?: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v);
    });
    if (page > 1) {
      params.set('page', page.toString());
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center space-x-2 border-t border-stone-100 pt-8"
    >
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
          rel="prev"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Link>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-stone-300 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </span>
      )}

      <div className="flex items-center space-x-1">
        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <Link
              key={p}
              href={buildUrl(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-stone-900 font-bold text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
          rel="next"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-stone-300 cursor-not-allowed">
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
