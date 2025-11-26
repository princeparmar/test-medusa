<h1 align="center">Medusa Contact Us Plugin</h1>

Collect, triage, and resolve storefront “contact us” submissions inside the Medusa Admin. The plugin ships a full stack experience: configurable form schema, database-backed requests/comments, workflows with notification hooks, open store endpoint, admin APIs, helper utilities, and a polished admin UI.

## Features

- ✅ Configurable form schema (required email + arbitrary fields validated from plugin options)
- 🧩 Status lifecycle definition (initial/intermediate/final, allowed transitions, metadata)
- ✉️ Workflow-powered notifications on submission and on final status (re-uses Medusa notification module)
- 🗒️ Admin-only comment trail per request with rich status history
- 🖥️ React Admin extension with list + detail views, filters, status change controls, and comment composer
- 🔌 Frontend helper (`submitContactRequest`) to abstract API wiring
- ✉️ Storefront opt-in helper + admin list for email subscriptions (subscribed/unsubscribed)
- 🧪 Table-driven tests for payload validation and helper logic

## Installation

```bash
yarn add medusa-contact-us
# or
npm install medusa-contact-us
```

## Configuration

Inside `medusa-config.ts` register the plugin and tailor the options:

```ts
import type { ConfigModule } from "@medusajs/framework/types"
import {
  defineContactUsPluginOptions,
  ContactRequestModule,
  ContactSubscriptionModule,
} from "medusa-contact-us"

const plugins = [
  {
    resolve: "medusa-contact-us",
    options: defineContactUsPluginOptions({
      // Form configuration
      form: {
        // Maximum payload size in KB
        max_payload_kb: 128,
        // Additional custom fields beyond the required email field
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
      // Status lifecycle configuration
      statuses: {
        // Initial status when a request is created
        initial: "new",
        // Intermediate statuses (work in progress)
        intermediates: ["in_review", "waiting_for_customer"],
        // Final status (request is complete)
        final: "closed",
        // Allowed status transitions
        transitions: {
          new: ["in_review", "closed"],
          in_review: ["waiting_for_customer", "closed"],
          waiting_for_customer: ["in_review", "closed"],
        },
      },
      // Status options with labels and notification settings
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
      // Notification configuration
      notifications: {
        // Send email when a contact request is created
        send_on_create: true,
        // Template for acknowledgement email
        acknowledgement_template: "emails/contact-received.mjml",
        // Send email when request reaches final status
        send_on_final_status: true,
        // Optional: Custom from address
        from_address: "support@yourstore.com",
        // Optional: Reply-to address
        reply_to: "support@yourstore.com",
      },
      // Comments configuration
      comments: {
        // Enable admin comments on contact requests
        enabled: true,
        // Require a note when changing status to final
        require_note_on_final: true,
      },
    }),
  },
]

// Register the ContactRequestModule
const modules = [ContactRequestModule, ContactSubscriptionModule]

export default {
  projectConfig: {
    // Your Medusa project configuration
    // database_url: process.env.DATABASE_URL,
    // ...
  },
  plugins,
  modules,
} satisfies ConfigModule
```

### Field Types

Available field types for `additional_fields`:
- `text`: Single-line text input
- `textarea`: Multi-line text input
- `number`: Numeric input
- `select`: Dropdown selection (requires `options` array)
- `multi_select`: Multiple selection (requires `options` array)
- `boolean`: Checkbox
- `date`: Date picker

### Status lifecycle best practices

- Define unique status codes (kebab or snake case) and map them in `status_options`.
- Provide at least one intermediate state when multiple review steps exist.
- Set `notify_customer` to `true` for statuses that should trigger emails.
- Configure `transitions` if you need granular control; otherwise the default is `(all non-final statuses) -> intermediates/final`.

## REST API

### Storefront (open)

```bash
curl -X POST https://your-medusa.com/store/contact-requests \
  -H "Content-Type: application/json" \
  -d '{
        "email": "customer@example.com",
        "payload": { "subject": "Need help", "priority": "high" },
        "metadata": { "order_id": "order_123" }
      }'
```

Response:

```json
{
  "contact_request": {
    "id": "crq_123",
    "email": "customer@example.com",
    "status": "new",
    "payload": { "subject": "Need help", "priority": "high" },
    "status_history": [
      { "status": "new", "updated_at": "2024-11-24T10:00:00.000Z" }
    ]
  }
}
```

#### Email subscriptions

```bash
curl -X POST https://your-medusa.com/store/contact-email-subscriptions \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_storefront" \
  -d '{
        "email": "newsletter@example.com",
        "status": "subscribed",
        "source": "footer"
      }'
```

Body fields:
- `email` – required, unique per entry (case-insensitive).
- `status` – optional, defaults to `subscribed`. Pass `"unsubscribed"` to honor opt-outs.
- `metadata` / `source` – optional context stored alongside the entry.

Response:

```json
{
  "subscription": {
    "id": "csub_123",
    "email": "newsletter@example.com",
    "status": "subscribed",
    "source": "footer",
    "created_at": "2024-11-26T10:00:00.000Z"
  }
}
```

### Admin (requires admin auth cookie/token)

List:

```bash
curl -X GET "https://your-medusa.com/admin/contact-requests?status=new&limit=20" \
  -H "Authorization: Bearer <token>"
```

Detail:

```bash
curl -X GET https://your-medusa.com/admin/contact-requests/crq_123 \
  -H "Authorization: Bearer <token>"
```

Update status:

```bash
curl -X PATCH https://your-medusa.com/admin/contact-requests/crq_123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "closed", "note": "Resolved via refund" }'
```

Add comment:

```bash
curl -X POST https://your-medusa.com/admin/contact-requests/crq_123/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "comment": "Waiting on supplier" }'
```

## Admin UI

After running `medusa admin dev --plugins medusa-contact-us`, the sidebar will include **Contact Requests**:

- **List view** – search by email, filter by status, inspect creation dates, open details with a single click.
- **Detail view** – see submitted fields, live status badge, change status (with optional notes), inspect the full history timeline, and append internal comments.
- **Comments** – only admins can add comments. Comments are persisted and shown newest first.
- **Contact email list** – dedicated table that displays every storefront opt-in, highlights unsubscribes, and supports filtering/searching by status or email.

All UI components follow the Medusa UI kit spacing (8pt grid), color, and accessibility guidelines.

## Frontend helper

Skip hand-writing `fetch` calls by importing the provided helpers. **Storefront requests must include a publishable API key** (create one under `Settings → API Keys` in the Medusa admin). The helpers automatically attach the header for you.

### Contact requests

```ts
import { submitContactRequest } from "medusa-contact-us"

await submitContactRequest(
  {
    email: "customer@example.com",
    payload: { subject: "Question", priority: "high" },
  },
  {
    baseUrl: "https://store.myshop.com",
    publishableApiKey: "pk_test_storefront",
  }
)
```

Using a Medusa JS client keeps credentials in one place while still letting you override headers (including publishable keys) per call:

```ts
import Medusa from "@medusajs/medusa-js"
import { submitContactRequest } from "medusa-contact-us"

const medusa = new Medusa({
  baseUrl: "https://store.myshop.com",
  publishableKey: "pk_live_client",
})

await submitContactRequest(
  {
    email: "customer@example.com",
    payload: { subject: "Returns" },
  },
  {
    client: medusa,
    publishableApiKey: "pk_live_client",
    headers: {
      Cookie: "connect.sid=...",
    },
  }
)
```

For SSR or edge runtimes, preconfigure the helper once:

```ts
import { createSubmitContactRequest } from "medusa-contact-us"

const submitContactRequest = createSubmitContactRequest({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_URL,
  publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

export async function action(formData: FormData) {
  await submitContactRequest({
    email: formData.get("email") as string,
    payload: {
      subject: formData.get("subject"),
      message: formData.get("message"),
    },
  })
}
```

### Email subscriptions

```ts
import { upsertContactSubscription } from "medusa-contact-us"

await upsertContactSubscription(
  {
    email: "newsletter@example.com",
    status: "subscribed",
    metadata: { channel: "footer" },
  },
  {
    baseUrl: "https://store.myshop.com",
    publishableApiKey: "pk_test_storefront",
  }
)
```

To keep deploys DRY, build a preconfigured helper and reuse it everywhere:

```ts
import { createUpsertContactSubscription } from "medusa-contact-us"

export const upsertSubscription = createUpsertContactSubscription({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_URL,
  publishableApiKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

await upsertSubscription({
  email: input.email,
  status: input.unsubscribe ? "unsubscribed" : "subscribed",
  source: input.source ?? "footer_form",
})
```

### Shared helper options

- `publishableApiKey` – Automatically sets the `x-publishable-api-key` header when no Medusa client is used.
- `baseUrl` – Storefront API origin (ignored when `client` is provided).
- `client` – Pre-configured Medusa JS/SDK instance (reuses its base URL and publishable key).
- `fetchImpl` – Custom fetch implementation (SSR, React Native, etc.).
- `headers` – Additional headers merged into the request (e.g., session cookie, localization). Values you pass here override the defaults, including the publishable key header if you need a per-request key.

Customer-authenticated endpoints (like submitting a request from a logged-in area) still require the appropriate session cookie or JWT. Provide those via the `headers` option if they’re not already managed by the browser fetch call.

## Workflows & notifications

- `createContactRequestWorkflow` validates payloads, persists the request, and optionally fires an acknowledgement email.
- `updateContactRequestStatusWorkflow` enforces transitions, records history entries, and emits final-status notifications.
- Notifications rely on the standard Medusa notification module. Ensure at least one email provider is configured; otherwise the workflows raise an error to surface misconfiguration early.

## Testing & build

```bash
yarn test   # runs Vitest table-driven suites
yarn build  # compiles the plugin via `medusa plugin:build`
```

Always run `yarn build` after development to ensure the bundler succeeds before publishing or yalc linking.

## Troubleshooting

- Submit endpoint returning `422`: ensure every field defined in `form.additional_fields` is provided and matches its type.
- Notifications not sent: confirm `notifications.send_on_*` flags and that the notification module is registered (the workflows throw an actionable error otherwise).
- Admin UI blank: rebuild the plugin (`yarn build`) and restart the Admin app with the plugin registered in `medusa-config.ts`.
