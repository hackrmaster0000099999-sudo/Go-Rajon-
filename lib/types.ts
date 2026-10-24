export type ArticleStatus = 'draft' | 'published' | 'scheduled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  article_count?: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  article_count?: number;
  category?: Category;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  category_id?: string | null;
  subcategory_id?: string | null;
  featured_image_url?: string | null;
  featured_image_alt?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  author_name: string;
  status: ArticleStatus;
  published_at?: string | null;
  scheduled_for?: string | null;
  noindex: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  
  // Joined relation fields
  category?: Category | null;
  subcategory?: Subcategory | null;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  default_seo_title: string;
  default_meta_description: string;
  default_og_image?: string | null;
  contact_email: string;
  default_author_name: string;
  ad_header_code?: string | null;
  ad_in_content_code?: string | null;
  ad_after_content_code?: string | null;
  ad_sidebar_code?: string | null;
  ads_enabled: boolean;
  updated_at: string;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  seo_title?: string | null;
  meta_description?: string | null;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size_bytes?: number;
  mime_type?: string;
  alt_text?: string | null;
  created_at: string;
}

export interface PaginatedArticles {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
