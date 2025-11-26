"use client"

import { useActionState, useEffect, useTransition } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Button, Label, Text } from "@medusajs/ui"
import {
  submitContactRequestAction,
  type ContactFormActionState,
} from "@lib/data/contact"

type ContactFormValues = {
  email: string
  subject: string
  message: string
  priority: string
  order_number: string
  phone: string
  preferred_contact_method: string
  is_return_request: boolean
}

const initialState: ContactFormActionState = {
  status: "idle",
}

type ContactFormProps = {
  countryCode: string
}

const inputClasses =
  "w-full rounded-lg border border-ui-border-base bg-ui-bg-field px-4 py-3 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus:border-ui-border-strong focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"

const ContactForm = ({ countryCode }: ContactFormProps) => {
  const [state, formAction] = useActionState(submitContactRequestAction, initialState)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      email: "",
      subject: "",
      message: "",
      priority: "",
      order_number: "",
      phone: "",
      preferred_contact_method: "",
      is_return_request: false,
    },
  })

  const onSubmit: SubmitHandler<ContactFormValues> = (values) => {
    if (isPending) {
      return
    }

    const formData = new FormData()
    formData.append("email", values.email.trim())
    formData.append("subject", values.subject.trim())
    formData.append("message", values.message.trim())
    formData.append("priority", values.priority)
    formData.append("order_number", values.order_number.trim())
    formData.append("phone", values.phone.trim())
    formData.append("preferred_contact_method", values.preferred_contact_method)
    formData.append("is_return_request", values.is_return_request ? "true" : "false")
    formData.append("source", "contact_page")
    formData.append("country_code", countryCode)

    startTransition(() => {
      formAction(formData)
    })
  }

  useEffect(() => {
    if (state.status === "success") {
      reset()
    }
  }, [state, reset])

  return (
    <section className="rounded-2xl border border-ui-border-base bg-ui-bg-base p-6 shadow-sm small:p-8">
      <div className="mb-6">
        <Text className="text-ui-fg-base text-xl font-semibold">Send us a message</Text>
        <p className="text-sm text-ui-fg-subtle mt-1">
          We reply within 1–2 business days. Fields marked with * are required.
        </p>
      </div>
      {state.status === "error" && (
        <p className="mb-6 rounded-md border border-ui-border-danger bg-ui-tag-red px-3 py-2 text-sm text-ui-fg-on-color">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="mb-6 rounded-md border border-ui-border-success bg-ui-tag-green px-3 py-2 text-sm text-ui-fg-success">
          {state.message}
        </p>
      )}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" required error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
            {...register("email", { required: "Email is required." })}
            disabled={isPending}
          />
        </Field>
        <Field
          label="Subject"
          required
          helper="Brief description of your inquiry"
          error={errors.subject?.message}
        >
          <input
            type="text"
            placeholder="e.g., Order inquiry"
            className={inputClasses}
            {...register("subject", {
              required: "Please provide a subject.",
              minLength: { value: 4, message: "Subject should be at least 4 characters." },
            })}
            disabled={isPending}
          />
        </Field>
        <Field
          label="Message"
          required
          helper="Include helpful context like products, sizes, or issue details."
          error={errors.message?.message}
        >
          <textarea
            rows={5}
            placeholder="Please describe your issue or question..."
            className={`${inputClasses} min-h-[140px] resize-y`}
            {...register("message", {
              required: "Message cannot be empty.",
              minLength: { value: 10, message: "Message should be at least 10 characters." },
            })}
            disabled={isPending}
          />
        </Field>
        <div className="grid gap-5 small:grid-cols-2">
          <Field label="Priority">
            <select
              className={inputClasses}
              defaultValue=""
              {...register("priority")}
              disabled={isPending}
            >
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
          <Field label="Preferred contact method">
            <select
              className={inputClasses}
              defaultValue=""
              {...register("preferred_contact_method")}
              disabled={isPending}
            >
              <option value="">No preference</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </Field>
        </div>
        <div className="grid gap-5 small:grid-cols-2">
          <Field label="Order number">
            <input
              type="text"
              placeholder="order_123456"
              className={inputClasses}
              {...register("order_number")}
              disabled={isPending}
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              className={inputClasses}
              {...register("phone")}
              disabled={isPending}
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm text-ui-fg-subtle">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ui-border-base text-ui-fg-base focus:ring-ui-border-interactive"
            {...register("is_return_request")}
            disabled={isPending}
          />
          Is this a return request?
        </label>
        <Button
          type="submit"
          className="w-full"
          variant="contrast"
          isLoading={isPending}
          disabled={isPending}
        >
          Send message
        </Button>
      </form>
    </section>
  )
}

const Field = ({
  label,
  helper,
  children,
  required,
  error,
}: {
  label: string
  helper?: string
  children: React.ReactNode
  required?: boolean
  error?: string
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-ui-fg-base">
        {label}
        {required && <span className="text-ui-fg-error ml-1">*</span>}
      </Label>
      {children}
      {helper && <span className="text-xs text-ui-fg-muted">{helper}</span>}
      {error && <span className="text-xs text-ui-fg-error">{error}</span>}
    </div>
  )
}

export default ContactForm


