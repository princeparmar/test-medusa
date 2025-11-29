# Wishlist Integration Guide

This guide explains how to integrate the wishlist feature in your Medusa storefront using the `medusa-product-helper` plugin's helper functions.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Helper Functions](#frontend-helper-functions)
- [UI Components](#ui-components)
- [Integration Examples](#integration-examples)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Overview

The wishlist feature allows customers to save products they're interested in for later. The feature is powered by the `medusa-product-helper` plugin and provides:

- Add/remove products from wishlist
- Check if a product is in wishlist
- Get customer's complete wishlist
- Server-side helper functions for Next.js
- Pre-built UI components

## Prerequisites

1. **Backend Plugin**: Ensure `medusa-product-helper` is installed and configured in your Medusa backend
2. **Database Migration**: Run the wishlist migration on your backend:
   ```bash
   cd test-medusa
   npx medusa plugin:db:generate
   npx medusa db:migrate
   ```
3. **Frontend Package**: The `medusa-product-helper` package should be installed in your frontend:
   ```bash
   npm install medusa-product-helper
   ```

## Backend Setup

The wishlist module is automatically registered when you add the `medusa-product-helper` plugin to your Medusa configuration. No additional backend configuration is required.

### Plugin Configuration

The plugin should be configured in `medusa-config.ts`:

```typescript
export const productHelperPlugin = {
  resolve: "medusa-product-helper",
  options: {
    // ... other options
  },
}
```

## Frontend Helper Functions

All wishlist helper functions are located in `src/lib/data/wishlist.ts`. These are server actions that can be used in both server and client components.

### Available Functions

#### 1. `addToWishlistAction(productId: string)`

Adds a product to the customer's wishlist.

**Parameters:**
- `productId` (string): The ID of the product to add

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Example:**
```typescript
import { addToWishlistAction } from "@lib/data/wishlist"

const result = await addToWishlistAction("prod_123")
if (result.success) {
  console.log("Product added to wishlist")
} else {
  console.error(result.error)
}
```

#### 2. `removeFromWishlistAction(productId: string)`

Removes a product from the customer's wishlist.

**Parameters:**
- `productId` (string): The ID of the product to remove

**Returns:**
```typescript
{
  success: boolean
  error?: string
}
```

**Example:**
```typescript
import { removeFromWishlistAction } from "@lib/data/wishlist"

const result = await removeFromWishlistAction("prod_123")
if (result.success) {
  console.log("Product removed from wishlist")
}
```

#### 3. `getWishlistAction()`

Gets the customer's complete wishlist (returns product IDs only for performance).

**Returns:**
```typescript
{
  success: boolean
  wishlist?: string[]  // Array of product IDs
  error?: string
}
```

**Example:**
```typescript
import { getWishlistAction } from "@lib/data/wishlist"

const result = await getWishlistAction()
if (result.success && result.wishlist) {
  console.log(`Wishlist contains ${result.wishlist.length} products`)
  result.wishlist.forEach(productId => {
    console.log(`- ${productId}`)
  })
}
```

#### 4. `isInWishlistAction(productId: string)`

Checks if a specific product is in the customer's wishlist.

**Parameters:**
- `productId` (string): The ID of the product to check

**Returns:**
```typescript
{
  isInWishlist: boolean
  error?: string
}
```

**Example:**
```typescript
import { isInWishlistAction } from "@lib/data/wishlist"

const result = await isInWishlistAction("prod_123")
if (result.isInWishlist) {
  console.log("Product is in wishlist")
}
```

## UI Components

### WishlistButton Component

A pre-built React component that provides a complete wishlist toggle button with heart icon.

**Location:** `src/modules/products/components/wishlist-button/index.tsx`

**Props:**
```typescript
type WishlistButtonProps = {
  productId: string                    // Required: Product ID
  className?: string                    // Optional: Additional CSS classes
  size?: "small" | "medium" | "large"  // Optional: Icon size (default: "medium")
  showLabel?: boolean                   // Optional: Show "Save"/"Saved" text (default: false)
  initialIsInWishlist?: boolean         // Optional: Initial wishlist state
  isAuthenticated?: boolean             // Optional: Customer authentication status
}
```

**Features:**
- Automatic authentication check
- Redirects to login if not authenticated
- Optimistic UI updates
- Loading states
- Accessible (ARIA labels, keyboard navigation)
- Visual feedback (filled heart when in wishlist)

**Example Usage:**

```tsx
import WishlistButton from "@modules/products/components/wishlist-button"

// Basic usage
<WishlistButton productId="prod_123" />

// With label
<WishlistButton 
  productId="prod_123" 
  showLabel={true}
  size="large"
/>

// With initial state (for server-side rendering)
<WishlistButton 
  productId="prod_123"
  initialIsInWishlist={true}
  isAuthenticated={true}
/>
```

### Heart Icon Component

A reusable heart icon component for custom implementations.

**Location:** `src/modules/common/icons/heart.tsx`

**Props:**
```typescript
type HeartIconProps = {
  className?: string  // Optional: CSS classes
  filled?: boolean    // Optional: Show filled or outline (default: false)
}
```

**Example:**
```tsx
import HeartIcon from "@modules/common/icons/heart"

<HeartIcon filled={true} className="w-6 h-6 text-red-500" />
```

## Integration Examples

### Example 1: Product Listing Page

Add wishlist button to product cards on listing pages:

```tsx
// src/modules/products/components/product-preview/index.tsx
import { retrieveCustomer } from "@lib/data/customer"
import { getWishlistAction } from "@lib/data/wishlist"
import WishlistButton from "../wishlist-button"

export default async function ProductPreview({ product, region }) {
  // Check authentication and wishlist status
  const customer = await retrieveCustomer()
  const isAuthenticated = !!customer

  let isInWishlist = false
  if (isAuthenticated && product.id) {
    const wishlistResult = await getWishlistAction()
    if (wishlistResult.success && wishlistResult.wishlist) {
      isInWishlist = wishlistResult.wishlist.includes(product.id)
    }
  }

  return (
    <div className="relative group">
      {/* Product content */}
      <ProductImage product={product} />
      <ProductTitle product={product} />
      
      {/* Wishlist button positioned absolutely */}
      {product.id && (
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            productId={product.id}
            size="medium"
            initialIsInWishlist={isInWishlist}
            isAuthenticated={isAuthenticated}
            className="bg-white/90 backdrop-blur-sm shadow-sm"
          />
        </div>
      )}
    </div>
  )
}
```

### Example 2: Product Detail Page

Add wishlist button to product actions section:

```tsx
// src/modules/products/components/product-actions/index.tsx
"use client"

import WishlistButton from "../wishlist-button"

export default function ProductActions({ 
  product, 
  isAuthenticated = false,
  isInWishlist = false 
}) {
  return (
    <div className="flex flex-col gap-y-2">
      {/* Product options, price, etc. */}
      
      {/* Wishlist button */}
      {product.id && (
        <div className="flex items-center justify-center py-2">
          <WishlistButton
            productId={product.id}
            size="medium"
            showLabel={true}
            initialIsInWishlist={isInWishlist}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}
      
      {/* Add to cart button */}
      <Button>Add to cart</Button>
    </div>
  )
}
```

### Example 3: Custom Wishlist Page

Create a custom page to display all wishlist items:

```tsx
// src/app/[countryCode]/(main)/account/wishlist/page.tsx
import { retrieveCustomer } from "@lib/data/customer"
import { getWishlistAction } from "@lib/data/wishlist"
import { listProducts } from "@lib/data/products"
import { notFound } from "next/navigation"

export default async function WishlistPage({ params }) {
  const customer = await retrieveCustomer()
  
  if (!customer) {
    notFound()
  }

  // Get wishlist product IDs
  const wishlistResult = await getWishlistAction()
  const productIds = wishlistResult.wishlist || []

  if (productIds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ui-fg-subtle">Your wishlist is empty</p>
      </div>
    )
  }

  // Fetch full product details
  const { response } = await listProducts({
    queryParams: { id: productIds },
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {response.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Example 4: Client-Side Toggle

Use helper functions directly in client components:

```tsx
"use client"

import { addToWishlistAction, removeFromWishlistAction } from "@lib/data/wishlist"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export default function CustomWishlistToggle({ productId }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isInWishlist, setIsInWishlist] = useState(false)

  const handleToggle = async () => {
    startTransition(async () => {
      if (isInWishlist) {
        const result = await removeFromWishlistAction(productId)
        if (result.success) {
          setIsInWishlist(false)
          router.refresh()
        }
      } else {
        const result = await addToWishlistAction(productId)
        if (result.success) {
          setIsInWishlist(true)
          router.refresh()
        }
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="p-2 rounded-full hover:bg-ui-bg-subtle"
    >
      {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    </button>
  )
}
```

## Authentication

All wishlist operations require customer authentication. The helper functions automatically check for authentication using JWT tokens stored in cookies.

### How Authentication Works

1. **Token Storage**: Customer JWT tokens are stored in the `_medusa_jwt` cookie after login
2. **Automatic Headers**: Helper functions automatically include the `Authorization: Bearer <token>` header
3. **Unauthenticated Users**: If no token is found, functions return appropriate error messages

### Handling Unauthenticated Users

The `WishlistButton` component automatically redirects unauthenticated users to the login page:

```tsx
// Component handles this internally
<WishlistButton productId="prod_123" />
// If not authenticated, clicking redirects to /[countryCode]/account/login
```

For custom implementations, check authentication before showing wishlist features:

```tsx
import { retrieveCustomer } from "@lib/data/customer"

const customer = await retrieveCustomer()
const isAuthenticated = !!customer

if (!isAuthenticated) {
  return <LoginPrompt />
}
```

## API Reference

### API Endpoint: Check Wishlist Status

**GET** `/api/wishlist/check?productId={productId}`

Checks if a product is in the customer's wishlist. Useful for client-side components.

**Query Parameters:**
- `productId` (string, required): The product ID to check

**Response:**
```json
{
  "isInWishlist": true,
  "error": "optional error message"
}
```

**Example:**
```typescript
const response = await fetch(`/api/wishlist/check?productId=prod_123`)
const data = await response.json()
console.log(data.isInWishlist) // true or false
```

### Backend Store API Endpoints

The following endpoints are available from the `medusa-product-helper` plugin:

#### Add to Wishlist
- **POST** `/store/wishlist`
- **Body:** `{ "product_id": "prod_123" }`
- **Auth:** Required (customer JWT token)

#### Remove from Wishlist
- **DELETE** `/store/wishlist/:product_id`
- **Auth:** Required (customer JWT token)

#### Get Wishlist
- **GET** `/store/wishlist?include_details=true`
- **Query Params:**
  - `include_details` (boolean): If `true`, returns full product details
- **Auth:** Required (customer JWT token)

## Best Practices

### 1. Server-Side Rendering

Always fetch wishlist status on the server when possible for better performance and SEO:

```tsx
// ✅ Good: Fetch on server
export default async function ProductPage({ params }) {
  const customer = await retrieveCustomer()
  const wishlistResult = await getWishlistAction()
  const isInWishlist = wishlistResult.wishlist?.includes(productId) ?? false
  
  return <WishlistButton initialIsInWishlist={isInWishlist} />
}

// ❌ Avoid: Fetching on client
"use client"
export default function ProductPage() {
  const [isInWishlist, setIsInWishlist] = useState(false)
  useEffect(() => {
    // Client-side fetch
  }, [])
}
```

### 2. Batch Wishlist Checks

When checking multiple products, fetch the entire wishlist once instead of checking each product individually:

```tsx
// ✅ Good: Fetch once, check multiple
const wishlistResult = await getWishlistAction()
const wishlistSet = new Set(wishlistResult.wishlist || [])

products.forEach(product => {
  const isInWishlist = wishlistSet.has(product.id)
  // ...
})

// ❌ Avoid: Multiple API calls
products.forEach(async product => {
  const result = await isInWishlistAction(product.id)
  // ...
})
```

### 3. Error Handling

Always handle errors gracefully:

```tsx
const result = await addToWishlistAction(productId)
if (!result.success) {
  // Show user-friendly error message
  toast.error(result.error || "Failed to add to wishlist")
}
```

### 4. Loading States

Use React's `useTransition` for better UX during wishlist operations:

```tsx
const [isPending, startTransition] = useTransition()

const handleToggle = () => {
  startTransition(async () => {
    await addToWishlistAction(productId)
  })
}

return (
  <button disabled={isPending}>
    {isPending ? "Loading..." : "Add to wishlist"}
  </button>
)
```

### 5. Optimistic Updates

Update UI immediately, then sync with server:

```tsx
const [isInWishlist, setIsInWishlist] = useState(initialState)

const handleToggle = async () => {
  // Optimistic update
  setIsInWishlist(!isInWishlist)
  
  // Sync with server
  const result = isInWishlist 
    ? await removeFromWishlistAction(productId)
    : await addToWishlistAction(productId)
  
  // Revert on error
  if (!result.success) {
    setIsInWishlist(isInWishlist)
  }
}
```

### 6. Accessibility

Ensure wishlist buttons are accessible:

```tsx
<button
  aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
  title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
>
  <HeartIcon filled={isInWishlist} />
</button>
```

## Troubleshooting

### Issue: "Please sign in to add items to your wishlist"

**Solution:** Ensure the customer is authenticated. Check that:
1. Customer has logged in
2. JWT token is stored in `_medusa_jwt` cookie
3. Token hasn't expired

### Issue: Wishlist button doesn't update after adding/removing

**Solution:** Call `router.refresh()` after wishlist operations to refresh server components:

```tsx
const result = await addToWishlistAction(productId)
if (result.success) {
  router.refresh() // Refresh server components
}
```

### Issue: Database migration errors

**Solution:** Ensure the backend plugin is properly installed and migration has run:

```bash
cd test-medusa
npm install medusa-product-helper
npx medusa plugin:db:generate
npx medusa db:migrate
```

## Additional Resources

- [medusa-product-helper README](../../medusa-plugins/medusa-product-helper/README.md)
- [Medusa Documentation](https://docs.medusajs.com)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

