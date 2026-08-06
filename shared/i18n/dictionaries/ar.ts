/**
 * Arabic Dictionary
 *
 * Purpose: Provides Arabic copy for public and development pages.
 * Used in: dictionary lookup.
 * Used for: Keeps AR page, header, and dev labels centralized.
 */

import type { AppDictionary } from '@/shared/i18n/model/dictionary';

export const arDictionary = {
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
    featuredAction: 'عرض المنتج',
    latestTitle: 'اختيارات الأعلى تقييماً',
    emptyState: 'لا توجد منتجات في الكتالوج بعد.',
  },
  products: {
    title: 'تصفح جميع المنتجات',
    eyebrow: 'المنتجات',
    description: 'اكتشف مجموعة مختارة بعناية من المنتجات التقنية للعمل والمنزل وكل يوم.',
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
  checkout: {
    title: 'الدفع',
    eyebrow: '',
    description: 'راجع المنتجات التي اخترتها قبل تأكيد طلبك.',
    actionLabel: 'المتابعة إلى الدفع',
    continueShopping: 'متابعة التسوق',
    emptyDescription: 'أضف منتجات إلى السلة قبل بدء الدفع.',
    emptyTitle: 'سلتك فارغة',
    estimatedTotal: 'الإجمالي التقديري',
    loading: 'جار تجهيز السلة...',
    orderSummary: 'ملخص الطلب',
    quantityLabel: 'الكمية',
    subtotal: 'المجموع الفرعي',
  },
  checkoutSuccess: {
    title: 'تم تأكيد الطلب',
    eyebrow: 'نجاح',
    description: 'تستخدم صفحة التأكيد هذه بيانات عميل تجريبية والسلة المحفوظة في هذا المتصفح.',
    continueShopping: 'متابعة التسوق',
    customer: 'العميل',
    deliveryEstimate: 'موعد التسليم المتوقع',
    emptyDescription: 'لا توجد منتجات محلية لعرضها في هذا التأكيد التجريبي.',
    emptyTitle: 'لا توجد منتجات في الإيصال',
    items: 'المنتجات',
    loading: 'جار تجهيز التأكيد...',
    orderNumber: 'رقم الطلب',
    paymentMethod: 'طريقة الدفع',
    quantityLabel: 'الكمية',
    receipt: 'الإيصال',
    totalPaid: 'الإجمالي المدفوع',
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
} satisfies AppDictionary;
