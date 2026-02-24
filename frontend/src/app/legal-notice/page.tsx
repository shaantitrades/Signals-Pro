import Link from 'next/link';

export default function LegalNoticePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a1a2e] via-[#2d1b69] to-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ãƒâ€šÃ‚Â Retour
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Legal Notice</h1>
          <p className="text-white/60 mt-2">Last Updated: February 11, 2026</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6">1. Company Information</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Business Details</h3>
                <div className="text-muted-foreground space-y-2 text-sm">
                  <p><strong className="text-foreground">Service Name:</strong> Market Signals24</p>
                  <p><strong className="text-foreground">Website:</strong> Market Signals24.com</p>
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@Market Signals24.com" className="text-primary hover:underline">support@Market Signals24.com</a></p>
                  <p><strong className="text-foreground">Service Type:</strong> Financial Information &amp; Trading Signals</p>
                </div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Regulatory Status</h3>
                <div className="text-muted-foreground text-sm space-y-2">
                  <p>This service provides educational and informational content related to financial markets.</p>
                  <p>We are not a regulated financial advisor or broker-dealer.</p>
                  <p>Users are responsible for their own trading decisions and compliance with local regulations.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">2. Service Description</h2>
            <p className="text-muted-foreground mb-4">
              Market Signals24 provides AI-powered trading signals and market analysis for educational and informational purposes. Our service includes:
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Real-time buy/sell signals for Forex, Crypto, and Indices markets</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Market analysis and educational content</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Technical analysis tools and indicators</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Risk management guidance</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Customer support and educational resources</li>
            </ul>
            <p className="text-amber-500 mt-4 font-medium">
              Important: Our signals are for educational purposes only and should not be considered as financial advice.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">3. Disclaimers</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">No Financial Advice</h3>
                <p className="text-muted-foreground">
                  The information provided through our service is for educational and informational purposes only. We do not provide financial advice, investment recommendations, or trading advice. Users should conduct their own research and consult with qualified financial professionals before making any investment decisions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">No Guarantee of Results</h3>
                <p className="text-muted-foreground">
                  Past performance does not guarantee future results. Trading in financial markets involves substantial risk of loss. We do not guarantee the accuracy, completeness, or timeliness of any information provided through our service.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Market Risk Disclosure</h3>
                <p className="text-muted-foreground">
                  Financial markets are inherently risky and volatile. Users can lose some or all of their invested capital. We strongly recommend that users only trade with capital they can afford to lose and implement proper risk management strategies.
                </p>
              </div>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">4. User Responsibilities</h2>
            <p className="text-muted-foreground mb-3">By using our service, users acknowledge and agree to the following responsibilities:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Conducting their own research and analysis before making trading decisions</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Understanding the risks involved in financial trading</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Complying with all applicable laws and regulations in their jurisdiction</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Using proper risk management techniques</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Not relying solely on our signals for trading decisions</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Maintaining the security of their account credentials</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Reporting any suspicious activity or technical issues</li>
            </ul>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, including but not limited to text, graphics, logos, software, and trading signals, is the property of Market Signals24 and is protected by copyright and other intellectual property laws. Users may not reproduce, distribute, or create derivative works from our content without express written permission. Unauthorized use of our content may result in legal action.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-3">
              To the maximum extent permitted by law, Market Signals24 shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul className="text-muted-foreground space-y-1 mb-4">
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Use of our trading signals or services</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Trading losses or missed opportunities</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Technical issues or service interruptions</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Inaccuracies in market data or analysis</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Delays in signal delivery</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Any other damages related to our service</li>
            </ul>
            <p className="text-muted-foreground">
              Our total liability shall not exceed the amount paid by the user for our services in the 12 months preceding the claim.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">7. Service Availability</h2>
            <p className="text-muted-foreground mb-3">
              We strive to provide continuous service availability, but we do not guarantee uninterrupted access to our platform. Service may be temporarily unavailable due to:
            </p>
            <ul className="text-muted-foreground space-y-1 mb-3">
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Scheduled maintenance and updates</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Technical issues or system failures</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Network connectivity problems</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Force majeure events</li>
            </ul>
            <p className="text-muted-foreground">
              We will make reasonable efforts to notify users of planned maintenance and restore service as quickly as possible.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">8. Data and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect and process user data in accordance with our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>. By using our service, users consent to the collection and use of their information as described in our Privacy Policy. We implement appropriate security measures to protect user data, but we cannot guarantee absolute security against unauthorized access or data breaches.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">9. Governing Law and Jurisdiction</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Legal Notice and any disputes arising from the use of our service shall be governed by and construed in accordance with applicable laws. Users agree to submit to the exclusive jurisdiction of the courts in the applicable jurisdiction for the resolution of any disputes.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">10. Changes to Legal Notice</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify this Legal Notice at any time. Changes will be effective immediately upon posting on our website. Users are responsible for regularly reviewing this Legal Notice. Continued use of our service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8 text-center">
            <h2 className="text-xl font-bold mb-3">Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Legal Notice or need clarification on any legal matters, please contact us:
            </p>
            <div className="text-muted-foreground space-y-1 mb-4">
              <p><strong className="text-foreground">Email:</strong> <a href="mailto:support@Market Signals24.com" className="text-primary hover:underline">support@Market Signals24.com</a></p>
              <p><strong className="text-foreground">Website:</strong> Market Signals24.com</p>
            </div>
            <a href="mailto:support@Market Signals24.com" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Contact Legal Team
            </a>
          </section>

        </div>
      </main>
    </div>
  );
}
