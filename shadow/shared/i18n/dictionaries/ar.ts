/**
 * Shadow Arabic Dictionary
 *
 * Purpose: Provides Arabic copy for shadow public and development pages.
 * Used in: shadow dictionary lookup.
 * Used for: Keeps AR page, header, and dev labels centralized.
 */

import type { ShadowDictionary } from '@/shadow/shared/i18n/model/dictionary';

export const shadowArDictionary = {
  common: {
    brandName: 'شوب ميت',
    home: 'الرئيسية',
    products: 'المنتجات',
    language: 'اللغة',
    localeNames: {
      en: 'الإنجليزية',
      ar: 'العربية',
    },
  },
  header: {
    navigation: {
      label: 'تنقل صفحات الظل',
      home: 'الرئيسية',
      products: 'المنتجات',
    },
  },
  home: {
    title: 'صفحة الظل الرئيسية',
    eyebrow: 'كتالوج من الخادم أولا',
    description: 'صفحة كتالوج مترجمة ستقرأ المنتجات والفئات من Supabase.',
    heroAction: 'تصفح المنتجات',
    categoriesTitle: 'تسوق حسب الفئة',
    featuredTitle: 'منتجات مميزة',
    latestTitle: 'وصل حديثا',
    emptyState: 'لا توجد منتجات في الكتالوج بعد.',
  },
  products: {
    title: 'منتجات الظل',
    eyebrow: 'قائمة الكتالوج',
    description: 'قائمة منتجات يتم عرضها من الخادم لمسار الهجرة الجديد.',
    emptyState: 'لا توجد منتجات متاحة بعد.',
  },
  productDetail: {
    title: 'منتج الظل',
    eyebrow: 'تفاصيل المنتج',
    description: 'صفحة تفاصيل منتج يتم عرضها من الخادم لمسار الهجرة الجديد.',
    notFound: 'المنتج غير موجود.',
  },
  category: {
    title: 'فئة الظل',
    eyebrow: 'قائمة الفئة',
    description: 'صفحة فئة يتم عرضها من الخادم لمسار الهجرة الجديد.',
    emptyState: 'لا توجد منتجات متاحة في هذه الفئة بعد.',
  },
  dev: {
    title: 'أدوات تطوير الظل',
    eyebrow: 'للتطوير فقط',
    description: 'ستوجد هنا أدوات إضافة البيانات والمصادقة وإعادة التحقق.',
    seedAction: 'إضافة بيانات الكتالوج',
    revalidateAction: 'إعادة تحقق الصفحات',
  },
} satisfies ShadowDictionary;
