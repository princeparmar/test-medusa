"use client"

import { useActionState, useEffect, useTransition } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Button } from "@medusajs/ui"
import {
  upsertContactSubscriptionAction,
  type SubscriptionFormActionState,
} from "@lib/data/contact"

type EmailSubscriptionFormProps = {
  source?: string
  layout?: "stacked" | "inline"
  placeholder?: string
  buttonLabel?: string
}

type SubscriptionFormValues = {
  email: string
}

const initialState: SubscriptionFormActionState = {
  status: "idle",
}

const inputClasses =
  "w-full rounded-full border border-ui-border-base bg-ui-bg-field px-4 py-2.5 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus:border-ui-border-strong focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"

const EmailSubscriptionForm = ({
  source = "footer_form",
  layout = "inline",
  placeholder = "Email address",
  buttonLabel = "Subscribe",
}: EmailSubscriptionFormProps) => {
  const [state, formAction] = useActionState(upsertContactSubscriptionAction, initialState)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    defaultValues: { email: "" },
  })

  const onSubmit: SubmitHandler<SubscriptionFormValues> = (values) => {
    if (isPending) {
      return
    }

    const formData = new FormData()
    formData.append("email", values.email.trim())
    formData.append("source", source)

    startTransition(() => {
      formAction(formData)
    })
  }

  useEffect(() => {
    if (state.status === "success") {
      reset()
    }
  }, [state, reset])

  const formClass =
    layout === "inline"
      ? "flex flex-col gap-3 small:flex-row"
      : "flex flex-col gap-3"

  return (
    <div className="flex flex-col gap-2">
      {state.status === "error" && (
        <p className="rounded-md border border-ui-border-danger bg-ui-tag-red px-3 py-2 text-xs text-ui-fg-on-color">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="rounded-md border border-ui-border-success bg-ui-tag-green px-3 py-2 text-xs text-ui-fg-success">
          {state.message}
        </p>
      )}
      <form className={formClass} onSubmit={handleSubmit(onSubmit)}>
        <div className="flex-1">
          <input
            type="email"
            placeholder={placeholder}
            autoComplete="email"
            className={inputClasses}
            {...register("email", { required: "Email is required." })}
            disabled={isPending}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-ui-fg-error">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className={layout === "inline" ? "small:w-auto w-full" : "w-full"}
          size="small"
          variant="contrast"
          isLoading={isPending}
          disabled={isPending}
        >
          {buttonLabel}
        </Button>
      </form>
    </div>
  )
}

export default EmailSubscriptionForm


