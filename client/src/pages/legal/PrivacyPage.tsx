import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../../components/common/Logo";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: January 3, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Account information (email, name, profile details)</li>
              <li>Portfolio content (pages, images, text)</li>
              <li>Payment information for subscription plans</li>
              <li>Communications with our support team</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and manage subscriptions</li>
              <li>Send you technical notices and support messages</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share information with:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
              <li>Business partners for analytics (anonymized data only)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Export your portfolio data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Analytics</h2>
            <p>
              We use cookies and similar technologies to analyze usage patterns and improve our service. You can control cookie settings through your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@sparklink.com" className="text-primary hover:underline">
                privacy@sparklink.com
              </a>
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
