import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Play, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

export const WorkflowTestRunner = () => {
  const [isTestingCompanyFlow, setIsTestingCompanyFlow] = useState(false);
  const [isTestingECommerceFlow, setIsTestingECommerceFlow] = useState(false);
  const [companyFlowResult, setCompanyFlowResult] = useState<TestResult | null>(null);
  const [eCommerceFlowResult, setECommerceFlowResult] = useState<TestResult | null>(null);

  const testCompanyToClientFlow = async () => {
    setIsTestingCompanyFlow(true);
    setCompanyFlowResult(null);
    
    try {
      // Step 1: Create a test company
      const companyName = `Test Company ${Date.now()}`;
      const { data: company, error: companyError } = await supabase
        .from('company_settings')
        .insert({
          company_name: companyName,
          lifecycle_stage: 'lead',
          account_manager: 'test@easeworks.com',
          primary_contact_phone: '+1-555-0123'
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Step 2: Create a deal for this company
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          title: `Deal for ${companyName}`,
          company_name: companyName,
          contact_name: 'Test Contact',
          contact_email: 'test@company.com',
          value: 50000,
          currency: 'USD',
          status: 'in_progress',
          probability: 50,
          stage_id: (await supabase.from('deal_stages').select('id').limit(1).single()).data?.id,
          assigned_to: (await supabase.auth.getUser()).data.user?.id,
          expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .select()
        .single();

      if (dealError) throw dealError;

      // Step 3: Mark deal as won to trigger conversion
      const { error: updateError } = await supabase
        .from('deals')
        .update({ status: 'won' })
        .eq('id', deal.id);

      if (updateError) throw updateError;

      // Step 4: Check if client was created
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for trigger
      
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('company_name', companyName)
        .single();

      if (clientError || !client) {
        throw new Error('Client not created automatically');
      }

      // Step 5: Verify conversion audit trail
      const { data: audit } = await supabase
        .from('client_conversion_audit')
        .select('*')
        .eq('client_id', client.id)
        .single();

      setCompanyFlowResult({
        success: true,
        message: 'Company-to-Client workflow completed successfully!',
        data: {
          company: company,
          deal: deal,
          client: client,
          audit: audit
        }
      });

      toast.success('Company-to-Client workflow test passed!');

    } catch (error: any) {
      setCompanyFlowResult({
        success: false,
        message: `Company-to-Client workflow failed: ${error.message}`
      });
      toast.error('Company-to-Client workflow test failed');
    } finally {
      setIsTestingCompanyFlow(false);
    }
  };

  const testECommerceFlow = async () => {
    setIsTestingECommerceFlow(true);
    setECommerceFlowResult(null);

    try {
      // Step 1: Simulate eCommerce purchase data
      const eCommerceData = {
        customer: {
          email: `test${Date.now()}@example.com`,
          name: 'E-Commerce Test Customer'
        },
        company_name: `E-Commerce Test Company ${Date.now()}`,
        amount_total: 14999, // $149.99 in cents
        currency: 'usd',
        subscription_id: `sub_test_${Date.now()}`,
        customer_id: `cus_test_${Date.now()}`,
        line_items: [{
          price: { metadata: { employees: '25' } },
          quantity: 1
        }]
      };

      // Step 2: Call the Stripe webhook function to simulate eCommerce purchase
      const { data: webhookResult, error: webhookError } = await supabase.functions.invoke('stripe-webhook', {
        body: {
          type: 'checkout.session.completed',
          data: {
            object: eCommerceData
          }
        }
      });

      if (webhookError) throw webhookError;

      // Step 3: Check if client was created directly (not company)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for processing
      
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('company_name', eCommerceData.company_name)
        .single();

      if (clientError || !client) {
        throw new Error('Client not created from eCommerce purchase');
      }

      // Step 4: Verify source is eCommerce
      if (client.source !== 'eCommerce') {
        throw new Error(`Expected source 'eCommerce', got '${client.source}'`);
      }

      // Step 5: Verify no company record was created
      const { data: company } = await supabase
        .from('company_settings')
        .select('*')
        .eq('company_name', eCommerceData.company_name)
        .maybeSingle();

      if (company) {
        throw new Error('Company record should not be created for eCommerce purchases');
      }

      setECommerceFlowResult({
        success: true,
        message: 'E-Commerce direct-to-client workflow completed successfully!',
        data: {
          client: client,
          webhookResult: webhookResult
        }
      });

      toast.success('E-Commerce workflow test passed!');

    } catch (error: any) {
      setECommerceFlowResult({
        success: false,
        message: `E-Commerce workflow failed: ${error.message}`
      });
      toast.error('E-Commerce workflow test failed');
    } finally {
      setIsTestingECommerceFlow(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Testing Dashboard</CardTitle>
          <CardDescription>
            Test the two main workflows: Company-to-Client conversion and eCommerce direct client creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company-to-Client Flow Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Company-to-Client Conversion Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Creates company → creates deal → marks deal as won → triggers client migration
                </p>
              </div>
              <Button
                onClick={testCompanyToClientFlow}
                disabled={isTestingCompanyFlow}
                variant="outline"
              >
                {isTestingCompanyFlow ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Test Company Flow
              </Button>
            </div>

            {companyFlowResult && (
              <Card className={companyFlowResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    {companyFlowResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={companyFlowResult.success ? "text-green-800" : "text-red-800"}>
                      {companyFlowResult.message}
                    </span>
                  </div>
                  {companyFlowResult.data && (
                    <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-auto">
                      {JSON.stringify(companyFlowResult.data, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* E-Commerce Flow Test */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">E-Commerce Direct Client Creation Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Simulates Stripe purchase → creates client directly → skips company creation
                </p>
              </div>
              <Button
                onClick={testECommerceFlow}
                disabled={isTestingECommerceFlow}
                variant="outline"
              >
                {isTestingECommerceFlow ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Test E-Commerce Flow
              </Button>
            </div>

            {eCommerceFlowResult && (
              <Card className={eCommerceFlowResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    {eCommerceFlowResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={eCommerceFlowResult.success ? "text-green-800" : "text-red-800"}>
                      {eCommerceFlowResult.message}
                    </span>
                  </div>
                  {eCommerceFlowResult.data && (
                    <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-auto">
                      {JSON.stringify(eCommerceFlowResult.data, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                testCompanyToClientFlow();
                setTimeout(() => testECommerceFlow(), 5000); // Run second test after first completes
              }}
              disabled={isTestingCompanyFlow || isTestingECommerceFlow}
              className="flex-1"
            >
              Run Both Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};