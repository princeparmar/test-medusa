# Medusa Plugin: Customer Registration & OTP Verification

A comprehensive Medusa v2 plugin that provides OTP-based verification for email, phone, and password reset functionality.

## Features

- ✅ **Unified OTP API**: Single endpoints for sending and verifying OTPs
- ✅ **Token-based Verification**: Secure JWT token system for OTP verification
- ✅ **Multiple Verification Types**: Email verification, phone verification, and password reset
- ✅ **Workflow-based Processing**: Automatic handling of verification flags and password reset tokens
- ✅ **Flexible Configuration**: Per-purpose channel configuration (email/SMS)
- ✅ **Automatic Contact Detection**: Automatically selects email/phone from customer based on channel
- ✅ **Throttling & Rate Limiting**: Built-in protection against abuse
- ✅ **Database Migrations**: Automatic schema updates for verification columns

## Quick Start

1. **Install the plugin**:
```bash
npm install customer-registration
```

2. **Add to medusa-config.ts**:
```typescript
import { defineConfig } from "@medusajs/framework/utils"

export default defineConfig({
  plugins: [
    {
      resolve: "customer-registration",
      options: {
        email_verification: {
          channel: "email",
          subject: "Verify your email",
        },
        phone_verification: {
          channel: "sms",
        },
        forgot_password: {
          channel: "email",
          subject: "Reset your password",
        },
      },
    },
  ],
})
```

3. **Run migrations**:
```bash
npx medusa db:migrate
```

4. **Use the API**:
```bash
# Send OTP
POST /store/customers/otp/send
{
  "customer_id": "cus_...",
  "type": "email_verification"
}

# Verify OTP
POST /store/customers/otp/verify
{
  "token": "...",
  "code": "123456"
}
```

📖 **For complete documentation, see [USAGE.md](./USAGE.md)**

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

### API Endpoints

The plugin provides unified OTP endpoints:

| Endpoint | Method | Description |
| --- | --- | --- |
| `/store/customers/otp/send` | POST | Send OTP for email/phone verification or password reset |
| `/store/customers/otp/verify` | POST | Verify OTP code and execute appropriate workflow |

**Request Types**:
- `email_verification` - Verify customer email
- `phone_verification` - Verify customer phone
- `forgot_password` - Generate password reset token

See [USAGE.md](./USAGE.md) for detailed API documentation and examples.

### Example Flow

1. **Register Customer** - Use standard Medusa customer registration endpoint
2. **Send OTP** - Request OTP using unified endpoint with type
3. **Verify OTP** - Verify code using token from send response
4. **Login** - Customer can login after email verification

See [USAGE.md](./USAGE.md) for complete examples and integration guide.

### Configuration

The plugin uses purpose-based configuration:

```typescript
{
  resolve: "customer-registration",
  options: {
    otpLength: 6,
    otpCharset: "numeric",
    otpExpiryMinutes: 15,
    maxAttempts: 5,
    email_verification: {
      channel: "email",
      template: "otp-email-verify",
      subject: "Verify your email",
      resendThrottleSeconds: 90,
    },
    phone_verification: {
      channel: "sms",
      template: "otp-phone-verify",
      resendThrottleSeconds: 60,
    },
    forgot_password: {
      channel: "email",
      template: "forgot-password",
      subject: "Reset your password",
      resendThrottleSeconds: 120,
    },
  },
}
```

See [USAGE.md](./USAGE.md) for complete configuration reference.

### Database Migrations

The plugin includes two migrations:

1. **Migration20250120000000AddCustomerVerificationColumns**
   - Adds `email_verified` and `phone_verified` columns to customer table
   - Creates indexes for performance

2. **Migration20250118001000CreateOtpVerificationTable**
   - Creates `otp_verification` table for storing OTP records

Run migrations after installation:
```bash
npx medusa db:migrate
```

## Requirements

- Medusa v2.11.2 or higher
- Node.js >= 20
- Notification module configured with at least one provider (email/SMS)
- Database migrations applied (`npx medusa db:migrate`)

## Documentation

- **[USAGE.md](./USAGE.md)** - Complete usage guide with examples
- **[README.md](./README.md)** - This file (overview and quick start)

## Modules

The plugin includes two modules:

1. **`otp-verification`** - OTP generation, verification, and management
2. **`customer-registration`** - Customer registration logic and overrides

## Workflows

The plugin uses workflows for different verification types:

- `verify-email` - Sets email_verified flag
- `verify-phone` - Sets phone_verified flag  
- `generate-password-reset-token` - Generates JWT token for password reset

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
