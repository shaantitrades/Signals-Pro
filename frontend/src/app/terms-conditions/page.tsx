import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a1a2e] via-[#2d1b69] to-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            ← Retour
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Terms &amp; Conditions of Use</h1>
          <p className="text-white/60 mt-2">Last Updated: February 11, 2026</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          
          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Welcome to SignalsPro!</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms &amp; Conditions of Use (hereinafter &quot;T&amp;C&quot;) govern the access and use of the website signalspro.com (hereinafter the &quot;Site&quot;) and the signal provision subscription services (hereinafter the &quot;Services&quot;) offered by SignalsPro.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By accessing the Site and using our Services, you acknowledge that you have read, understood, and agree to be bound by all of these T&amp;C. If you do not agree with these terms, you must not use the Site or the Services.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Definitions</h2>
            <ul className="text-muted-foreground space-y-2">
              <li><strong className="text-foreground">User:</strong> Any individual or legal entity who registers on the Site and/or subscribes to a Subscription.</li>
              <li><strong className="text-foreground">Service:</strong> All services provided by the Site, including access to signals, analysis, and exclusive content.</li>
              <li><strong className="text-foreground">Subscription:</strong> The paid subscription, at a specified rate and for a specified duration, granting access to the Services.</li>
              <li><strong className="text-foreground">Signals:</strong> The information, alerts, or data provided by the Site as part of a Subscription.</li>
            </ul>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 1: Purpose</h2>
            <p className="text-muted-foreground leading-relaxed">
              The purpose of these T&amp;C is to define the terms and conditions under which Users may access the Site and subscribe to the Services.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 2: Account Creation</h2>
            <p className="text-muted-foreground leading-relaxed">
              2.1. Access to the Services requires the creation of a personal account. The User agrees to provide accurate, complete, and up-to-date information.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              2.2. The User is solely responsible for the confidentiality of their password and for all activities conducted from their account. The User agrees to immediately notify SignalsPro of any unauthorized use of their account.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 3: Subscriptions</h2>
            <div className="text-muted-foreground space-y-3">
              <p>3.1. <strong className="text-foreground">Subscription:</strong> The Services are accessible through one or more paid Subscriptions, as presented on the Site. Payments are managed by our secure payment service provider, Stripe.</p>
              <p>3.2. <strong className="text-foreground">Automatic Renewal:</strong> Unless canceled by the User before the expiration date, all Subscriptions are automatically renewed for a period identical to the one initially subscribed.</p>
              <p>3.3. <strong className="text-foreground">Cancellation:</strong> The User may cancel the automatic renewal of their Subscription at any time from their personal account area. The cancellation will take effect at the end of the current Subscription period. Access to the Services will be maintained until that date.</p>
              <p>3.4. <strong className="text-foreground">No Refunds:</strong> As detailed in Article 4, canceling a Subscription or its early termination does not entitle the User to any refund for the remaining period.</p>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 4: No-Refund Policy</h2>
            <div className="text-muted-foreground space-y-3">
              <p>4.1. <strong className="text-foreground">Finality of Purchase:</strong> The User expressly acknowledges and agrees that any payment made for a Subscription is final.</p>
              <p>4.2. <strong className="text-foreground">NO REFUNDS:</strong> Due to the digital and immediate nature of the Services provided (instant access to signals and content), SignalsPro does not issue any refunds, either full or partial, under any circumstances.</p>
              <p>4.3. This includes, but is not limited to, cases of dissatisfaction, non-use of the Service, cancellation during the billing period, or forgetting to cancel the automatic renewal. By subscribing, you waive any right to claim a refund.</p>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 5: User Obligations</h2>
            <p className="text-muted-foreground mb-3">The User agrees to:</p>
            <ul className="text-muted-foreground space-y-2">
              <li>• Use the Services for strictly personal and non-commercial purposes.</li>
              <li>• Not share, resell, copy, or distribute the Signals and content of the Site to third parties.</li>
              <li>• Not use any devices or software intended to disrupt the proper functioning of the Site.</li>
              <li>• Comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          <section className="signal-card p-6 sm:p-8 border-l-4 border-l-amber-500">
            <h2 className="text-xl font-bold mb-4">Article 6: IMPORTANT DISCLAIMER AND LIMITATION OF LIABILITY</h2>
            <div className="text-muted-foreground space-y-3">
              <p>6.1. <strong className="text-foreground">Nature of Information:</strong> The Signals and content provided on the Site are for purely informational and educational purposes. They do not, under any circumstances, constitute investment advice, financial recommendation, solicitation, or an offer to buy or sell any financial product.</p>
              <p>6.2. <strong className="text-foreground">No Guarantee:</strong> SignalsPro does not guarantee the performance, accuracy, or relevance of the Signals in any way. Past performance is not indicative of future results.</p>
              <p>6.3. <strong className="text-foreground">Assumption of Risk:</strong> The User is solely and exclusively responsible for their investment or trading decisions and for any financial losses that may result. The use of the Signals is at the User&apos;s own risk.</p>
              <p>6.4. <strong className="text-foreground">Service Availability:</strong> We strive to keep the Site accessible 24/7 but cannot guarantee continuous availability. Access may be interrupted for maintenance or force majeure reasons.</p>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 7: Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All elements of the Site (logo, texts, software, signals, design) are the exclusive property of SignalsPro and are protected by copyright and intellectual property law. Any reproduction, even partial, is strictly prohibited.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 8: Personal Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              The collection and processing of Users&apos; personal data are carried out in accordance with our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>, accessible on the Site, and in compliance with the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 9: Modification of T&amp;C</h2>
            <p className="text-muted-foreground leading-relaxed">
              SignalsPro reserves the right to modify these T&amp;C at any time. Users will be informed of any substantial changes. The applicable version is the one in effect on the Site at the time the Services are used.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Article 10: Governing Law and Jurisdiction</h2>
            <p className="text-muted-foreground leading-relaxed">
              These T&amp;C are subject to international law. In the event of a dispute, and after an attempt at an amicable resolution, exclusive jurisdiction is granted to the competent international courts.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
