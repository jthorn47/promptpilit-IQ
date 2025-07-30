
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePredictiveAnalysis } from '../../hooks/useAnalytics';

interface PredictiveModelingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export const PredictiveModelingModal: React.FC<PredictiveModelingModalProps> = ({
  open,
  onOpenChange,
  companyId,
}) => {
  const { data: models, isLoading, error } = usePredictiveAnalysis(companyId);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const runPrediction = (modelId: string) => {
    setSelectedModel(modelId);
    // Simulate prediction run
    setTimeout(() => {
      setSelectedModel(null);
    }, 2000);
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Predictive Modeling</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p>Error loading predictive models. Please try again later.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Predictive Modeling</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading predictive models...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models?.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {model.model_name}
                      <Badge variant="outline">{model.model_type}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Confidence Score</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${model.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{Math.round(model.confidence_score * 100)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Model Accuracy</h4>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{Math.round(model.model_accuracy * 100)}%</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => runPrediction(model.id)}
                        disabled={selectedModel === model.id}
                        className="w-full"
                      >
                        {selectedModel === model.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Running Prediction...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Run Prediction
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
