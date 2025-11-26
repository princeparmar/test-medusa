# Medusa Review & Rating Plugin

A Medusa v2 plugin to add product reviews and ratings.

## Features

- **Product Reviews**: Customers can submit reviews with ratings (1-5), title, description, and images.
- **Product Ratings**: Stores rating data directly in the product table (`total_rating_count` and `total_rating_sum` columns). Average rating is calculated on-demand.
- **Configurable Options**: Control auto-approval of reviews and purchase verification.
- **Admin Management**: Admin routes to list, approve/reject, and delete reviews.
- **Storefront API**: Public routes to list reviews, submit new ones, and fetch product ratings.

## Installation

1.  **Install the plugin**:
    
    ```bash
    npm install medusa-review-rating
    ```
    
    Or with yarn:
    
    ```bash
    yarn add medusa-review-rating
    ```

2.  **Configure `medusa-config.js`**:
    Add the plugin to your `modules` configuration in your Medusa project's `medusa-config.js`.

    module.exports = defineConfig({
      // ...
      modules: {
        reviews: {
          resolve: "medusa-review-rating",
        },
      },
      plugins: [
        {
          resolve: "medusa-review-rating",
        },
      ],
    })
    ```

3.  **Run Migrations**:
    The plugin migrations should be run to create the necessary tables.

    ```bash
    npx medusa db:migrate
    ```

## API Reference

### Product Endpoints (Enhanced)

The plugin overrides default Medusa product endpoints to automatically include rating data.

#### Get Product List

```bash
GET /store/products
```

**Response includes rating fields automatically:**
```json
{
  "products": [
    {
      "id": "prod_123",
      "title": "Product Name",
      // ... all standard product fields
      "total_rating_count": 15,
      "total_rating_sum": 68,
      "average_rating": 4.53
    }
  ],
  "count": 10,
  "offset": 0,
  "limit": 20
}
```

**Query Parameters:**
- All standard Medusa product filters work (e.g., `fields`, `limit`, `offset`, `q`, etc.)
- Rating fields are always included

#### Get Single Product

```bash
GET /store/products/:id
```

**Response:**
```json
{
  "product": {
    "id": "prod_123",
    "title": "Product Name",
    // ... all standard product fields
    "total_rating_count": 15,
    "total_rating_sum": 68,
    "average_rating": 4.53
  }
}
```

#### Get Product Rating Only

```bash
GET /store/products/:id/rating
```

**Response:**
```json
{
  "rating": {
    "average_rating": 4.53,
    "total_reviews": 15,
    "total_rating_sum": 68
  }
}
```

### Review Endpoints

#### Submit a Review (Store)

```bash
POST /store/reviews
```

**Request Body:**
```json
{
  "product_id": "prod_123",
  "customer_id": "cus_123",
  "rating": 5,
  "title": "Great product!",
  "description": "This product exceeded my expectations...",
  "images": ["url1", "url2"]
}
```

**Response:**
```json
{
  "review": {
    "id": "rev_123",
    "product_id": "prod_123",
    "customer_id": "cus_123",
    "rating": 5,
    "title": "Great product!",
    "description": "This product exceeded my expectations...",
    "images": ["url1", "url2"],
    "verified_purchase": false,
    "status": "pending",
    "created_at": "2024-11-21T08:00:00.000Z",
    "updated_at": "2024-11-21T08:00:00.000Z"
  }
}
```

**Note:** Review status depends on plugin configuration:
- `autoApprove: true` → status is `approved`
- `autoApprove: false` → status is `pending` (requires admin approval)

#### Get Product Reviews (Store)

```bash
GET /store/products/:id/reviews
```

**Query Parameters:**
- `status` - Filter by status (approved, pending, rejected)
- `limit` - Number of reviews per page
- `offset` - Pagination offset

**Response:**
```json
{
  "reviews": [
    {
      "id": "rev_123",
      "product_id": "prod_123",
      "customer_id": "cus_123",
      "rating": 5,
      "title": "Great product!",
      "description": "This product exceeded my expectations...",
      "images": ["url1", "url2"],
      "verified_purchase": true,
      "status": "approved",
      "created_at": "2024-11-21T08:00:00.000Z"
    }
  ]
}
```

#### Get Single Review (Store)

```bash
GET /store/reviews/:id
```

**Response:**
```json
{
  "review": {
    "id": "rev_123",
    "product_id": "prod_123",
    "rating": 5,
    "title": "Great product!",
    // ... full review object
  }
}
```

#### Get Current Customer Reviews

```bash
GET /store/reviews/me
```

**Query Parameters (optional):**
- `product_id` - Filter reviews for a specific product
- `status` - Filter by review status (`pending`, `approved`, `rejected`)

**Response:**
```json
{
  "reviews": [
    {
      "id": "rev_123",
      "product_id": "prod_123",
      "rating": 5,
      "status": "approved"
    }
  ],
  "summary": {
    "total_reviews": 3,
    "average_rating": 4.33,
    "total_rating_sum": 13
  }
}
```

#### Get Current Customer Review For Product

```bash
GET /store/products/:id/reviews/me
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "rev_999",
      "product_id": "prod_123",
      "rating": 4,
      "status": "pending"
    }
  ],
  "summary": {
    "product_id": "prod_123",
    "total_reviews": 1,
    "average_rating": 4,
    "total_rating_sum": 4
  }
}
```

### Helper Utilities

This plugin exposes storefront-friendly helpers (similar to other Medusa modules) so you can call the Review API without re-implementing fetch logic.

**Important:** Most storefront requests require a publishable API key. You can find this in your Medusa dashboard under Settings → API Key Management.

```ts
import {
  submitReview,
  listCustomerReviews,
  listCustomerProductReviews,
  listProductReviews,
  getProductRating,
  type StorefrontHelperOptions,
  type ReviewDTO,
} from "medusa-review-rating/helpers"

// Common options - can be reused across all helper calls
const options = {
  baseUrl: "https://store.myshop.com",
  publishableApiKey: "pk_your_publishable_api_key_here", // Required for public endpoints
}

// Submit a review
await submitReview(
  {
    product_id: "prod_123",
    rating: 5,
    title: "Amazing product",
    description: "Highly recommend",
  },
  options
)

// Fetch all reviews authored by the current customer (requires authentication)
const myReviews = await listCustomerReviews(
  { status: "approved" },
  options
)

// Fetch only the current customer's review for a specific product
const myProductReviews = await listCustomerProductReviews(
  "prod_123",
  options
)

// Public product reviews (requires publishable API key)
const productReviews = await listProductReviews("prod_123", options)

// Get product rating summary (requires publishable API key)
const rating = await getProductRating("prod_123", options)
```

**Using with Medusa JS SDK:**

```ts
import { Medusa } from "@medusajs/js-sdk"

const medusa = new Medusa({
  baseUrl: "https://store.myshop.com",
  publishableKey: "pk_your_publishable_api_key_here",
})

// Use the SDK client instead of baseUrl + publishableApiKey
const productReviews = await listProductReviews("prod_123", {
  client: medusa,
})
```

**Helper Options:**

- `publishableApiKey` (required for public endpoints): Your Medusa publishable API key. Found in Settings → API Key Management in your dashboard.
- `baseUrl`: Storefront API origin (e.g., `https://store.myshop.com`).
- `client`: Pass an initialized Medusa JS/SDK client to reuse its transport and authentication.
- `fetchImpl`: Custom fetch implementation (SSR, React Native, etc.).
- `headers`: Additional headers merged into every request.

**Authentication Notes:**

- **Public endpoints** (`listProductReviews`, `getProductRating`): Only require `publishableApiKey`.
- **Customer-specific endpoints** (`submitReview`, `listCustomerReviews`, `listCustomerProductReviews`): Require both `publishableApiKey` and customer authentication (via session cookies or JWT token in headers).

For authenticated requests, include the customer's session cookie or JWT token in the `headers` option:

```ts
const authenticatedOptions = {
  ...options,
  headers: {
    Cookie: "connect.sid=your_session_cookie", // or
    Authorization: "Bearer customer_jwt_token",
  },
}

const myReviews = await listCustomerReviews({}, authenticatedOptions)
```


### Admin Endpoints

#### List All Reviews (Admin)

```bash
GET /admin/reviews
```

**Query Parameters:**
- `product_id` - Filter by product
- `customer_id` - Filter by customer
- `status` - Filter by status (approved, pending, rejected)
- `limit` - Number of reviews per page
- `offset` - Pagination offset

**Response:**
```json
{
  "reviews": [
    {
      "id": "rev_123",
      "product_id": "prod_123",
      "customer_id": "cus_123",
      "rating": 5,
      "status": "pending",
      // ... full review details
    }
  ]
}
```

#### Update Review Status (Admin)

```bash
POST /admin/reviews/:id
```

**Request Body:**
```json
{
  "status": "approved"
}
```

**Accepted values:** `approved`, `rejected`, `pending`

**Response:**
```json
{
  "review": {
    "id": "rev_123",
    "status": "approved",
    // ... updated review object
  }
}
```

**Note:** Updating status to `approved` automatically recalculates the product's rating.

#### Delete Review (Admin)

```bash
DELETE /admin/reviews/:id
```

**Response:**
```json
{
  "id": "rev_123",
  "deleted": true
}
```

**Note:** Deleting a review automatically recalculates the product's rating.

## Configuration

Configure the plugin in your `medusa-config.js`:

```javascript
module.exports = defineConfig({
  // ...
  modules: {
    reviews: {
      resolve: "medusa-review-rating",
      options: {
        autoApprove: false,        // Set to true to auto-approve all reviews
        requireVerifiedPurchase: false  // Set to true to only allow verified purchases
      }
    },
  },
  plugins: [
    {
      resolve: "medusa-review-rating",
    },
  ],
})
```

## Integration Examples

### Frontend - Display Product with Rating

```javascript
// Fetch product (rating included automatically)
const { product } = await fetch('/store/products/prod_123').then(r => r.json())

console.log(product.average_rating)      // 4.53
console.log(product.total_rating_count)  // 15
```

### Frontend - Submit Review

```javascript
const review = await fetch('/store/reviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    product_id: 'prod_123',
    customer_id: 'cus_123',
    rating: 5,
    title: 'Great product!',
    description: 'Highly recommend'
  })
}).then(r => r.json())
```

### Admin - Approve Review

```javascript
await fetch('/admin/reviews/rev_123', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({ status: 'approved' })
})
```

## Development

1.  **Build**:
    ```bash
    yarn build
    ```

2.  **Watch**:
    ```bash
    yarn dev
    ```
