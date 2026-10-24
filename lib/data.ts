import { 
  Article, 
  Category, 
  Subcategory, 
  SiteSettings, 
  StaticPage, 
  MediaFile, 
  PaginatedArticles, 
  ArticleStatus 
} from './types';
import { 
  isSupabaseConfigured, 
  getSupabaseServerClient, 
  getSupabaseAdminClient 
} from './supabase';

// Fresh production store (empty until published from Supabase or Android app)
const initialCategories: Category[] = [];
const initialSubcategories: Subcategory[] = [];
const initialArticles: Article[] = [];

const initialSiteSettings: SiteSettings = {
  id: 'default',
  site_name: 'Go Rajon',
  site_description: 'A minimalist, high-speed multi-niche publication exploring technology, web development, lifestyle, science, and cultural perspectives.',
  logo_url: null,
  favicon_url: null,
  default_seo_title: 'Go Rajon — Thoughtful Perspectives & Technology Analysis',
  default_meta_description: 'Read quality articles on technology, development, health, career, and culture on Go Rajon.',
  default_og_image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&auto=format&fit=crop&q=80',
  contact_email: 'contact@gorajon.site',
  default_author_name: 'Go Rajon',
  ad_header_code: '',
  ad_in_content_code: '',
  ad_after_content_code: '',
  ad_sidebar_code: '',
  ads_enabled: false,
  updated_at: new Date().toISOString(),
};

const initialStaticPages: StaticPage[] = [
  {
    id: 'page-about',
    title: 'About Go Rajon',
    slug: 'about',
    content: `## Welcome to Go Rajon

**Go Rajon** is an independent multi-niche publication committed to fast, high-quality editorial writing without digital clutter.

### Our Mission
Our mission is straightforward: to provide clean, well-researched, and accessible articles across technology, web engineering, culture, and lifestyle. We prioritize readability, speed, and genuine utility over sensationalism.

### Editorial Philosophy
- **Depth over clickbait**: We publish substantive analysis.
- **Speed & Privacy**: No trackers or intrusive popups.
- **Bilingual Respect**: Full support for both English and Bengali reading experiences.
- **Reader First**: Generous whitespace, comfortable typography, and zero layout shifts.`,
    seo_title: 'About Go Rajon — Independent Editorial Publication',
    meta_description: 'Learn about the mission, editorial philosophy, and values driving Go Rajon.',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-contact',
    title: 'Contact Us',
    slug: 'contact',
    content: `## Get in Touch

We welcome editorial inquiries, guest pitches, feedback, and corrections.

### Editorial Contact
- **Email**: contact@gorajon.site
- **Response Time**: Usually within 24 to 48 business hours.

Please include article references or specific details with your inquiry so our team can respond effectively.`,
    seo_title: 'Contact Editorial Team — gorajon.site',
    meta_description: 'Contact the editorial team at gorajon.site for inquiries, corrections, and partnerships.',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-privacy',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `## Privacy Policy

*Last updated: October 2026*

### 1. Information We Do Not Collect
gorajon.site does not require readers to register, create accounts, or provide sensitive personal data to access our articles.

### 2. Analytics & Cookies
We use standard, non-invasive server logs to understand general traffic patterns. We do not sell user data to third parties.

### 3. Advertising
We display advertising provided by verified ad partners (such as Adsterra and Google AdSense). These third-party networks may use privacy-compliant cookies to serve relevant contextual ads.

### 4. Contact
For questions about our privacy practices, contact us at contact@gorajon.site.`,
    seo_title: 'Privacy Policy — gorajon.site',
    meta_description: 'Read the transparent privacy policy for gorajon.site.',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-terms',
    title: 'Terms and Conditions',
    slug: 'terms-and-conditions',
    content: `## Terms and Conditions

*Last updated: October 2026*

### 1. Acceptance of Terms
By accessing gorajon.site, you agree to comply with and be bound by these terms.

### 2. Intellectual Property
All original content, editorial writings, and code snippets published on gorajon.site are protected by copyright unless otherwise stated.

### 3. Disclaimer of Warranties
Content is provided for educational and informational purposes only without warranties of any kind.`,
    seo_title: 'Terms and Conditions — gorajon.site',
    meta_description: 'Terms and conditions governing the use of gorajon.site.',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'page-disclaimer',
    title: 'Disclaimer',
    slug: 'disclaimer',
    content: `## Disclaimer

*Last updated: October 2026*

The information on gorajon.site is provided in good faith for general informational and educational purposes. While we strive for accuracy, gorajon.site makes no representations regarding the completeness or reliability of the information.

Any action you take upon the information on this website is strictly at your own risk.`,
    seo_title: 'Editorial & Legal Disclaimer — gorajon.site',
    meta_description: 'Read the editorial and content disclaimer for gorajon.site.',
    updated_at: new Date().toISOString(),
  },
];

// Persistent runtime cache to maintain state across page transitions in dev/preview
// Note: In Node.js server environments, global variables persist between requests.
interface GlobalStore {
  articles: Article[];
  categories: Category[];
  subcategories: Subcategory[];
  siteSettings: SiteSettings;
  staticPages: StaticPage[];
  mediaFiles: MediaFile[];
}

const globalStore: GlobalStore = {
  articles: [],
  categories: [],
  subcategories: [],
  siteSettings: { ...initialSiteSettings },
  staticPages: [...initialStaticPages],
  mediaFiles: [],
};
(global as any).__gorajonStore = globalStore;

// ==============================================================================
// ARTICLE DATA OPERATIONS
// ==============================================================================

export async function getArticles(options: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  subcategorySlug?: string;
  search?: string;
  status?: ArticleStatus | 'all';
  admin?: boolean;
} = {}): Promise<PaginatedArticles> {
  const {
    page = 1,
    pageSize = 6,
    categorySlug,
    subcategorySlug,
    search,
    status = 'published',
    admin = false,
  } = options;

  if (isSupabaseConfigured()) {
    try {
      const client = admin ? getSupabaseAdminClient() : getSupabaseServerClient();
      if (client) {
        let query = client
          .from('articles')
          .select('*, category:categories(*), subcategory:subcategories(*)', { count: 'exact' });

        if (!admin) {
          query = query.eq('status', 'published');
          query = query.lte('published_at', new Date().toISOString());
        } else if (status !== 'all') {
          query = query.eq('status', status);
        }

        if (categorySlug) {
          const { data: catData } = await client.from('categories').select('id').eq('slug', categorySlug).single();
          if (catData) {
            query = query.eq('category_id', catData.id);
          }
        }

        if (subcategorySlug) {
          const { data: subData } = await client.from('subcategories').select('id').eq('slug', subcategorySlug).single();
          if (subData) {
            query = query.eq('subcategory_id', subData.id);
          }
        }

        if (search && search.trim()) {
          query = query.ilike('title', `%${search.trim()}%`);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.order('published_at', { ascending: false, nullsFirst: false }).range(from, to);

        const { data, count, error } = await query;
        if (!error && data) {
          const total = count || 0;
          return {
            articles: data as Article[],
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
          };
        }
      }
    } catch {
      // Fallback to local store if Supabase query encounters network/config issues
    }
  }

  // Local store execution
  let items = [...globalStore.articles];

  // Filter by status
  if (!admin) {
    items = items.filter(
      (a) => a.status === 'published' && a.published_at && new Date(a.published_at) <= new Date()
    );
  } else if (status !== 'all') {
    items = items.filter((a) => a.status === status);
  }

  // Filter by category
  if (categorySlug) {
    const cat = globalStore.categories.find((c) => c.slug === categorySlug);
    if (cat) {
      items = items.filter((a) => a.category_id === cat.id);
    } else {
      items = [];
    }
  }

  // Filter by subcategory
  if (subcategorySlug) {
    const sub = globalStore.subcategories.find((s) => s.slug === subcategorySlug);
    if (sub) {
      items = items.filter((a) => a.subcategory_id === sub.id);
    } else {
      items = [];
    }
  }

  // Filter by search query
  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(term)) ||
        a.content.toLowerCase().includes(term)
    );
  }

  // Sort: published_at desc, then created_at desc
  items.sort((a, b) => {
    const timeA = new Date(a.published_at || a.created_at).getTime();
    const timeB = new Date(b.published_at || b.created_at).getTime();
    return timeB - timeA;
  });

  const total = items.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = items.slice(startIndex, startIndex + pageSize);

  // Populate relational fields
  const populated = paginated.map((art) => ({
    ...art,
    category: globalStore.categories.find((c) => c.id === art.category_id) || null,
    subcategory: globalStore.subcategories.find((s) => s.id === art.subcategory_id) || null,
  }));

  return {
    articles: populated,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getArticleBySlug(
  slug: string, 
  options: { admin?: boolean } = {}
): Promise<Article | null> {
  const { admin = false } = options;

  if (isSupabaseConfigured()) {
    try {
      const client = admin ? getSupabaseAdminClient() : getSupabaseServerClient();
      if (client) {
        let query = client
          .from('articles')
          .select('*, category:categories(*), subcategory:subcategories(*)')
          .eq('slug', slug);

        if (!admin) {
          query = query.eq('status', 'published').lte('published_at', new Date().toISOString());
        }

        const { data, error } = await query.single();
        if (!error && data) {
          return data as Article;
        }
      }
    } catch {
      // Fallback to local
    }
  }

  const art = globalStore.articles.find((a) => a.slug === slug);
  if (!art) return null;

  if (!admin && (art.status !== 'published' || (art.published_at && new Date(art.published_at) > new Date()))) {
    return null;
  }

  return {
    ...art,
    category: globalStore.categories.find((c) => c.id === art.category_id) || null,
    subcategory: globalStore.subcategories.find((s) => s.id === art.subcategory_id) || null,
  };
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data, error } = await client
          .from('articles')
          .select('*, category:categories(*), subcategory:subcategories(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data as Article;
      }
    } catch {
      // Fallback
    }
  }

  const art = globalStore.articles.find((a) => a.id === id);
  if (!art) return null;

  return {
    ...art,
    category: globalStore.categories.find((c) => c.id === art.category_id) || null,
    subcategory: globalStore.subcategories.find((s) => s.id === art.subcategory_id) || null,
  };
}

export async function createArticle(data: Partial<Article>): Promise<Article> {
  const now = new Date().toISOString();
  const slug = data.slug || (data.title || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let publishedAt = data.published_at;
  if (data.status === 'published' && !publishedAt) {
    publishedAt = now;
  }

  const newArticle: Article = {
    id: data.id || `art-${Date.now()}`,
    title: data.title || 'Untitled Article',
    slug,
    excerpt: data.excerpt || null,
    content: data.content || '',
    category_id: data.category_id || null,
    subcategory_id: data.subcategory_id || null,
    featured_image_url: data.featured_image_url || null,
    featured_image_alt: data.featured_image_alt || null,
    seo_title: data.seo_title || data.title || null,
    meta_description: data.meta_description || data.excerpt || null,
    canonical_url: data.canonical_url || null,
    author_name: data.author_name || 'Go Rajon',
    status: data.status || 'draft',
    published_at: publishedAt || null,
    scheduled_for: data.scheduled_for || null,
    noindex: Boolean(data.noindex),
    views_count: 0,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data: inserted, error } = await client
          .from('articles')
          .insert(newArticle)
          .select()
          .single();
        if (!error && inserted) {
          // Also sync into local cache
          globalStore.articles.unshift(inserted as Article);
          return inserted as Article;
        }
      }
    } catch {
      // Continue to local
    }
  }

  globalStore.articles.unshift(newArticle);
  return newArticle;
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article | null> {
  const now = new Date().toISOString();
  
  if (data.status === 'published' && !data.published_at) {
    data.published_at = now;
  }

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data: updated, error } = await client
          .from('articles')
          .update({ ...data, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) {
          const index = globalStore.articles.findIndex((a) => a.id === id);
          if (index !== -1) globalStore.articles[index] = updated as Article;
          return updated as Article;
        }
      }
    } catch {
      // Local fallback
    }
  }

  const index = globalStore.articles.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const updated: Article = {
    ...globalStore.articles[index],
    ...data,
    updated_at: now,
  };
  globalStore.articles[index] = updated;
  return updated;
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { error } = await client.from('articles').delete().eq('id', id);
        if (!error) {
          globalStore.articles = globalStore.articles.filter((a) => a.id !== id);
          return true;
        }
      }
    } catch {
      // Local fallback
    }
  }

  const initialLen = globalStore.articles.length;
  globalStore.articles = globalStore.articles.filter((a) => a.id !== id);
  return globalStore.articles.length < initialLen;
}

export async function getRelatedArticles(
  currentArticleId: string, 
  categoryId?: string | null, 
  limit: number = 3
): Promise<Article[]> {
  const allArticles = await getArticles({ pageSize: 15, status: 'published' });
  const filtered = allArticles.articles.filter((a) => a.id !== currentArticleId);

  if (categoryId) {
    const sameCat = filtered.filter((a) => a.category_id === categoryId);
    if (sameCat.length >= limit) {
      return sameCat.slice(0, limit);
    }
    const otherCat = filtered.filter((a) => a.category_id !== categoryId);
    return [...sameCat, ...otherCat].slice(0, limit);
  }

  return filtered.slice(0, limit);
}

// ==============================================================================
// CATEGORY OPERATIONS
// ==============================================================================

export async function getCategories(options: { includeCounts?: boolean } = {}): Promise<Category[]> {
  const { includeCounts = true } = options;

  let categories: Category[] = [];

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        const { data, error } = await client.from('categories').select('*').order('name');
        if (!error && data) {
          categories = data as Category[];
        }
      }
    } catch {
      // Local fallback
    }
  }

  if (categories.length === 0) {
    categories = [...globalStore.categories];
  }

  if (includeCounts) {
    categories = categories.map((cat) => {
      const count = globalStore.articles.filter(
        (a) => a.category_id === cat.id && a.status === 'published'
      ).length;
      return { ...cat, article_count: count };
    });
  }

  return categories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        const { data, error } = await client.from('categories').select('*').eq('slug', slug).single();
        if (!error && data) return data as Category;
      }
    } catch {
      // Fallback
    }
  }
  return globalStore.categories.find((c) => c.slug === slug) || null;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const now = new Date().toISOString();
  const slug = data.slug || (data.name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat: Category = {
    id: data.id || `cat-${Date.now()}`,
    name: data.name || 'New Category',
    slug,
    description: data.description || null,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data: inserted, error } = await client.from('categories').insert(newCat).select().single();
        if (!error && inserted) {
          globalStore.categories.push(inserted as Category);
          return inserted as Category;
        }
      }
    } catch {}
  }

  globalStore.categories.push(newCat);
  return newCat;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data: updated, error } = await client
          .from('categories')
          .update({ ...data, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) {
          const idx = globalStore.categories.findIndex((c) => c.id === id);
          if (idx !== -1) globalStore.categories[idx] = updated as Category;
          return updated as Category;
        }
      }
    } catch {}
  }

  const idx = globalStore.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const updated: Category = {
    ...globalStore.categories[idx],
    ...data,
    updated_at: now,
  };
  globalStore.categories[idx] = updated;
  return updated;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  // Safe deletion check: check if any articles depend on this category
  const dependentArticles = globalStore.articles.filter((a) => a.category_id === id);
  if (dependentArticles.length > 0) {
    return {
      success: false,
      message: `Cannot delete: ${dependentArticles.length} article(s) are currently assigned to this category. Please reassign them first.`,
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { error } = await client.from('categories').delete().eq('id', id);
        if (error) return { success: false, message: error.message };
      }
    } catch {}
  }

  globalStore.categories = globalStore.categories.filter((c) => c.id !== id);
  // Also remove associated subcategories
  globalStore.subcategories = globalStore.subcategories.filter((s) => s.category_id !== id);
  return { success: true };
}

// ==============================================================================
// SUBCATEGORY OPERATIONS
// ==============================================================================

export async function getSubcategories(categoryId?: string): Promise<Subcategory[]> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        let query = client.from('subcategories').select('*, category:categories(*)').order('name');
        if (categoryId) query = query.eq('category_id', categoryId);
        const { data, error } = await query;
        if (!error && data) return data as Subcategory[];
      }
    } catch {}
  }

  let items = [...globalStore.subcategories];
  if (categoryId) {
    items = items.filter((s) => s.category_id === categoryId);
  }
  return items.map((sub) => ({
    ...sub,
    category: globalStore.categories.find((c) => c.id === sub.category_id),
    article_count: globalStore.articles.filter((a) => a.subcategory_id === sub.id && a.status === 'published').length,
  }));
}

export async function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string): Promise<Subcategory | null> {
  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return null;

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        const { data, error } = await client
          .from('subcategories')
          .select('*, category:categories(*)')
          .eq('category_id', cat.id)
          .eq('slug', subcategorySlug)
          .single();
        if (!error && data) return data as Subcategory;
      }
    } catch {}
  }

  const sub = globalStore.subcategories.find((s) => s.category_id === cat.id && s.slug === subcategorySlug);
  if (!sub) return null;
  return {
    ...sub,
    category: cat,
  };
}

export async function createSubcategory(data: Partial<Subcategory>): Promise<Subcategory> {
  const now = new Date().toISOString();
  const slug = data.slug || (data.name || 'subcategory').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newSub: Subcategory = {
    id: data.id || `sub-${Date.now()}`,
    category_id: data.category_id!,
    name: data.name || 'New Subcategory',
    slug,
    description: data.description || null,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data: inserted, error } = await client.from('subcategories').insert(newSub).select().single();
        if (!error && inserted) {
          globalStore.subcategories.push(inserted as Subcategory);
          return inserted as Subcategory;
        }
      }
    } catch {}
  }

  globalStore.subcategories.push(newSub);
  return newSub;
}

export async function deleteSubcategory(id: string): Promise<{ success: boolean; message?: string }> {
  const dependentArticles = globalStore.articles.filter((a) => a.subcategory_id === id);
  if (dependentArticles.length > 0) {
    return {
      success: false,
      message: `Cannot delete: ${dependentArticles.length} article(s) are associated with this subcategory.`,
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        await client.from('subcategories').delete().eq('id', id);
      }
    } catch {}
  }

  globalStore.subcategories = globalStore.subcategories.filter((s) => s.id !== id);
  return { success: true };
}

// ==============================================================================
// SITE SETTINGS
// ==============================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        const { data, error } = await client.from('site_settings').select('*').eq('id', 'default').single();
        if (!error && data) return data as SiteSettings;
      }
    } catch {}
  }
  return { ...globalStore.siteSettings };
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data: updated, error } = await client
          .from('site_settings')
          .upsert({ ...data, id: 'default', updated_at: now })
          .select()
          .single();
        if (!error && updated) {
          globalStore.siteSettings = updated as SiteSettings;
          return updated as SiteSettings;
        }
      }
    } catch {}
  }

  globalStore.siteSettings = {
    ...globalStore.siteSettings,
    ...data,
    updated_at: now,
  };
  return globalStore.siteSettings;
}

// ==============================================================================
// STATIC PAGES
// ==============================================================================

export async function getAllStaticPages(): Promise<StaticPage[]> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        const { data, error } = await client.from('static_pages').select('*').order('title');
        if (!error && data) return data as StaticPage[];
      }
    } catch {}
  }
  return [...globalStore.staticPages];
}

export async function getStaticPage(slug: string): Promise<StaticPage | null> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        const { data, error } = await client.from('static_pages').select('*').eq('slug', slug).single();
        if (!error && data) return data as StaticPage;
      }
    } catch {}
  }
  return globalStore.staticPages.find((p) => p.slug === slug) || null;
}

export async function updateStaticPage(slug: string, data: Partial<StaticPage>): Promise<StaticPage | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data: updated, error } = await client
          .from('static_pages')
          .update({ ...data, updated_at: now })
          .eq('slug', slug)
          .select()
          .single();
        if (!error && updated) {
          const idx = globalStore.staticPages.findIndex((p) => p.slug === slug);
          if (idx !== -1) globalStore.staticPages[idx] = updated as StaticPage;
          return updated as StaticPage;
        }
      }
    } catch {}
  }

  const idx = globalStore.staticPages.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;

  const updated: StaticPage = {
    ...globalStore.staticPages[idx],
    ...data,
    updated_at: now,
  };
  globalStore.staticPages[idx] = updated;
  return updated;
}

// ==============================================================================
// MEDIA FILES
// ==============================================================================

export async function getMediaFiles(): Promise<MediaFile[]> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data, error } = await client.from('media_files').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as MediaFile[];
      }
    } catch {}
  }
  return [...globalStore.mediaFiles];
}

export async function addMediaFile(file: Partial<MediaFile>): Promise<MediaFile> {
  const newMedia: MediaFile = {
    id: file.id || `med-${Date.now()}`,
    filename: file.filename || 'image.jpg',
    url: file.url || '',
    size_bytes: file.size_bytes || 0,
    mime_type: file.mime_type || 'image/jpeg',
    alt_text: file.alt_text || null,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdminClient();
      if (client) {
        const { data, error } = await client.from('media_files').insert(newMedia).select().single();
        if (!error && data) {
          globalStore.mediaFiles.unshift(data as MediaFile);
          return data as MediaFile;
        }
      }
    } catch {}
  }

  globalStore.mediaFiles.unshift(newMedia);
  return newMedia;
}

// ==============================================================================
// DASHBOARD STATS
// ==============================================================================

export async function getDashboardStats() {
  const publishedArticles = globalStore.articles.filter((a) => a.status === 'published').length;
  const draftArticles = globalStore.articles.filter((a) => a.status === 'draft').length;
  const scheduledArticles = globalStore.articles.filter((a) => a.status === 'scheduled').length;
  const totalCategories = globalStore.categories.length;
  const totalSubcategories = globalStore.subcategories.length;
  const recentArticles = [...globalStore.articles]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return {
    publishedArticles,
    draftArticles,
    scheduledArticles,
    totalCategories,
    totalSubcategories,
    recentArticles,
    supabaseConnected: isSupabaseConfigured(),
  };
}
