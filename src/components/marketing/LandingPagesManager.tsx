import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const LandingPagesManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log("LandingPagesManager rendering");

  const copyShareableLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Shareable link copied to clipboard",
      });
    });
  };

  const landingPages = [
    {
      id: "easeworks",
      title: "Easeworks HR Landing Page",
      description: "Landing page for HR services and Google Adwords campaigns",
      url: "/marketing/landing-pages/easeworks",
      status: "active"
    },
    {
      id: "accelerate-growth",
      title: "Accelerate Growth - PEO Landing Page",
      description: "PEO services landing page for growth acceleration campaigns",
      url: "/accelerate-growth",
      status: "active"
    },
    {
      id: "hr-solutions-assessment",
      title: "HR Solutions & Assessment Landing Page",
      description: "HR compliance assessment and solutions landing page",
      url: "/hr-solutions-assessment",
      status: "active"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground">Manage marketing landing pages and campaigns</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Landing Page
        </Button>
      </div>

      <div className="grid gap-4">
        {landingPages.map((page) => (
          <Card key={page.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription>{page.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    page.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {page.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(page.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Page
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyShareableLink(page.url)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm">
                  Analytics
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                URL: {page.url}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};