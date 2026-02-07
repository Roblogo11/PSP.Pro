'use client'

import Link from 'next/link'
import { FileText, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-cyan-700 dark:text-white hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-10 h-10 text-orange" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
            Terms of Service
          </h1>
        </div>
        <p className="text-cyan-700 dark:text-white text-lg">
          Last Updated: February 5, 2026
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto glass-card p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            By accessing or using PSP.Pro (Proper Sports Performance) PSP.Pro platform and training services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Services Provided</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            PSP.Pro provides:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>In-person baseball and softball training sessions</li>
            <li>PSP.Pro digital platform for performance tracking</li>
            <li>Access to premium training drill library</li>
            <li>Velocity tracking and progress analytics</li>
            <li>Personalized coaching and drill assignments</li>
            <li>Session booking and management tools</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            You must create an account to use our services. You agree to provide accurate, current, and complete information and to update it as necessary. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. For users under 18, parental or guardian consent is required.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Payment and Billing</h2>
          <div className="space-y-4 text-cyan-700 dark:text-white leading-relaxed">
            <p>
              <strong className="text-white">Pricing:</strong> Training session prices and subscription fees are as displayed on our pricing page. We reserve the right to change pricing with 30 days notice to active subscribers.
            </p>
            <p>
              <strong className="text-white">Payment:</strong> Payment is required at the time of booking for individual sessions or upfront for training packages and subscriptions.
            </p>
            <p>
              <strong className="text-white">Refunds:</strong> Session cancellations made at least 24 hours in advance are eligible for rescheduling or credit. No-shows or cancellations within 24 hours are non-refundable. Training packages are non-refundable but may be paused for injuries (with documentation).
            </p>
            <p>
              <strong className="text-white">Subscriptions:</strong> Monthly subscriptions automatically renew unless cancelled at least 7 days before the next billing cycle.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Cancellation and Scheduling</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            Cancellation and rescheduling policies:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>Cancel or reschedule sessions at least 24 hours in advance via the PSP.Pro platform</li>
            <li>Late cancellations (less than 24 hours) result in forfeiture of that session</li>
            <li>Package sessions expire 6 months from purchase date</li>
            <li>Weather cancellations by PSP.Pro will be rescheduled at no charge</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Assumption of Risk and Liability</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            Athletic training involves inherent risks. By participating, you acknowledge and accept these risks, including but not limited to:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>Physical injury from training activities</li>
            <li>Overuse injuries or muscle strain</li>
            <li>Equipment-related injuries</li>
            <li>Pre-existing condition aggravation</li>
          </ul>
          <p className="text-cyan-700 dark:text-white leading-relaxed mt-4">
            You agree to release PSP.Pro, its coaches, and staff from liability for injuries sustained during training, except in cases of gross negligence or willful misconduct. You are responsible for obtaining medical clearance before participating in training programs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. PSP.Pro Platform Usage</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            When using the PSP.Pro platform, you agree to:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>Use the platform only for lawful purposes</li>
            <li>Not share your account credentials with others</li>
            <li>Not attempt to access other users' data or accounts</li>
            <li>Not interfere with platform security or functionality</li>
            <li>Not scrape, copy, or redistribute platform content without permission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            All content on the PSP.Pro platform, including training videos, drill instructions, analytics tools, and branding, is owned by PSP.Pro and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Performance Data</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            Your performance data (velocity measurements, drill completion, progress metrics) is stored securely and used to provide your training services. You retain ownership of your data and may export it at any time. We may use aggregated, anonymized data for improving our services and research purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            We reserve the right to suspend or terminate your account for violation of these terms, including but not limited to: abusive behavior toward staff, damage to facility property, fraudulent payment activity, or misuse of the platform. You may terminate your account at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">11. Limitation of Liability</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            To the fullest extent permitted by law, PSP.Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, or goodwill arising from your use of our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            These Terms are governed by the laws of the Commonwealth of Virginia, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Virginia Beach, Virginia.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            We may modify these Terms at any time. We will notify active users of material changes via email or platform notification. Continued use of our services after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            For questions about these Terms of Service:
          </p>
          <div className="mt-4 space-y-2 text-cyan-700 dark:text-white">
            <p>
              <strong className="text-white">Email:</strong>{' '}
              <a href="mailto:legal@propersports.pro" className="text-orange hover:underline">
                legal@propersports.pro
              </a>
            </p>
            <p>
              <strong className="text-white">Address:</strong> Proper Sports Performance, Virginia Beach, VA
            </p>
            <p>
              <strong className="text-white">Phone:</strong> (757) 555-0100
            </p>
          </div>
        </section>

        {/* Footer Links */}
        <div className="pt-8 border-t border-cyan-200/40 flex flex-col sm:flex-row gap-4 justify-between">
          <Link href="/privacy" className="text-orange hover:underline">
            View Privacy Policy →
          </Link>
          <Link href="/contact" className="text-orange hover:underline">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  )
}
