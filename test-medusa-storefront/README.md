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
  Medusa Next.js Starter Template
</h1>

<p align="center">
Combine Medusa's modules for your commerce backend with the newest Next.js 15 features for a performant storefront.</p>

<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

### Prerequisites

To use the [Next.js Starter Template](https://medusajs.com/nextjs-commerce/), you should have a Medusa server running locally on port 9000.
For a quick setup, run:

```shell
npx create-medusa-app@latest
```

Check out [create-medusa-app docs](https://docs.medusajs.com/learn/installation) for more details and troubleshooting.

# Overview

The Medusa Next.js Starter is built with:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Medusa](https://medusajs.com/)

Features include:

- Full ecommerce support:
  - Product Detail Page
  - Product Overview Page
  - Product Collections
  - Cart
  - Checkout with Stripe
  - User Accounts
  - Order Details
- Full Next.js 15 support:
  - App Router
  - Next fetching/caching
  - Server Components
  - Server Actions
  - Streaming
  - Static Pre-Rendering

# Quickstart

### Setting up the environment variables

Navigate into your projects directory and get your environment variables ready:

```shell
cd nextjs-starter-medusa/
mv .env.template .env.local
```

### Install dependencies

Use Yarn to install all dependencies.

```shell
yarn
```

### Start developing

You are now ready to start up your project.

```shell
yarn dev
```

### Open the code and start customizing

Your site is now running at http://localhost:8000!

# Payment integrations

By default this starter supports the following payment integrations

- [Stripe](https://stripe.com/)

To enable the integrations you need to add the following to your `.env.local` file:

```shell
NEXT_PUBLIC_STRIPE_KEY=<your-stripe-public-key>
```

You'll also need to setup the integrations in your Medusa server. See the [Medusa documentation](https://docs.medusajs.com) for more information on how to configure [Stripe](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe#main).

# Reviews & Ratings

The storefront ships with built-in support for the [`medusa-review-rating`](https://www.npmjs.com/package/medusa-review-rating) plugin. Follow the steps below to enable end-to-end product reviews and aggregate ratings.

## 1. Install & configure the Medusa plugin (Backend)

1. In your Medusa backend, install the plugin:

   ```bash
   yarn add medusa-review-rating
   ```

2. Register it in `medusa-config.ts`:

   ```ts
   modules: {
     reviews: {
       resolve: "medusa-review-rating",
       options: {
         autoApprove: false,
         requireVerifiedPurchase: false,
       },
     },
   },
   plugins: [{ resolve: "medusa-review-rating" }]
   ```

3. Run the plugin migrations so the `review` table and rating columns exist:

   ```bash
   npx medusa db:migrate
   ```

4. Restart your Medusa server.

## 2. Configure the storefront

1. Install the helper package (already referenced in `package.json` but shown here for clarity):

   ```bash
   yarn add medusa-review-rating
   ```

2. Provide the API base URL and publishable key so the helpers can call the review routes. Add the following to `.env.local`:

   ```bash
   MEDUSA_BACKEND_URL=http://localhost:9000          # your Medusa server
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test_xxx     # create in Medusa dashboard
   ```

3. (Optional) If your storefront is deployed separately from the Medusa server, update `MEDUSA_BACKEND_URL` to the public Store API URL (e.g., `https://store.myshop.com`).

## 3. Using the helpers

### Submitting a Review (with Authentication)

To submit a review, you need to pass a JWT token in the `Authorization` header. The storefront automatically handles this through the `getAuthHeaders()` helper which retrieves the token from the customer's session cookie.

**Server Action Example** (recommended for Next.js):

```ts
"use server"

import { getAuthHeaders } from "@lib/data/cookies"
import {
  submitReview,
  type StorefrontHelperOptions,
} from "medusa-review-rating/helpers"

export const submitReviewAction = async (formData: FormData) => {
  const authHeaders = await getAuthHeaders()
  
  // Verify user is authenticated
  if (!("authorization" in authHeaders)) {
    return { status: "error", message: "Please sign in to leave a review." }
  }

  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const baseUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

  // Create authenticated options with JWT token
  const authenticatedOptions: StorefrontHelperOptions = {
    baseUrl,
    publishableApiKey: publishableKey,
    headers: {
      Authorization: authHeaders.authorization, // JWT token from customer login
      "Content-Type": "application/json",
    },
  }

  await submitReview(
    {
      product_id: "prod_123",
      rating: 5,
      title: "Amazing product",
      description: "Highly recommend",
    },
    authenticatedOptions
  )
}
```

**Direct Helper Usage** (for custom implementations):

```ts
import {
  submitReview,
  type StorefrontHelperOptions,
} from "medusa-review-rating/helpers"

// Option 1: Using JWT token (recommended)
const authenticatedOptions: StorefrontHelperOptions = {
  baseUrl: "https://store.myshop.com",
  publishableApiKey: "pk_your_publishable_api_key_here",
  headers: {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT token from customer login
  },
}

// Submit a review with authentication
await submitReview(
  {
    product_id: "prod_123",
    rating: 5,
    title: "Amazing product",
    description: "Highly recommend",
  },
  authenticatedOptions
)
```

### Listing Reviews on Product Listing Pages

To display reviews and ratings on product listing pages (store, collections, categories), you can fetch product ratings and display them on each product card.

**Example: Fetching ratings for multiple products**

```ts
import {
  getProductRating,
  listProductReviews,
  type StorefrontHelperOptions,
} from "medusa-review-rating/helpers"

const options: StorefrontHelperOptions = {
  baseUrl: process.env.MEDUSA_BACKEND_URL,
  publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
}

// Fetch rating for a single product
const rating = await getProductRating("prod_123", options)
// Returns: { average_rating: 4.5, total_reviews: 42, total_rating_sum: 189 }

// Fetch reviews for a product (with pagination)
const { reviews } = await listProductReviews("prod_123", options)
// Returns: { reviews: ReviewDTO[], count: number, limit: number, offset: number }
```

**Example: Displaying ratings on product cards**

```tsx
// In your ProductPreview component
import { getProductRating } from "medusa-review-rating/helpers"

export default async function ProductPreview({ product }: { product: Product }) {
  const rating = await getProductRating(product.id, {
    baseUrl: process.env.MEDUSA_BACKEND_URL,
    publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  })

  return (
    <div>
      <ProductImage product={product} />
      <h3>{product.title}</h3>
      
      {/* Display rating summary */}
      {rating.total_reviews > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={rating.average_rating} />
          <span>({rating.total_reviews} reviews)</span>
        </div>
      )}
      
      <ProductPrice product={product} />
    </div>
  )
}
```

**Example: Batch fetching ratings for multiple products**

```ts
// Fetch ratings for all products in a listing
const products = await listProducts({ /* your query */ })

const ratings = await Promise.all(
  products.map((product) =>
    getProductRating(product.id, options).then((rating) => ({
      productId: product.id,
      ...rating,
    }))
  )
)

// Create a map for easy lookup
const ratingsMap = new Map(
  ratings.map((r) => [r.productId, r])
)
```

### Using Medusa JS SDK Client

If you already have an instantiated Medusa JS SDK client, you can pass it instead of `baseUrl` + `publishableApiKey`:

```ts
import { Medusa } from "@medusajs/js-sdk"

const medusa = new Medusa({ 
  baseUrl: "https://store.myshop.com", 
  publishableKey: "pk_xxx" 
})

// For authenticated requests, add the token
const rating = await getProductRating("prod_123", { 
  client: medusa,
  headers: {
    Authorization: "Bearer <jwt_token>"
  }
})
```

## 4. Frontend UI

### Product Detail Page

This starter already mounts a `ProductReviewsSection` on the product detail page (`/products/[handle]`):

- Signed-in customers can submit reviews through the form with automatic JWT authentication.
- Logged-out visitors see a sign-in prompt.
- Public reviews and rating summaries are fetched during SSR/Suspense via the helpers above.

The review submission automatically includes the customer's JWT token from their session cookie, ensuring authenticated requests.

### Product Listing Pages

To add reviews/ratings to product listing pages (store, collections, categories), you can:

1. **Fetch ratings in your product listing component:**

```tsx
// In paginated-products.tsx or similar
import { getProductRating } from "medusa-review-rating/helpers"

const products = await listProducts({ /* your query */ })

// Fetch ratings for all products
const productsWithRatings = await Promise.all(
  products.map(async (product) => {
    const rating = await getProductRating(product.id, {
      baseUrl: process.env.MEDUSA_BACKEND_URL,
      publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    })
    return { ...product, rating }
  })
)
```

2. **Display ratings in ProductPreview component:**

```tsx
// In product-preview/index.tsx
{product.rating && product.rating.total_reviews > 0 && (
  <div className="flex items-center gap-1 mt-2">
    <StarRating rating={product.rating.average_rating} />
    <span className="text-sm text-gray-600">
      ({product.rating.total_reviews})
    </span>
  </div>
)}
```

Once both backend and frontend configuration steps are complete, the review block renders automatically on product detail pages. For listing pages, follow the examples above to add rating displays.

# Contact & Subscriptions

The contact page and newsletter blocks are powered by the [`medusa-contact-us`](https://www.npmjs.com/package/medusa-contact-us) plugin.

## Backend Setup

1. **Install the plugin:**
   ```bash
   cd test-medusa
   npm install medusa-contact-us --legacy-peer-deps
   ```

2. **Register the plugin** in `medusa-configs/plugins/contact-us.ts` (already configured)

3. **Register the modules** in `medusa-configs/modules.ts`:
   ```typescript
   contact_email_subscriptions: {
     resolve: "medusa-contact-us/modules/contact-subscriptions",
   },
   contact_requests: {
     resolve: "medusa-contact-us/modules/contact-requests",
   },
   ```

4. **Run migrations:**
   ```bash
   npx medusa db:migrate
   ```

5. **Restart the server**

For detailed backend integration, see [`../test-medusa/CONTACT_US_INTEGRATION.md`](../test-medusa/CONTACT_US_INTEGRATION.md).

## Frontend Setup

### Environment Variables

Add to `.env.local`:

```bash
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
```

**Note:** Create a publishable API key in the Medusa admin dashboard under `Settings → API Keys`.

### Contact Form

The contact form is already implemented at `/[countryCode]/contact` and includes:

- **Required Fields:**
  - Email (with validation)
  - Subject
  - Message

- **Optional Fields:**
  - Priority (Low, Medium, High, Urgent)
  - Order Number
  - Phone Number
  - Preferred Contact Method (Email, Phone)
  - Is Return Request (checkbox)

### Using the Helpers

The storefront uses the helper functions from `medusa-contact-us/helpers`:

```ts
import {
  submitContactRequest,
  upsertContactSubscription,
  type StorefrontHelperOptions,
} from "medusa-contact-us/helpers"

// Submit contact request
await submitContactRequest(
  {
    email: "customer@example.com",
    payload: {
      subject: "Order inquiry",
      message: "I need help with my order",
      priority: "high",
      order_number: "order_123",
    },
    source: "contact_page",
  },
  {
    baseUrl: process.env.MEDUSA_BACKEND_URL,
    publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  }
)

// Email subscription
await upsertContactSubscription(
  {
    email: "newsletter@example.com",
    status: "subscribed",
    source: "footer",
  },
  {
    baseUrl: process.env.MEDUSA_BACKEND_URL,
    publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  }
)
```

### Server Actions

The storefront includes server actions in `src/lib/data/contact.ts`:

- `submitContactRequestAction` - Handles contact form submissions
- `upsertContactSubscriptionAction` - Handles email subscriptions

These actions:
- Validate email format
- Sanitize and format payload data
- Handle errors gracefully
- Revalidate Next.js cache on success

### Custom Forms

To create custom forms, use the helper functions directly:

```ts
"use server"

import {
  submitContactRequest,
  type StorefrontHelperOptions,
} from "medusa-contact-us/helpers"

export async function customContactAction(formData: FormData) {
  const options: StorefrontHelperOptions = {
    baseUrl: process.env.MEDUSA_BACKEND_URL,
    publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  }

  await submitContactRequest(
    {
      email: formData.get("email") as string,
      payload: {
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
      },
    },
    options
  )
}
```

## Testing

### Test Contact Form

1. Navigate to `http://localhost:8000/[countryCode]/contact`
2. Fill out the form with valid data
3. Submit and verify success message
4. Check admin panel for the contact request

### Test with cURL

See [`../test-medusa/CONTACT_US_CURL_EXAMPLES.md`](../test-medusa/CONTACT_US_CURL_EXAMPLES.md) for complete cURL examples.

## Troubleshooting

### Email Validation Errors

If you see "Invalid email" errors:
- Ensure email is properly formatted
- Frontend validates email before submission
- Server action normalizes email (trim + lowercase)

### API Connection Errors

- Verify `MEDUSA_BACKEND_URL` is correct
- Check `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set
- Ensure backend server is running
- Check browser console for detailed errors

For more troubleshooting, see [`../test-medusa/CONTACT_US_INTEGRATION.md`](../test-medusa/CONTACT_US_INTEGRATION.md).

# Resources

## Learn more about Medusa

- [Website](https://www.medusajs.com/)
- [GitHub](https://github.com/medusajs)
- [Documentation](https://docs.medusajs.com/)

## Learn more about Next.js

- [Website](https://nextjs.org/)
- [GitHub](https://github.com/vercel/next.js)
- [Documentation](https://nextjs.org/docs)
