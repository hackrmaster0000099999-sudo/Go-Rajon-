import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
        404 Error
      </span>
      <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        The article, topic, or page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </main>
  );
}
