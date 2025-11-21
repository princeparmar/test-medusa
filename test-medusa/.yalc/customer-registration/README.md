# Medusa Plugin: Customer Registration Guard

A lean Medusa v2 plugin that hardens customer onboarding, guarantees both `email_verified` and `phone_verified` start as `false`, and now ships a full OTP verification flow for email + phone.

## Features

- Listens to Medusa's native `customer.created` event, so OTP automation works without overriding `POST /store/customers`.
- Forces `email_verified = false` and `phone_verified = false` for every new customer, regardless of the request payload.
- Automatically generates & sends an email OTP right after registration (configurable) using the Notification module + whatever providers your project already registered.
- Adds dedicated email + phone OTP endpoints for resending and verifying codes while marking the corresponding `*_verified` flags to `true`.
- Ships a lightweight Medusa module (`customer-registration`) that exposes OTP helpers and bundles Mikro-ORM migrations (email/phone columns + OTP table) that run during `npx medusa db:migrate`.
- OTP length, charset, expiry, throttling, and provider metadata (channel, template, etc.) are all configurable via plugin options.

## Installation

### Local Development

1. Publish the plugin to local registry:
```bash
cd plugins/customer-registration
npx medusa plugin:publish
```

2. Install in your Medusa application:
```bash
cd ../../test-medusa
npx medusa plugin:add customer-registration
```

3. Register the plugin in `medusa-config.ts`:
```typescript
module.exports = defineConfig({
  // ... other config
  plugins: [
    {
      resolve: "customer-registration",
      options: {},
    },
  ],
})
```

4. Start development mode (in plugin directory):
```bash
cd plugins/customer-registration
npx medusa plugin:develop
```

5. Start your Medusa application:
```bash
cd ../../test-medusa
yarn dev
```

## Usage

### Registration lifecycle hook

The plugin no longer overrides `POST /store/customers`. Instead, it listens to the `customer.created` event and automatically issues an email OTP (when `email.autoSendOnRegistration` is enabled). Because the default Medusa route still handles persistence and response formatting, there are no behavioral differences for registration requests aside from the verification guard.

### OTP endpoints

Expose these Store API routes to your frontend so shoppers can complete verification without touching the Admin API:

| Endpoint | Request Body | Description |
| --- | --- | --- |
| `POST /store/customers/email/otp/verify` | `{ email?: string; customer_id?: string; code: string }` | Confirms the latest email OTP and flips `email_verified` to `true`. |
| `POST /store/customers/phone/otp/send` | `{ email?: string; customer_id?: string }` | Generates a new OTP, throttled per config, and sends it via your configured SMS channel. |
| `POST /store/customers/phone/otp/verify` | `{ email?: string; customer_id?: string; code: string }` | Confirms the latest phone OTP and flips `phone_verified` to `true`. |

All notification dispatches go through Medusa's Notification module, so whichever providers/templates your project already registers will be used automatically.

#### Example: send phone OTP

Request:

```http
POST /store/customers/phone/otp/send
Content-Type: application/json

{
  "email": "sarah@example.com"
}
```

Response:

```json
{
  "sent": true
}
```

#### Example: verify email OTP

Request:

```http
POST /store/customers/email/otp/verify
Content-Type: application/json

{
  "customer_id": "cus_01J7J6PSJ8K7XR31R3Q0H0RZ5Q",
  "code": "529104"
}
```

Response:

```json
{
  "customer": {
    "id": "cus_01J7J6PSJ8K7XR31R3Q0H0RZ5Q",
    "email": "sarah@example.com",
    "phone": "+12025550123",
    "email_verified": true,
    "phone_verified": false,
    "...": "other Medusa customer fields"
  }
}
```

### Typical storefront flow

1. **Register** – call `POST /store/customers` as usual (plugin sets both verification flags to `false`).  
2. **Auto email OTP (optional)** – if `email.autoSendOnRegistration` is `true`, the plugin immediately emails the code.  
3. **Resend OTP** – expose “Resend email/phone code” buttons that hit `POST /store/customers/email/otp/verify` or `POST /store/customers/phone/otp/send`.  
4. **Verify** – when the user submits the code, call the corresponding verify endpoint; the plugin marks the customer as verified and returns the updated customer object.

### End-to-end OTP integration guide

Follow this sequence to enforce verification before login. Each step shows the minimal payloads and cURL commands your storefront or test suite can run.

1. **Register the customer (no cookies returned)**  
   ```bash
   curl -X POST http://localhost:9000/store/customers \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "Ava",
       "last_name": "Lopez",
       "email": "ava@example.com",
       "password": "S3cret!123"
     }'
   ```
   The response contains `customer.email_verified = false`. If `email.autoSendOnRegistration` is enabled, an OTP is already dispatched (and logged to the console when no notification module is configured).

2. **Verify the email OTP**  
   ```bash
   curl -X POST http://localhost:9000/store/customers/email/otp/verify \
     -H "Content-Type: application/json" \
     -d '{
       "email": "ava@example.com",
       "code": "123456"
     }'
   ```
   On success the returned customer now has `email_verified = true`. If an incorrect or expired code is provided, you receive a `400` or `403` style Medusa error describing the reason and you can prompt the shopper to retry.

3. **Login via Medusa auth endpoint (email verification enforced)**  
   The plugin overrides `POST /auth/customer/emailpass` so tokens issue only when `email_verified` is true.
   ```bash
   curl -X POST http://localhost:9000/auth/customer/emailpass \
     -H "Content-Type: application/json" \
     -d '{
       "email": "ava@example.com",
       "password": "S3cret!123"
     }'
   ```
   - If the email is verified, the response matches Medusa core (`{ "token": "..." }`).
   - If not verified, the route returns `401` with `message: "Please verify your email before logging in."`

4. **(Optional) Phone verification gating**  
   - During registration and OTP verification responses you always receive the latest `phone_verified` flag alongside `email_verified`.
   - In an account or profile screen, read these flags from `GET /store/customers/me`. When `phone_verified` is `false`, show a CTA that calls `POST /store/customers/phone/otp/send` and `POST /store/customers/phone/otp/verify` just like the email flow.  
   - Once both flags are true, hide the prompts or replace them with a “Verified” badge.

> Hint: For QA environments without providers, OTP codes are logged with the `[customer-registration] OTP dispatch fallback` prefix so testers can copy/paste them while still exercising the full API surface.

### Configuration reference

Declare the plugin inside `medusa-config.ts` with the options that match your UX and provider setup:

```ts
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  // ...
  plugins: [
    {
      resolve: "customer-registration",
      options: {
        otpLength: 6,
        otpCharset: "numeric",            // "numeric" or "alphanumeric"
        otpExpiryMinutes: 15,
        maxAttempts: 5,
        email: {
          channel: "email",               // Medusa notification channel key
          template: "otp-email-verify",   // optional provider template
          subject: "Verify your Medusa account",
          resendThrottleSeconds: 90,
          autoSendOnRegistration: true,
        },
        phone: {
          channel: "sms",
          template: "otp-phone-verify",
          resendThrottleSeconds: 60,
        },
      },
    },
  ],
})
```

| Option | Type | Description |
| --- | --- | --- |
| `otpLength` | `number` | Total characters generated per OTP. |
| `otpCharset` | `"numeric" \| "alphanumeric"` | Controls whether codes contain digits only or digits + consonants. |
| `otpExpiryMinutes` | `number` | Minutes before each OTP expires. |
| `maxAttempts` | `number` | Number of failed attempts before forcing a resend. |
| `email.channel` / `phone.channel` | `string` | Notification channel key registered in Medusa (e.g., `email`, `sms`). |
| `email.template` / `phone.template` | `string \| null` | Optional provider template handle (SendGrid ID, Twilio template, etc.). |
| `email.subject` | `string` | Fallback subject when sending raw email content. |
| `email.autoSendOnRegistration` | `boolean` | Auto-dispatch an email OTP immediately after registration. |
| `email.resendThrottleSeconds` / `phone.resendThrottleSeconds` | `number` | Minimum seconds before another OTP can be requested for the same purpose. |

> Tip: leave `template` as `null` to fall back to the built-in plain-text message content; otherwise provide the template ID your provider expects.

### Database migrations

- `Migration20250118000000AddEmailVerifiedColumn`: ensures the customer table includes `email_verified` and `phone_verified` booleans.
- `Migration20250118001000CreateCustomerOtpTable`: creates the `customer_registration_otp` table for storing hashed OTPs, expiry metadata, and delivery context.

After installing or updating the plugin, run `npx medusa db:migrate` in your Medusa project so both migrations are applied before handling registrations.

## Requirements

- Medusa v2.11.2 or higher
- Customer table must have `email_verified` and `phone_verified` boolean columns — handled by the bundled migration.
- At least one Notification provider (email + optional SMS) configured in your Medusa project so OTPs can be delivered automatically.
- Run `npx medusa db:migrate` after installation so the module migrations are applied.

## Development

### Build

```bash
npm run build
```

### Watch for Changes

```bash
npx medusa plugin:develop
```

This command watches for changes and automatically rebuilds and publishes the plugin to the local registry.

## License

MIT
