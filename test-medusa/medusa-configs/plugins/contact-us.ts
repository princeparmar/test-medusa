export const contactUsPlugin = {
  resolve: "medusa-contact-us",
  options: {
    // Contact Request Configuration
    default_status: "pending",
    payload_fields: [
      {
        key: "subject",
        type: "text",
        required: true,
        label: "Subject",
        placeholder: "Enter subject",
      },
      {
        key: "message",
        type: "textarea",
        required: true,
        label: "Message",
        placeholder: "Enter your message",
      },
      {
        key: "priority",
        type: "select",
        required: false,
        label: "Priority",
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "urgent", label: "Urgent" },
        ],
      },
      {
        key: "order_number",
        type: "text",
        required: false,
        label: "Order Number",
        placeholder: "If this relates to an order, please provide the order number",
      },
      {
        key: "phone",
        type: "text",
        required: false,
        label: "Phone Number",
        placeholder: "+1 (555) 123-4567",
      },
      {
        key: "preferred_contact_method",
        type: "select",
        required: false,
        label: "Preferred Contact Method",
        options: [
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
        ],
      },
      {
        key: "is_return_request",
        type: "checkbox",
        required: false,
        label: "Is this a return request?",
      },
    ],
    allowed_statuses: ["pending", "in_progress", "resolved", "closed"],
    status_transitions: [
      {
        from: null,
        to: "pending",
        send_email: false,
      },
      {
        from: "pending",
        to: "in_progress",
        send_email: true,
        email_subject: "Your request is being processed",
      },
      {
        from: "in_progress",
        to: "resolved",
        send_email: true,
        email_subject: "Your request has been resolved",
      },
      {
        from: "resolved",
        to: "closed",
        send_email: false,
      },
    ],
    email: {
      enabled: true,
      default_subject: "Contact Request Status Update",
      default_template: null,
    },
  },
}

