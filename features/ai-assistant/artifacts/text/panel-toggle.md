# Document Preview Conditional Rendering Logic

## Overview

The `DocumentPreview` component switches between two views based on the **artifact panel visibility**:

1. **Preview Card** (Full View) - When panel is **CLOSED**
2. **Button** (Compact View) - When panel is **OPEN**

---

## The Key Condition

```typescript
if (artifact.isVisible) {
  // Panel is OPEN → Show BUTTON
} else {
  // Panel is CLOSED → Show PREVIEW CARD
}
```

**Source**: `artifact.isVisible` from `useArtifact()` hook (global state via SWR)

---

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DocumentPreview                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Check: artifact.isVisible                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                        │                                     │
│            ┌───────────┴───────────┐                        │
│            │                       │                        │
│      TRUE (Panel OPEN)    FALSE (Panel CLOSED)              │
│            │                       │                        │
│            ▼                       ▼                        │
│  ┌──────────────────┐   ┌──────────────────────┐           │
│  │  Show BUTTON     │   │  Show PREVIEW CARD   │           │
│  │                  │   │                      │           │
│  │  [📄 Document]   │   │  ┌────────────────┐ │           │
│  │                  │   │  │ Header + Title   │ │           │
│  │  (Compact)       │   │  ├────────────────┤ │           │
│  │                  │   │  │ Content Preview │ │           │
│  │                  │   │  │ (~257px height) │ │           │
│  │                  │   │  │ Scrollable      │ │           │
│  │                  │   │  └────────────────┘ │           │
│  └──────────────────┘   └──────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Logic Breakdown

### 1. When Panel is OPEN (`artifact.isVisible === true`)

**Shows**: Compact button component

**Which button?**
- If `result` exists → `DocumentToolResult` (document created)
- If `args` exists → `DocumentToolCall` (document being created)
- Otherwise → `DocumentToolResult` with artifact data

**Code Location**: Lines 109-145 in `document-preview.tsx`

```typescript
if (artifact.isVisible) {
  // Panel is open - show compact button
  if (result) {
    return <DocumentToolResult ... />;
  }
  if (args) {
    return <DocumentToolCall ... />;
  }
  // Fallback: show button with artifact data
  if (artifact.documentId !== 'init' || artifact.title) {
    return <DocumentToolResult ... />;
  }
}
```

---

### 2. When Panel is CLOSED (`artifact.isVisible === false`)

**Shows**: Full preview card with content

**Components**:
- `DocumentHeader` - Title, icon, streaming indicator
- `DocumentContent` - Scrollable content preview (~257px height)
- `HitboxLayer` - Clickable overlay (header area only)

**Code Location**: Lines 147-174 in `document-preview.tsx`

```typescript
// Panel is closed - show preview card
if (!document || (!document.title && !result && !args)) {
  return <DocumentSkeleton />; // Loading state
}

return (
  <div className="relative w-full cursor-pointer" ref={hitboxRef}>
    <HitboxLayer ... />      {/* Clickable header */}
    <DocumentHeader ... />   {/* Title + icon */}
    <DocumentContent ... />  {/* Scrollable content */}
  </div>
);
```

---

## Data Priority (for `document` object)

When building the `document` object, priority is:

1. **Artifact State** (if has content/title/documentId)
   ```typescript
   if (artifact.content || artifact.title || artifact.documentId !== 'init') {
     return { title, kind, content, id } from artifact;
   }
   ```

2. **Result** (tool result - document created)
   ```typescript
   if (result) {
     return { title, kind, id } from result;
   }
   ```

3. **Args** (tool call - document being created)
   ```typescript
   if (args) {
     return { title, kind } from args;
   }
   ```

**Code Location**: Lines 71-104 in `document-preview.tsx`

---

## State Management

### Global State (SWR)

The `artifact` state is managed globally via SWR:

```typescript
const { artifact, setArtifact } = useArtifact();
```

**Key Properties**:
- `artifact.isVisible` - Controls panel visibility (main switch)
- `artifact.content` - Document content
- `artifact.title` - Document title
- `artifact.documentId` - Document ID (UUID or 'init')
- `artifact.status` - 'idle' | 'streaming' | 'complete'
- `artifact.kind` - 'text' | 'code' | 'sheet'

### When `isVisible` Changes

**Set to `true`** (Open Panel):
- User clicks preview card header
- User clicks maximize button
- Auto-opens when content reaches threshold (400-450 chars)

**Set to `false`** (Close Panel):
- User clicks close button in artifact panel
- Content is preserved (not cleared)

**Code Location**: 
- Opening: `HitboxLayer.handleClick()` (line 193-217)
- Closing: `ArtifactCloseButton.handleClose()` (artifact-close-button.tsx)

---

## Example Scenarios

### Scenario 1: Document Being Created (Streaming)

**State**:
- `artifact.isVisible = false` (panel closed)
- `artifact.status = 'streaming'`
- `args = { title: "My Document", kind: "text" }`

**Renders**: Preview card with streaming indicator

---

### Scenario 2: Document Created, Panel Closed

**State**:
- `artifact.isVisible = false` (panel closed)
- `artifact.status = 'complete'`
- `result = { id: "abc-123", title: "My Document", kind: "text" }`
- `artifact.content = "Full document content..."`

**Renders**: Preview card with full content (scrollable)

---

### Scenario 3: Document Created, Panel Open

**State**:
- `artifact.isVisible = true` (panel open)
- `result = { id: "abc-123", title: "My Document", kind: "text" }`

**Renders**: Compact button `[📄 Created "My Document"]`

---

### Scenario 4: User Clicks Preview Card

**Action**: User clicks header area

**State Change**:
```typescript
setArtifact(prev => ({
  ...prev,
  isVisible: true,  // ← Changes from false to true
  boundingBox: { ... } // For animation
}));
```

**Result**: 
- Preview card → Button (in message list)
- Artifact panel opens (split-screen)

---

## Key Files

1. **`document-preview.tsx`** - Main component with conditional logic
2. **`use-artifact.ts`** - Global state management (SWR)
3. **`document-tool-call.tsx`** - Button shown when creating
4. **`document-tool-result.tsx`** - Button shown when created
5. **`document-header.tsx`** - Header of preview card
6. **`document-content.tsx`** - Content area of preview card
7. **`artifact-close-button.tsx`** - Closes panel (sets `isVisible = false`)

---

## Summary

**The switch happens based on `artifact.isVisible`:**

- ✅ **`isVisible = false`** → Preview Card (full view with content)
- ✅ **`isVisible = true`** → Button (compact view in message list)

**The state is global** (via SWR), so all `DocumentPreview` instances react to the same `isVisible` value.

