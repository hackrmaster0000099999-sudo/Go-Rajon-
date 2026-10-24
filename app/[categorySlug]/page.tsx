import { redirect, notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/data';

interface CategoryRedirectProps {
  params: Promise<{ categorySlug: string }>;
}

export default async function CategoryRedirectPage({ params }: CategoryRedirectProps) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  redirect(`/category/${category.slug}`);
}
