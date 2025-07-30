import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, FileText, Video, Image, Presentation, Star } from "lucide-react";

export const BrokerMarketingToolkit = () => {
  // Mock marketing assets data
  const marketingAssets = [
    {
      id: 1,
      assetName: "HALO Payroll Service Brochure",
      assetType: "brochure",
      category: "product_specific",
      fileFormat: "PDF",
      fileSize: 2.4,
      description: "Comprehensive overview of HALOworks payroll services and benefits",
      whiteLabelAvailable: true,
      downloadCount: 156,
      isActive: true
    },
    {
      id: 2,
      assetName: "HR Technology Trends 2024",
      assetType: "presentation",
      category: "general",
      fileFormat: "PPTX",
      fileSize: 15.2,
      description: "Executive presentation on latest HR technology trends and opportunities",
      whiteLabelAvailable: true,
      downloadCount: 89,
      isActive: true
    },
    {
      id: 3,
      assetName: "Client Success Stories Video",
      assetType: "video",
      category: "general",
      fileFormat: "MP4",
      fileSize: 45.8,
      description: "Compelling testimonials from satisfied HALOworks clients",
      whiteLabelAvailable: false,
      downloadCount: 234,
      isActive: true
    },
    {
      id: 4,
      assetName: "ROI Calculator Tool",
      assetType: "interactive",
      category: "product_specific",
      fileFormat: "XLSX",
      fileSize: 1.1,
      description: "Interactive spreadsheet to calculate client ROI from HALO services",
      whiteLabelAvailable: true,
      downloadCount: 78,
      isActive: true
    },
    {
      id: 5,
      assetName: "HALO Logo Package",
      assetType: "logo",
      category: "general",
      fileFormat: "ZIP",
      fileSize: 5.6,
      description: "High-resolution HALO logos in various formats for co-branding",
      whiteLabelAvailable: false,
      downloadCount: 342,
      isActive: true
    },
    {
      id: 6,
      assetName: "Email Campaign Templates",
      assetType: "template",
      category: "general",
      fileFormat: "HTML",
      fileSize: 0.8,
      description: "Ready-to-use email templates for lead nurturing campaigns",
      whiteLabelAvailable: true,
      downloadCount: 125,
      isActive: true
    }
  ];

  const assetTypeIcons = {
    brochure: FileText,
    presentation: Presentation,
    video: Video,
    logo: Image,
    banner: Image,
    template: FileText,
    interactive: Star
  };

  const categoryColors = {
    general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    product_specific: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    event: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    seasonal: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Marketing Toolkit</h2>
        <p className="text-muted-foreground">Access professional sales and marketing materials</p>
      </div>

      {/* Toolkit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketingAssets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Available resources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              White Label
            </CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketingAssets.filter(a => a.whiteLabelAvailable).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Customizable assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {marketingAssets.reduce((total, asset) => total + asset.downloadCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total downloads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Popular
            </CardTitle>
            <Video className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-foreground">
              Success Stories
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.max(...marketingAssets.map(a => a.downloadCount))} downloads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Available Resources</CardTitle>
              <CardDescription>
                Professional marketing materials ready for use
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketingAssets.map((asset) => {
              const IconComponent = assetTypeIcons[asset.assetType as keyof typeof assetTypeIcons] || FileText;
              
              return (
                <Card key={asset.id} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base leading-tight">
                            {asset.assetName}
                          </CardTitle>
                        </div>
                      </div>
                      {asset.whiteLabelAvailable && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          White Label
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {asset.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Badge className={categoryColors[asset.category as keyof typeof categoryColors]}>
                        {asset.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {asset.fileFormat}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{asset.fileSize} MB</span>
                      <span>{asset.downloadCount} downloads</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {asset.whiteLabelAvailable && (
                        <Button size="sm" variant="outline">
                          Customize
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* White Label Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            White Label Options
          </CardTitle>
          <CardDescription>
            Customize materials with your branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Available Customizations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Replace HALOworks logo with your brand</li>
                <li>• Add your company contact information</li>
                <li>• Customize color schemes and fonts</li>
                <li>• Include your value propositions</li>
                <li>• Add co-branding opportunities</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Request Custom Materials</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Need something specific? Our marketing team can create custom materials for your campaigns.
              </p>
              <Button variant="outline">
                Request Custom Asset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};