# Model Migration: Calendar Scheduling → Electronic Products Promotion & Q&A

This document tracks the migration from a calendar scheduling system to an electronic products promotion and Q&A assistant.

## Overview
- **From**: Calendar scheduling assistant (booking appointments, managing schedules)
- **To**: Electronic products promotion assistant (showcasing products, answering questions)

---

## Phase 1: Foundation Setup

### Step 1: Define Product Type

Create a new product type structure with the following properties:

```typescript
interface Product {
  id: string;
  name: string;
  rating: number; // e.g., 4.8, 2.2, etc.
  shortDescription: string;
  description: string;
  price: number;
  reviewsCount: number;
  features: string[]; // Array of feature text descriptions
}
```

**Location**: `features/ai-assistant/types/product.ts` (new file)

**Properties**:
- `id`: Unique identifier for the product
- `name`: Product name (e.g., "Samsung Galaxy S24 Ultra")
- `rating`: Numeric rating (0-5 scale, e.g., 4.8, 2.2)
- `shortDescription`: Brief one-line description
- `description`: Full detailed description
- `price`: Product price (number)
- `reviewsCount`: Number of reviews
- `features`: Array of feature strings (e.g., ["5G connectivity", "128GB storage", "Triple camera system"])

---

### Step 2: Update System Prompt

**File**: `features/ai-assistant/config/system-prompt.ts`

**Changes**:
- Update `getSystemPrompt()` to reflect product assistant role
- Change from calendar scheduling context to product promotion/Q&A context
- Update instructions to focus on:
  - Showcasing electronic products
  - Answering product questions
  - Comparing products
  - Providing product recommendations
  - Explaining product features

**New Context**:
- Assistant name: Keep as "Liora" or update to product-focused name
- Purpose: Help users discover and learn about electronic products
- Capabilities: Product information, comparisons, recommendations, feature explanations

---

### Step 3: Update Initial Data

**File**: `features/ai-assistant/config/initial-data.ts`

**Changes**:
- Remove scheduling data functions (`getInitialSchedulingData`)
- Add product data function (`getInitialProducts`)
- Create sample electronic products with:
  - Various product categories (smartphones, laptops, tablets, etc.)
  - Different price ranges
  - Various ratings
  - Realistic features and descriptions

**Sample Products to Include**:
- Smartphones (high-end, mid-range, budget)
- Laptops (gaming, business, ultrabooks)
- Tablets
- Smartwatches
- Headphones/Earbuds
- Other electronics

---

### Step 4: Update Intro Suggestions

**File**: `features/ai-assistant/config/intro-suggestions.ts`

**Changes**:
- Replace appointment booking suggestions with product-related suggestions
- Examples:
  - "Show me the best smartphones"
  - "What are your top-rated laptops?"
  - "Compare gaming laptops"
  - "Tell me about your latest products"
  - "What's the best product under $500?"

### Step 5: Create useProducts Hook

**File**: `features/ai-assistant/hooks/use-products.ts` (new file)

**Changes**:
- Create a new `useProducts` hook using `useReducer` for CRUD operations
- Replace `useBookings` hook with `useProducts` in `chat-container.tsx`
- Hook should take `setPageData` and `userType` as parameters

**Hook Features**:
- **State Management**: Use `useReducer` instead of `useState` for better state management
- **CRUD Operations**:
  - `addProduct(product)` - Add a new product to the catalog
  - `updateProduct(id, updates)` - Update an existing product
  - `removeProduct(id)` - Remove a product from the catalog
  - `confirmProduct(product)` - Mark a product as confirmed
  - `setProducts(products)` - Replace all products (for advanced use cases)

**State Structure**:
- `products`: Array of Product objects
- `confirmedProduct`: Currently confirmed product (or null)
- `confirmedProductIds`: Set of confirmed product IDs

**Reducer Actions**:
- `SET_PRODUCTS` - Replace all products
- `ADD_PRODUCT` - Add a new product
- `UPDATE_PRODUCT` - Update an existing product
- `REMOVE_PRODUCT` - Remove a product
- `SET_CONFIRMED_PRODUCT` - Set confirmed product
- `ADD_CONFIRMED_ID` - Add to confirmed IDs set
- `REMOVE_CONFIRMED_ID` - Remove from confirmed IDs set
- `RESET_CONFIRMED_PRODUCT` - Clear confirmed product

**Integration**:
- Update `chat-container.tsx` to use `useProducts` instead of `useBookings`
- Sync with page state using `setPageData` callback
- Maintain compatibility with existing components (may require type casting temporarily)

### Step 6: Update Agent

**File**: `features/ai-assistant/agent.ts`

**Changes**:
- Update function name from `processCalendarSchedulingRequest` to `processProductAssistantRequest`
- Update interface `AgentRequest` to use `products` instead of `schedulingData`
- Remove `timezoneOffsetHours` parameter (not needed for products)
- Update function to use `getProductCatalogContext` instead of `getCalendarDataContext`
- Update variable names from `schedulingData` to `products`
- Update variable names from `calendarDataContext` to `productCatalogContext`
- Update variable names from `messagesWithCalendarData` to `messagesWithProductData`
- Remove booking tools (bookAppointment, removeAppointment, updateAppointment)
- Add TODO comment for future product tools
- Update comments and documentation to reflect product assistant purpose

**Key Updates**:
- Change from calendar scheduling context to product catalog context
- Remove timezone handling (not needed for products)
- Prepare for product tools (to be added in future steps)
- Maintain same streaming and reasoning structure

**Also Update Route File**:
- **File**: `app/api/ai-assistant/route.ts`
- Update comments from "Calendar Scheduling API Route" to "AI Assistant API Route"
- Update description to reflect product assistant purpose
- Ensure route uses `processProductAssistantRequest` function
- Ensure route extracts `products` from request body instead of `schedulingData`

**Also Update useChatSubmission Hook**:
- **File**: `features/ai-assistant/hooks/use-chat-submission.ts`
- Update interface to use `products` instead of `schedulingData` (or generic `data`)
- Update parameter name from `schedulingData` to `products` for clarity
- Remove `timezoneOffsetHours` from message body (not needed for products)
- Update comments from "scheduling data" to "product catalog"
- Update `prepareMessageBody` to send `products` instead of `schedulingData`
- Update file comments to reflect product assistant purpose

---

## Phase 2: Tools & Components (Future Steps)

### Step 7: Create Product Search Tool

**Files Created**:
- `features/ai-assistant/tools/product-search/product-search-tool.ts`
- `features/ai-assistant/tools/product-search/components/product-search-tool-renderer.tsx`
- `features/ai-assistant/tools/product-search/components/product-card.tsx`

**Tool Features**:
- Searches and filters products based on user queries
- Supports filtering by: name, description, features, category, price range
- Supports sorting by: rating, price (low/high), reviews, name
- Returns array of matching products with header, paragraph, and footer

**Product Card Component**:
- Displays product category as a badge
- Displays product name, rating, reviews count
- Shows short description and price
- Lists key features (first 3)
- Hover effects and click handler support

**Integration**:
- Added to `tools/index.ts` exports
- Added to `agent.ts` tools object
- Added to `message-part-orchestrator-renderer.tsx` for rendering
- **REMINDER**: Ensure the system prompt (`config/system-prompt.ts`) explicitly instructs the AI to use this tool when users ask about products or want to buy something

**Usage**:
- AI uses this tool when user asks to see products, wants recommendations, or searches for specific products
- Examples: "show me smartphones", "best laptops", "products under $500", "I want to buy an AirPod"

### Step 8: Cleanup - Remove Unused Tools and Props

**Completed**: Removed all booking/appointment-related tools and cleaned up unused props

**Step 8.1: Removed Unused Tool Exports**
- [x] Removed `createBookingTool` from `tools/index.ts`
- [x] Removed `createRemoveAppointmentTool` from `tools/index.ts`
- [x] Removed `createUpdateAppointmentTool` from `tools/index.ts`
- [x] Kept only `createProductSearchTool` export

**Step 8.2: Cleaned Up Renderer Orchestrator**
- [x] Removed imports: `BookingToolRenderer`, `RemoveToolRenderer`, `UpdateToolRenderer`
- [x] Removed unused type imports: `BookingSlot`, `SchedulingDataItem`
- [x] Removed renderer logic for `bookAppointment`, `removeAppointment`, `updateAppointment` tools
- [x] Kept only `ProductSearchToolRenderer` for `productSearch` tool
- [x] Simplified `MessagePartRendererProps` interface (removed all booking-related props)

**Step 8.3: Cleaned Up Message List**
- [x] Removed unused props from `MessageListProps`:
  - `schedulingData`, `addBookingToSchedule`, `confirmedBooking`, `confirmedUpdate`
  - `onRemoveBooking`, `onConfirmBooking`, `onCancelUpdate`, `onConfirmUpdate`
  - `confirmedBookingIds`, `confirmedUpdateIds`
  - `onAppointmentTypeChange`, `onUpdateAppointment`
- [x] Removed unused imports: `BookingSlot`, `SchedulingDataItem`
- [x] Updated `MessagePartRenderer` calls to only pass required props
- [x] Kept only essential props: `messages`, `clickedSuggestionCard`, `sendMessage`, `regenerate`, `status`

**Step 8.4: Cleaned Up Chat Container**
- [x] Removed all unused props being passed to `MessageList` (13+ booking-related props)
- [x] Now only passes: `messages`, `clickedSuggestionCard`, `sendMessage`, `regenerate`, `status`

**Step 8.5: Deleted Unused Tool Directories**
- [x] Deleted `features/ai-assistant/tools/add-appointment/`
- [x] Deleted `features/ai-assistant/tools/remove-appointment/`
- [x] Deleted `features/ai-assistant/tools/update-appointment/`
- [x] Deleted `features/ai-assistant/tools/shared-components/`

**Result**: Codebase is now clean and focused solely on product search functionality with no booking/appointment-related code remaining.

### Step 9: Update/Create Additional Tools
- [ ] Create product comparison tool
- [ ] Create product recommendation tool
- [ ] Create product detail tool

### Step 10: Refactor Products Reducer to Dispatch Action Pattern

**Completed**: Updated `useProducts` hook to use single dispatch function

**Changes**:
- [x] Replaced individual functions (`addProduct`, `updateProduct`, `removeProduct`, `confirmProduct`, `setProducts`) with single `dispatchProductsAction` function
- [x] Components now pass action objects: `{ type: 'ADD_PRODUCT', payload: product }`
- [x] Reducer handles all logic via switch case
- [x] Reduces prop drilling - only one function to pass

**Files Modified**:
- `features/ai-assistant/hooks/use-products.ts`

**Benefits**:
- Cleaner API - single dispatch function
- Action types visible in code
- Easier to extend with new actions
- Consistent pattern with cart reducer

### Step 11: Create Cart Reducer

**Completed**: Created shopping cart system with useReducer

**Files Created**:
- `features/ai-assistant/types/cart.ts` - Cart type definitions
- `features/ai-assistant/hooks/use-cart.ts` - Cart reducer hook

**Cart Features**:
- [x] Cart state: items array, totalItems, totalPrice
- [x] Actions: `ADD_TO_CART`, `REMOVE_FROM_CART`, `INCREASE_QUANTITY`, `DECREASE_QUANTITY`
- [x] Reducer with switch case handling all actions
- [x] Automatic total calculation after each action
- [x] Console logging after every cart update
- [x] Single `dispatchCartAction` function for all operations

**Cart State Structure**:
```typescript
{
  items: CartItem[]; // Array of cart items with product and quantity
  totalItems: number; // Total quantity of all items
  totalPrice: number; // Total price of all items
}
```

**Integration Points**:
- Hook available via `useCart()` in any component
- Returns `{ cart, dispatchCartAction }`

### Step 12: Integrate Cart Button in Product Cards

**Completed**: Added "Add to Cart" button to product cards

**Changes**:
- [x] Added `dispatchCartAction` prop to `ProductCard` component
- [x] Added "ADD_TO_CART" button at bottom of product card
- [x] Button styled with dark theme (blue background, hover effects)
- [x] Button text displays action type: "ADD_TO_CART"
- [x] Button calls `dispatchCartAction({ type: 'ADD_TO_CART', payload: product })`
- [x] Updated `ProductSearchToolRenderer` to accept and pass `dispatchCartAction`
- [x] Updated `MessagePartRenderer` to use `useCart` hook and pass `dispatchCartAction`

**Files Modified**:
- `features/ai-assistant/tools/product-search/components/product-card.tsx`
- `features/ai-assistant/tools/product-search/components/product-search-tool-renderer.tsx`
- `features/ai-assistant/components/message-part-orchestrator-renderer.tsx`

**Button Features**:
- Positioned at bottom of card after features
- Styled with blue background (`bg-blue-600`) and hover effect
- Action type displayed as button text
- Prevents card onClick when button is clicked (`e.stopPropagation()`)

### Step 13: Update UI Components
- [x] Create product card component (created in Step 7)
- [x] Add cart button to product cards (completed in Step 12)
- [ ] Replace booking-related components with product components
- [ ] Create product list component
- [ ] Create product comparison component
- [ ] Create product detail view

### Step 14: Update Hooks (Remaining)
- [x] Replace booking hooks with product hooks (useProducts created)
- [ ] Update chat submission for products
- [ ] Update other hooks to work with products instead of bookings

### Step 15: Update Agent (Additional Updates)
- [ ] Update agent to handle product-related requests
- [ ] Replace scheduling tools with product tools
- [ ] Update system prompt integration

---

## Phase 3: Cleanup (Future Steps)

### Step 13: Remove Scheduling Code
- [ ] Remove booking-related types
- [ ] Remove scheduling tools
- [ ] Remove calendar components
- [ ] Clean up unused imports

### Step 14: Testing & Refinement
- [ ] Test product queries
- [ ] Test product comparisons
- [ ] Test recommendations
- [ ] Refine prompts and responses

---

## Notes

- Keep the chat interface structure
- Maintain the AI assistant flow
- Preserve the message rendering system
- Keep the tool system architecture

---

## Progress Tracker

- [x] Step 1: Define Product Type
- [x] Step 2: Update System Prompt
- [x] Step 3: Update Initial Data
- [x] Step 4: Update Intro Suggestions
- [x] Step 5: Create useProducts Hook
- [x] Step 6: Update Agent
- [x] Step 7: Create Product Search Tool
- [x] Step 8: Cleanup - Remove Unused Tools and Props
- [ ] Step 9: Update/Create Additional Tools
- [ ] Step 10: Update UI Components
- [ ] Step 11: Update Hooks (Remaining)
- [ ] Step 12: Update Agent (Additional Updates)
- [ ] Step 13: Remove Scheduling Code
- [ ] Step 14: Testing & Refinement

---

**Last Updated**: Step 8 (Cleanup - Remove Unused Tools and Props) completed

