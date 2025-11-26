declare module "medusa-contact-us/plugin-options" {
  type SelectOption = {
    value: string
    label: string
  }

  type AdditionalField =
    | {
        key: string
        label: string
        description?: string
        type: "text" | "textarea" | "number"
        required?: boolean
        placeholder?: string
        helper_text?: string
      }
    | {
        key: string
        label: string
        description?: string
        type: "select" | "multi_select"
        required?: boolean
        options: SelectOption[]
      }
    | {
        key: string
        label: string
        description?: string
        type: "boolean" | "date"
        required?: boolean
      }

  type ContactStatusOption = {
    code: string
    label: string
    description?: string
    notify_customer?: boolean
    template?: string
  }

  type ContactNotificationsConfig = {
    send_on_create?: boolean
    acknowledgement_template?: string
    send_on_final_status?: boolean
    from_address?: string
    reply_to?: string
  }

  type ContactCommentsConfig = {
    enabled?: boolean
    require_note_on_final?: boolean
  }

  export type ContactUsPluginOptions = {
    form?: {
      max_payload_kb?: number
      additional_fields?: AdditionalField[]
    }
    statuses?: {
      initial: string
      intermediates?: string[]
      final: string
      transitions?: Record<string, string[]>
    }
    status_options?: ContactStatusOption[]
    notifications?: ContactNotificationsConfig
    comments?: ContactCommentsConfig
  }

  export function defineContactUsPluginOptions<T extends ContactUsPluginOptions>(
    options: T
  ): ContactUsPluginOptions
}


