import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { retrieveCustomer } from "@lib/data/customer"
import { getWishlistAction } from "@lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import WishlistButton from "../wishlist-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  // Check if customer is authenticated and get wishlist status
  const customer = await retrieveCustomer()
  const isAuthenticated = !!customer

  let isInWishlist = false
  if (isAuthenticated && product.id) {
    try {
      const wishlistResult = await getWishlistAction()
      if (wishlistResult.success && wishlistResult.wishlist) {
        isInWishlist = wishlistResult.wishlist.includes(product.id)
      }
    } catch (error) {
      // Silently fail
    }
  }

  return (
    <div className="relative group" data-testid="product-wrapper">
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </LocalizedClientLink>
      {/* Wishlist button positioned absolutely over the thumbnail */}
      {product.id && (
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton
            productId={product.id}
            size="medium"
            initialIsInWishlist={isInWishlist}
            isAuthenticated={isAuthenticated}
            className="bg-ui-bg-base/90 backdrop-blur-sm shadow-sm"
          />
        </div>
      )}
    </div>
  )
}
