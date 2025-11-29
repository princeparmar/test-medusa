import { isInWishlistAction } from "@lib/data/wishlist"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const productId = searchParams.get("productId")

  if (!productId) {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 }
    )
  }

  try {
    const result = await isInWishlistAction(productId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check wishlist status", isInWishlist: false },
      { status: 500 }
    )
  }
}

