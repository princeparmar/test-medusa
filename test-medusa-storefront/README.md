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

Import review helpers anywhere in your app code:

```ts
import {
  submitReview,
  listCustomerReviews,
  listCustomerProductReviews,
  listProductReviews,
  getProductRating,
  type StorefrontHelperOptions,
} from "medusa-review-rating/helpers"

const options: StorefrontHelperOptions = {
  baseUrl: process.env.MEDUSA_BACKEND_URL,
  publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
}

await submitReview(
  { product_id: "prod_123", rating: 5, title: "Great!", description: "Loved it" },
  options
)

const rating = await getProductRating("prod_123", options)
```

If you already have an instantiated Medusa JS SDK client, you can pass it instead of `baseUrl` + `publishableApiKey`:

```ts
import { Medusa } from "@medusajs/js-sdk"
const medusa = new Medusa({ baseUrl: "https://store.myshop.com", publishableKey: "pk_xxx" })

const rating = await getProductRating("prod_123", { client: medusa })
```

## 4. Frontend UI

This starter already mounts a `ProductReviewsSection` on the product page:

- Signed-in customers can submit reviews through the form.
- Logged-out visitors see a sign-in prompt.
- Public reviews and rating summaries are fetched during SSR/Suspense via the helpers above.

Once both backend and frontend configuration steps are complete, the review block renders automatically without additional wiring.

# Contact & Subscriptions

The contact page and newsletter blocks are powered by the [`medusa-contact-us`](https://www.npmjs.com/package/medusa-contact-us) plugin.

1. **Backend**: Follow the plugin README to register it in `medusa-config.ts`, run the migrations, and configure notification templates/status workflows.
2. **Storefront**: Set `MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. The `/[countryCode]/contact` route will render the contact form using `submitContactRequest`, and the footer + contact page reuse `upsertContactSubscription`.
3. **Custom forms**: Import helpers directly to avoid hand-written fetch calls:

   ```ts
   import { submitContactRequest, upsertContactSubscription } from "medusa-contact-us"

   await submitContactRequest({ email, payload: { subject, message } }, helperOptions)
   await upsertContactSubscription({ email, status: "subscribed" }, helperOptions)
   ```

`helperOptions` should always include `baseUrl` and a publishable API key (or a configured Medusa JS client) so requests can be authenticated on the Store API.

# Resources

## Learn more about Medusa

- [Website](https://www.medusajs.com/)
- [GitHub](https://github.com/medusajs)
- [Documentation](https://docs.medusajs.com/)

## Learn more about Next.js

- [Website](https://nextjs.org/)
- [GitHub](https://github.com/vercel/next.js)
- [Documentation](https://nextjs.org/docs)
