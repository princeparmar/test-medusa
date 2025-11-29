"use client"

import { addToWishlistAction, removeFromWishlistAction } from "@lib/data/wishlist"
import HeartIcon from "@modules/common/icons/heart"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect, useTransition } from "react"

type WishlistButtonProps = {
  productId: string
  className?: string
  size?: "small" | "medium" | "large"
  showLabel?: boolean
  initialIsInWishlist?: boolean
  isAuthenticated?: boolean
}

const WishlistButton = ({
  productId,
  className = "",
  size = "medium",
  showLabel = false,
  initialIsInWishlist = false,
  isAuthenticated = false,
}: WishlistButtonProps) => {
  const router = useRouter()
  const params = useParams()
  const countryCode = params?.countryCode as string
  const [isPending, startTransition] = useTransition()
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist)
  const [isChecking, setIsChecking] = useState(!initialIsInWishlist && isAuthenticated)

  // Check wishlist status on mount if authenticated and not provided
  useEffect(() => {
    if (!isAuthenticated || initialIsInWishlist !== undefined) {
      setIsChecking(false)
      return
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/wishlist/check?productId=${productId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        )

        if (response.ok) {
          const data = await response.json()
          setIsInWishlist(data.isInWishlist ?? false)
        }
      } catch (error) {
        // Silently fail
      } finally {
        setIsChecking(false)
      }
    }

    checkStatus()
  }, [productId, isAuthenticated, initialIsInWishlist])

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      const loginPath = countryCode ? `/${countryCode}/account/login` : "/account/login"
      router.push(loginPath)
      return
    }

    startTransition(async () => {
      if (isInWishlist) {
        const result = await removeFromWishlistAction(productId)
        if (result.success) {
          setIsInWishlist(false)
          router.refresh()
        }
      } else {
        const result = await addToWishlistAction(productId)
        if (result.success) {
          setIsInWishlist(true)
          router.refresh()
        }
      }
    })
  }

  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-7 h-7",
  }

  if (isChecking) {
    return (
      <button
        type="button"
        className={`${className} opacity-50 cursor-not-allowed`}
        disabled
        aria-label="Loading wishlist status"
      >
        <HeartIcon className={sizeClasses[size]} filled={false} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggleWishlist}
      disabled={isPending}
      className={`${className} transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ui-border-interactive rounded-full p-1 ${
        isInWishlist
          ? "text-ui-fg-error hover:text-ui-fg-error"
          : "text-ui-fg-subtle hover:text-ui-fg-base"
      } ${isPending ? "opacity-50 cursor-wait" : ""}`}
      aria-label={
        isInWishlist ? "Remove from wishlist" : "Add to wishlist"
      }
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon
        className={sizeClasses[size]}
        filled={isInWishlist}
      />
      {showLabel && (
        <span className="ml-2 text-sm">
          {isInWishlist ? "Saved" : "Save"}
        </span>
      )}
    </button>
  )
}

export default WishlistButton

