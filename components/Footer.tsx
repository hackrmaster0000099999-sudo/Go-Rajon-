import Link from 'next/link';
import { Category } from '@/lib/types';

interface FooterProps {
  categories: Category[];
  siteName: string;
  siteDescription: string;
}

export default function Footer({ categories, siteName, siteDescription }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-stone-200 bg-stone-50/60 py-12 text-stone-600">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Identity */}
          <div className="md:col-span-2">
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-stone-900">
              {siteName}
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
              {siteDescription}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
              Categories
            </h3>
            {categories.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-stone-600 transition-colors hover:text-stone-900"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-stone-400 italic">Topics coming soon</p>
            )}
          </div>

          {/* Essential Editorial & Policy Pages */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
              Publication
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-stone-600 transition-colors hover:text-stone-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-stone-600 transition-colors hover:text-stone-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-stone-600 transition-colors hover:text-stone-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-stone-600 transition-colors hover:text-stone-900">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-stone-600 transition-colors hover:text-stone-900">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-stone-200/80 pt-6 text-center text-xs text-stone-500">
          <p>© {currentYear} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
