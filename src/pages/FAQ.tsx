import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Logo } from "@/components/ui/logo";
import { FAQCategory } from "@/components/faq/FAQCategory";
import { faqCategories, generateFAQSchemaData } from "@/data/faqData";

const FAQ = () => {
  const navigate = useNavigate();
  const faqSchemaData = generateFAQSchemaData();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Frequently Asked Questions - Workplace Safety Training | EaseLearn"
        description="Get answers to common questions about workplace violence prevention training, California SB 553 compliance, training requirements, and our platform features."
        keywords="workplace safety FAQ, California SB 553 questions, workplace violence training questions, compliance requirements FAQ, employee training FAQ"
        canonicalUrl="https://easelearn.com/faq"
        schemaData={faqSchemaData}
      />

      {/* Header */}
      <PageHeader>
        <Logo />
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      </PageHeader>

  <BreadcrumbNav items={[{ label: "Frequently Asked Questions" }]} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get answers to common questions about workplace safety training, compliance requirements, 
            and how EaseLearn can help protect your organization.
          </p>
        </div>

        {/* FAQ Categories */}
        {faqCategories.map((category, categoryIndex) => (
          <FAQCategory
            key={categoryIndex}
            category={category.category}
            questions={category.questions}
            categoryIndex={categoryIndex}
          />
        ))}

        {/* Contact CTA */}
        <div className="bg-gray-50 rounded-3xl p-12 text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our safety experts are here to help. Get personalized answers about compliance 
            requirements and training solutions for your organization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/assessment')}
              className="bg-primary hover:bg-primary/90"
            >
              Take Free Assessment
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'tel:888-843-0880'}
            >
              Call (888) 843-0880
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;