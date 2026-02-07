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
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your performance data</li>
          </ul>
          <p className="text-cyan-700 dark:text-white leading-relaxed mt-4">
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@propersports.pro" className="text-cyan hover:underline">
              privacy@propersports.pro
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
          <p className="text-cyan-700 dark:text-white leading-relaxed">
            Our services are used by athletes of all ages, including minors. If you are under 18, you must have parental or guardian consent to use our services. We do not knowingly collect information from children under 13 without parental consent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
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
