import { listProducts } from "@lib/data/products"
import { retrieveCustomer } from "@lib/data/customer"
import { getWishlistAction } from "@lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  // Check customer authentication and wishlist status
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
    <ProductActions
      product={product}
      region={region}
      isAuthenticated={isAuthenticated}
      isInWishlist={isInWishlist}
    />
  )
}
