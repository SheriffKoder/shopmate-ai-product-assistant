/**
 * Initial Product Data
 *
 * Purpose: Provides development-only catalog seed records for the server-first pages project.
 * Used in: Future /dev seed actions.
 * Used for: Keeps seed input out of public page reads.
 */

import type { LocalizedList, LocaleText } from '@/shared/model/localization';

export type InitialCategory = {
  slug: string;
  name: LocaleText;
  description: LocaleText;
  sortOrder: number;
};

export type InitialProduct = {
  slug: string;
  categorySlug: string;
  name: LocaleText;
  shortDescription: LocaleText;
  description: LocaleText;
  price: number;
  rating: number;
  reviewsCount: number;
  features: LocalizedList;
  imageUrl: string | null;
  imageUrlVariations: string[];
  isFeatured: boolean;
  keywords: string[];
  colors: string[];
};

export const initialCategories: InitialCategory[] = [
  {
    slug: 'smartphone',
    name: {
      en: 'Smartphones',
      ar: 'الهواتف الذكية',
    },
    description: {
      en: 'Flagship and everyday phones for modern mobile work.',
      ar: 'هواتف رائدة ويومية للعمل والتنقل الحديث.',
    },
    sortOrder: 10,
  },
  {
    slug: 'laptop',
    name: {
      en: 'Laptops',
      ar: 'الحواسيب المحمولة',
    },
    description: {
      en: 'Portable computers for creative, professional, and everyday use.',
      ar: 'حواسيب محمولة للإبداع والعمل والاستخدام اليومي.',
    },
    sortOrder: 20,
  },
  {
    slug: 'tablet',
    name: { en: 'Tablets', ar: 'الأجهزة اللوحية' },
    description: { en: 'Portable screens for creativity, productivity, and entertainment.', ar: 'شاشات محمولة للإبداع والإنتاجية والترفيه.' },
    sortOrder: 30,
  },
  {
    slug: 'smartwatch',
    name: { en: 'Smartwatches', ar: 'الساعات الذكية' },
    description: { en: 'Connected watches for health, fitness, and everyday routines.', ar: 'ساعات متصلة للصحة واللياقة والروتين اليومي.' },
    sortOrder: 40,
  },
  {
    slug: 'headphones',
    name: { en: 'Headphones', ar: 'سماعات الرأس' },
    description: { en: 'Immersive audio for music, calls, travel, and work.', ar: 'صوت غامر للموسيقى والمكالمات والسفر والعمل.' },
    sortOrder: 50,
  },
];

export const initialProducts: InitialProduct[] = [
  {
    slug: 'samsung-galaxy-s24-ultra',
    categorySlug: 'smartphone',
    name: {
      en: 'Samsung Galaxy S24 Ultra',
      ar: 'سامسونج جالاكسي S24 ألترا',
    },
    shortDescription: {
      en: 'Flagship smartphone with advanced AI features and a vivid display.',
      ar: 'هاتف رائد بميزات ذكاء اصطناعي متقدمة وشاشة زاهية.',
    },
    description: {
      en: 'The Samsung Galaxy S24 Ultra is a premium smartphone featuring a 6.8-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 processor, and advanced AI capabilities. With a 200MP camera system, S Pen support, and all-day battery life, it is designed for power users and creative professionals.',
      ar: 'سامسونج جالاكسي S24 ألترا هاتف فاخر بشاشة Dynamic AMOLED 2X مقاس 6.8 بوصة ومعالج Snapdragon 8 Gen 3 وميزات ذكاء اصطناعي متقدمة. يضم نظام كاميرا بدقة 200 ميجابكسل ودعم قلم S Pen وبطارية تدوم طوال اليوم.',
    },
    price: 1199.99,
    rating: 4.8,
    reviewsCount: 2847,
    features: {
      en: ['6.8-inch AMOLED display', '200MP camera system', 'S Pen included'],
      ar: ['شاشة Dynamic AMOLED 2X مقاس 6.8 بوصة', 'معالج Snapdragon 8 Gen 3', 'نظام كاميرا رئيسية بدقة 200 ميجابكسل', 'يتضمن قلم S Pen', 'ذاكرة 12GB وتخزين 256GB', 'بطارية 5000mAh مع شحن سريع', 'اتصال 5G', 'مقاومة الماء IP68'],
    },
    imageUrl: '/images/products/samsung-galaxy-s24-ultra-removebg-preview.png',
    imageUrlVariations: [],
    isFeatured: false,
    keywords: ['samsung', 'galaxy', 's24', 'ultra', 'smartphone', 'android'],
    colors: ['black', 'titanium', 'gray'],
  },
  {
    slug: 'macbook-pro-16-m3',
    categorySlug: 'laptop',
    name: {
      en: 'MacBook Pro 16" M3 Max',
      ar: 'ماك بوك برو 16 بوصة M3 Max',
    },
    shortDescription: {
      en: 'Professional laptop with M3 Max performance for creators and developers.',
      ar: 'حاسوب محمول احترافي بأداء M3 Max للمبدعين والمطورين.',
    },
    description: {
      en: 'A professional laptop with a Liquid Retina XDR display, powerful Apple silicon, and long battery life for demanding workflows.',
      ar: 'حاسوب محمول احترافي بشاشة Liquid Retina XDR ومعالج Apple قوي وبطارية طويلة للمهام المتقدمة.',
    },
    price: 3999,
    rating: 4.9,
    reviewsCount: 892,
    features: {
      en: ['16.2-inch Liquid Retina XDR display', 'M3 Max chip with 14-core CPU and 30-core GPU', 'Up to 128GB unified memory', 'Up to 8TB SSD storage', '22-hour battery life', '1080p FaceTime HD camera', 'Six-speaker sound system', 'MagSafe 3 charging'],
      ar: ['شاشة Liquid Retina XDR مقاس 16.2 بوصة', 'معالج M3 Max بوحدة معالجة مركزية 14 نواة ومعالج رسومات 30 نواة', 'ذاكرة موحدة تصل إلى 128GB', 'تخزين SSD يصل إلى 8TB', 'بطارية تدوم 22 ساعة', 'كاميرا FaceTime HD بدقة 1080p', 'نظام صوتي بستة مكبرات', 'شحن MagSafe 3'],
    },
    imageUrl: '/images/products/macbook-pro-16-m3-removebg-preview.png',
    imageUrlVariations: [
      '/images/products/macbook-pro-16-m3-1.png',
      '/images/products/macbook-pro-16-m3-2.png',
      '/images/products/macbook-pro-16-m3-3.png',
    ],
    isFeatured: true,
    keywords: ['macbook', 'pro', 'm3', 'laptop', 'apple'],
    colors: ['space gray', 'silver'],
  },
  {
    slug: 'iphone-15-pro-max',
    categorySlug: 'smartphone',
    name: { en: 'iPhone 15 Pro Max', ar: 'آيفون 15 برو ماكس' },
    shortDescription: { en: "Apple's most advanced iPhone with titanium design and A17 Pro chip.", ar: 'أحدث آيفون من Apple بتصميم من التيتانيوم وشريحة A17 Pro.' },
    description: { en: 'The iPhone 15 Pro Max features a premium titanium design, the powerful A17 Pro chip, and an advanced camera system. With ProRes video recording, Action Button, and USB-C connectivity, it delivers exceptional performance for professionals and enthusiasts.', ar: 'يتميز iPhone 15 Pro Max بتصميم فاخر من التيتانيوم وشريحة A17 Pro قوية ونظام كاميرا متقدم، مع تسجيل فيديو ProRes وزر الإجراءات ومنفذ USB-C.' },
    price: 1199,
    rating: 4.7,
    reviewsCount: 3124,
    features: {
      en: ['6.7-inch Super Retina XDR display', 'A17 Pro chip with 6-core GPU', '48MP main camera with ProRAW', '5x optical zoom telephoto', 'Titanium design', 'Action Button', 'USB-C port', 'Up to 29 hours video playback'],
      ar: ['شاشة Super Retina XDR مقاس 6.7 بوصة', 'شريحة A17 Pro بمعالج رسومات سداسي النواة', 'كاميرا رئيسية 48 ميجابكسل مع ProRAW', 'تقريب بصري 5x', 'تصميم من التيتانيوم', 'زر الإجراءات', 'منفذ USB-C', 'تشغيل فيديو يصل إلى 29 ساعة'],
    },
    imageUrl: '/images/products/iphone-15-pro-max-removebg-preview.png',
    imageUrlVariations: [],
    isFeatured: false,
    keywords: ['iphone', '15', 'pro', 'max', 'apple', 'smartphone', 'phone', 'titanium', 'a17', 'ios'],
    colors: ['natural titanium', 'blue titanium', 'white titanium', 'black titanium', 'red'],
  },
  {
    slug: 'dell-xps-15-9530',
    categorySlug: 'laptop',
    name: { en: 'Dell XPS 15 9530', ar: 'Dell XPS 15 9530' },
    shortDescription: { en: 'Premium Windows laptop with OLED display and powerful performance.', ar: 'حاسوب محمول فاخر بنظام Windows وشاشة OLED وأداء قوي.' },
    description: { en: 'The Dell XPS 15 combines stunning design with powerful performance. Featuring an optional 3.5K OLED touch display, Intel Core i9 processor, and NVIDIA RTX graphics, it is perfect for content creation, gaming, and productivity.', ar: 'يجمع Dell XPS 15 بين التصميم المميز والأداء القوي، مع شاشة OLED لمس اختيارية ومعالج Intel Core i9 ورسومات NVIDIA RTX.' },
    price: 2299.99,
    rating: 4.6,
    reviewsCount: 1456,
    features: {
      en: ['15.6-inch 3.5K OLED touch display', 'Intel Core i9-13900H processor', 'NVIDIA RTX 4070 graphics', '32GB DDR5 RAM', '1TB PCIe NVMe SSD', '87Whr battery', 'Thunderbolt 4 ports', 'Aluminum and carbon fiber design'],
      ar: ['شاشة لمس OLED مقاس 15.6 بوصة بدقة 3.5K', 'معالج Intel Core i9-13900H', 'رسومات NVIDIA RTX 4070', 'ذاكرة DDR5 بسعة 32GB', 'تخزين PCIe NVMe SSD بسعة 1TB', 'بطارية 87Wh', 'منافذ Thunderbolt 4', 'تصميم من الألومنيوم وألياف الكربون'],
    },
    imageUrl: '/images/products/dell-xps-15-9530-removebg-preview.png',
    imageUrlVariations: ['/images/products/dell-xps-15-9530-1.png', '/images/products/dell-xps-15-9530-2.png', '/images/products/dell-xps-15-9530-3.png'],
    isFeatured: true,
    keywords: ['dell', 'xps', 'laptop', 'windows', 'oled', 'gaming', 'computer', 'notebook', 'rtx'],
    colors: ['platinum silver', 'graphite'],
  },
  {
    slug: 'ipad-pro-12.9-m2',
    categorySlug: 'tablet',
    name: { en: 'iPad Pro 12.9" M2', ar: 'iPad Pro 12.9 بوصة M2' },
    shortDescription: { en: 'Powerful tablet with M2 chip and Liquid Retina XDR display.', ar: 'جهاز لوحي قوي بشريحة M2 وشاشة Liquid Retina XDR.' },
    description: { en: 'The iPad Pro 12.9-inch with M2 chip redefines what a tablet can do. With a stunning Liquid Retina XDR display, Apple Pencil support, and desktop-class performance, it is perfect for artists, designers, and professionals on the go.', ar: 'يعيد iPad Pro مقاس 12.9 بوصة بشريحة M2 تعريف إمكانيات الأجهزة اللوحية، مع شاشة Liquid Retina XDR ودعم Apple Pencil وأداء بمستوى أجهزة الكمبيوتر.' },
    price: 1099,
    rating: 4.8,
    reviewsCount: 2134,
    features: {
      en: ['12.9-inch Liquid Retina XDR display', 'M2 chip with 8-core CPU', 'Apple Pencil 2nd gen compatible', 'Magic Keyboard compatible', '12MP wide and 10MP ultra wide cameras', 'Face ID', 'Up to 2TB storage', 'Thunderbolt / USB 4 port'],
      ar: ['شاشة Liquid Retina XDR مقاس 12.9 بوصة', 'شريحة M2 بمعالج مركزي ثماني النواة', 'متوافق مع Apple Pencil الجيل الثاني', 'متوافق مع Magic Keyboard', 'كاميرات عريضة 12 ميجابكسل وفائقة الاتساع 10 ميجابكسل', 'Face ID', 'تخزين يصل إلى 2TB', 'منفذ Thunderbolt / USB 4'],
    },
    imageUrl: '/images/products/ipad-pro-12.9-m2-removebg-preview.png',
    imageUrlVariations: ['/images/products/ipad-pro-12.9-m2-1.png', '/images/products/ipad-pro-12.9-m2-2.png', '/images/products/ipad-pro-12.9-m2-3.png'],
    isFeatured: true,
    keywords: ['ipad', 'pro', 'm2', 'tablet', 'apple', 'pencil', 'creative', 'art', 'design'],
    colors: ['space gray', 'silver'],
  },
  {
    slug: 'apple-watch-ultra-2',
    categorySlug: 'smartwatch',
    name: { en: 'Apple Watch Ultra 2', ar: 'Apple Watch Ultra 2' },
    shortDescription: { en: 'Rugged smartwatch built for adventure and extreme sports.', ar: 'ساعة ذكية متينة للمغامرات والرياضات القاسية.' },
    description: { en: 'The Apple Watch Ultra 2 is the most capable Apple Watch ever. With a titanium case, Action Button, dual-frequency GPS, and up to 36 hours of battery life, it is designed for athletes, adventurers, and outdoor enthusiasts.', ar: 'Apple Watch Ultra 2 هي أكثر ساعات Apple قدرة، مع هيكل من التيتانيوم وزر إجراءات ونظام GPS مزدوج التردد وبطارية تصل إلى 36 ساعة.' },
    price: 799,
    rating: 4.7,
    reviewsCount: 1876,
    features: { en: ['49mm titanium case', 'Always-On Retina display', 'Action Button', 'Dual-frequency GPS', '100m water resistance', 'Up to 36 hours battery life', 'Advanced health sensors', 'Emergency SOS via satellite'], ar: ['هيكل من التيتانيوم مقاس 49mm', 'شاشة Retina تعمل دائمًا', 'زر الإجراءات', 'GPS مزدوج التردد', 'مقاومة للماء حتى 100 متر', 'بطارية تصل إلى 36 ساعة', 'مستشعرات صحية متقدمة', 'طوارئ SOS عبر الأقمار الصناعية'] },
    imageUrl: '/images/products/apple-watch-ultra-2-removebg-preview.png',
    imageUrlVariations: [],
    isFeatured: false,
    keywords: ['apple', 'watch', 'ultra', 'smartwatch', 'fitness', 'health', 'gps', 'adventure'],
    colors: ['titanium'],
  },
  {
    slug: 'sony-wh-1000xm5',
    categorySlug: 'headphones',
    name: { en: 'Sony WH-1000XM5', ar: 'Sony WH-1000XM5' },
    shortDescription: { en: 'Premium noise-canceling headphones with exceptional sound quality.', ar: 'سماعات فاخرة بإلغاء ضوضاء وجودة صوت استثنائية.' },
    description: { en: 'The Sony WH-1000XM5 headphones deliver industry-leading noise cancellation and exceptional sound quality. With 30-hour battery life, quick charge, and comfortable design, they are perfect for travel, work, and music lovers.', ar: 'توفر سماعات Sony WH-1000XM5 إلغاء ضوضاء رائدًا وجودة صوت استثنائية، مع بطارية 30 ساعة وشحن سريع وتصميم مريح.' },
    price: 399.99,
    rating: 4.8,
    reviewsCount: 3421,
    features: { en: ['Industry-leading noise cancellation', '30mm driver units', '30-hour battery life', '3-minute quick charge', 'Touch sensor controls', 'Speak-to-Chat technology', 'LDAC support', 'Comfortable over-ear design'], ar: ['إلغاء ضوضاء رائد في المجال', 'وحدات تشغيل 30mm', 'بطارية 30 ساعة', 'شحن سريع لمدة 3 دقائق', 'عناصر تحكم باللمس', 'تقنية Speak-to-Chat', 'دعم LDAC', 'تصميم مريح فوق الأذن'] },
    imageUrl: '/images/products/sony-wh-1000xm5-removebg-preview.png',
    imageUrlVariations: [],
    isFeatured: false,
    keywords: ['sony', 'wh-1000xm5', 'headphones', 'noise canceling', 'wireless', 'audio', 'music', 'travel'],
    colors: ['black', 'silver'],
  },
  {
    slug: 'airpods-pro-2',
    categorySlug: 'headphones',
    name: { en: 'AirPods Pro (2nd Generation)', ar: 'AirPods Pro الجيل الثاني' },
    shortDescription: { en: 'Premium wireless earbuds with active noise cancellation.', ar: 'سماعات أذن لاسلكية فاخرة بإلغاء ضوضاء نشط.' },
    description: { en: 'The AirPods Pro (2nd generation) feature advanced Active Noise Cancellation, personalized Spatial Audio, and up to 6 hours of listening time. With a new H2 chip and improved sound quality, they deliver an immersive audio experience.', ar: 'تتميز AirPods Pro الجيل الثاني بإلغاء ضوضاء نشط متقدم وصوت مكاني مخصص ووقت استماع يصل إلى 6 ساعات، مع شريحة H2 وجودة صوت محسنة.' },
    price: 249,
    rating: 4.6,
    reviewsCount: 4523,
    features: { en: ['Active Noise Cancellation', 'Adaptive Transparency mode', 'Personalized Spatial Audio', 'H2 chip', 'Up to 6 hours listening time', 'MagSafe charging case', 'Sweat and water resistant', 'Touch controls'], ar: ['إلغاء الضوضاء النشط', 'وضع الشفافية التكيفي', 'صوت مكاني مخصص', 'شريحة H2', 'وقت استماع يصل إلى 6 ساعات', 'علبة شحن MagSafe', 'مقاومة للعرق والماء', 'عناصر تحكم باللمس'] },
    imageUrl: '/images/products/airpods-pro-2-removebg-preview.png',
    imageUrlVariations: [],
    isFeatured: false,
    keywords: ['airpods', 'pro', 'apple', 'earbuds', 'headphones', 'wireless', 'noise cancellation', 'spatial audio'],
    colors: ['white'],
  },
];
