# Medusa Plugin: Customer Email Verified Registration Override

A Medusa v2 plugin that overrides the customer registration endpoint to set `email_verified = false` by default.

## Features

- Overrides the `POST /store/customers` registration endpoint
- Sets `email_verified = false` for all new customer registrations
- Maintains all existing customer registration functionality

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

### Registration

When a customer registers via `POST /store/customers`, the plugin automatically sets `email_verified = false` in the database.

The registration endpoint works exactly like the default Medusa endpoint, with the addition of setting `email_verified = false` for all new customers.

## Requirements

- Medusa v2.11.2 or higher
- Customer table must have an `email_verified` boolean column (default: `false`)

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
