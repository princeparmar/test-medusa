import { defineContactUsPluginOptions } from "medusa-contact-us/plugin-options"

export const contactUsPlugin = {
  resolve: "medusa-contact-us",
  options: defineContactUsPluginOptions({
    form: {
      max_payload_kb: 128,
      additional_fields: [
        {
          key: "subject",
          label: "Subject",
          description: "Brief description of your inquiry",
          type: "text",
          required: true,
          placeholder: "e.g., Order inquiry",
          helper_text: "Please provide a clear subject line",
        },
        {
          key: "message",
          label: "Message",
          description: "Detailed message about your inquiry",
          type: "textarea",
          required: true,
          placeholder: "Please describe your issue or question...",
        },
        {
          key: "priority",
          label: "Priority",
          description: "How urgent is your request?",
          type: "select",
          required: false,
          options: [
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ],
        },
        {
          key: "order_number",
          label: "Order Number",
          description: "If this relates to an order, please provide the order number",
          type: "text",
          required: false,
          placeholder: "order_123456",
        },
        {
          key: "phone",
          label: "Phone Number",
          type: "text",
          required: false,
          placeholder: "+1 (555) 123-4567",
        },
        {
          key: "preferred_contact_method",
          label: "Preferred Contact Method",
          type: "select",
          required: false,
          options: [
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
          ],
        },
        {
          key: "is_return_request",
          label: "Is this a return request?",
          type: "boolean",
          required: false,
        },
      ],
    },
    statuses: {
      initial: "new",
      intermediates: ["in_review", "waiting_for_customer"],
      final: "closed",
      transitions: {
        new: ["in_review", "closed"],
        in_review: ["waiting_for_customer", "closed"],
        waiting_for_customer: ["in_review", "closed"],
      },
    },
    status_options: [
      {
        code: "new",
        label: "New",
        description: "Recently submitted requests awaiting review",
        notify_customer: true,
        template: "emails/contact-received.mjml",
      },
      {
        code: "in_review",
        label: "In Review",
        description: "Assigned to an agent and being reviewed",
        notify_customer: false,
      },
      {
        code: "waiting_for_customer",
        label: "Waiting for Customer",
        description: "Awaiting response from customer",
        notify_customer: true,
        template: "emails/contact-waiting.mjml",
      },
      {
        code: "closed",
        label: "Closed",
        description: "Resolved and completed",
        notify_customer: true,
        template: "emails/contact-final.mjml",
      },
    ],
    notifications: {
      send_on_create: true,
      acknowledgement_template: "emails/contact-received.mjml",
      send_on_final_status: true,
      from_address: "support@yourstore.com",
      reply_to: "support@yourstore.com",
    },
    comments: {
      enabled: true,
      require_note_on_final: true,
    },
  }),
}


