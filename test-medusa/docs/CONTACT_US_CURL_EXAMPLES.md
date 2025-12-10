# Contact Us API - cURL Examples

## Prerequisites

- Backend URL: `http://localhost:9000` (or your Medusa server URL)
- Publishable API Key: Replace `pk_your_publishable_key_here` with your actual publishable key

## 1. Basic Contact Request (Required Fields Only)

```bash
curl -X POST http://localhost:9000/store/contact-requests \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_your_publishable_key_here" \
  -d '{
    "email": "customer@example.com",
    "payload": {
      "subject": "Order inquiry",
      "message": "I need help with my order #12345"
    },
    "source": "storefront"
  }'
```

## 2. Full Contact Request (All Fields)

```bash
curl -X POST http://localhost:9000/store/contact-requests \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_your_publishable_key_here" \
  -d '{
    "email": "customer@example.com",
    "payload": {
      "subject": "Product return request",
      "message": "I would like to return my recent purchase. The product arrived damaged.",
      "priority": "high",
      "order_number": "order_123456",
      "phone": "+1 (555) 123-4567",
      "preferred_contact_method": "email",
      "is_return_request": true
    },
    "metadata": {
      "source_page": "contact",
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1"
    },
    "source": "contact_page"
  }'
```

## 3. Contact Request with High Priority

```bash
curl -X POST http://localhost:9000/store/contact-requests \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_your_publishable_key_here" \
  -d '{
    "email": "urgent@example.com",
    "payload": {
      "subject": "Urgent: Payment issue",
      "message": "I was charged twice for my order. Please help immediately.",
      "priority": "urgent",
      "order_number": "order_789012"
    },
    "source": "storefront"
  }'
```

## 4. Email Subscription (Newsletter Signup)

```bash
curl -X POST http://localhost:9000/store/contact-email-subscriptions \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_your_publishable_key_here" \
  -d '{
    "email": "newsletter@example.com",
    "status": "subscribed",
    "source": "footer",
    "metadata": {
      "signup_location": "footer_form"
    }
  }'
```

## 5. Unsubscribe from Email List

```bash
curl -X POST http://localhost:9000/store/contact-email-subscriptions \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: pk_your_publishable_key_here" \
  -d '{
    "email": "newsletter@example.com",
    "status": "unsubscribed",
    "source": "unsubscribe_link"
  }'
```

## Expected Response (Contact Request)

```json
{
  "request": {
    "id": "creq_123",
    "email": "customer@example.com",
    "payload": {
      "subject": "Order inquiry",
      "message": "I need help with my order #12345",
      "priority": "high",
      "order_number": "order_123456",
      "phone": "+1 (555) 123-4567",
      "preferred_contact_method": "email",
      "is_return_request": true
    },
    "status": "pending",
    "status_history": [
      {
        "from": null,
        "to": "pending",
        "changed_at": "2024-11-29T16:33:17.000Z"
      }
    ],
    "metadata": {
      "source_page": "contact"
    },
    "source": "storefront",
    "created_at": "2024-11-29T16:33:17.000Z",
    "updated_at": "2024-11-29T16:33:17.000Z"
  }
}
```

## Expected Response (Email Subscription)

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

## Field Configuration

Based on your plugin configuration:

### Required Fields:
- `email` (string) - Valid email address
- `payload.subject` (string) - Subject line
- `payload.message` (string) - Message content

### Optional Fields:
- `payload.priority` (string) - One of: `"low"`, `"medium"`, `"high"`, `"urgent"`
- `payload.order_number` (string) - Order reference number
- `payload.phone` (string) - Phone number
- `payload.preferred_contact_method` (string) - One of: `"email"`, `"phone"`
- `payload.is_return_request` (boolean) - Whether this is a return request
- `metadata` (object) - Additional metadata
- `source` (string) - Request source identifier (default: `"storefront"`)

## Testing with Environment Variables

You can use environment variables in your shell:

```bash
export MEDUSA_URL="http://localhost:9000"
export PUBLISHABLE_KEY="pk_your_publishable_key_here"

curl -X POST ${MEDUSA_URL}/store/contact-requests \
  -H "Content-Type: application/json" \
  -H "x-publishable-api-key: ${PUBLISHABLE_KEY}" \
  -d '{
    "email": "test@example.com",
    "payload": {
      "subject": "Test request",
      "message": "This is a test contact request"
    }
  }'
```

## Error Responses

### Missing Required Field
```json
{
  "message": "Validation error",
  "type": "invalid_data",
  "errors": [
    {
      "field": "payload.subject",
      "message": "Subject is required"
    }
  ]
}
```

### Invalid Email
```json
{
  "message": "Invalid email address",
  "type": "invalid_data"
}
```

