import type { HttpTypes } from "@medusajs/types"
import { fetchReviewData, submitReviewAction } from "@lib/data/reviews"
import ProductReviewsClient from "./product-reviews.client"

type ProductReviewsSectionProps = {
  productId: string
  productHandle: string
  productTitle: string
  countryCode: string
  customer: HttpTypes.StoreCustomer | null
}

const ProductReviewsSection = async ({
  productId,
  productHandle,
  productTitle,
  countryCode,
  customer,
}: ProductReviewsSectionProps) => {
  const data = await fetchReviewData(productId, Boolean(customer))

  const customerLabel =
    customer &&
    (customer.first_name || customer.last_name
      ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
      : customer.email ?? undefined)

  return (
    <ProductReviewsClient
      productId={productId}
      productHandle={productHandle}
      countryCode={countryCode}
      productTitle={productTitle}
      ratingSummary={data.ratingSummary}
      reviews={data.reviews}
      customerReviews={data.customerReviews}
      isSignedIn={Boolean(customer)}
      customerLabel={customerLabel}
      submitAction={submitReviewAction}
    />
  )
}

export default ProductReviewsSection


