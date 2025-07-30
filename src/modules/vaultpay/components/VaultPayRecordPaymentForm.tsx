import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CalendarIcon, DollarSign, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PaymentAllocation {
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  remainingBalance: number;
  allocationAmount: number;
}

interface VaultPayRecordPaymentFormProps {
  expanded?: boolean;
}

export const VaultPayRecordPaymentForm = ({ expanded = false }: VaultPayRecordPaymentFormProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedCompany, setSelectedCompany] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [memo, setMemo] = useState("");
  const [allocationType, setAllocationType] = useState<"single" | "multiple">("single");
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [paymentAllocations, setPaymentAllocations] = useState<PaymentAllocation[]>([]);

  // Mock data - will be replaced with real Supabase queries
  const companies = [
    { id: "1", name: "Acme Corporation" },
    { id: "2", name: "TechStart LLC" },
    { id: "3", name: "Global Industries" },
    { id: "4", name: "Innovate Solutions" }
  ];

  const paymentMethods = [
    { value: "check", label: "Check" },
    { value: "ach", label: "ACH" },
    { value: "wire", label: "Wire Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "cash", label: "Cash" }
  ];

  // Mock invoices for selected company
  const mockInvoices = selectedCompany ? [
    { id: "1", number: "VP-0001", amount: 2500.00, balance: 2500.00 },
    { id: "2", number: "VP-0002", amount: 1800.00, balance: 1800.00 },
    { id: "3", number: "VP-0003", amount: 3200.00, balance: 1600.00 }
  ] : [];

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setSelectedInvoice("");
    setPaymentAllocations([]);
  };

  const handleAllocationTypeChange = (type: "single" | "multiple") => {
    setAllocationType(type);
    setSelectedInvoice("");
    setPaymentAllocations([]);
  };

  const addToAllocations = (invoiceId: string) => {
    const invoice = mockInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const existing = paymentAllocations.find(alloc => alloc.invoiceId === invoiceId);
    if (existing) return;

    setPaymentAllocations([...paymentAllocations, {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      invoiceAmount: invoice.amount,
      remainingBalance: invoice.balance,
      allocationAmount: Math.min(paymentAmount, invoice.balance)
    }]);
  };

  const updateAllocation = (invoiceId: string, amount: number) => {
    setPaymentAllocations(allocations =>
      allocations.map(alloc =>
        alloc.invoiceId === invoiceId 
          ? { ...alloc, allocationAmount: Math.min(amount, alloc.remainingBalance) }
          : alloc
      )
    );
  };

  const removeAllocation = (invoiceId: string) => {
    setPaymentAllocations(allocations =>
      allocations.filter(alloc => alloc.invoiceId !== invoiceId)
    );
  };

  const getTotalAllocated = () => {
    return paymentAllocations.reduce((sum, alloc) => sum + alloc.allocationAmount, 0);
  };

  const handleRecordPayment = async () => {
    if (!selectedCompany || !paymentDate || !paymentAmount || !paymentMethod) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (allocationType === "multiple" && paymentAllocations.length === 0) {
      toast.error("Please allocate payment to at least one invoice");
      return;
    }

    if (allocationType === "single" && !selectedInvoice) {
      toast.error("Please select an invoice");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual payment recording
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      toast.success("Payment recorded successfully!");
      
      // Reset form
      setSelectedCompany("");
      setPaymentDate(new Date());
      setPaymentAmount(0);
      setPaymentMethod("");
      setMemo("");
      setSelectedInvoice("");
      setPaymentAllocations([]);
      if (!expanded) {
        setIsExpanded(false);
      }
    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  if (!expanded && !isExpanded) {
    return (
      <Button 
        onClick={() => setIsExpanded(true)} 
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Record Payment
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Record Payment
        </CardTitle>
        <CardDescription>
          Record a payment against one or more invoices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Select value={selectedCompany} onValueChange={handleCompanyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Payment Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={paymentAmount || ""}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Invoice Allocation */}
        {selectedCompany && mockInvoices.length > 0 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Apply Payment To</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="single"
                    checked={allocationType === "single"}
                    onCheckedChange={() => handleAllocationTypeChange("single")}
                  />
                  <Label htmlFor="single">Single Invoice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multiple"
                    checked={allocationType === "multiple"}
                    onCheckedChange={() => handleAllocationTypeChange("multiple")}
                  />
                  <Label htmlFor="multiple">Multiple Invoices</Label>
                </div>
              </div>
            </div>

            {allocationType === "single" && (
              <div className="space-y-2">
                <Label>Select Invoice</Label>
                <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInvoices.map(invoice => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.number} - ${invoice.balance.toFixed(2)} due
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {allocationType === "multiple" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Available Invoices</Label>
                  <span className="text-sm text-muted-foreground">
                    Allocated: ${getTotalAllocated().toFixed(2)} / ${paymentAmount.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {mockInvoices.map(invoice => {
                    const isAllocated = paymentAllocations.some(alloc => alloc.invoiceId === invoice.id);
                    const allocation = paymentAllocations.find(alloc => alloc.invoiceId === invoice.id);
                    
                    return (
                      <div key={invoice.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={isAllocated}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              addToAllocations(invoice.id);
                            } else {
                              removeAllocation(invoice.id);
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{invoice.number}</div>
                          <div className="text-sm text-muted-foreground">
                            Balance: ${invoice.balance.toFixed(2)}
                          </div>
                        </div>
                        {isAllocated && (
                          <div className="w-32">
                            <Input
                              type="number"
                              placeholder="Amount"
                              min="0"
                              max={allocation?.remainingBalance}
                              step="0.01"
                              value={allocation?.allocationAmount || ""}
                              onChange={(e) => updateAllocation(invoice.id, parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Memo */}
        <div className="space-y-2">
          <Label htmlFor="memo">Memo</Label>
          <Textarea
            id="memo"
            placeholder="Optional payment memo..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!expanded && (
            <Button 
              variant="outline" 
              onClick={() => setIsExpanded(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleRecordPayment}
            disabled={loading}
          >
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};