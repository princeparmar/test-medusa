# Contact Us Plugin Integration Guide

This guide explains how to integrate the `medusa-contact-us` plugin into your Medusa backend and Next.js storefront.

## Table of Contents

1. [Backend Integration](#backend-integration)
2. [Frontend Integration](#frontend-integration)
3. [Configuration](#configuration)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

## Backend Integration

### Step 1: Install the Plugin

```bash
cd test-medusa
npm install medusa-contact-us --legacy-peer-deps
```

**Note:** Use `--legacy-peer-deps` if you encounter peer dependency conflicts.

### Step 2: Create Plugin Configuration

Create a plugin configuration file at `medusa-configs/plugins/contact-us.ts`:

```typescript
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
```

### Step 3: Register the Plugin

Add the plugin to `medusa-configs/plugins/index.ts`:

```typescript
import { contactUsPlugin } from './contact-us'

export const pluginsConfig = [
  // ... other plugins
  contactUsPlugin,
  // ... other plugins
]

export {
  // ... other exports
  contactUsPlugin,
  // ... other exports
}
```

### Step 4: Register the Modules

Add the modules to `medusa-configs/modules.ts`:

```typescript
export const modulesConfig = {
  [Modules.NOTIFICATION]: notificationModuleConfig,
  reviews: {
    resolve: "medusa-review-rating",
  },
  contact_email_subscriptions: {
    resolve: "medusa-contact-us/modules/contact-subscriptions",
  },
  contact_requests: {
    resolve: "medusa-contact-us/modules/contact-requests",
  },
}
```

### Step 5: Run Database Migrations

```bash
npx medusa db:migrate
```

This creates the following tables:
- `contact_email_subscription` - for email subscriptions
- `contact_request` - for contact requests

### Step 6: Install Missing Dependencies (if needed)

If you encounter MikroORM errors, install the required dependencies:

```bash
npm install @mikro-orm/core @mikro-orm/postgresql --legacy-peer-deps
```

### Step 7: Restart the Server

```bash
npm run dev
```

## Frontend Integration

### Step 1: Install the Package

The package should already be in `package.json`. If not:

```bash
cd test-medusa-storefront
npm install medusa-contact-us
```

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_publishable_key_here
```

**Note:** Create a publishable API key in the Medusa admin dashboard under `Settings → API Keys`.

### Step 3: Verify Contact Form Implementation

The contact form is already implemented at:
- **Component:** `src/modules/contact/components/contact-form/index.tsx`
- **Server Action:** `src/lib/data/contact.ts`
- **Page:** `src/app/[countryCode]/(main)/contact/page.tsx`

The form includes all fields from your backend configuration:
- Email (required, validated)
- Subject (required)
- Message (required)
- Priority (optional)
- Order Number (optional)
- Phone (optional)
- Preferred Contact Method (optional)
- Is Return Request (optional checkbox)

### Step 4: Verify Email Subscription Form

The email subscription form is implemented at:
- **Component:** `src/modules/contact/components/email-subscription-form/index.tsx`
- Used in footer and contact page

## Configuration

### Backend Configuration Options

#### Contact Request Fields

Configure fields in `medusa-configs/plugins/contact-us.ts`:

- **Required Fields:** `subject`, `message`
- **Optional Fields:** `priority`, `order_number`, `phone`, `preferred_contact_method`, `is_return_request`

#### Status Workflow

The default workflow is:
```
pending → in_progress → resolved → closed
```

You can customize:
- `allowed_statuses` - List of valid status values
- `status_transitions` - Define allowed transitions and email notifications

#### Email Notifications

Configure email notifications per status transition:
- `send_email: true/false` - Enable/disable email for transition
- `email_subject` - Custom subject for transition
- `email_template` - Optional email template path

### Frontend Configuration

The frontend automatically uses:
- `MEDUSA_BACKEND_URL` or `NEXT_PUBLIC_MEDUSA_BACKEND_URL` for API base URL
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` for authentication

## Testing

### Test Contact Request Submission

Use the curl command (see `CONTACT_US_CURL_EXAMPLES.md`):

```bash
curl -X POST http://localhost:9000/store/contact-requests \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_your_publishable_key_here" \
  -d '{
    "email": "customer@example.com",
    "payload": {
      "subject": "Test request",
      "message": "This is a test message"
    },
    "source": "test"
  }'
```

### Test via Frontend

1. Navigate to `http://localhost:8000/[countryCode]/contact`
2. Fill out the contact form
3. Submit and verify the success message
4. Check the admin panel for the new contact request

### Test Email Subscription

```bash
curl -X POST http://localhost:9000/store/contact-email-subscriptions \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_your_publishable_key_here" \
  -d '{
    "email": "newsletter@example.com",
    "status": "subscribed",
    "source": "test"
  }'
```

## Troubleshooting

### Email Validation Errors

**Error:** `Invalid email` from Zod validation

**Solution:**
- Ensure email is properly formatted (e.g., `user@example.com`)
- Email is automatically trimmed and lowercased in the server action
- Frontend form validates email format before submission

### Module Not Found Errors

**Error:** `Cannot find module '@mikro-orm/core'`

**Solution:**
```bash
npm install @mikro-orm/core @mikro-orm/postgresql --legacy-peer-deps
```

### Plugin Configuration Errors

**Error:** `Cannot find module 'medusa-contact-us/plugin-options'`

**Solution:**
- Don't use `defineContactUsPluginOptions` - pass options directly
- See `medusa-configs/plugins/contact-us.ts` for correct format

### Database Connection Errors

**Error:** `MikroORM failed to connect to the database`

**Solution:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env` file
- Verify database credentials

### Frontend API Errors

**Error:** `Unable to submit your request right now`

**Solution:**
- Verify `MEDUSA_BACKEND_URL` is correct
- Check `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set
- Ensure backend server is running
- Check browser console for detailed error messages

## API Endpoints

### Storefront Endpoints (Public)

#### Submit Contact Request
```
POST /store/contact-requests
Headers:
  - Content-Type: application/json
  - x-publishable-api-key: pk_xxx

Body:
{
  "email": "customer@example.com",
  "payload": {
    "subject": "Subject",
    "message": "Message",
    "priority": "high", // optional
    "order_number": "order_123", // optional
    "phone": "+1234567890", // optional
    "preferred_contact_method": "email", // optional
    "is_return_request": true // optional
  },
  "source": "contact_page", // optional
  "metadata": {} // optional
}
```

#### Email Subscription
```
POST /store/contact-email-subscriptions
Headers:
  - Content-Type: application/json
  - x-publishable-api-key: pk_xxx

Body:
{
  "email": "newsletter@example.com",
  "status": "subscribed", // or "unsubscribed"
  "source": "footer" // optional
}
```

### Admin Endpoints (Authenticated)

#### List Contact Requests
```
GET /admin/contact-requests?status=pending&limit=20&offset=0
Headers:
  - Authorization: Bearer <admin_token>
```

#### Get Contact Request
```
GET /admin/contact-requests/{id}
Headers:
  - Authorization: Bearer <admin_token>
```

#### Update Contact Request Status
```
POST /admin/contact-requests/{id}/status
Headers:
  - Authorization: Bearer <admin_token>
  - Content-Type: application/json

Body:
{
  "status": "in_progress"
}
```

## File Structure

### Backend Files

```
test-medusa/
├── medusa-configs/
│   ├── plugins/
│   │   ├── contact-us.ts          # Plugin configuration
│   │   └── index.ts                # Plugin registration
│   └── modules.ts                  # Module registration
├── package.json                     # Dependencies
└── CONTACT_US_INTEGRATION.md        # This file
```

### Frontend Files

```
test-medusa-storefront/
├── src/
│   ├── lib/
│   │   └── data/
│   │       └── contact.ts          # Server actions
│   ├── modules/
│   │   └── contact/
│   │       ├── components/
│   │       │   ├── contact-form/
│   │       │   │   └── index.tsx   # Contact form component
│   │       │   └── email-subscription-form/
│   │       │       └── index.tsx   # Subscription form
│   │       └── ...
│   └── app/
│       └── [countryCode]/
│           └── (main)/
│               └── contact/
│                   └── page.tsx    # Contact page
└── package.json
```

## Next Steps

1. **Customize Email Templates:** Configure email templates for status transitions
2. **Admin UI:** Access contact requests in the admin dashboard
3. **Webhooks:** Set up webhooks for contact request events
4. **Analytics:** Track contact request metrics
5. **Automation:** Set up automated responses based on request type

## Additional Resources

- [Plugin README](../../medusa-plugins/medusa-contact-us/README.md)
- [cURL Examples](./CONTACT_US_CURL_EXAMPLES.md)
- [Medusa Documentation](https://docs.medusajs.com)
- [Plugin NPM Package](https://www.npmjs.com/package/medusa-contact-us)

