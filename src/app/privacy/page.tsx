'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <Shield className="w-10 h-10 text-cyan" />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
            Privacy Policy
          </h1>
        </div>
        <p className="text-cyan-700 dark:text-white text-lg">
          Last Updated: February 5, 2026
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto glass-card p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            Welcome to PSP.Pro (Proper Sports Performance). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our PSP.Pro platform and training services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            We collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>Register for an account</li>
            <li>Book training sessions</li>
            <li>Use our PSP.Pro dashboard</li>
            <li>Contact us with inquiries</li>
            <li>Subscribe to our newsletter or communications</li>
          </ul>
          <p className="text-cyan-700 dark:text-white leading-relaxed mt-4">
            This information may include: name, email address, phone number, date of birth, athletic position, training goals, performance metrics (velocity data, drill completion), payment information, and other information you choose to provide.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>Provide and manage your training services and PSP.Pro access</li>
            <li>Process your bookings and payments</li>
            <li>Track your athletic performance and progress</li>
            <li>Send you training updates, drill assignments, and performance reports</li>
            <li>Communicate with you about your account and services</li>
            <li>Improve our platform and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Security</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            We implement appropriate technical and organizational security measures to protect your personal information. Your data is stored securely using industry-standard encryption. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Sharing Your Information</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>Your assigned coaches and trainers (to provide your training services)</li>
            <li>Service providers (payment processors, email services, analytics)</li>
            <li>Legal authorities (when required by law)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Your Privacy Rights</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Opt-out of marketing communications at any time</li>
            <li>Export a copy of your personal data in portable format</li>
          </ul>
          <p className="text-cyan-700 dark:text-white leading-relaxed mt-4">
            Logged-in users can exercise these rights directly in{' '}
            <Link href="/settings?tab=privacy" className="text-cyan hover:underline">
              Settings → Privacy &amp; Data
            </Link>
            . You can download your data, manage marketing preferences, or permanently delete your account there.
            You may also contact us at{' '}
            <a href="mailto:privacy@propersports.pro" className="text-cyan hover:underline">
              privacy@propersports.pro
            </a>{' '}
            for manual assistance.
          </p>
        </section>

        <section id="ccpa">
          <h2 className="text-2xl font-bold text-white mb-4">7. California Privacy Rights (CCPA/CPRA)</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed mb-4">
            If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
          </p>
          <ul className="list-disc list-inside text-cyan-700 dark:text-white space-y-2 ml-4">
            <li><strong className="text-white">Right to Know:</strong> Request disclosure of the personal information we collect, use, or share</li>
            <li><strong className="text-white">Right to Delete:</strong> Request deletion of your personal information</li>
            <li><strong className="text-white">Right to Correct:</strong> Request correction of inaccurate personal information</li>
            <li><strong className="text-white">Right to Opt-Out:</strong> Opt-out of the sale or sharing of personal information</li>
            <li><strong className="text-white">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
          </ul>
          <p className="text-cyan-700 dark:text-white leading-relaxed mt-4">
            <strong className="text-white">We do not sell your personal information</strong> to third parties, and we do not share it for cross-context behavioral advertising.
          </p>
          <p className="text-cyan-700 dark:text-white leading-relaxed mt-4">
            To exercise your California privacy rights, visit{' '}
            <Link href="/settings?tab=privacy" className="text-cyan hover:underline">
              Settings → Privacy &amp; Data
            </Link>{' '}
            or contact{' '}
            <a href="mailto:privacy@propersports.pro" className="text-cyan hover:underline">
              privacy@propersports.pro
            </a>.{' '}
            <a href="#do-not-sell" className="text-cyan hover:underline">
              Do Not Sell or Share My Personal Information
            </a>
          </p>
          <div id="do-not-sell" className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-sm text-cyan-700 dark:text-white">
              <strong className="text-white">Do Not Sell or Share:</strong> PSP.Pro does not sell or share personal information. If you still wish to opt out of any future data sharing, email{' '}
              <a href="mailto:privacy@propersports.pro" className="text-cyan hover:underline">privacy@propersports.pro</a>{' '}
              with subject "Do Not Sell — California Opt-Out".
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Cookies and Tracking</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            We use essential cookies for authentication and session management (required for the platform to function).
            We may use optional analytics cookies to improve your experience. You can manage your cookie preferences
            using the cookie consent banner when you first visit the site, or by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy (COPPA)</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            Our services are used by athletes of all ages, including minors. Athletes under 13 may not self-register
            and must be enrolled directly by a coach or admin. Athletes ages 13–17 must provide parent or guardian
            contact information at signup, and we notify the parent or guardian when an account is created.
            We do not use minor athletes' data for marketing or share it with third parties.
            Parents may contact{' '}
            <a href="mailto:privacy@propersports.pro" className="text-cyan hover:underline">
              privacy@propersports.pro
            </a>{' '}
            to review, correct, or delete their child's information at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            If you have questions about this Privacy Policy, please contact us:
          </p>
          <div className="mt-4 space-y-2 text-cyan-700 dark:text-white">
            <p>
              <strong className="text-white">Email:</strong>{' '}
              <a href="mailto:privacy@propersports.pro" className="text-cyan hover:underline">
                privacy@propersports.pro
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
          <Link href="/terms" className="text-cyan hover:underline">
            View Terms of Service →
          </Link>
          <Link href="/contact" className="text-cyan hover:underline">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  )
}
