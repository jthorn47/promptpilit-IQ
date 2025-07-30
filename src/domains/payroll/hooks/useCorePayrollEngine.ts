
import { useState } from 'react';
import { CorePayrollEngine } from '../engine/CorePayrollEngine';
import { PayrollCalculationInput, PayrollCalculationOutput, CalculationContext } from '../engine/types';

export const useCorePayrollEngine = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<PayrollCalculationOutput | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  const calculatePayroll = async (
    input: PayrollCalculationInput,
    context?: Partial<CalculationContext>
  ): Promise<PayrollCalculationOutput | null> => {
    setIsCalculating(true);
    setCalculationError(null);

    try {
      const fullContext: CalculationContext = {
        employee_id: input.employee_id,
        pay_period: {
          start: new Date(input.pay_period_start),
          end: new Date(input.pay_period_end)
        },
        simulation: input.simulation || false,
        engine_version: '2.0.0',
        calculation_timestamp: new Date(),
        ...context
      };

      const result = await CorePayrollEngine.calculatePayroll(input, fullContext);
      setLastCalculation(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
      setCalculationError(errorMessage);
      console.error('Payroll calculation error:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  const generateReport = (input: PayrollCalculationInput, output: PayrollCalculationOutput): string => {
    return CorePayrollEngine.generateCalculationReport(input, output);
  };

  const simulatePayroll = async (
    input: PayrollCalculationInput,
    context?: Partial<CalculationContext>
  ): Promise<PayrollCalculationOutput | null> => {
    return calculatePayroll({ ...input, simulation: true }, context);
  };

  return {
    calculatePayroll,
    simulatePayroll,
    generateReport,
    isCalculating,
    lastCalculation,
    calculationError,
    isMockMode: false, // TODO: Implement mock mode detection
    clearError: () => setCalculationError(null)
  };
};
