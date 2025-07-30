import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            <strong>Version:</strong> v1.0 | <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="prose max-w-none space-y-6">
            <p className="lead">
              EaseBase respects your privacy. This policy explains how we collect, use, and protect your data.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. What We Collect</h2>
              <ul className="list-disc ml-6">
                <li>Name, email, company info</li>
                <li>Employee data (payroll, training, documents)</li>
                <li>Device/browser data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Why We Collect It</h2>
              <ul className="list-disc ml-6">
                <li>To operate and improve the Services</li>
                <li>To deliver payroll, training, and compliance tools</li>
                <li>To respond to support inquiries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
              <p>
                We do <strong>not sell</strong> your data. We may share it with:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Trusted vendors (e.g., payroll processors)</li>
                <li>Regulatory bodies if legally required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Security Measures</h2>
              <p>
                We use encryption, secure hosting, and access controls.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p>
                We retain data only as long as necessary for business or legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p>You can:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Request access to or deletion of your data</li>
                <li>Withdraw consent (where applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies & Tracking</h2>
              <p>
                We use cookies for session management and analytics. You may disable them in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Updates</h2>
              <p>
                We may update this policy. Material changes will be announced via email or system notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
              <p>
                For questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@easebase.com" className="text-primary hover:underline">
                  privacy@easebase.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;