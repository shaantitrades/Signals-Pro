import Link from 'next/link';

export default function TradingRisksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a1a2e] via-[#2d1b69] to-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Ãƒâ€šÃ‚Â Retour
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Trading Risks Disclosure</h1>
          <p className="text-white/60 mt-2">Last Updated: February 11, 2026</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">

          <section className="signal-card p-6 sm:p-8 border-l-4 border-l-amber-500">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã‚Â¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â</span> Important Risk Warning
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trading in financial markets involves substantial risk of loss and is not suitable for all investors. You can lose some or all of your invested capital. Please ensure that you fully understand the risks involved.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6">1. General Trading Risks</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Market Risk</h3>
                <p className="text-sm text-muted-foreground">Financial markets are inherently volatile and unpredictable. Prices can move rapidly in either direction, potentially resulting in significant losses.</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Leverage Risk</h3>
                <p className="text-sm text-muted-foreground">Trading with leverage can amplify both profits and losses. Small market movements can result in substantial losses that exceed your initial investment.</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Liquidity Risk</h3>
                <p className="text-sm text-muted-foreground">Some markets may have low liquidity, making it difficult to enter or exit positions at desired prices, especially during volatile periods.</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Gap Risk</h3>
                <p className="text-sm text-muted-foreground">Markets can gap between trading sessions, potentially causing stop losses to be executed at unfavorable prices or positions to be closed at significant losses.</p>
              </div>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6">2. Specific Market Risks</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Forex Trading Risks</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Currency pairs can be highly volatile, especially during major economic events</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Political and economic factors can cause sudden currency movements</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Interest rate changes can significantly impact currency values</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ OTC markets may have wider spreads and less regulation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Cryptocurrency Trading Risks</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Extreme volatility with prices that can change dramatically in minutes</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Regulatory uncertainty and potential government interventions</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Security risks including hacking and theft</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Limited historical data for analysis</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ 24/7 trading can lead to unexpected price movements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Indices Trading Risks</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Market hours limitations and overnight gaps</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Economic data releases can cause significant volatility</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Company earnings and news can impact entire sectors</li>
                  <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Geopolitical events can affect global markets</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">3. Signal Service Risks</h2>
            <h3 className="text-lg font-semibold mb-3">Signal Limitations</h3>
            <p className="text-muted-foreground mb-3">
              While our signals are generated using advanced AI and professional analysis, they are not guaranteed to be profitable. Past performance does not indicate future results.
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Market conditions can change rapidly, making signals outdated</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Execution delays can result in different entry/exit prices</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Technical issues may prevent timely signal delivery</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Individual trading decisions should always include personal risk assessment</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Signals should be used as part of a comprehensive trading strategy</li>
            </ul>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6">4. Risk Management Recommendations</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <span className="text-2xl">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€šÃ‚Â</span>
                <h3 className="font-semibold mt-2 mb-2">Position Sizing</h3>
                <p className="text-sm text-muted-foreground">Never risk more than 1-2% of your trading capital on any single trade. This helps protect your account from significant losses.</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <span className="text-2xl">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“</span>
                <h3 className="font-semibold mt-2 mb-2">Stop Losses</h3>
                <p className="text-sm text-muted-foreground">Always use stop losses to limit potential losses. Set them at levels that make sense for your risk tolerance.</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <span className="text-2xl">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬</span>
                <h3 className="font-semibold mt-2 mb-2">Diversification</h3>
                <p className="text-sm text-muted-foreground">Don&apos;t put all your capital in one market or asset. Spread your risk across different instruments.</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <span className="text-2xl">ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒâ€¦Ã‚Â¡</span>
                <h3 className="font-semibold mt-2 mb-2">Education</h3>
                <p className="text-sm text-muted-foreground">Continuously educate yourself about trading and risk management before risking real money.</p>
              </div>
            </div>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">5. Legal and Regulatory Considerations</h2>
            <ul className="text-muted-foreground space-y-1">
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Trading regulations vary by jurisdiction - ensure compliance with local laws</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Tax implications of trading profits and losses should be understood</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Some jurisdictions may restrict or prohibit certain types of trading</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Broker regulations and protections vary by country</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Consider consulting with financial and legal professionals</li>
            </ul>
          </section>

          <section className="signal-card p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">6. Suitability Assessment</h2>
            <h3 className="text-lg font-semibold mb-3">Before You Start Trading</h3>
            <p className="text-muted-foreground mb-3">Consider whether trading is suitable for you based on your:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Financial situation and investment objectives</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Risk tolerance and ability to withstand losses</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Trading experience and knowledge</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Time available for market monitoring</li>
              <li>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Access to necessary capital</li>
            </ul>
          </section>

          <section className="signal-card p-6 sm:p-8 border-l-4 border-l-loss">
            <h2 className="text-xl font-bold mb-4">Final Warning</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using our trading signals service, you acknowledge that you understand and accept these risks. We strongly recommend that you only trade with capital you can afford to lose and that you seek professional financial advice if you are unsure about any aspect of trading.
            </p>
          </section>

          <section className="signal-card p-6 sm:p-8 text-center">
            <h2 className="text-xl font-bold mb-3">Need Help Understanding Risks?</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about trading risks or need clarification on any points, our support team is here to help.
            </p>
            <a href="mailto:support@Market Signals24.com" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Contact Support
            </a>
          </section>

        </div>
      </main>
    </div>
  );
}
