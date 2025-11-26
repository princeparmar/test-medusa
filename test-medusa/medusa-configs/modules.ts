import { Modules } from '@medusajs/framework/utils'

const notificationModuleConfig = {
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
}

export const modulesConfig = {
  [Modules.NOTIFICATION]: notificationModuleConfig,
  reviews: {
    resolve: "medusa-review-rating",
  },
  contact_requests: {
    resolve: "medusa-contact-us/modules/contact-requests",
  },
  contact_email_subscriptions: {
    resolve: "medusa-contact-us/modules/contact-subscriptions",
  },
}

