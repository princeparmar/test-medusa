"use client"

import { useActionState, useEffect, useMemo, useTransition } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button, Label, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { SubmitReviewActionState } from "@lib/data/reviews"
import type { ReviewDTO } from "medusa-review-rating/helpers"

type ProductReviewsClientProps = {
  productId: string
  productHandle: string
  productTitle: string
  countryCode: string
  reviews: ReviewDTO[]
  customerReviews: ReviewDTO[]
  ratingSummary: {
    average_rating: number
    total_reviews: number
    total_rating_sum: number
  }
  isSignedIn: boolean
  customerLabel?: string
  submitAction: (
    prevState: SubmitReviewActionState,
    formData: FormData
  ) => Promise<SubmitReviewActionState>
}

type ReviewFormValues = {
  rating: number
  title: string
  description: string
}

const initialFormState: SubmitReviewActionState = {
  status: "idle",
  message: undefined,
}

const ProductReviewsClient = ({
  productId,
  productHandle,
  productTitle,
  countryCode,
  reviews,
  customerReviews,
  ratingSummary,
  isSignedIn,
  customerLabel,
  submitAction,
}: ProductReviewsClientProps) => {
  const router = useRouter()
  const [state, formAction] = useActionState(submitAction, initialFormState)
  const [isSubmitting, startTransition] = useTransition()

  const { register, handleSubmit, watch, setValue, reset } = useForm<ReviewFormValues>({
    defaultValues: {
      rating: 5,
      title: "",
      description: "",
    },
  })

  const onSubmit: SubmitHandler<ReviewFormValues> = (values) => {
    if (!isSignedIn || isSubmitting) {
      return
    }

    const formData = new FormData()
    formData.append("product_id", productId)
    formData.append("product_handle", productHandle)
    formData.append("country_code", countryCode)
    formData.append("rating", String(values.rating))
    formData.append("title", values.title.trim())
    formData.append("description", values.description.trim())

    startTransition(() => {
      formAction(formData)
    })
  }

  useEffect(() => {
    if (state.status === "success") {
      reset({ rating: 5, title: "", description: "" })
      router.refresh()
    }
  }, [state, reset, router])

  const latestCustomerReview = customerReviews[0]

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
      return bDate - aDate
    })
  }, [reviews])

  const ratingValue = watch("rating")

  return (
    <section
      id="reviews"
      className="rounded-2xl border border-ui-border-base bg-ui-bg-base px-6 py-8 shadow-sm"
    >
      <div className="flex flex-col gap-2 pb-6 border-b border-ui-border-base">
        <h3 className="text-xl font-semibold text-ui-fg-base">Customer reviews</h3>
        <p className="text-sm text-ui-fg-subtle">
          See what shoppers think about <span className="font-medium">{productTitle}</span>.
        </p>
      </div>

      <div className="mt-8 grid gap-8">
        <SummaryCard ratingSummary={ratingSummary} />

        {isSignedIn ? (
          <form
            className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6 shadow-sm space-y-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium text-ui-fg-base">Your rating</Label>
              <input
                type="hidden"
                {...register("rating", { required: true, min: 1, max: 5 })}
                value={ratingValue}
                readOnly
              />
              <RatingSelector
                value={ratingValue}
                onSelect={(val) => setValue("rating", val, { shouldDirty: true })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="review-title" className="text-sm font-medium text-ui-fg-base">
                Title
              </Label>
              <input
                id="review-title"
                type="text"
                placeholder="Summarize your experience"
                maxLength={120}
                className="w-full rounded-lg border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm focus:border-ui-border-strong focus:outline-none focus:ring-2 focus:ring-ui-border-strong"
                {...register("title", { required: true, minLength: 4 })}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="review-description" className="text-sm font-medium text-ui-fg-base">
                Description
              </Label>
              <textarea
                id="review-description"
                placeholder="What did you like or dislike? Highlight fit, quality, and comfort."
                rows={4}
                className="w-full rounded-lg border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm focus:border-ui-border-strong focus:outline-none focus:ring-2 focus:ring-ui-border-strong"
                {...register("description", { required: true, minLength: 16 })}
                disabled={isSubmitting}
              />
              <span className="text-xs text-ui-fg-muted">
                Minimum 16 characters · Share helpful, constructive feedback.
              </span>
            </div>

            {state.status === "error" && (
              <p className="rounded-md border border-ui-border-danger bg-ui-tag-red py-2 px-3 text-sm text-ui-fg-on-color">
                {state.message}
              </p>
            )}

            {state.status === "success" && (
              <p className="rounded-md border border-ui-border-base bg-ui-tag-green py-2 px-3 text-sm text-ui-fg-success">
                Thanks for your review! We&apos;ll refresh once it&apos;s published.
              </p>
            )}

            <Button
              type="submit"
              size="medium"
              variant="contrast"
              className="w-full small:w-auto"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Post review"}
            </Button>
          </form>
        ) : (
          <div className="rounded-xl border border-dashed border-ui-border-base bg-ui-bg-field p-6 text-sm">
            <p className="font-medium text-ui-fg-base">Want to leave a review?</p>
            <p className="mt-1 text-ui-fg-subtle">
              Please{" "}
              <LocalizedClientLink
                href={`/${countryCode}/account/login`}
                className="font-medium text-ui-fg-interactive hover:text-ui-fg-base"
              >
                sign in
              </LocalizedClientLink>{" "}
              to share your experience.
            </p>
          </div>
        )}

        {latestCustomerReview && (
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ui-fg-base">Your latest review</p>
                <Text className="text-ui-fg-muted text-xs">
                  Status: <StatusPill status={latestCustomerReview.status} />
                </Text>
              </div>
              <Text className="text-sm text-ui-fg-subtle">
                {formatDate(latestCustomerReview.created_at)}
              </Text>
            </div>
            <ReviewBody review={latestCustomerReview} authorLabel={customerLabel ?? "You"} />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-lg font-semibold text-ui-fg-base">
              {sortedReviews.length ? "Recent reviews" : "No reviews yet"}
            </p>
            {!sortedReviews.length && (
              <p className="text-sm text-ui-fg-subtle">
                Be the first to review this product once you receive it.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {sortedReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-ui-fg-base">
                      {resolveReviewerName(review)}
                    </p>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-xs text-ui-fg-muted">{formatDate(review.created_at)}</p>
                </div>
                <ReviewBody review={review} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const SummaryCard = ({
  ratingSummary,
}: {
  ratingSummary: {
    average_rating: number
    total_reviews: number
    total_rating_sum: number
  }
}) => {
  const average = Number.isFinite(ratingSummary.average_rating)
    ? ratingSummary.average_rating
    : 0

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6 shadow-inner">
      <div>
        <p className="text-4xl font-semibold text-ui-fg-base">
          {average ? average.toFixed(1) : "0.0"}
        </p>
        <p className="text-sm text-ui-fg-subtle">out of 5</p>
      </div>
      <StarRating rating={average} size="lg" />
      <p className="text-sm text-ui-fg-muted">
        {ratingSummary.total_reviews}{" "}
        {ratingSummary.total_reviews === 1 ? "review" : "reviews"}{" "}
        {ratingSummary.total_reviews ? "from verified buyers" : ""}
      </p>
    </div>
  )
}

const RatingSelector = ({
  value,
  onSelect,
}: {
  value: number
  onSelect: (value: number) => void
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((score) => {
        const isActive = value === score
        return (
          <button
            type="button"
            key={score}
            onClick={() => onSelect(score)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-ui-border-strong bg-ui-bg-base text-ui-fg-base"
                : "border-ui-border-base bg-transparent text-ui-fg-subtle hover:border-ui-border-strong"
            }`}
          >
            <StarRating rating={score} size="sm" />
            <span>{score}</span>
          </button>
        )
      })}
    </div>
  )
}

const StarRating = ({
  rating,
  size = "md",
}: {
  rating: number
  size?: "sm" | "md" | "lg"
}) => {
  const dimension = size === "lg" ? 24 : size === "sm" ? 14 : 18
  const stars = Array.from({ length: 5 }, (_, index) => {
    const fillValue = Math.max(Math.min(rating - index, 1), 0)
    return <Star key={index} fill={fillValue} size={dimension} />
  })

  return <div className="flex items-center gap-1">{stars}</div>
}

const Star = ({ fill, size }: { fill: number; size: number }) => {
  const percentage = Math.round(fill * 100)

  return (
    <span className="relative inline-flex" aria-hidden="true">
      <StarBase size={size} className="text-ui-fg-muted" />
      <StarBase
        size={size}
        className="text-amber-500 absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - percentage}% 0 0)` }}
      />
    </span>
  )
}

const StarBase = ({
  className,
  size,
  style,
}: {
  className?: string
  size: number
  style?: React.CSSProperties
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    style={style}
    role="presentation"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
      fill="currentColor"
    />
  </svg>
)

const StatusPill = ({ status }: { status: ReviewDTO["status"] }) => {
  const label =
    status === "approved" ? "Published" : status === "pending" ? "Pending review" : "Rejected"
  const colors =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-800"

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors}`}>{label}</span>
}

const ReviewBody = ({
  review,
  authorLabel,
}: {
  review: ReviewDTO
  authorLabel?: string
}) => {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {review.title && <p className="text-base font-medium text-ui-fg-base">{review.title}</p>}
      {review.description && (
        <p className="whitespace-pre-line text-sm text-ui-fg-subtle">{review.description}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-ui-fg-muted">
        <span>{authorLabel ?? resolveReviewerName(review)}</span>
        {review.verified_purchase && (
          <span className="rounded-full bg-ui-bg-field px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-ui-fg-subtle">
            Verified purchase
          </span>
        )}
      </div>
    </div>
  )
}

const resolveReviewerName = (review: ReviewDTO) => {
  if (review.customer?.first_name || review.customer?.last_name) {
    return `${review.customer?.first_name ?? ""} ${review.customer?.last_name ?? ""}`.trim()
  }

  return "Verified buyer"
}

const formatDate = (value?: string) => {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date)
}

export default ProductReviewsClient


