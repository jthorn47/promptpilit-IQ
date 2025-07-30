import { Button } from "@/components/ui/button";

export const NewsletterSignup = () => {
  return (
    <div className="bg-gray-50 rounded-3xl p-12 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Stay Updated with Expert Insights
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Subscribe to our weekly newsletter for the latest workplace safety trends, 
        compliance updates, and training best practices.
      </p>
      
      <div className="max-w-md mx-auto flex gap-4">
        <input
          type="email"
          placeholder="Enter your email address"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button className="bg-primary hover:bg-primary/90 px-6">
          Subscribe
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
};