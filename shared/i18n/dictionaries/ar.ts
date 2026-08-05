/**
 * Shadow Arabic Dictionary
 *
 * Purpose: Provides Arabic copy for shadow public and development pages.
 * Used in: shadow dictionary lookup.
 * Used for: Keeps AR page, header, and dev labels centralized.
 */

import type { ShadowDictionary } from '@/shared/i18n/model/dictionary';

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
    categoryNavLabel: 'فئات المنتجات',
    emptyState: 'لا توجد منتجات متاحة بعد.',
    gridTitle: 'المنتجات',
    resultCount: 'تم العثور على {count} منتج',
  },
  productDetail: {
    title: 'منتج الظل',
    eyebrow: 'تفاصيل المنتج',
    description: 'صفحة تفاصيل منتج يتم عرضها من الخادم لمسار الهجرة الجديد.',
    backToProducts: 'العودة إلى المنتجات',
    colorsTitle: 'الألوان المتاحة',
    descriptionTitle: 'تفاصيل المنتج',
    featuresTitle: 'المميزات الرئيسية',
    noImage: 'لا توجد صورة متاحة',
    notFound: 'المنتج غير موجود.',
    ratingLabel: 'تقييم {rating} من {count} مراجعة',
    relatedEmptyState: 'لا توجد منتجات مشابهة متاحة بعد.',
    relatedTitle: 'منتجات مشابهة',
    viewLabel: 'عرض',
  },
  category: {
    title: 'فئة الظل',
    eyebrow: 'قائمة الفئة',
    description: 'صفحة فئة يتم عرضها من الخادم لمسار الهجرة الجديد.',
    emptyState: 'لا توجد منتجات متاحة في هذه الفئة بعد.',
    gridTitle: 'منتجات الفئة',
    resultCount: 'تم العثور على {count} منتج',
  },
  dev: {
    title: 'أدوات تطوير الظل',
    eyebrow: 'للتطوير فقط',
    description: 'ستوجد هنا أدوات إضافة البيانات والمصادقة وإعادة التحقق.',
    actionsLabel: 'إجراءات تطوير الظل',
    authAction: 'تجهيز مستخدم التطوير',
    authDescription: 'إنشاء أو تأكيد مستخدم Supabase Auth المحدد من البيئة لعمل المساعد لاحقا.',
    authTitle: 'مستخدم التطوير',
    seedAction: 'إضافة بيانات الكتالوج',
    seedDescription: 'إضافة أو تحديث فئات ومنتجات البداية في الجداول ذات البادئة المحددة.',
    seedTitle: 'كتالوج البداية',
    revalidateAction: 'إعادة تحقق الصفحات',
    revalidateDescription: 'تحديث وسوم التخزين المؤقت ومسارات ISR العامة بعد تغييرات البيانات.',
    revalidateTitle: 'تخزين الصفحات',
  },
} satisfies ShadowDictionary;
