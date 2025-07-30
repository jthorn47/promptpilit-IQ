// HALOcalc Simulator Modal Component
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HaloButton } from '@/components/ui/halo-button';
import { HaloCard } from '@/components/ui/halo-card';
import { HaloInput } from '@/components/ui/halo-input';
import { HaloBadge } from '@/components/ui/halo-badge';
import { useHALOcalc } from '../hooks/useHALOcalc';
import { Zap, TrendingUp, TrendingDown, Equal, Play } from 'lucide-react';
import { SimulationConfig, SimulationScenario } from '../types';

interface HALOcalcSimulatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HALOcalcSimulatorModal: React.FC<HALOcalcSimulatorModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { simulate, isSimulating } = useHALOcalc();
  const [selectedMode, setSelectedMode] = useState<'wage_change' | 'bonus_impact'>('wage_change');
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([
    {
      id: '1',
      name: 'Current Baseline',
      description: 'Current wages and benefits',
      changes: {}
    }
  ]);

  const simulationModes = [
    {
      id: 'wage_change' as const,
      name: 'Wage Changes',
      description: 'Test impact of salary adjustments',
      icon: TrendingUp,
      color: 'primary'
    },
    {
      id: 'bonus_impact' as const,
      name: 'Bonus Impact',
      description: 'Analyze bonus distribution effects',
      icon: Zap,
      color: 'accent'
    }
  ];

  const addScenario = () => {
    const newScenario: SimulationScenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length}`,
      description: 'New simulation scenario',
      changes: {
        wage_adjustments: selectedMode === 'wage_change' ? { base_salary: 50000 } : undefined,
        bonus_additions: selectedMode === 'bonus_impact' ? [{
          id: Date.now().toString(),
          type: 'performance',
          amount: 5000,
          description: 'Performance bonus',
          is_taxable: true,
          approval_required: false
        }] : undefined
      }
    };
    setScenarios([...scenarios, newScenario]);
  };

  const runSimulation = async () => {
    const config: SimulationConfig = {
      mode: selectedMode,
      scenarios: scenarios.slice(1), // Exclude baseline
      compare_to_baseline: true
    };

    try {
      await simulate.mutateAsync({
        baseline_inputs: [], // Would be populated with actual employee data
        simulation_config: config,
        options: {
          include_detailed_breakdown: true,
          enable_ai_explanations: true
        }
      });
    } catch (error) {
      console.error('Simulation failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-6 h-6 text-accent" />
            HALOcalc Simulation Mode
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Mode Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Simulation Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {simulationModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                return (
                  <HaloCard 
                    key={mode.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <div className="p-4 text-center">
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <h4 className="font-medium">{mode.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                    </div>
                  </HaloCard>
                );
              })}
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Scenarios</h3>
              <HaloButton size="sm" onClick={addScenario}>
                Add Scenario
              </HaloButton>
            </div>
            
            <div className="space-y-3">
              {scenarios.map((scenario, index) => (
                <HaloCard key={scenario.id} className={index === 0 ? 'bg-muted/30' : ''}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{scenario.name}</h4>
                        {index === 0 && <HaloBadge variant="secondary" size="sm">Baseline</HaloBadge>}
                      </div>
                      {index > 0 && (
                        <div className="flex items-center gap-2">
                          <HaloBadge variant="outline" size="sm">
                            {selectedMode === 'wage_change' ? 'Wage Change' : 'Bonus Impact'}
                          </HaloBadge>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                    
                    {index > 0 && selectedMode === 'wage_change' && (
                      <div className="grid grid-cols-2 gap-3">
                        <HaloInput
                          placeholder="Base salary change"
                          defaultValue="50000"
                          type="number"
                        />
                        <HaloInput
                          placeholder="Percentage increase"
                          defaultValue="5"
                          type="number"
                        />
                      </div>
                    )}
                    
                    {index > 0 && selectedMode === 'bonus_impact' && (
                      <div className="grid grid-cols-3 gap-3">
                        <HaloInput
                          placeholder="Bonus amount"
                          defaultValue="5000"
                          type="number"
                        />
                        <HaloInput
                          placeholder="Bonus type"
                          defaultValue="Performance"
                        />
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Taxable</span>
                        </div>
                      </div>
                    )}
                  </div>
                </HaloCard>
              ))}
            </div>
          </div>

          {/* Expected Results Preview */}
          <HaloCard>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3">Expected Impact Preview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Gross Pay</span>
                  </div>
                  <p className="text-2xl font-bold text-success">+8.5%</p>
                  <p className="text-xs text-muted-foreground">Est. increase</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium">Tax Burden</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">+12.3%</p>
                  <p className="text-xs text-muted-foreground">Est. increase</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Equal className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Net Impact</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">+6.8%</p>
                  <p className="text-xs text-muted-foreground">Net increase</p>
                </div>
              </div>
            </div>
          </HaloCard>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <HaloButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </HaloButton>
          <HaloButton 
            onClick={runSimulation}
            disabled={isSimulating || scenarios.length <= 1}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
          </HaloButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};