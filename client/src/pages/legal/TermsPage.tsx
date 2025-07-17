import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../../components/common/Logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={32} />
            <span className="font-bold text-xl">SparkLink</span>
          </Link>
          <Link 
            to="/register" 
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign Up
          </Link>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6 py-12"
      >
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: January 3, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SparkLink ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              SparkLink is a portfolio builder platform that allows users to create professional portfolios and personal websites. We provide tools for profile management, page creation, gallery management, and analytics.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use the service</li>
              <li>One person or legal entity may not maintain more than one free account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Content Guidelines</h2>
            <p>You agree not to upload, post, or transmit content that:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Is illegal, harmful, threatening, abusive, or harassing</li>
              <li>Infringes any patent, trademark, copyright, or other intellectual property rights</li>
              <li>Contains viruses or other harmful computer code</li>
              <li>Is spam or unsolicited promotional material</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Subscription Plans</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>STARTER plan is free with limited features</li>
              <li>RISE and BLAZE plans are paid subscriptions with additional features</li>
              <li>Subscription fees are billed in advance and are non-refundable</li>
              <li>You may cancel your subscription at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@sparklink.com" className="text-primary hover:underline">
                legal@sparklink.com
              </a>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
