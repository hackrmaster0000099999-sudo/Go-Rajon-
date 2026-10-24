# gorajon.site — Public Reader-Focused Editorial Platform

A high-performance, minimalist, SEO-focused multi-niche blogging website built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**.

The web frontend is dedicated 100% to readers and search engine crawlers with ultra-fast page loads. Content management (creating, publishing, scheduling, and editing articles) is decoupled and designed to be managed via an external dedicated administrator application (e.g., custom Android App via Supabase SDK / API).

---

## 1. Architecture & Technology Stack

- **Public Web Application**: Next.js 15+ (App Router, Server Components, On-Demand Caching)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Minimalist, reader-first, zero layout shift)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **SEO & Structured Data**: Dynamic XML Sitemap (`/sitemap.xml`), Robots (`/robots.txt`), JSON-LD (`WebSite`, `BlogPosting`, `BreadcrumbList`), OpenGraph & Twitter Cards
- **Typography**: Dual-font stack supporting Latin & Bengali typography (`Inter` & `Hind Siliguri`)
- **Advertising**: Adsterra & Google AdSense integration with pre-reserved container heights preventing Cumulative Layout Shift (CLS)
- **Admin & Publishing**: External Android App connects directly to Supabase (`articles`, `categories`, `subcategories`, `media_files`, `site_settings`).

---

## 2. Directory Structure

\`\`\`
├── app/
│   ├── layout.tsx                     # Root layout with bilingual fonts & WebSite JSON-LD
│   ├── page.tsx                       # Public editorial Homepage with category filters
│   ├── [categorySlug]/
│   │   ├── page.tsx                   # Redirect to canonical /category/[categorySlug]
│   │   └── [articleSlug]/
│   │       └── page.tsx               # Permanent Article Detail page with JSON-LD
│   ├── category/
│   │   └── [categorySlug]/
│   │       ├── page.tsx               # Dedicated category archive
│   │       └── [subcategorySlug]/
│   │           └── page.tsx           # Dedicated subcategory archive
│   ├── search/page.tsx                # Functional article search (noindex)
│   ├── about/page.tsx                 # Dynamic About page
│   ├── contact/page.tsx               # Dynamic Contact page
│   ├── privacy-policy/page.tsx        # Dynamic Privacy Policy
│   ├── terms-and-conditions/page.tsx  # Dynamic Terms & Conditions
│   ├── disclaimer/page.tsx            # Dynamic Disclaimer
│   ├── sitemap.ts                     # Dynamic XML Sitemap generator
│   └── robots.ts                      # Robots.txt generator
├── components/                        # Accessible UI components (Navbar, Footer, Cards, AdPlacement)
├── lib/                               # Data layer, Supabase clients, SEO schemas
├── supabase/
│   └── schema.sql                     # SQL schema, RLS policies, indexes, and initial seeds
└── public/                            # Static assets
\`\`\`

---

## 3. How the Android App Connects to the Database

Your external Android app can interact with Supabase directly using the official [Supabase Kotlin SDK](https://github.com/supabase-community/supabase-kt) or REST endpoints:

1. **Endpoint**: `https://<your-supabase-project-id>.supabase.co`
2. **Tables**:
   - `articles` (Insert/Update articles, set `status = 'published'`, `scheduled_for`, `featured_image_url`)
   - `categories` (Manage parent topics)
   - `subcategories` (Manage subtopics)
   - `site_settings` (Update ads scripts, branding, contact email)
   - `static_pages` (Update About, Privacy Policy, Terms, etc.)
   - `storage` bucket `media` (Upload article figures and featured thumbnails)
3. Any published article created via the Android app instantly displays on `gorajon.site`!

---

## 4. Supabase Database & Security Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository and run the entire script.
4. RLS is configured so that:
   - Anonymous visitors can only read published articles where `published_at <= now()`.
   - Authenticated administrators (via Supabase Auth on your Android app) have full read/write/delete privileges.

---

## 5. Vercel Deployment Instructions

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), import the repository.
3. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://gorajon.site`
4. Click **Deploy**.

---

## 6. Domain Configuration (gorajon.site)

In your DNS manager (Namecheap, Cloudflare, etc.):
- **Type**: `A`, **Name**: `@`, **Value**: `76.76.21.21`
- **Type**: `CNAME`, **Name**: `www`, **Value**: `cname.vercel-dns.com`

---

## 7. Google Search Console

1. In Search Console, add `gorajon.site` as a Domain property.
2. Verify via DNS TXT record.
3. Submit your sitemap: `https://gorajon.site/sitemap.xml`.
