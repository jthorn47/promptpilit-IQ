import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Info,
  Calendar,
  DollarSign,
  Minus,
  Eye
} from 'lucide-react';

const PayStubViewer: React.FC = () => {
  const [selectedStub, setSelectedStub] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareStub, setCompareStub] = useState<string | null>(null);

  const { data: payStubs, isLoading } = useQuery({
    queryKey: ['employee-pay-stubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_pay_stubs')
        .select('*')
        .order('pay_date', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      return data;
    }
  });

  const selectedStubData = payStubs?.find(stub => stub.id === selectedStub);
  const compareStubData = payStubs?.find(stub => stub.id === compareStub);

  const downloadPDF = async (stubId: string) => {
    // TODO: Implement PDF download functionality
    console.log('Downloading PDF for stub:', stubId);
  };

  const downloadCSV = async (stubId: string) => {
    // TODO: Implement CSV download functionality
    console.log('Downloading CSV for stub:', stubId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted/50 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold">Pay Stub Viewer</h2>
          <p className="text-muted-foreground">Interactive pay summary and history</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            onClick={() => setCompareMode(!compareMode)}
            className="hover-scale"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {compareMode ? 'Exit Compare' : 'Compare Mode'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pay Stub List */}
        <div className="lg:col-span-1">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pay History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {payStubs?.map((stub, index) => (
                <motion.div
                  key={stub.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover-scale ${
                    selectedStub === stub.id 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-muted/30 border-border/30 hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedStub(stub.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        ${stub.net_pay?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(stub.pay_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(stub.pay_period_start).toLocaleDateString()} - {new Date(stub.pay_period_end).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={stub.status === 'issued' ? 'default' : 'secondary'}>
                      {stub.status}
                    </Badge>
                  </div>
                  {compareMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareStub(stub.id);
                      }}
                    >
                      {compareStub === stub.id ? 'Selected for Compare' : 'Select to Compare'}
                    </Button>
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Pay Stub Details */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedStubData ? (
              <motion.div
                key={selectedStub}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Pay Summary Card */}
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Pay Summary
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadPDF(selectedStub!)}
                          className="hover-scale"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadCSV(selectedStub!)}
                          className="hover-scale"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Gross to Net Flow */}
                      <div className="md:col-span-3 mb-4">
                        <h3 className="font-semibold mb-4">Gross → Net Flow</h3>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ${selectedStubData.gross_pay?.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Gross Pay</div>
                          </div>
                          <Minus className="w-6 h-6 text-muted-foreground" />
                          <div className="text-center">
                            <div className="text-xl font-semibold text-red-500">
                              ${selectedStubData.total_taxes?.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Taxes</div>
                          </div>
                          <Minus className="w-6 h-6 text-muted-foreground" />
                          <div className="text-center">
                            <div className="text-xl font-semibold text-orange-500">
                              ${selectedStubData.total_deductions?.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Deductions</div>
                          </div>
                          <div className="text-2xl font-bold">=</div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              ${selectedStubData.net_pay?.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Net Pay</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Breakdowns */}
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Earnings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {selectedStubData.earnings_breakdown && Object.entries(selectedStubData.earnings_breakdown as any).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center gap-1 text-sm">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    <Info className="w-3 h-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Detailed explanation of {key}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="font-medium">${(value as number)?.toLocaleString()}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Taxes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {selectedStubData.tax_breakdown && Object.entries(selectedStubData.tax_breakdown as any).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center gap-1 text-sm">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    <Info className="w-3 h-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>What is {key} and why you pay it</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="font-medium text-red-600">-${(value as number)?.toLocaleString()}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Deductions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {selectedStubData.deduction_breakdown && Object.entries(selectedStubData.deduction_breakdown as any).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center gap-1 text-sm">
                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    <Info className="w-3 h-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Explanation of {key} deduction</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="font-medium text-orange-600">-${(value as number)?.toLocaleString()}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison View */}
                {compareMode && compareStubData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Pay Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold">Metric</h4>
                            <div className="space-y-2">
                              <div>Gross Pay</div>
                              <div>Total Taxes</div>
                              <div>Total Deductions</div>
                              <div>Net Pay</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold">Current</h4>
                            <div className="space-y-2">
                              <div>${selectedStubData.gross_pay?.toLocaleString()}</div>
                              <div className="text-red-600">${selectedStubData.total_taxes?.toLocaleString()}</div>
                              <div className="text-orange-600">${selectedStubData.total_deductions?.toLocaleString()}</div>
                              <div className="font-bold">${selectedStubData.net_pay?.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold">Previous</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                ${compareStubData.gross_pay?.toLocaleString()}
                                {selectedStubData.gross_pay! > compareStubData.gross_pay! ? (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className="text-red-600">${compareStubData.total_taxes?.toLocaleString()}</div>
                              <div className="text-orange-600">${compareStubData.total_deductions?.toLocaleString()}</div>
                              <div className="font-bold">${compareStubData.net_pay?.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-96 text-center"
              >
                <Eye className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Pay Stub</h3>
                <p className="text-muted-foreground">
                  Choose a pay stub from the list to view detailed information
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PayStubViewer;