# SEO audit implementation plan

This plan tracks the public-page SEO work for ShopMate. Shared values and builders live under `shared/seo` so route files only provide page-specific data.

## Steps

- [x] 1. Add shared SEO configuration: site URL, brand, locale URLs, and social metadata defaults.
- [x] 2. Add localized metadata for home, products, categories, product details, and category details.
- [x] 3. Add canonical URLs and locale alternates for public routes.
- [x] 4. Add `sitemap.xml` generation for localized public catalog pages.
- [x] 5. Add `robots.txt` rules for public pages and private/demo routes.
- [x] 6. Add JSON-LD for product details and breadcrumbs.
- [x] 7. Add no-index metadata to checkout, checkout success, and development pages.
- [x] 8. Verify generated metadata, sitemap, robots, headings, image alternatives, and TypeScript output.

## Configuration

Set `NEXT_PUBLIC_SITE_URL` in deployment environments, for example `https://shopmate.example.com`. The local fallback is `http://localhost:3000` so development metadata remains deterministic.
