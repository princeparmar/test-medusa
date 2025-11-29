"use server"

import { revalidatePath } from "next/cache"
import { getAuthHeaders } from "@lib/data/cookies"
import {
  submitContactRequest,
  upsertContactSubscription,
  type StorefrontHelperOptions,
} from "medusa-contact-us/helpers"

const getContactBaseUrl = () => {
  return (
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:9000"
  )
}

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...(init ?? {}), cache: "no-store" })

const getContactHelperOptions = async (
  includeAuth = false
): Promise<StorefrontHelperOptions> => {
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  const headers = includeAuth ? await getAuthHeaders() : {}

  return {
    baseUrl: getContactBaseUrl(),
    publishableApiKey: publishableKey,
    headers: Object.keys(headers).length ? (headers as Record<string, string>) : undefined,
    fetchImpl: noStoreFetch,
  }
}

export type ContactFormActionState = {
  status: "idle" | "success" | "error"
  message?: string
}

const CONTACT_INITIAL_STATE: ContactFormActionState = {
  status: "idle",
  message: undefined,
}

const sanitizePayload = (payload: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => {
      if (typeof value === "string") {
        return value.trim().length > 0
      }
      // Include boolean values (they're valid even if false)
      if (typeof value === "boolean") {
        return true
      }
      return value !== undefined && value !== null
    })
  )
}

// Email validation regex
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export const submitContactRequestAction = async (
  _prevState: ContactFormActionState = CONTACT_INITIAL_STATE,
  formData: FormData
): Promise<ContactFormActionState> => {
  const emailRaw = formData.get("email")
  const email = emailRaw ? (emailRaw as string).trim().toLowerCase() : ""
  const subject = (formData.get("subject") as string)?.trim() ?? ""
  const message = (formData.get("message") as string)?.trim() ?? ""
  const priority = (formData.get("priority") as string)?.trim() ?? ""
  const orderNumber = (formData.get("order_number") as string)?.trim() ?? ""
  const phone = (formData.get("phone") as string)?.trim() ?? ""
  const preferredContactMethod =
    (formData.get("preferred_contact_method") as string)?.trim() ?? ""
  const isReturnRequest = formData.get("is_return_request") === "true"
  const source = (formData.get("source") as string)?.trim() || "contact_page"
  const countryCode = (formData.get("country_code") as string)?.toLowerCase()

  // Validate email format
  if (!email) {
    return { status: "error", message: "Email is required." }
  }
  if (!EMAIL_REGEX.test(email)) {
    return { status: "error", message: "Please enter a valid email address." }
  }

  if (!subject || !message) {
    return { status: "error", message: "Please provide a subject and message." }
  }

  // Build payload matching backend configuration
  // Required fields: subject, message
  // Optional fields: priority, order_number, phone, preferred_contact_method, is_return_request
  const payload: Record<string, unknown> = {
    subject,
    message,
  }

  // Add optional fields only if they have values
  if (priority) {
    payload.priority = priority
  }
  if (orderNumber) {
    payload.order_number = orderNumber
  }
  if (phone) {
    payload.phone = phone
  }
  if (preferredContactMethod) {
    payload.preferred_contact_method = preferredContactMethod
  }
  // Only include is_return_request if it's true (matches curl example)
  if (isReturnRequest) {
    payload.is_return_request = true
  }

  try {
    // Email is already validated and lowercased above
    await submitContactRequest(
      {
        email,
        payload,
        source,
      },
      await getContactHelperOptions(false)
    )

    if (countryCode) {
      revalidatePath(`/${countryCode}/contact`)
    } else {
      revalidatePath("/contact")
    }

    return { status: "success", message: "Thanks! We received your message." }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit your request right now."
    return { status: "error", message }
  }
}

export type SubscriptionFormActionState = {
  status: "idle" | "success" | "error"
  message?: string
}

const SUBSCRIPTION_INITIAL_STATE: SubscriptionFormActionState = {
  status: "idle",
  message: undefined,
}

export const upsertContactSubscriptionAction = async (
  _prevState: SubscriptionFormActionState = SUBSCRIPTION_INITIAL_STATE,
  formData: FormData
): Promise<SubscriptionFormActionState> => {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const source = (formData.get("source") as string)?.trim() || "footer_form"

  if (!email) {
    return { status: "error", message: "Please enter a valid email." }
  }

  try {
    await upsertContactSubscription(
      {
        email,
        status: "subscribed",
        source,
        metadata: { source },
      },
      await getContactHelperOptions(false)
    )

    return { status: "success", message: "You're subscribed!" }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Subscription failed. Please try again."
    return { status: "error", message }
  }
}


