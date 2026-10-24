# Go Rajon — Android Admin Companion Application
## Complete Product Requirements Document (PRD) & Technical Specification

**Target Website**: Go Rajon (`https://gorajon.site`)  
**Backend & Database**: Supabase PostgreSQL + Supabase Auth + Supabase Storage  
**Frontend Framework**: Next.js 15 (App Router on Vercel)  
**App Platform**: Native Android (Kotlin + Jetpack Compose)  
**Document Version**: 1.0 (Production-Ready Spec)  

---

## 1. Executive Summary & Objectives

The **Go Rajon Android Admin Application** is a private, single-administrator native mobile application designed to manage, author, publish, and monitor content for **Go Rajon** (`gorajon.site`) directly from an Android smartphone or tablet.

### Primary Goals
1. **Total Decoupling**: Ensure zero administrative interface or admin login forms exist on the public web platform.
2. **Effortless Mobile Publishing**: Enable the administrator to write articles in Markdown, upload camera/gallery images, categorize content, and publish instantly while on the move.
3. **Instant Cache Sync**: Trigger Next.js on-demand cache revalidation (`/api/revalidate`) upon article publishing or editing so the public site reflects updates in sub-seconds without redeployment.
4. **Offline Resilience**: Allow drafting and editing articles locally with auto-save when offline, syncing automatically when connectivity resumes.
5. **Robust Security**: Enforce Supabase Authentication with biometric (Fingerprint / Face Unlock) app locking and encrypted local credential storage.

---

## 2. Technology Stack & Architecture

### Mobile Architecture
- **Language**: Kotlin 2.0+
- **UI Toolkit**: Jetpack Compose with Material 3 Design
- **Architecture Pattern**: Clean Architecture with MVI / MVVM (Model-View-ViewModel) + Android Architecture Components
- **Concurrency & Asynchrony**: Kotlin Coroutines + StateFlow / SharedFlow
- **Database Client**: Official [Supabase Kotlin SDK](https://github.com/supabase-community/supabase-kt) (`io.github.jan-tennert.supabase`)
  - `postgrest-kt` (PostgreSQL query builder & mutations)
  - `auth-kt` (Admin authentication & session refresh)
  - `storage-kt` (Image file uploads to Supabase Storage bucket)
- **Local Persistence / Offline Drafts**: Android Jetpack Room Database
- **Image Loading & Caching**: Coil 3 (`io.coil-kt.coil3:coil-compose`)
- **Markdown Rendering**: Compose-Markdown (`com.github.jeziellago:compose-markdown`) or Multiplatform Markdown
- **Network / HTTP Client**: Ktor Client (embedded in Supabase SDK)
- **Security**: Jetpack Security (`androidx.security:security-crypto`) for `EncryptedSharedPreferences` + AndroidX Biometric

---

## 3. Database Specification & SQL Schema

The Android application connects directly to the **Supabase PostgreSQL** database shared with the web application.

### 3.1 PostgreSQL Tables

#### Table: `public.categories`
Stores primary topical categories (e.g., Technology, Web Development, Lifestyle).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique category identifier |
| `name` | `TEXT` | `NOT NULL` | Display name (e.g. "Technology") |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | URL-friendly slug (e.g. "technology") |
| `description`| `TEXT` | `NULLABLE` | Short editorial summary |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last modified timestamp |

---

#### Table: `public.subcategories`
Stores child categories associated with a parent category.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique subcategory identifier |
| `category_id`| `UUID` | `NOT NULL REFERENCES categories(id) ON DELETE CASCADE` | Parent category ID |
| `name` | `TEXT` | `NOT NULL` | Display name (e.g. "Artificial Intelligence") |
| `slug` | `TEXT` | `NOT NULL` | Subcategory URL slug |
| `description`| `TEXT` | `NULLABLE` | Optional description |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last modified timestamp |
| *Constraint* | `UNIQUE(category_id, slug)` | Prevents duplicate slugs under the same parent |

---

#### Table: `public.articles`
The central content repository containing both published stories and private drafts.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique article ID |
| `title` | `TEXT` | `NOT NULL` | Article headline |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | Permanent URL slug (e.g. "future-of-ai") |
| `excerpt` | `TEXT` | `NULLABLE` | 1-2 sentence lead summary |
| `content` | `TEXT` | `NOT NULL` | Full Markdown content |
| `category_id`| `UUID` | `NULLABLE REFERENCES categories(id) ON DELETE SET NULL` | Assigned parent category |
| `subcategory_id`| `UUID` | `NULLABLE REFERENCES subcategories(id) ON DELETE SET NULL` | Assigned subcategory |
| `featured_image_url` | `TEXT` | `NULLABLE` | Public URL of cover image |
| `featured_image_alt` | `TEXT` | `NULLABLE` | Accessible description of image |
| `seo_title` | `TEXT` | `NULLABLE` | Custom title for Google Search |
| `meta_description` | `TEXT` | `NULLABLE` | Snippet for Google Search |
| `canonical_url` | `TEXT` | `NULLABLE` | Optional canonical URL |
| `author_name`| `TEXT` | `NOT NULL DEFAULT 'Go Rajon'` | Bylines / Author attribution |
| `status` | `TEXT` | `NOT NULL CHECK (status IN ('draft', 'published', 'scheduled'))` | Publication lifecycle state |
| `published_at`| `TIMESTAMPTZ`| `NULLABLE` | Exact publication timestamp |
| `scheduled_for`| `TIMESTAMPTZ`| `NULLABLE` | Future scheduled timestamp |
| `noindex` | `BOOLEAN` | `NOT NULL DEFAULT false` | Search engine indexing flag |
| `views_count`| `INTEGER` | `NOT NULL DEFAULT 0` | Reader view metrics |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Initial creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last modified timestamp |

---

#### Table: `public.site_settings`
Global website configurations, advertising tags, and branding.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY DEFAULT 'default'` | Constant record ID |
| `site_name` | `TEXT` | `NOT NULL DEFAULT 'Go Rajon'` | Brand name |
| `site_description` | `TEXT` | `NOT NULL` | Global tagline / summary |
| `logo_url` | `TEXT` | `NULLABLE` | Logo asset URL |
| `favicon_url`| `TEXT` | `NULLABLE` | Favicon asset URL |
| `default_seo_title` | `TEXT` | `NOT NULL` | Fallback homepage title |
| `default_meta_description` | `TEXT` | `NOT NULL` | Fallback search description |
| `default_og_image` | `TEXT` | `NULLABLE` | Social card thumbnail URL |
| `contact_email` | `TEXT` | `NOT NULL` | Editorial contact address |
| `default_author_name` | `TEXT` | `NOT NULL DEFAULT 'Go Rajon'` | Default byline |
| `ad_header_code` | `TEXT` | `DEFAULT ''` | Adsterra / AdSense Header snippet |
| `ad_in_content_code` | `TEXT` | `DEFAULT ''` | Adsterra / AdSense In-Article snippet |
| `ad_after_content_code`| `TEXT` | `DEFAULT ''` | Adsterra / AdSense Bottom snippet |
| `ad_sidebar_code` | `TEXT` | `DEFAULT ''` | Adsterra / AdSense Sidebar snippet |
| `ads_enabled` | `BOOLEAN` | `NOT NULL DEFAULT false` | Global ad toggle |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

---

#### Table: `public.static_pages`
Editable policies and essential static pages (`about`, `contact`, `privacy-policy`, `terms-and-conditions`, `disclaimer`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique page ID |
| `title` | `TEXT` | `NOT NULL` | Page title (e.g. "About Go Rajon") |
| `slug` | `TEXT` | `NOT NULL UNIQUE` | URL slug (e.g. "privacy-policy") |
| `content` | `TEXT` | `NOT NULL` | Page body in Markdown |
| `seo_title` | `TEXT` | `NULLABLE` | SEO title |
| `meta_description` | `TEXT` | `NULLABLE` | Meta description |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

---

#### Table: `public.media_files`
Catalog of uploaded images and asset sizes.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Media record ID |
| `filename` | `TEXT` | `NOT NULL` | Original filename |
| `url` | `TEXT` | `NOT NULL` | Public Supabase Storage URL |
| `size_bytes` | `INTEGER` | `NULLABLE` | File size in bytes |
| `mime_type` | `TEXT` | `NULLABLE` | MIME type (e.g. image/jpeg, image/webp) |
| `alt_text` | `TEXT` | `NULLABLE` | Accessibility description |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Upload timestamp |

---

### 3.2 Storage Bucket: `media`
- **Bucket ID**: `media`
- **Public**: `true` (Images are publicly readable by readers and Googlebot)
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`
- **Max File Size**: 5MB per upload
- **File Hierarchy**: `articles/{timestamp}_{sanitized_name}.webp`

---

### 3.3 Complete Production SQL Setup Script
This SQL script should be executed in your Supabase SQL Editor:

```sql
-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Subcategories Table
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

-- 4. Create Articles Table
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

-- Indexes for Speed & Organic Search Filtering
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON public.articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_subcategory_id ON public.articles(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_articles_fts ON public.articles USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '') || ' ' || content));

-- 5. Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    site_name TEXT NOT NULL DEFAULT 'Go Rajon',
    site_description TEXT NOT NULL DEFAULT 'A minimalist, high-speed multi-niche publication exploring technology, web development, lifestyle, science, and cultural perspectives.',
    logo_url TEXT,
    favicon_url TEXT,
    default_seo_title TEXT NOT NULL DEFAULT 'Go Rajon — Thoughtful Perspectives & Technology Analysis',
    default_meta_description TEXT NOT NULL DEFAULT 'Read quality articles on technology, development, health, career, and culture on Go Rajon.',
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

-- 6. Create Static Pages Table
CREATE TABLE IF NOT EXISTS public.static_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Create Media Files Table
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes INTEGER,
    mime_type TEXT,
    alt_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Anonymous Web Visitors)
CREATE POLICY "Public users can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public users can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Public users can view published articles" ON public.articles FOR SELECT 
    USING (status = 'published' AND published_at <= timezone('utc'::text, now()));
CREATE POLICY "Public users can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public users can view static pages" ON public.static_pages FOR SELECT USING (true);
CREATE POLICY "Public users can view media files" ON public.media_files FOR SELECT USING (true);

-- Authenticated Admin Policies (Your Android App using Supabase Auth)
CREATE POLICY "Admin full access to categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to subcategories" ON public.subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to articles" ON public.articles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to static_pages" ON public.static_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to media_files" ON public.media_files FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_subcategories_updated_at BEFORE UPDATE ON public.subcategories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_static_pages_updated_at BEFORE UPDATE ON public.static_pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Initialize Default Site Settings
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

-- Initialize Essential Legal Pages
INSERT INTO public.static_pages (title, slug, content, seo_title, meta_description) VALUES
('About Go Rajon', 'about', '## Welcome to Go Rajon\n\n**Go Rajon** is an independent multi-niche publication committed to fast, high-quality editorial writing without digital clutter.\n\n### Our Mission\nOur mission is straightforward: to provide clean, well-researched, and accessible articles across technology, web engineering, culture, and lifestyle.', 'About Go Rajon — Independent Editorial Publication', 'Learn about the mission, editorial philosophy, and values driving Go Rajon.'),
('Contact Us', 'contact', '## Get in Touch\n\nWe welcome editorial inquiries, guest pitches, feedback, and corrections.\n\n### Editorial Contact\n- **Email**: contact@gorajon.site\n- **Response Time**: Usually within 24 to 48 business hours.', 'Contact Editorial Team — Go Rajon', 'Contact the editorial team at Go Rajon for inquiries, corrections, and partnerships.'),
('Privacy Policy', 'privacy-policy', '## Privacy Policy\n\n*Last updated: 2026*\n\n### 1. Information We Do Not Collect\nGo Rajon does not require readers to register, create accounts, or provide sensitive personal data to access our articles.', 'Privacy Policy — Go Rajon', 'Read the transparent privacy policy for Go Rajon.'),
('Terms and Conditions', 'terms-and-conditions', '## Terms and Conditions\n\n*Last updated: 2026*\n\n### 1. Acceptance of Terms\nBy accessing gorajon.site, you agree to comply with and be bound by these terms.', 'Terms and Conditions — Go Rajon', 'Terms and conditions governing the use of Go Rajon.'),
('Disclaimer', 'disclaimer', '## Disclaimer\n\n*Last updated: 2026*\n\nThe information on Go Rajon is provided in good faith for general informational and educational purposes.', 'Editorial & Legal Disclaimer — Go Rajon', 'Read the editorial and content disclaimer for Go Rajon.')
ON CONFLICT (slug) DO NOTHING;
```

---

## 4. Mobile App Screen Specifications & UI Flow

### Screen 1: Splash & Authentication
- **Purpose**: Secure access so only the administrator can open the application.
- **Features**:
  - Email & Password input against Supabase Auth (`supabase.auth.signInWith(Email)`).
  - "Remember Login" checkbox storing the refresh token in `EncryptedSharedPreferences`.
  - **Biometric Unlock**: Prompt for Fingerprint / Face Unlock on subsequent app launches.
  - "Keep Me Logged In" session persistence with token auto-refresh.

---

### Screen 2: Dashboard Overview
- **Top Bar**: Display "Go Rajon Publisher", quick action button (`+ Write Article`), and connection status indicator (Online / Offline).
- **Stat Cards (2x2 Grid)**:
  - Total Published Articles
  - Drafts in Progress
  - Total Categories
  - Total Subcategories
- **Recent Articles Carousel / List**: The last 5 modified articles with one-tap access to edit or view.
- **Quick Action Row**:
  - `New Article`
  - `Manage Topics`
  - `Upload Media`
  - `Site Settings`

---

### Screen 3: Article Management Screen
- **Tabs**: `All` | `Published` | `Drafts` | `Scheduled`
- **Search Bar**: Instant filter across article titles and slugs.
- **Article Card Item**:
  - Cover image thumbnail (via Coil with rounded corners).
  - Title and category badge.
  - Status pill:
    - *Green*: Published (with publication date).
    - *Orange*: Draft (with last updated time).
    - *Blue*: Scheduled (with target publication time).
  - **Swipe Actions**:
    - Swipe Left: Quick toggle between Published and Draft.
    - Swipe Right: Delete (triggers Confirmation Dialog).
  - Tap: Opens the **Article Editor Screen**.
  - Long Press: Share live public link (`https://gorajon.site/[category]/[slug]`).

---

### Screen 4: Article Editor Screen (Core Feature)
The heart of the application, optimized for comfortable mobile authoring:
- **Header Section**:
  - Title input field with auto-slug generation.
  - Slug editor field (with toggle to unlock custom manual slug editing).
  - Category Dropdown (fetches from `categories` table).
  - Subcategory Dropdown (dynamically filtered by selected parent category).
- **Featured Image Section**:
  - "Take Photo with Camera" or "Pick from Gallery".
  - Automatic on-device WebP/JPEG compression (max 1600px width, ~300KB) to ensure rapid mobile uploads.
  - Alt Text input field.
  - Live image preview.
- **Excerpt Field**: 1-2 sentence lead summary with character counter.
- **Markdown Editor Area**:
  - Full-screen or expansive text input with custom formatting toolbar docked above the soft keyboard:
    - `H2`, `H3`
    - **B** (Bold), *I* (Italic)
    - `Quote` (Blockquote)
    - `Bullet List`, `Numbered List`
    - `Code Block`
    - `Insert Link`
    - `Insert Image`
- **Tab Toggle: "Edit" vs "Live Preview"**:
  - Live Preview tab renders Compose Markdown with identical typography and styling to the website.
- **SEO & Indexing Accordion**:
  - Custom SEO Title
  - Meta Description
  - Canonical URL
  - `noindex` Checkbox (toggles Googlebot indexing).
- **Bottom Action Bar**:
  - `Save Draft` (Stores locally in Room and saves as `status = 'draft'` in Supabase).
  - `Publish Now` (Sets `status = 'published'`, `published_at = now()`, and pings Next.js revalidation endpoint).
  - `Schedule` (Opens Material 3 Date & Time Picker).

---

### Screen 5: Category & Subcategory Manager
- **Hierarchical List**: Displays each parent category with its child subcategories and associated article counts.
- **Add Category Dialog**:
  - Name, slug, and optional description.
- **Add Subcategory Dialog**:
  - Parent selector, Name, slug, and optional description.
- **Safety Dependency Protection**:
  - If the administrator attempts to delete a category that still contains articles, the app detects the dependency and displays:
    `"Cannot delete category: 3 articles are currently assigned. Please reassign them first."`

---

### Screen 6: Media Library Screen
- **Grid Layout**: 3-column thumbnail grid of images uploaded to the Supabase `media` bucket.
- **Quick Upload FAB**: Floating action button to capture or pick images.
- **Detail Bottom Sheet**:
  - Displays image dimension, file size, and upload date.
  - "Copy Markdown Snippet" button (`![alt](url)`) for pasting directly into the article body.
  - Delete asset button.

---

### Screen 7: Website Settings & Ad Management
- **Branding Fields**: Edit Site Name (`Go Rajon`), Description, Contact Email, Default Author Name.
- **Advertising Configuration**:
  - `Enable Advertisements` Switch.
  - Header Banner Code input.
  - In-Content Banner Code input.
  - After-Content Banner Code input.
- **Instant Web Revalidation Button**:
  - Pings `https://gorajon.site/api/revalidate?secret=YOUR_SECRET&path=/` to purge edge caches manually.

---

## 5. Webhook Cache Revalidation Integration

When articles are published from the Android app, Next.js page caches should refresh immediately without redeploying.

### Endpoint Details
- **Method**: `GET`
- **URL**: `https://gorajon.site/api/revalidate?secret=gorajon_revalidate_secret&path=/`
- **Parameters**:
  - `secret`: Defined in your Vercel environment variables (`REVALIDATION_SECRET`).
  - `path`: The path to invalidate:
    - `/` (Homepage)
    - `/category/<slug>` (Category archive)
    - `/<category>/<article>` (Specific article page)
    - `/sitemap.xml` (SEO sitemap)

### Kotlin Implementation Example
```kotlin
suspend fun triggerWebRevalidation(secret: String, path: String = "/") {
    withContext(Dispatchers.IO) {
        val client = HttpClient(Android)
        try {
            val response: HttpResponse = client.get("https://gorajon.site/api/revalidate") {
                parameter("secret", secret)
                parameter("path", path)
            }
            if (response.status == HttpStatusCode.OK) {
                Log.d("Revalidation", "Next.js cache revalidated for path: $path")
            }
        } catch (e: Exception) {
            Log.e("Revalidation", "Failed to trigger revalidation", e)
        }
    }
}
```

---

## 6. Android Implementation Dependencies (`build.gradle.kts`)

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.compose.compiler)
    alias(libs.plugins.ksp)
}

dependencies {
    // 1. Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // 2. Supabase Kotlin Multiplatform SDK
    val supabaseVersion = "3.1.1"
    implementation("io.github.jan-tennert.supabase:postgrest-kt:$supabaseVersion")
    implementation("io.github.jan-tennert.supabase:auth-kt:$supabaseVersion")
    implementation("io.github.jan-tennert.supabase:storage-kt:$supabaseVersion")
    implementation("io.github.jan-tennert.supabase:realtime-kt:$supabaseVersion")

    // 3. Ktor Client Engine for Android
    implementation("io.ktor:ktor-client-android:3.0.3")

    // 4. Image Loading & Markdown
    implementation("io.coil-kt.coil3:coil-compose:3.1.0")
    implementation("io.coil-kt.coil3:coil-network-ktor:3.1.0")
    implementation("com.github.jeziellago:compose-markdown:0.5.6")

    // 5. Offline Cache (Room Database)
    val roomVersion = "2.7.0-alpha13"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // 6. Security & Biometrics
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.biometric:biometric:1.2.0-alpha05")
}
```

---

## 7. Supabase Initialization in Kotlin

```kotlin
package com.gorajon.admin.core

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.storage.storage

object SupabaseProvider {
    private const val SUPABASE_URL = "https://your-project-id.supabase.co"
    private const val SUPABASE_ANON_KEY = "your-anon-key"

    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = SUPABASE_URL,
            supabaseKey = SUPABASE_ANON_KEY
        ) {
            install(Auth)
            install(Postgrest)
            install(Storage)
        }
    }

    val auth get() = client.auth
    val db get() = client.postgrest
    val storage get() = client.storage
}
```

---

## 8. Development Milestones & Checklist

| Phase | Deliverable | Acceptance Criteria |
| :--- | :--- | :--- |
| **Phase 1** | App Foundation & Auth | Android project created, Supabase Auth sign-in working, tokens securely saved in `EncryptedSharedPreferences`. Biometrics verified. |
| **Phase 2** | Articles Listing & Filtering | Read `articles` table from Supabase, display status tabs (All, Published, Draft, Scheduled), swipe-to-publish action functioning. |
| **Phase 3** | Markdown Editor & Image Upload | Full editor with H2/H3/Lists/Quotes toolbar, camera/gallery upload compressing to WebP and uploading to `media` bucket, slug auto-generation. |
| **Phase 4** | Taxonomy & Categories | Full category and subcategory creation, editing, and deletion with article dependency protection. |
| **Phase 5** | Cache Sync & Revalidation | App triggers Next.js `/api/revalidate` after publishing, verifying that `gorajon.site` updates in real-time. |
| **Phase 6** | Polish & Biometric Lock | Biometric lock prompt on resume, dark/light theme matching Android system settings, network error handling. |

---

## 9. Security Best Practices for the Mobile App
1. **Never hardcode the `SUPABASE_SERVICE_ROLE_KEY` in the Android APK**: The mobile app should authenticate as an admin user using `SUPABASE_ANON_KEY` + `auth.signInWith(Email)`.
2. **ProGuard / R8 Obfuscation**: Enable R8 code shrinking and rule obfuscation in release builds.
3. **MIME & Compression Check**: Always validate image format and downscale resolutions exceeding 2000px before uploading to conserve bandwidth and storage limits.
