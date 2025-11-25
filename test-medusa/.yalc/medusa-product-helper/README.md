<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa Plugin Starter
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  Building blocks for digital commerce
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Compatibility

This plugin is compatible with versions >= 2.4.0 of `@medusajs/medusa`.

## Installation

```bash
yarn add medusa-product-helper
# or
npm install medusa-product-helper
```

## Configuration

Add the plugin to your `medusa-config.ts`:

```ts
import type { ConfigModule } from "@medusajs/framework/types"

const plugins = [
  {
    resolve: "medusa-product-helper",
    options: {
      // Metadata descriptors for product & category metadata fields
      metadata: {
        products: {
          // Expose client-side helper functions for metadata access
          expose_client_helpers: true,
          // Define metadata fields that will be used across products
          descriptors: [
            {
              key: "brand",
              label: "Brand",
              type: "text",
              filterable: true,
            },
            {
              key: "material",
              label: "Material",
              type: "text",
            },
            {
              key: "warranty_years",
              label: "Warranty (Years)",
              type: "number",
              filterable: true,
            },
            {
              key: "is_eco_friendly",
              label: "Eco Friendly",
              type: "bool",
              filterable: true,
            },
            {
              key: "certification_file",
              label: "Certification Document",
              type: "file",
            },
          ],
        },
        categories: {
          // Define metadata fields maintained on product categories
          descriptors: [
            {
              key: "taxonomy_label",
              label: "Taxonomy Label",
              type: "text",
            },
            {
              key: "category_banner",
              label: "Category Banner URL",
              type: "file",
            },
          ],
        },
      },
      // Default price range when none is specified
      default_price_range: {
        label: "custom",
        min: null,
        max: null,
      },
      // Promotion window configuration
      promotion_window: {
        // Metadata key that stores the promotion start date
        start_metadata_key: "promotion_start",
        // Metadata key that stores the promotion end date
        end_metadata_key: "promotion_end",
        // If true, promotions without an end date are considered active
        treat_open_ended_as_active: true,
      },
      // Product availability filtering options
      availability: {
        // Only show products that are in stock
        require_in_stock: false,
        // Include products available for preorder
        include_preorder: true,
        // Include products available for backorder
        include_backorder: true,
        // Include gift cards in product listings
        include_gift_cards: false,
        // Only show publishable products
        publishable_only: true,
      },
      // Product rating configuration
      rating: {
        // Enable rating-based filtering
        enabled: true,
        // Minimum rating value (0-5)
        min: 0,
        // Maximum rating value (0-5)
        max: 5,
        // Require products to have at least one review
        require_reviews: false,
      },
    },
  },
]

export default {
  projectConfig: {
    // Your Medusa project configuration
    // database_url: process.env.DATABASE_URL,
    // ...
  },
  plugins,
} satisfies ConfigModule
```

### Configuration Options

#### Metadata

Define metadata fields that will be used across your products and product categories.

`metadata.products`
- `descriptors`: Drives the product metadata widgets and product filter API.
- `expose_client_helpers`: When `true`, exposes helper utilities for retrieving product metadata on the storefront.

`metadata.categories`
- `descriptors`: Drives the category metadata widget. These keys are never exposed to the product filter API.

Each descriptor supports:
- `text`, `number`, `bool`, `file` field types
- `filterable` (products only): Optional boolean flag (default `false`) that controls whether the key can be used in the public product filter API. Only product keys with `filterable: true` are honored when customers pass `metadata` filters.

### Admin Metadata Widgets

The plugin ships two Medusa Admin widgets:

- **Product metadata table** (`product.details.after`) replaces the default
  product metadata editor with a structured, type-aware table driven by your
  configured descriptors.
- **Category metadata table** (`product_category.details.after`) provides the
  exact experience on the product category detail page so category metadata can
  be edited consistently.

Both widgets automatically hide the default metadata sections to avoid duplicate
inputs. No extra configuration is required beyond defining descriptors under
`metadata.products.descriptors` or `metadata.categories.descriptors` in
`medusa-config.ts`.

#### Wishlist Insights Widget

The admin extension also injects a **Wishlist performance** card into the product
details sidebar (`product.details.side.after`). The widget:

- Shows how many unique customers saved the current product.
- Highlights whether the product ranks within the most wishlisted items.
- Displays a live leaderboard (top 5) powered by `/admin/wishlist/stats`.

No additional configuration is required—install the plugin, run the wishlist
migration, and open any product inside Medusa Admin to see the UI.

#### Promotion Window

Configure how promotion dates are tracked using product metadata:
- `start_metadata_key`: Metadata key storing promotion start date
- `end_metadata_key`: Metadata key storing promotion end date
- `treat_open_ended_as_active`: If true, promotions without an end date are considered active

#### Availability

Control which products appear in listings:
- `require_in_stock`: Only show in-stock products
- `include_preorder`: Include preorder products
- `include_backorder`: Include backorder products
- `include_gift_cards`: Include gift cards
- `publishable_only`: Only show publishable products

#### Rating

Configure rating-based filtering:
- `enabled`: Enable rating filtering
- `min`: Minimum rating (0-5)
- `max`: Maximum rating (0-5)
- `require_reviews`: Require at least one review

## Wishlist Feature

The plugin includes a comprehensive wishlist feature that allows customers to save products they're interested in and admins to view wishlist statistics.

### Security & Access Control

- Store-facing wishlist routes authenticate strictly as customers. Customer IDs are always derived from the session or JWT auth context and never taken from the request payload, so an admin or API client cannot spoof a customer identifier.
- Admin-facing wishlist statistics are available only to admin actors (`user` sessions or secret API keys). Customer tokens receive a `403` response when attempting to access `/admin/wishlist/stats`.
- This separation ensures only customers can manage their wishlist entries while only admins can inspect aggregate wishlist state.

### Module Registration

The wishlist module is automatically registered when you add the plugin to your Medusa configuration. No additional configuration is required for basic usage.

### Database Migration

After installing the plugin, generate and run the database migration:

```bash
npx medusa plugin:db:generate
npx medusa db:migrate
```

This will create the `wishlist` table with the following structure:
- `id`: Primary key
- `customer_id`: Customer identifier (searchable)
- `product_id`: Product identifier (searchable)
- `created_at`: Timestamp when item was added
- `updated_at`: Timestamp when item was last updated

The table enforces a unique constraint on the combination of `customer_id` and `product_id`, ensuring no duplicate entries.

### Store API Endpoints

#### Add Product to Wishlist

**POST** `/store/wishlist`

Add a product to the current customer's wishlist. The operation is idempotent - adding the same product multiple times will not create duplicates.

**Authentication**: Required (customer must be authenticated)

**Request Body**:
```json
{
  "product_id": "prod_123"
}
```

**Response**:
```json
{
  "wishlist_item": {
    "id": "wish_123",
    "customer_id": "cus_123",
    "product_id": "prod_123",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example**:
```bash
curl -X POST https://your-store.com/store/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "prod_123"}'
```

#### Remove Product from Wishlist

**DELETE** `/store/wishlist/:product_id`

Remove a product from the current customer's wishlist.

**Authentication**: Required (customer must be authenticated)

**Response**:
```json
{
  "success": true
}
```

**Example**:
```bash
curl -X DELETE https://your-store.com/store/wishlist/prod_123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Customer Wishlist

**GET** `/store/wishlist`

Get the current customer's wishlist. Can return either product IDs only or full product details.

**Authentication**: Required (customer must be authenticated)

**Query Parameters**:
- `include_details` (boolean, default: `false`): If `true`, returns full product details. If `false`, returns only product IDs.

**Response (IDs only)**:
```json
{
  "wishlist": [
    {
      "product_id": "prod_123"
    },
    {
      "product_id": "prod_456"
    }
  ]
}
```

**Response (with details)**:
```json
{
  "wishlist": [
    {
      "id": "wish_123",
      "product_id": "prod_123",
      "product": {
        "id": "prod_123",
        "title": "Product Name",
        "handle": "product-name",
        "description": "Product description",
        "thumbnail": "https://example.com/image.jpg",
        "status": "published",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Example**:
```bash
# Get only product IDs
curl https://your-store.com/store/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get full product details
curl "https://your-store.com/store/wishlist?include_details=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Admin API Endpoints

#### Get Wishlist Statistics

**GET** `/admin/wishlist/stats`

Get wishlist statistics showing how many users have added each product to their wishlist.

**Authentication**: Required (admin authentication)

**Query Parameters**:
- `product_id` (string, optional): If provided, returns the wishlist count for that specific product only.

**Response (all products)**:
```json
{
  "stats": [
    {
      "product_id": "prod_123",
      "wishlist_count": 42
    },
    {
      "product_id": "prod_456",
      "wishlist_count": 15
    }
  ]
}
```

**Response (single product)**:
```json
{
  "product_id": "prod_123",
  "wishlist_count": 42
}
```

**Example**:
```bash
# Get statistics for all products
curl https://your-store.com/admin/wishlist/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get statistics for a specific product
curl "https://your-store.com/admin/wishlist/stats?product_id=prod_123" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Helper Functions

The plugin exposes lightweight helpers that wrap the Store API endpoints. They are ideal for server-side storefronts that need to call the wishlist endpoints while relying on the authenticated customer's session (no customer ID is ever passed in the payload).

#### Imports

```typescript
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  createWishlistHelpers,
} from "medusa-product-helper/wishlist-helper"
```

#### Example Usage

```typescript
// Add a product
await addToWishlist(
  { product_id: "prod_123" },
  {
    baseUrl: "https://store.example.com",
    headers: {
      Cookie: "connect.sid=...", // or Authorization header
    },
  }
)

// Read wishlist with details
const { wishlist } = await getWishlist(
  { includeDetails: true },
  {
    baseUrl: "https://store.example.com",
    headers: {
      Cookie: "connect.sid=...",
    },
  }
)

// Remove a product
await removeFromWishlist(
  { product_id: "prod_123" },
  {
    baseUrl: "https://store.example.com",
    headers: {
      Cookie: "connect.sid=...",
    },
  }
)
```

#### Configuration Options

All helper calls accept the following options:

- `client`: Medusa JS/SDK client instance. When provided, network requests are delegated to `client.request`.
- `baseUrl`: Base URL for the Store API (e.g., `https://store.example.com`). Required when a client is not provided.
- `fetchImpl`: Custom `fetch` implementation for SSR or React Native environments. Defaults to `globalThis.fetch`.
- `headers`: Additional headers appended to every request (useful for `Cookie` / `Authorization` headers).

You can also generate pre-configured helpers:

```typescript
const wishlist = createWishlistHelpers({
  baseUrl: "https://store.example.com",
  headers: { Cookie: "connect.sid=..." },
})

await wishlist.addToWishlist({ product_id: "prod_123" })
const { wishlist: items } = await wishlist.getWishlist({ includeDetails: true })
await wishlist.removeFromWishlist({ product_id: "prod_123" })
```

### Using Workflows Directly

You can also use the workflows directly in your custom code:

```typescript
import { addToWishlistWorkflow } from "medusa-product-helper/workflows"
import { removeFromWishlistWorkflow } from "medusa-product-helper/workflows"
import { getWishlistWorkflow } from "medusa-product-helper/workflows"

// Add to wishlist
const { result } = await addToWishlistWorkflow(container).run({
  input: {
    customer_id: "cus_123",
    product_id: "prod_123"
  }
})

// Remove from wishlist
const { result } = await removeFromWishlistWorkflow(container).run({
  input: {
    customer_id: "cus_123",
    product_id: "prod_123"
  }
})

// Get wishlist
const { result } = await getWishlistWorkflow(container).run({
  input: {
    customer_id: "cus_123",
    options: {
      includeDetails: true
    }
  }
})
```

### Using the Module Service Directly

You can also access the wishlist module service directly:

```typescript
import { WISHLIST_MODULE } from "medusa-product-helper/modules/wishlist"
import type { WishlistModuleService } from "medusa-product-helper/modules/wishlist"

// In your route or service
const wishlistService: WishlistModuleService = container.resolve(WISHLIST_MODULE)

// Add to wishlist
await wishlistService.addToWishlist(customerId, productId)

// Remove from wishlist
await wishlistService.removeFromWishlist(customerId, productId)

// Get wishlist
const wishlist = await wishlistService.getWishlist(customerId, {
  includeDetails: true
})

// Check if product is in wishlist
const isInWishlist = await wishlistService.isInWishlist(customerId, productId)

// Get wishlist counts (for admin)
const counts = await wishlistService.getWishlistCounts(['prod_123', 'prod_456'])
```

## Getting Started

Visit the [Quickstart Guide](https://docs.medusajs.com/learn/installation) to set up a server.

Visit the [Plugins documentation](https://docs.medusajs.com/learn/fundamentals/plugins) to learn more about plugins and how to create them.

## What is Medusa

Medusa is a set of commerce modules and tools that allow you to build rich, reliable, and performant commerce applications without reinventing core commerce logic. The modules can be customized and used to build advanced ecommerce stores, marketplaces, or any product that needs foundational commerce primitives. All modules are open-source and freely available on npm.

Learn more about [Medusa’s architecture](https://docs.medusajs.com/learn/introduction/architecture) and [commerce modules](https://docs.medusajs.com/learn/fundamentals/modules/commerce-modules) in the Docs.

## Community & Contributions

The community and core team are available in [GitHub Discussions](https://github.com/medusajs/medusa/discussions), where you can ask for support, discuss roadmap, and share ideas.

Join our [Discord server](https://discord.com/invite/medusajs) to meet other community members.

## Other channels

- [GitHub Issues](https://github.com/medusajs/medusa/issues)
- [Twitter](https://twitter.com/medusajs)
- [LinkedIn](https://www.linkedin.com/company/medusajs)
- [Medusa Blog](https://medusajs.com/blog/)
