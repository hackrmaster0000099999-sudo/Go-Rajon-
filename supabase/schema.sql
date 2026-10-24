-- ==============================================================================
-- GORAJON.SITE PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Subcategories Table
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_category_subcategory_slug UNIQUE (category_id, slug)
);

-- 4. Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    featured_image_url TEXT,
    featured_image_alt TEXT,
    seo_title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    author_name TEXT NOT NULL DEFAULT 'Go Rajon',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    noindex BOOLEAN NOT NULL DEFAULT false,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for high-performance organic search queries and filtering
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_subcategory_id ON public.articles(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);

-- Full text search index on title and content
CREATE INDEX IF NOT EXISTS idx_articles_fts ON public.articles USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || content));

-- 5. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name TEXT NOT NULL DEFAULT 'Go Rajon',
    site_description TEXT NOT NULL DEFAULT 'Thoughtful journalism, tech innovations, web engineering, and cultural insights.',
    logo_url TEXT,
    favicon_url TEXT,
    default_seo_title TEXT NOT NULL DEFAULT 'Go Rajon — Production-Ready Editorial & Insights',
    default_meta_description TEXT NOT NULL DEFAULT 'High quality articles on web development, modern technology, lifestyle, and culture.',
    default_og_image TEXT,
    contact_email TEXT NOT NULL DEFAULT 'contact@gorajon.site',
    default_author_name TEXT NOT NULL DEFAULT 'Go Rajon',
    ad_header_code TEXT DEFAULT '',
    ad_in_content_code TEXT DEFAULT '',
    ad_after_content_code TEXT DEFAULT '',
    ad_sidebar_code TEXT DEFAULT '',
    ads_enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Static Pages Table
CREATE TABLE IF NOT EXISTS public.static_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Media Files Table
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes INTEGER,
    mime_type TEXT,
    alt_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Row Level Security (RLS) Configuration
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies
CREATE POLICY "Public users can view categories" 
    ON public.categories FOR SELECT 
    USING (true);

CREATE POLICY "Public users can view subcategories" 
    ON public.subcategories FOR SELECT 
    USING (true);

CREATE POLICY "Public users can view published articles" 
    ON public.articles FOR SELECT 
    USING (status = 'published' AND published_at <= timezone('utc'::text, now()));

CREATE POLICY "Public users can view site settings" 
    ON public.site_settings FOR SELECT 
    USING (true);

CREATE POLICY "Public users can view static pages" 
    ON public.static_pages FOR SELECT 
    USING (true);

CREATE POLICY "Public users can view media records" 
    ON public.media_files FOR SELECT 
    USING (true);

-- Authenticated Admin Policies (Full Access for authenticated users)
CREATE POLICY "Admin full access to categories" 
    ON public.categories FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Admin full access to subcategories" 
    ON public.subcategories FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Admin full access to articles" 
    ON public.articles FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Admin full access to site_settings" 
    ON public.site_settings FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Admin full access to static_pages" 
    ON public.static_pages FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Admin full access to media_files" 
    ON public.media_files FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 9. Trigger for updating updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_static_pages_updated_at BEFORE UPDATE ON public.static_pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 10. Initial Seed Data
INSERT INTO public.site_settings (id, site_name, site_description, default_seo_title, default_meta_description, contact_email, default_author_name)
VALUES (
    'default',
    'Go Rajon',
    'A minimalist, high-speed multi-niche publication exploring technology, web development, lifestyle, science, and cultural perspectives.',
    'Go Rajon — Thoughtful Perspectives & Technology Analysis',
    'Discover in-depth articles, tutorials, and practical insights designed for modern readers.',
    'contact@gorajon.site',
    'Go Rajon'
) ON CONFLICT (id) DO NOTHING;



-- Seed Static Pages
INSERT INTO public.static_pages (title, slug, content, seo_title, meta_description) VALUES
('About Go Rajon', 'about', '## Welcome to Go Rajon\n\n**Go Rajon** is an independent multi-niche publication committed to fast, high-quality, editorial writing without digital clutter.\n\n### Our Mission\n\nOur mission is simple: provide clean, well-researched, and accessible articles across technology, web engineering, culture, and lifestyle. We prioritize readability, speed, and genuine utility over sensationalism.\n\n### Editorial Philosophy\n\n- **Depth over clickbait**: We publish substantive analysis.\n- **Speed & Privacy**: No trackers or intrusive popups.\n- **Bilingual Respect**: Full support for both English and Bengali reading experiences.', 'About Go Rajon — Independent Editorial Publication', 'Learn about the mission, editorial philosophy, and values driving Go Rajon.'),

('Contact Us', 'contact', '## Get in Touch\n\nWe welcome editorial inquiries, guest pitches, feedback, and corrections.\n\n### Editorial Contact\n- **Email**: contact@gorajon.site\n- **Response Time**: Usually within 24 to 48 business hours.\n\nPlease include article references or specific details with your inquiry.', 'Contact Editorial Team — Go Rajon', 'Contact the editorial team at Go Rajon for inquiries, corrections, and partnerships.'),

('Privacy Policy', 'privacy-policy', '## Privacy Policy\n\n*Last updated: October 2026*\n\n### 1. Information We Do Not Collect\nGo Rajon does not require readers to register, create accounts, or provide sensitive personal data to access our articles.\n\n### 2. Analytics & Cookies\nWe use standard, non-invasive server logs to understand general traffic patterns. We do not sell user data to third parties.\n\n### 3. Advertising\nWe display advertising provided by verified ad partners (such as Adsterra and Google AdSense). These third-party networks may use privacy-compliant cookies to serve relevant contextual ads.\n\n### 4. Contact\nFor questions about our privacy practices, contact us at contact@gorajon.site.', 'Privacy Policy — Go Rajon', 'Read the transparent privacy policy for Go Rajon.'),

('Terms and Conditions', 'terms-and-conditions', '## Terms and Conditions\n\n*Last updated: October 2026*\n\n### 1. Acceptance of Terms\nBy accessing gorajon.site, you agree to comply with and be bound by these terms.\n\n### 2. Intellectual Property\nAll original content, editorial writings, and code snippets published on Go Rajon are protected by copyright unless otherwise stated.\n\n### 3. Disclaimer of Warranties\nContent is provided for educational and informational purposes only without warranties of any kind.', 'Terms and Conditions — Go Rajon', 'Terms and conditions governing the use of Go Rajon.'),

('Disclaimer', 'disclaimer', '## Disclaimer\n\n*Last updated: October 2026*\n\nThe information on Go Rajon is provided in good faith for general informational and educational purposes. While we strive for accuracy, Go Rajon makes no representations regarding the completeness or reliability of the information.\n\nAny action you take upon the information on this website is strictly at your own risk.', 'Editorial & Legal Disclaimer — Go Rajon', 'Read the editorial and content disclaimer for Go Rajon.')
ON CONFLICT (slug) DO NOTHING;
