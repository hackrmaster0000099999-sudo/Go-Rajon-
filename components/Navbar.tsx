'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Category } from '@/lib/types';

interface NavbarProps {
  categories: Category[];
  siteName: string;
}

export default function Navbar({ categories, siteName }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-stone-900 transition-colors hover:text-stone-700"
          >
            {siteName}
          </Link>

          {/* Desktop Categories */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {categories.slice(0, 6).map((category) => {
              const isActive = pathname === `/category/${category.slug}`;
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-stone-900 font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action icons: Search & Mobile Menu */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search articles"
            className="flex h-9 w-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-stone-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === '/' ? 'bg-stone-100 font-semibold text-stone-900' : 'text-stone-600'
              }`}
            >
              Home
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pathname === `/category/${category.slug}`
                    ? 'bg-stone-100 font-semibold text-stone-900'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {category.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-stone-100">
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-stone-600 flex items-center gap-2 px-3 py-2"
              >
                <Search className="h-4 w-4" /> Search Articles
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
