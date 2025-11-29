"use server"

import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "@lib/data/cookies"
import type { StorefrontHelperOptions } from "medusa-review-rating/helpers"
import {
  submitReview,
  listProductReviews,
  listCustomerProductReviews,
  getProductRating,
  type ReviewDTO,
} from "medusa-review-rating/helpers"

const getReviewBaseUrl = () => {
  return (
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:9000"
  )
}

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...(init ?? {}), cache: "no-store" })

export const getReviewHelperOptions = async (
  includeAuth = false
): Promise<StorefrontHelperOptions> => {
  const authHeaders = includeAuth ? await getAuthHeaders() : {}
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const headers: Record<string, string> = {}

  if (Object.keys(authHeaders).length > 0) {
    Object.assign(headers, authHeaders as Record<string, string>)
  }

  return {
    baseUrl: getReviewBaseUrl(),
    publishableApiKey: publishableKey,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    fetchImpl: noStoreFetch,
  }
}

export type SubmitReviewActionState = {
  status: "idle" | "success" | "error"
  message?: string
}

const INITIAL_STATE: SubmitReviewActionState = {
  status: "idle",
  message: undefined,
}

export const submitReviewAction = async (
  _prevState: SubmitReviewActionState = INITIAL_STATE,
  formData: FormData
): Promise<SubmitReviewActionState> => {
  const productId = (formData.get("product_id") as string) ?? ""
  const rating = Number(formData.get("rating"))
  const title = (formData.get("title") as string) ?? ""
  const description = (formData.get("description") as string) ?? ""
  const countryCode = (formData.get("country_code") as string) ?? ""
  const productHandle = (formData.get("product_handle") as string) ?? ""

  if (!productId) {
    return { status: "error", message: "Missing product information." }
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "Please select a rating between 1 and 5." }
  }

  const authHeaders = await getAuthHeaders()
  if (!("authorization" in authHeaders)) {
    return { status: "error", message: "Please sign in to leave a review." }
  }

  try {
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const baseUrl = getReviewBaseUrl()

    // Create authenticated options with JWT token
    const authenticatedOptions: StorefrontHelperOptions = {
      baseUrl,
      publishableApiKey: publishableKey,
      headers: {
        Authorization: authHeaders.authorization, // JWT token from customer login
        "Content-Type": "application/json",
      },
      fetchImpl: noStoreFetch,
    }

    await submitReview(
      {
        product_id: productId,
        rating,
        title: title.trim(),
        description: description.trim(),
      },
      authenticatedOptions
    )

    if (countryCode && productHandle) {
      revalidatePath(`/${countryCode}/products/${productHandle}`)
    }

    return { status: "success" }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit review. Please try again."
    return { status: "error", message }
  }
}

export type ProductReviewData = {
  reviews: ReviewDTO[]
  ratingSummary: {
    average_rating: number
    total_reviews: number
    total_rating_sum: number
  }
  customerReviews: ReviewDTO[]
}

export const fetchReviewData = async (
  productId: string,
  includeCustomer = false
): Promise<ProductReviewData> => {
  try {
    const publicOptions = await getReviewHelperOptions(false)
    const [{ reviews }, ratingResponse] = await Promise.all([
      listProductReviews(productId, publicOptions),
      getProductRating(productId, publicOptions),
    ])

    let customerReviews: ReviewDTO[] = []

    if (includeCustomer) {
      try {
        const privateOptions = await getReviewHelperOptions(true)
        const customerResponse = await listCustomerProductReviews(
          productId,
          privateOptions
        )
        customerReviews = customerResponse.reviews ?? []
      } catch (error) {
        console.warn("[reviews] Failed to load customer reviews", error)
      }
    }

    return {
      reviews: reviews ?? [],
      ratingSummary: ratingResponse?.rating ?? {
        average_rating: 0,
        total_reviews: 0,
        total_rating_sum: 0,
      },
      customerReviews,
    }
  } catch (error) {
    console.error("[reviews] Failed to load review data", error)
    return {
      reviews: [],
      ratingSummary: {
        average_rating: 0,
        total_reviews: 0,
        total_rating_sum: 0,
      },
      customerReviews: [],
    }
  }
}


