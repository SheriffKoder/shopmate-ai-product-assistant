/**
 * @file features/shop-assistant/lib/catalog/match-catalog-products.ts
 * Deterministic catalog matcher using unique category values, then leftover tokens.
 * Used in: server/sources/mock-shop-api-client searchProducts.
 * Used for: "smart phones" → smartphones only. No blob substring OR-match.
 *
 * Function Index:
 * MatchCatalogProductsInput: Lookup filters passed into the matcher.
 * getUniqueCatalogCategories: Distinct product.category values from the catalog.
 * resolveCatalogCategory: Explicit category or longest query phrase → unique category.
 * matchCatalogProducts: Filter, then sort, then limit.
 *
 * Steps:
 * 1. Resolve category from catalog uniques (explicit hint wins, else query n-grams).
 * 2. If a category resolves, keep only that product.category.
 * 3. Match leftover brand/model tokens with word boundaries (AND).
 * 4. Apply price / color / rating / feature constraints.
 * 5. Sort and slice. Empty query + no category = browse-all.
 */

import type { Product } from '@/features/catalog/model/product';
import type { CatalogSearchSort } from '../../model/sources/catalog-source';

/** Lookup filters. Empty query means browse-all (constraints may still apply). */
export interface MatchCatalogProductsInput {
  query?: string;
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  color?: string | null;
  colors?: string[];
  features?: string[];
  keywords?: string[];
  minRating?: number | null;
  sortBy?: CatalogSearchSort | string | null;
  limit?: number | null;
}

/**
 * Generic phrases that map onto unique catalog categories.
 * Brand/model names (iphone, macbook) stay as leftover tokens, not category aliases.
 */
const GENERIC_CATEGORY_ALIASES: Record<string, string[]> = {
  smartphone: ['smartphone', 'smart phone', 'smartphones', 'smart phones', 'phone', 'phones', 'mobile', 'mobiles'],
  laptop: ['laptop', 'laptops', 'notebook', 'notebooks'],
  tablet: ['tablet', 'tablets'],
  smartwatch: ['smartwatch', 'smart watch', 'smartwatches', 'smart watches', 'watch', 'watches'],
  headphones: ['headphones', 'headphone', 'earbuds', 'earbud', 'earphones', 'earphone', 'headset', 'headsets'],
};

/** Query filler that must not become leftover product tokens. */
const QUERY_STOPWORDS = new Set([
  'a', 'an', 'the', 'me', 'my', 'our', 'some', 'any', 'show', 'find', 'get', 'looking',
  'for', 'want', 'need', 'please', 'available', 'product', 'products', 'item', 'items',
  'catalog', 'store', 'shop', 'shopmate', 'table', 'list', 'all', 'every', 'entire',
  'full', 'whole', 'everything', 'under', 'over', 'below', 'above', 'than', 'budget',
  'cheap', 'cheaper', 'with', 'and', 'or', 'in', 'of', 'to',
]);

//////////////////////////////////
// Unique catalog values
//////////////////////////////////

/** Distinct lowercase category values currently in the catalog. */
export function getUniqueCatalogCategories(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.category.trim().toLowerCase()).filter(Boolean))];
}

/**
 * Resolve a unique catalog category from an explicit hint or the query.
 *
 * Longest phrase wins: "smart phones" → smartphone, not smartwatch / headphones.
 *
 * @example
 * resolveCatalogCategory(products, 'smart phones')
 * // 'smartphone'
 */
export function resolveCatalogCategory(
  products: Product[],
  query: string,
  explicitCategory?: string | null,
): string | null {
  const categories = getUniqueCatalogCategories(products);
  const phrases = categoryPhrases(categories);

  // 1. Explicit schema/request category wins when it exists in this catalog.
  if (explicitCategory?.trim()) {
    const normalized = explicitCategory.trim().toLowerCase();
    if (categories.includes(normalized)) return normalized;
    const fromAlias = phrases.find(
      (entry) => entry.phrase === normalized || entry.collapsed === collapse(normalized),
    );
    if (fromAlias) return fromAlias.category;
  }

  // 2. Empty query is browse-all: do not invent a category.
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;

  // 3. Longest n-gram first so "smart phones" beats "phone".
  for (const gram of tokenNgrams(tokens)) {
    const collapsed = gram.join('');
    const joined = gram.join(' ');
    const match = phrases.find((entry) => (
      collapsed === entry.collapsed
      || collapsed === `${entry.collapsed}s`
      || joined === entry.phrase
    ));
    if (match) return match.category;
  }

  return null;
}

/**
 * Filter catalog rows using unique categories, then leftover tokens, then constraints.
 *
 * @example
 * matchCatalogProducts(products, { query: 'smart phones' }).map((p) => p.category)
 * // ['smartphone', 'smartphone']
 */
export function matchCatalogProducts(
  products: Product[],
  input: MatchCatalogProductsInput,
): Product[] {
  const query = input.query?.trim() ?? '';
  const category = resolveCatalogCategory(products, query, input.category);
  const leftover = leftoverTokens(query, category);
  const colors = requestedColors(input);
  const featureTerms = [
    ...(input.features ?? []),
    ...(input.keywords ?? []),
  ].map((term) => term.trim().toLowerCase()).filter(Boolean);

  // 1. Category first when one resolved. Browse-all keeps every row.
  let matched = category
    ? products.filter((product) => product.category.toLowerCase() === category)
    : [...products];

  // 2. Leftover brand/model tokens must all appear as whole words.
  if (leftover.length > 0) {
    matched = matched.filter((product) => {
      const haystack = searchableText(product);
      return leftover.every((token) => hasWholeToken(haystack, token));
    });
  }

  // 3. Structured constraints never use substring OR across the blob.
  matched = matched.filter((product) => matchesConstraints(product, input, colors, featureTerms));

  // 4. Sort then limit. No implicit default limit — runtime chooses.
  matched = sortProducts(matched, input.sortBy);
  if (typeof input.limit === 'number' && Number.isFinite(input.limit) && input.limit >= 0) {
    return matched.slice(0, input.limit);
  }
  return matched;
}

//////////////////////////////////
// Phrase / token helpers
//////////////////////////////////

function collapse(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function tokenize(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function tokenNgrams(tokens: string[]): string[][] {
  const grams: string[][] = [];
  for (let size = tokens.length; size >= 1; size -= 1) {
    for (let index = 0; index + size <= tokens.length; index += 1) {
      grams.push(tokens.slice(index, index + size));
    }
  }
  return grams;
}

function categoryPhrases(categories: string[]): Array<{ category: string; phrase: string; collapsed: string }> {
  const entries: Array<{ category: string; phrase: string; collapsed: string }> = [];
  for (const category of categories) {
    const aliases = GENERIC_CATEGORY_ALIASES[category] ?? [category];
    for (const phrase of new Set([category, ...aliases])) {
      entries.push({
        category,
        phrase: phrase.toLowerCase(),
        collapsed: collapse(phrase),
      });
    }
  }
  // Longest collapsed phrase first so smartphone wins over phone.
  return entries.sort((left, right) => (
    right.collapsed.length - left.collapsed.length
    || right.phrase.length - left.phrase.length
  ));
}

function leftoverTokens(query: string, matchedCategory: string | null): string[] {
  const stop = new Set(QUERY_STOPWORDS);
  if (matchedCategory) {
    const phrases = [matchedCategory, ...(GENERIC_CATEGORY_ALIASES[matchedCategory] ?? [])];
    for (const phrase of phrases) {
      for (const part of phrase.split(/\s+/)) {
        stop.add(part);
        if (part.endsWith('s') && part.length > 3) stop.add(part.slice(0, -1));
        else stop.add(`${part}s`);
      }
    }
  }

  return tokenize(query).filter((token) => (
    token.length > 1
    && !/^\d+$/.test(token)
    && !stop.has(token)
  ));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasWholeToken(haystack: string, token: string): boolean {
  return new RegExp(`\\b${escapeRegex(token)}\\b`, 'i').test(haystack);
}

function searchableText(product: Product): string {
  // Skip long description blobs so stray words cannot reopen the substring bug.
  return [
    product.name,
    product.category,
    ...product.keywords,
    ...product.features,
  ].join(' ').toLowerCase();
}

//////////////////////////////////
// Constraints + sort
//////////////////////////////////

function requestedColors(input: MatchCatalogProductsInput): string[] {
  const colors = [
    ...(input.colors ?? []),
    ...(input.color ? [input.color] : []),
  ].map((color) => color.trim().toLowerCase()).filter(Boolean);
  return [...new Set(colors)];
}

function matchesConstraints(
  product: Product,
  input: MatchCatalogProductsInput,
  colors: string[],
  featureTerms: string[],
): boolean {
  if (input.minPrice != null && Number.isFinite(input.minPrice) && product.price < input.minPrice) {
    return false;
  }
  if (input.maxPrice != null && Number.isFinite(input.maxPrice) && product.price > input.maxPrice) {
    return false;
  }
  if (input.minRating != null && Number.isFinite(input.minRating) && product.rating < input.minRating) {
    return false;
  }
  if (colors.length > 0) {
    const productColors = product.colors.map((color) => color.toLowerCase());
    const matchesColor = colors.some((color) => (
      productColors.some((productColor) => hasWholeToken(productColor, color))
    ));
    if (!matchesColor) return false;
  }
  if (featureTerms.length > 0) {
    const haystack = searchableText(product);
    if (!featureTerms.every((term) => hasWholeToken(haystack, term) || haystack.includes(term))) {
      return false;
    }
  }
  return true;
}

function sortProducts(products: Product[], sortBy?: string | null): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case 'rating':
      return sorted.sort((left, right) => right.rating - left.rating);
    case 'price-low':
      return sorted.sort((left, right) => left.price - right.price);
    case 'price-high':
      return sorted.sort((left, right) => right.price - left.price);
    case 'reviews':
      return sorted.sort((left, right) => right.reviewsCount - left.reviewsCount);
    case 'name':
      return sorted.sort((left, right) => left.name.localeCompare(right.name));
    default:
      return sorted;
  }
}
