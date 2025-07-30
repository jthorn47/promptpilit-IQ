import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, FileText, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { convertPalmsLiquorToWPVFormat, type WPVPlanData } from "@/utils/wpvDocumentConverter";
import { supabase } from "@/integrations/supabase/client";

interface WPVDocumentConverterProps {
  clientId: string;
  onConversionComplete?: (planData: WPVPlanData) => void;
}

export function WPVDocumentConverter({ clientId, onConversionComplete }: WPVDocumentConverterProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [convertedData, setConvertedData] = useState<WPVPlanData | null>(null);
  const [documentUrl, setDocumentUrl] = useState("");

  const handleConvertPalmsLiquor = async () => {
    setIsConverting(true);
    try {
      // For this specific document, we'll use the pre-parsed data
      const palmsLiquorContent = `Workplace Violence Prevention Program for Palms Liquor - converted document content`;
      
      const convertedPlan = convertPalmsLiquorToWPVFormat(palmsLiquorContent);
      setConvertedData(convertedPlan);
      
      toast.success("Document converted successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert document");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!convertedData) return;

    try {
      // Update the client's SBW9237 module with the converted data
      const { error } = await supabase
        .from('client_sbw9237_modules')
        .update({
          wpv_plan_content: convertedData.planContent,
          wpv_plan_type: 'html',
          updated_at: new Date().toISOString()
        })
        .eq('client_id', clientId);

      if (error) throw error;

      toast.success("WPV plan saved successfully!");
      onConversionComplete?.(convertedData);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save WPV plan");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            WPV Document Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document URL (Optional)</Label>
            <Input
              placeholder="https://example.com/document.docx"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleConvertPalmsLiquor}
              disabled={isConverting}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isConverting ? "Converting..." : "Convert Palms Liquor Document"}
            </Button>
          </div>

          {convertedData && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Document converted successfully!</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Company:</strong> {convertedData.companyName}
                </div>
                <div>
                  <strong>Industry:</strong> {convertedData.industry}
                </div>
                <div>
                  <strong>Effective Date:</strong> {convertedData.effectiveDate}
                </div>
                <div>
                  <strong>Plan Year:</strong> {convertedData.planYear}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Coordinator</Label>
                <div className="text-sm bg-muted p-2 rounded">
                  {convertedData.primaryCoordinator?.name} - {convertedData.primaryCoordinator?.title}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Factors</Label>
                <div className="flex flex-wrap gap-2">
                  {convertedData.riskFactors?.map((factor, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Converted Content Preview</Label>
                <Textarea
                  value={convertedData.planContent.substring(0, 500) + "..."}
                  readOnly
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>

              <Button onClick={handleSaveToDatabase} className="w-full">
                Save to WPV Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>This converter processes the Palms Liquor WPV document and transforms it into our standardized format.</p>
              <ul className="mt-2 space-y-1 ml-4 list-disc">
                <li>Company information and key personnel are extracted</li>
                <li>Risk factors are identified and categorized</li>
                <li>Security measures and procedures are restructured</li>
                <li>Content is formatted for our WPV plan viewer</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}