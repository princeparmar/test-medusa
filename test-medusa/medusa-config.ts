import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: {
    [Modules.NOTIFICATION]: {
      resolve: "@medusajs/notification",
      options: {
        providers: [
          {
            resolve: "@tsc_tech/medusa-plugin-smtp/providers/smtp",
            id: "notification-smtp",
            options: {
              channels: ["email"],
              fromEmail: process.env.SMTP_FROM || process.env.SMTP_AUTH_USER,
              transport: {
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: Number(process.env.SMTP_PORT) || 465,
                secure: process.env.SMTP_SECURE === "true" || true,
                auth: {
                  user: process.env.SMTP_AUTH_USER,
                  pass: process.env.SMTP_AUTH_PASS,
                },
              },
            },
          },
        ],
      },
    },
    reviews: {
      resolve: "medusa-review-rating",
    },
  },
  plugins: [
    // # Review Rating
    {
      resolve: "medusa-review-rating",
      options: {
        // Add any plugin options here
      },
    },
    // # medusa-admin-category
    {
      resolve: "medusa-admin-category",
      options: {}
    },
    // # Customer Registration
    {
      resolve: "customer-registration",
      options: {
        otpLength: 6,
        otpCharset: "numeric",
        otpExpiryMinutes: 15,
        maxAttempts: 5,
        email: {
          channel: "email",
          template: "otp-email-verify",
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
    // // # Dynamic Config
    {
      resolve: "medusa-plugin-dynamic-config",
      options: {
        configs: {
          "homepage-config": {
            "id": "homepage-config",
            "title": "Homepage Experiments",
            "active": true,
            "structure": [
              {
                "id": "homepage-banner-array",
                "title": "Homepage Banner Array",
                "type": "array",
                "children": [
                  {
                    "id": "homepage-banner",
                    "title": "Homepage Banner",
                    "type": "object",
                    "children": [
                      {
                        "id": "homepage-banner-title",
                        "title": "Banner Title",
                        "type": "short-text",
                        "required": false
                      },
                      {
                        "id": "homepage-banner-subtitle",
                        "title": "Banner Subtitle",
                        "type": "short-text",
                        "required": false
                      },
                      {
                        "id": "homepage-banner-image",
                        "title": "Banner Image",
                        "type": "file",
                        "required": false
                      }
                    ]
                  },
                ]
              },
              {
                "id": "homepage-banner",
                "title": "Homepage Banner Copy",
                "type": "object",
                "children": [
                  {
                    "id": "homepage-banner-subtitle",
                    "title": "Banner Subtitle",
                    "defaultValue": "Limited time offer",
                    "type": "short-text",
                    "required": false
                  }
                ]
              },
              {
                "id": "logo",
                "title": "Company Logo",
                "type": "file",
                "required": false
              }
            ]
          }
        }
      }
    },
  ],
})
