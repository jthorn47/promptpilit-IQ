import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Download, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface BenefitScenario {
  id: string;
  name: string;
  enrolled_employees: number;
  monthly_cost: number;
  annual_cost: number;
  created_at: string;
  tier_distribution: any;
  employer_contribution: any;
  assumed_premiums: any;
}

interface CostProjectionsProps {
  onRefresh?: number;
}

export const CostProjections: React.FC<CostProjectionsProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<BenefitScenario[]>([]);
  const [loading, setLoading] = useState(true);

  const budgetThreshold = 500000; // $500k annual budget threshold

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('benefit_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios(data || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to load scenarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  useEffect(() => {
    if (onRefresh !== undefined) {
      fetchScenarios();
    }
  }, [onRefresh]);

  const exportToCSV = () => {
    const headers = ['Scenario Name', 'Employees', 'Monthly Cost', 'Annual Cost', 'Exceeds Budget'];
    const csvData = scenarios.map(scenario => [
      scenario.name,
      scenario.enrolled_employees.toString(),
      `$${scenario.monthly_cost?.toLocaleString() || '0'}`,
      `$${scenario.annual_cost?.toLocaleString() || '0'}`,
      (scenario.annual_cost || 0) > budgetThreshold ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cost-projections.csv';
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Cost projections exported to CSV"
    });
  };

  const exportToPDF = () => {
    // Stubbed PDF export functionality
    toast({
      title: "PDF Export",
      description: "PDF export functionality would be implemented here"
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading cost projections...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scenarios Found</h3>
            <p className="text-muted-foreground">Create some cost scenarios first to run projections.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {scenarios.length}
              </div>
              <div className="text-sm text-blue-600">Total Scenarios</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${Math.min(...scenarios.map(s => s.annual_cost || 0)).toLocaleString()}
              </div>
              <div className="text-sm text-green-600">Lowest Annual Cost</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {scenarios.filter(s => (s.annual_cost || 0) > budgetThreshold).length}
              </div>
              <div className="text-sm text-orange-600">Exceed Budget Threshold</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projections Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Cost Projections
              </CardTitle>
              <CardDescription>
                Financial projections for all scenarios (Budget threshold: ${budgetThreshold.toLocaleString()}/year)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario Name</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Monthly Cost</TableHead>
                <TableHead className="text-right">Annual Cost</TableHead>
                <TableHead className="text-center">Budget Status</TableHead>
                <TableHead className="text-center">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => {
                const exceedsBudget = (scenario.annual_cost || 0) > budgetThreshold;
                const savings = budgetThreshold - (scenario.annual_cost || 0);
                
                return (
                  <TableRow key={scenario.id}>
                    <TableCell className="font-medium">{scenario.name}</TableCell>
                    <TableCell className="text-right">{scenario.enrolled_employees}</TableCell>
                    <TableCell className="text-right">
                      ${scenario.monthly_cost?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={exceedsBudget ? 'text-red-600 font-bold' : 'text-green-600'}>
                        ${scenario.annual_cost?.toLocaleString() || '0'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {exceedsBudget ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Over Budget
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Under Budget
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(scenario.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost Comparison Chart (Visual representation) */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Comparison</CardTitle>
          <CardDescription>Visual comparison of annual costs across scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scenarios.map((scenario, index) => {
              const maxCost = Math.max(...scenarios.map(s => s.annual_cost || 0));
              const widthPercentage = ((scenario.annual_cost || 0) / maxCost) * 100;
              const exceedsBudget = (scenario.annual_cost || 0) > budgetThreshold;
              
              return (
                <div key={scenario.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{scenario.name}</span>
                    <span className={`text-sm font-bold ${exceedsBudget ? 'text-red-600' : 'text-green-600'}`}>
                      ${scenario.annual_cost?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className={`h-3 rounded-full ${exceedsBudget ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${widthPercentage}%` }}
                    />
                    {/* Budget threshold line */}
                    <div 
                      className="absolute top-0 w-0.5 h-3 bg-orange-400"
                      style={{ left: `${(budgetThreshold / maxCost) * 100}%` }}
                      title={`Budget threshold: $${budgetThreshold.toLocaleString()}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Orange line indicates budget threshold (${budgetThreshold.toLocaleString()}/year)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};