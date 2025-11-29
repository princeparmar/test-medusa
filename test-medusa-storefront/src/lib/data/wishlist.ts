"use server"

import { getAuthHeaders } from "@lib/data/cookies"
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  type HelperTransportOptions,
} from "medusa-product-helper/helpers"

const getWishlistBaseUrl = () => {
  return (
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:9000"
  )
}

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...(init ?? {}), cache: "no-store" })

const getWishlistHelperOptions = async (): Promise<HelperTransportOptions> => {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const authHeaders = await getAuthHeaders()

  return {
    baseUrl: getWishlistBaseUrl(),
    publishableApiKey: publishableKey,
    headers:
      Object.keys(authHeaders).length > 0
        ? (authHeaders as Record<string, string>)
        : undefined,
    fetchImpl: noStoreFetch,
  }
}

/**
 * Add a product to the customer's wishlist
 * Requires customer authentication
 */
export const addToWishlistAction = async (productId: string) => {
  const authHeaders = await getAuthHeaders()

  if (!("authorization" in authHeaders)) {
    return {
      success: false,
      error: "Please sign in to add items to your wishlist.",
    }
  }

  try {
    const options = await getWishlistHelperOptions()
    await addToWishlist({ product_id: productId }, options)

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add to wishlist."
    return { success: false, error: message }
  }
}

/**
 * Remove a product from the customer's wishlist
 * Requires customer authentication
 */
export const removeFromWishlistAction = async (productId: string) => {
  const authHeaders = await getAuthHeaders()

  if (!("authorization" in authHeaders)) {
    return {
      success: false,
      error: "Please sign in to remove items from your wishlist.",
    }
  }

  try {
    const options = await getWishlistHelperOptions()
    await removeFromWishlist({ product_id: productId }, options)

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove from wishlist."
    return { success: false, error: message }
  }
}

/**
 * Get the customer's wishlist
 * Returns product IDs only for performance
 * Requires customer authentication
 */
export const getWishlistAction = async (): Promise<{
  success: boolean
  wishlist?: string[]
  error?: string
}> => {
  const authHeaders = await getAuthHeaders()

  if (!("authorization" in authHeaders)) {
    return {
      success: false,
      wishlist: [],
      error: "Please sign in to view your wishlist.",
    }
  }

  try {
    const options = await getWishlistHelperOptions()
    const { wishlist } = await getWishlist({ includeDetails: false }, options)

    const productIds = wishlist?.map((item) => item.product_id) ?? []

    return { success: true, wishlist: productIds }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load wishlist."
    return { success: false, wishlist: [], error: message }
  }
}

/**
 * Check if a product is in the customer's wishlist
 * Requires customer authentication
 */
export const isInWishlistAction = async (
  productId: string
): Promise<{ isInWishlist: boolean; error?: string }> => {
  const authHeaders = await getAuthHeaders()

  if (!("authorization" in authHeaders)) {
    return { isInWishlist: false }
  }

  try {
    const options = await getWishlistHelperOptions()
    const { wishlist } = await getWishlist({ includeDetails: false }, options)

    const productIds = wishlist?.map((item) => item.product_id) ?? []
    const isInWishlist = productIds.includes(productId)

    return { isInWishlist }
  } catch (error) {
    // Silently fail - don't show error for wishlist checks
    return { isInWishlist: false }
  }
}

