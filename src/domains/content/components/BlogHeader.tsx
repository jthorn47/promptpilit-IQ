import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const BlogHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/8fe37e66-d41f-4e29-9f60-6cc6b334903d.png" 
                alt="ease.learn" 
                className="h-10 w-auto"
              />
            </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};