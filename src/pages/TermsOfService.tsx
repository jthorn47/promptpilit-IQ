import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">
            <strong>Version:</strong> v1.0 | <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="prose max-w-none space-y-6">
            <p className="lead">
              Welcome to EaseBase ("Company," "we," "our," or "us"). By accessing or using our services, 
              software platform, or website (collectively, the "Services"), you agree to be bound by these Terms of Service.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3">1. Use of Services</h2>
              <p>
                You agree to use the Services only for lawful purposes. You are responsible for keeping your 
                account credentials confidential.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Account Registration</h2>
              <p>
                You must provide accurate information and notify us of any changes. Company Admins are 
                responsible for user access within their organizations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Ownership & Rights</h2>
              <p>
                You retain ownership of all data you upload. We may process or store that data only to 
                deliver the Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Restrictions</h2>
              <p>You may not use the platform to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Violate any law</li>
                <li>Attempt unauthorized access</li>
                <li>Disrupt system integrity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Payment Terms</h2>
              <p>
                If applicable, subscription fees are non-refundable unless explicitly stated in a signed agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
              <p>
                We may suspend or terminate access if terms are violated or the law requires it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Warranty Disclaimer</h2>
              <p>
                Services are provided "as-is" with no warranty.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p>
                We are not liable for indirect or incidental damages. Total liability is limited to fees 
                paid in the previous 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p>
                We may update these Terms. Continued use after changes implies agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@easebase.com" className="text-primary hover:underline">
                  legal@easebase.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;