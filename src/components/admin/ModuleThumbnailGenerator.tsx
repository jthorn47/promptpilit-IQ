import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Loader2, Palette, Check } from "lucide-react";
import { MODULE_DEFINITIONS, ModuleDefinition } from "@/types/modules";

interface GeneratedThumbnail {
  id: number;
  image: string;
  prompt: string;
}

export const ModuleThumbnailGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<Record<string, GeneratedThumbnail[]>>({});
  const [selectedThumbnails, setSelectedThumbnails] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const getModulePrompt = (module: ModuleDefinition): string => {
    const categoryPrompts = {
      core: "Professional business foundation, reliable systems, modern office environment, blue and green corporate theme",
      hr: "People-focused workplace, employee collaboration, professional team interactions, diverse workforce, warm welcoming colors",
      finance: "Financial accuracy, accounting systems, money management, professional calculations, green and gold financial theme",
      premium: "Sophisticated enterprise solutions, advanced technology, executive-level professional environments, premium aesthetic"
    };

    const moduleSpecificPrompts: Record<string, string> = {
      lms: "Modern e-learning platform, digital education interface, online training dashboard, graduation elements, knowledge sharing",
      assessments: "Risk evaluation documents, compliance checklists, audit processes, analysis charts, professional assessment tools",
      payroll: "Payroll calculation interfaces, payment processing systems, financial spreadsheets, accounting software, monetary symbols",
      ats: "Hiring process technology, candidate interviews, recruitment dashboard, job application systems, professional recruitment",
      onboarding: "New employee welcome, orientation process, document signing, workplace introduction, team integration",
      benefits: "Employee wellness programs, health insurance materials, benefit packages, care and support imagery, wellness themes",
      performance: "Performance review meetings, goal setting, employee development, progress tracking, achievement recognition",
      scheduling: "Work schedule calendars, shift planning, time management, workforce coordination, organizational systems",
      processing_schedules: "Automated batch processing, scheduled operations, timing systems, workflow automation, systematic processing",
      express_tracking: "Package tracking, logistics coordination, shipping management, delivery tracking, transportation systems",
      hr_management: "HR administrative systems, employee records, personnel management, professional HR office environment",
      workers_comp: "Safety reporting systems, incident documentation, worker protection, safety compliance, protective workplace",
      time_attendance: "Clock-in systems, time tracking devices, attendance monitoring, workforce management, punctuality themes",
      wpv_wizard: "Workplace safety planning, violence prevention training, security protocols, safety compliance documentation",
      crm: "Customer relationship interfaces, sales pipeline dashboards, client management systems, business relationship building",
      compliance: "Regulatory documentation, audit trails, compliance checklists, legal requirements, regulatory compliance systems",
      reports: "Data visualization dashboards, analytics charts, business reporting, statistical analysis, information displays",
      business_intelligence: "Advanced analytics platforms, data science visualizations, business insights, strategic dashboards"
    };

    const categoryPrompt = categoryPrompts[module.category];
    const specificPrompt = moduleSpecificPrompts[module.id] || `${module.name} professional interface, ${module.description}`;

    return `Professional corporate stock photography: ${specificPrompt}. ${categoryPrompt}. High-quality business environment, authentic workplace setting, professional lighting, modern office aesthetic. 16:9 aspect ratio, ultra-high resolution, premium corporate style.`;
  };

  const generateThumbnailsForModule = async (module: ModuleDefinition) => {
    setIsGenerating(true);
    setCurrentModule(module.id);
    
    toast({
      title: `Generating ${module.name} Thumbnails`,
      description: "Creating 6 AI-powered thumbnail options...",
      duration: 3000,
    });

    try {
      const prompt = getModulePrompt(module);
      console.log(`🎨 Generating thumbnails for ${module.name}:`, prompt);

      const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
        body: {
          prompt,
          title: module.name,
          description: module.description,
          moduleType: module.category,
          moduleId: module.id
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate thumbnails');
      }

      if (data?.images && data.images.length > 0) {
        setGeneratedThumbnails(prev => ({
          ...prev,
          [module.id]: data.images
        }));
        
        toast({
          title: `Generated ${data.images.length} Options`,
          description: `Choose your favorite thumbnail for ${module.name}!`,
        });
      } else {
        throw new Error('No thumbnail data received');
      }
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate thumbnails",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentModule(null);
    }
  };

  const generateAllThumbnails = async () => {
    setIsGenerating(true);
    
    toast({
      title: "Generating All Module Thumbnails",
      description: "This will take several minutes to complete...",
      duration: 5000,
    });

    try {
      for (const module of MODULE_DEFINITIONS) {
        if (!generatedThumbnails[module.id]) {
          setCurrentModule(module.id);
          await generateThumbnailsForModule(module);
          // Small delay between generations to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      toast({
        title: "All Thumbnails Generated!",
        description: "Review and select your preferred thumbnails for each module.",
      });
    } catch (error) {
      console.error('Batch generation error:', error);
      toast({
        title: "Batch generation failed",
        description: "Some thumbnails may not have been generated.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setCurrentModule(null);
    }
  };

  const selectThumbnail = (moduleId: string, imageUrl: string) => {
    setSelectedThumbnails(prev => ({
      ...prev,
      [moduleId]: imageUrl
    }));
    
    toast({
      title: "Thumbnail Selected",
      description: "Thumbnail will be applied to the module card.",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      core: "bg-blue-100 text-blue-800",
      hr: "bg-green-100 text-green-800", 
      finance: "bg-yellow-100 text-yellow-800",
      premium: "bg-purple-100 text-purple-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Module Thumbnail Generator</h2>
          <p className="text-muted-foreground">Generate AI-powered thumbnails for all platform modules</p>
        </div>
        <Button 
          onClick={generateAllThumbnails}
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Palette className="w-4 h-4 mr-2" />
              Generate All Thumbnails
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULE_DEFINITIONS.map((module) => (
          <Card key={module.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {module.name}
                    <Badge className={getCategoryColor(module.category)}>
                      {module.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {module.description}
                  </CardDescription>
                </div>
              </div>
              
              {/* Current/Selected Thumbnail */}
              {selectedThumbnails[module.id] && (
                <div className="mt-3">
                  <div className="relative">
                    <img 
                      src={selectedThumbnails[module.id]} 
                      alt={`${module.name} selected thumbnail`}
                      className="w-full h-24 object-cover rounded border-2 border-green-500"
                    />
                    <div className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => generateThumbnailsForModule(module)}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating && currentModule === module.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Thumbnails
                    </>
                  )}
                </Button>

                {/* Generated Thumbnails Grid */}
                {generatedThumbnails[module.id] && (
                  <div className="grid grid-cols-2 gap-2">
                    {generatedThumbnails[module.id].map((thumbnail) => (
                      <div
                        key={thumbnail.id}
                        className={`relative cursor-pointer border-2 rounded overflow-hidden transition-all ${
                          selectedThumbnails[module.id] === thumbnail.image
                            ? 'border-green-500 ring-2 ring-green-500 ring-opacity-50'
                            : 'border-transparent hover:border-primary'
                        }`}
                        onClick={() => selectThumbnail(module.id, thumbnail.image)}
                      >
                        <img
                          src={thumbnail.image}
                          alt={`${module.name} thumbnail option ${thumbnail.id}`}
                          className="w-full h-16 object-cover"
                        />
                        <div className={`absolute bottom-0 left-0 right-0 text-white text-xs p-1 text-center ${
                          selectedThumbnails[module.id] === thumbnail.image
                            ? 'bg-green-500 bg-opacity-90'
                            : 'bg-black bg-opacity-50'
                        }`}>
                          {selectedThumbnails[module.id] === thumbnail.image ? '✓ Selected' : `Option ${thumbnail.id}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};