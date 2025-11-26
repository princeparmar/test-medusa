import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import ContactForm from "@modules/contact/components/contact-form"
import EmailSubscriptionForm from "@modules/contact/components/email-subscription-form"
import { Text } from "@medusajs/ui"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function ContactPage({ params }: Props) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  return (
    <div className="content-container py-12 small:py-16 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16">
        <div className="space-y-6">
          <div className="space-y-3">
            <Text className="text-3xl font-semibold text-ui-fg-base">Contact us</Text>
            <p className="text-base text-ui-fg-subtle leading-relaxed">
              Need help with an order, sizing, or shipping? Send us a message using the
              form or reach out using the details below and our team will reply within 48
              hours.
            </p>
          </div>
          <div className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-ui-fg-base uppercase tracking-wide">
                Email
              </p>
              <a
                href="mailto:support@yourstore.com"
                className="mt-1 inline-flex text-lg text-ui-fg-interactive hover:text-ui-fg-base"
              >
                support@yourstore.com
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-ui-fg-base uppercase tracking-wide">
                Phone
              </p>
              <a
                href="tel:+15551234567"
                className="mt-1 inline-flex text-lg text-ui-fg-interactive hover:text-ui-fg-base"
              >
                +1 (555) 123-4567
              </a>
            </div>
            <div>
              <p className="text-sm font-semibold text-ui-fg-base uppercase tracking-wide">
                Hours
              </p>
              <p className="mt-1 text-base text-ui-fg-subtle">
                Monday–Friday, 9:00–18:00 {region.name}
              </p>
            </div>
          </div>
        </div>
        <ContactForm countryCode={countryCode} />
      </div>

      <section className="mt-16 rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-6 small:p-8">
        <div className="flex flex-col gap-2">
          <Text className="text-2xl font-semibold text-ui-fg-base">
            Stay in the loop
          </Text>
          <p className="text-sm text-ui-fg-subtle max-w-2xl">
            Subscribe to occasional product drops, fit guides, and community events. No spam
            — just the good stuff.
          </p>
        </div>
        <div className="mt-6">
          <EmailSubscriptionForm
            layout="stacked"
            source="contact_page_subscription"
            buttonLabel="Join newsletter"
          />
        </div>
      </section>
    </div>
  )
}


