import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStaticPage } from '@/lib/data';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Breadcrumbs from '@/components/Breadcrumbs';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage('contact');
  if (!page) return { title: 'Contact' };
  return {
    title: page.seo_title || page.title,
    description: page.meta_description || 'Contact gorajon.site',
  };
}

export default async function ContactPage() {
  const page = await getStaticPage('contact');
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: page.title, url: '/contact' }]} />
      <header className="mb-8 border-b border-stone-200 pb-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {page.title}
        </h1>
      </header>
      <article className="prose-content">
        <MarkdownRenderer content={page.content} />
      </article>
    </main>
  );
}
