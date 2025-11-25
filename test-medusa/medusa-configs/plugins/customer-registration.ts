export const customerRegistrationPlugin = {
  resolve: "customer-registration",
  options: {
    otpLength: 6,
    otpCharset: "numeric",
    otpExpiryMinutes: 15,
    maxAttempts: 5,
    email_verification: {
      channel: "email",
      template: "/Users/pradipparmar/git/ecommerce/test-medusa/test-medusa/src/templates/emails/otp-email-verify.html",
      subject: "Verify your email",
      resendThrottleSeconds: 90,
    },
    phone_verification: {
      channel: "sms",
      template: "/Users/pradipparmar/git/ecommerce/test-medusa/test-medusa/src/templates/emails/otp-phone-verify.html",
      resendThrottleSeconds: 60,
    },
    forgot_password: {
      channel: "email",
      template: "/Users/pradipparmar/git/ecommerce/test-medusa/test-medusa/src/templates/emails/forgot-password.html",
      subject: "Reset your password",
      resendThrottleSeconds: 120,
    },
  },
}

