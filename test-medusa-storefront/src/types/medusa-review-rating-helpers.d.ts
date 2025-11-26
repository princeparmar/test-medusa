declare module "medusa-review-rating/helpers" {
  export type MedusaClientLike =
    | {
        request: (path: string, init?: RequestInit) => Promise<unknown>
      }
    | {
        client: {
          request: (path: string, init?: RequestInit) => Promise<unknown>
        }
      }

  export type StorefrontHelperOptions = {
    client?: MedusaClientLike
    baseUrl?: string
    fetchImpl?: typeof fetch
    headers?: Record<string, string>
    publishableApiKey?: string
  }

  export type ReviewDTO = {
    id: string
    product_id: string
    customer_id?: string | null
    customer?: {
      first_name?: string | null
      last_name?: string | null
      email?: string | null
    } | null
    rating: number
    title?: string | null
    description?: string | null
    images?: string[] | null
    verified_purchase?: boolean
    status: "pending" | "approved" | "rejected"
    created_at?: string
    updated_at?: string
  }

  export type SubmitReviewInput = {
    product_id: string
    rating: number
    title?: string | null
    description?: string | null
    images?: string[]
    endpoint?: string
  }

  export type SubmitReviewResponse = {
    review: ReviewDTO
  }

  export type ListCustomerReviewsQuery = {
    product_id?: string
    status?: "pending" | "approved" | "rejected"
  }

  export type ListCustomerReviewsResponse = {
    reviews: ReviewDTO[]
    summary: {
      total_reviews: number
      average_rating: number
      total_rating_sum: number
    }
  }

  export type ListCustomerProductReviewsResponse = {
    reviews: ReviewDTO[]
    summary: {
      product_id: string
      total_reviews: number
      average_rating: number
      total_rating_sum: number
    }
  }

  export type ListProductReviewsResponse = {
    reviews: ReviewDTO[]
  }

  export type ProductRatingResponse = {
    rating: {
      average_rating: number
      total_reviews: number
      total_rating_sum: number
    }
  }

  export function submitReview(
    input: SubmitReviewInput,
    options?: StorefrontHelperOptions
  ): Promise<SubmitReviewResponse>

  export function listCustomerReviews(
    query?: ListCustomerReviewsQuery,
    options?: StorefrontHelperOptions
  ): Promise<ListCustomerReviewsResponse>

  export function listCustomerProductReviews(
    productId: string,
    options?: StorefrontHelperOptions
  ): Promise<ListCustomerProductReviewsResponse>

  export function listProductReviews(
    productId: string,
    options?: StorefrontHelperOptions
  ): Promise<ListProductReviewsResponse>

  export function getProductRating(
    productId: string,
    options?: StorefrontHelperOptions
  ): Promise<ProductRatingResponse>

  export function makeRequest<TResponse = unknown, TBody = unknown>(args: {
    endpoint: string
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: TBody
    options?: StorefrontHelperOptions
    query?: Record<string, string | number | boolean | undefined>
  }): Promise<TResponse>
}


