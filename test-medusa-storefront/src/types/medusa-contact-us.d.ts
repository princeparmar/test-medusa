declare module "medusa-contact-us/helpers" {
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

  export type SubmitContactRequestInput = {
    email: string
    payload?: Record<string, unknown>
    metadata?: Record<string, unknown>
    source?: string
    endpoint?: string
  }

  export type ContactSubscriptionInput = {
    email: string
    status?: "subscribed" | "unsubscribed"
    metadata?: Record<string, unknown>
    source?: string
    endpoint?: string
  }

  export function submitContactRequest(
    input: SubmitContactRequestInput,
    options?: StorefrontHelperOptions
  ): Promise<unknown>

  export function createSubmitContactRequest(options?: StorefrontHelperOptions): (
    input: SubmitContactRequestInput
  ) => Promise<unknown>

  export function upsertContactSubscription(
    input: ContactSubscriptionInput,
    options?: StorefrontHelperOptions
  ): Promise<unknown>

  export function createUpsertContactSubscription(options?: StorefrontHelperOptions): (
    input: ContactSubscriptionInput
  ) => Promise<unknown>
}


