# 🛍️ ShopMate - AI-Powered E-Commerce Platform

> **Intelligent e-commerce assistant using OpenAI o3-mini that enables natural product discovery, personalized recommendations, and conversational cart management for electronic products.**

ShopMate is an AI-powered conversational shopping assistant that helps users discover, compare, and purchase electronic products through natural language interactions with real-time product search and cart management capabilities.

---

## 🤖 AI Assistant Features

### Core Capabilities

- **Natural Language Product Search** - Discover products through conversational queries with visual product cards
- **Personalized Recommendations** - Get product suggestions tailored to budget, needs, and preferences
- **Conversational Cart Management** - View, modify, and remove items through natural chat interactions
- **Real-Time Streaming Responses** - Experience transparent AI reasoning with live response streaming
- **Product Comparisons & Q&A** - Get detailed answers about features, specifications, and product comparisons
- **Seamless Browsing** - Click product cards in chat to visit detail pages while keeping the AI assistant open for continued conversation throughout the shopping journey

### Design Principles

- **Node-Based Routing Architecture** - Two-level classification system routes queries through specialized agent nodes. Query Classifier determines if query is shop-related, technical discussion, or unrelated, then Product Classifier (for related queries) routes to specialized agents (products, recommendation, filtering) for optimal handling

- **Tool-Driven Execution** - Specialized agents use `productSearch` and `cartInfo` tools to show actual products, not just describe them. Products are displayed through tools for consistent UI and interactive controls

- **User-Centric** - Prioritizes showing products with interactive controls over asking clarifying questions. Agents display products immediately when possible

- **Context-Aware** - Integrates full product catalog and cart state into every conversation. All product-related agents receive complete catalog context for informed responses *(future optimization: can selectively pass relevant products instead of entire catalog for better performance)*

- **Transparent Reasoning** - Displays AI thinking process to build user trust. Uses OpenAI o3-mini with reasoning transparency to show decision-making process

### How It Helps Users

- ⚡ **Faster Product Discovery** - Ask "best smartphones under $500" instead of browsing filters
- 🎯 **Personalized Shopping** - Get recommendations tailored to budget, needs, and preferences
- 💡 **Informed Decisions** - Compare products, understand features, and get answers instantly
- 🛒 **Seamless Cart Management** - Modify quantities and remove items through natural conversation
- 🔄 **Continuous Assistance** - Click product cards in chat to view details while keeping AI assistant open for ongoing conversation and support
- 🌙 **24/7 Assistance** - Get help anytime without waiting for human support

### How It Brings Success to Website Owners

- 📈 **Increased Conversion Rates** - AI guides users to products that match their needs, reducing decision paralysis
- 📉 **Reduced Bounce Rate** - Engaging conversational interface keeps users on site longer
- 💰 **Higher Average Order Value** - Personalized recommendations can suggest complementary products
- 💼 **Lower Support Costs** - AI handles common product questions, reducing customer service load
- 🚀 **Competitive Advantage** - Modern AI-powered shopping experience differentiates from traditional e-commerce
- 📱 **Better User Engagement** - Interactive chat interface increases time on site and return visits

---

## 🛠️ Additional Site Features

### Home Page
- **Category Navigation** - Sidebar with clickable product categories (smartphones, laptops, tablets, smartwatches, headphones) that filter products
- **Banner Slider** - Carousel showcasing featured products with product images, names, descriptions, prices, and "Shop Now" buttons
- **Promotional Cards** - Grid of promotional cards highlighting specific products with custom configurations

### Product Discovery & Browsing
- **Products Grid** - Responsive grid layout displaying all products with filtering by category and search query
- **Product Search** - Header search bar that navigates to products page with search results
- **Category Filtering** - Filter products by category through URL parameters and category sidebar
- **Product Cards** - Display product name, image, price, rating, reviews count, and short description

### Product Detail Pages
- **Detailed Product View** - Full product information including name, description, price, rating, and reviews
- **Product Images** - Main product image with optional image variations gallery
- **Color Options** - Display available color variants for products
- **Feature List** - Key product features displayed as bullet points
- **Add to Cart** - Direct add-to-cart functionality from product detail page
- **Back Navigation** - Easy navigation back to previous page

### Shopping Cart System
- **Cart Dropdown** - Header cart icon with badge showing total items count
- **Cart Items Display** - Shows all cart items with product images, names, descriptions, quantities, and prices
- **Quantity Management** - Increase/decrease item quantities directly from cart dropdown
- **Remove Items** - Remove items from cart with delete controls
- **Cart Total** - Displays total price calculation for all items in cart
- **Checkout Button** - Checkout functionality (UI ready, can be connected to payment system)
- **Cart State Persistence** - Cart state managed globally through Context API

### Navigation & Header
- **Main Header** - Fixed header with logo, navigation icons, search bar, cart, and AI assistant toggle
- **Home Button** - Quick navigation to home page
- **User Account Icon** - User account button (placeholder for future implementation)
- **Search Bar** - Global product search functionality in header
- **ShopMate AI Toggle** - Button to open/close AI assistant chat interface

### Layout & UI Components
- **Responsive Design** - Mobile-first responsive layout that adapts to different screen sizes
- **Footer** - Site footer with company information, product links, and social media links
- **Theme Support** - Theme toggler component (dark/light mode support)
- **Modern UI Components** - Reusable UI components (buttons, cards, dialogs, tooltips, etc.)

### State Management
- **Shop Context** - Centralized state management for products and cart using React Context API
- **Product State** - Global product catalog accessible throughout the application
- **Cart State** - Global cart state with add, remove, and update quantity actions
- **URL-based Filtering** - Category and search filters managed through URL search parameters

### User Experience Features
- **Empty States** - Helpful messages when no products match search/filters
- **Loading States** - Visual feedback during data loading
- **Product Ratings** - Star ratings and review counts displayed on products
- **Image Optimization** - Next.js Image component for optimized image loading
- **Smooth Navigation** - Client-side routing with Next.js navigation

---

## 🚀 Tech Stack

- **Framework**: Next.js 15.3.0 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **AI/ML**: 
  - OpenAI o3-mini (with reasoning transparency)
  - Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/openai`)
- **Styling**: Tailwind CSS 4.1.4
- **UI Components**: Radix UI primitives
- **State Management**: React Context API
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ShopMate
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file and add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

---

## 📚 Project Structure

```
ShopMate/
├── app/
│   ├── api/
│   │   └── ai-assistant/     # AI assistant API route
│   ├── products/             # Product pages
│   └── page.tsx              # Home page
├── components/
│   ├── ai-elements/          # AI chat UI components
│   ├── main-header/          # Header components
│   └── ui/                   # Reusable UI components
├── features/
│   ├── ai-assistant/         # AI assistant feature
│   │   ├── agents/          # AI agent implementations
│   │   ├── tools/           # AI tools (productSearch, cartInfo)
│   │   └── components/      # Chat UI components
│   ├── home/                # Home page feature
│   └── products/            # Products feature
├── providers/
│   └── shop-context.tsx     # Global state management
└── lib/                     # Utility functions
```

---

## 🎯 Key Features Overview

- ✅ AI-powered conversational shopping assistant
- ✅ Multi-agent routing architecture with intelligent query classification
- ✅ Real-time product search with AI-powered relevance ranking
- ✅ Conversational cart management
- ✅ Responsive design (mobile-first)
- ✅ Dark/light theme support
- ✅ URL-based filtering and shareable links
- ✅ Optimized image loading
- ✅ Type-safe with TypeScript

---

## 📝 License

This project is private and proprietary.

---

## 🤝 Contributing

This is a personal project. Contributions and suggestions are welcome!

---

**Built with ❤️ using Next.js and OpenAI**
