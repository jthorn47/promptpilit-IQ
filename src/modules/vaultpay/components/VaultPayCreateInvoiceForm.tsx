import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, CalendarIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export const VaultPayCreateInvoiceForm = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [selectedCompany, setSelectedCompany] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>();
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unit_price: 0, total: 0 }
  ]);

  // Mock companies - will be replaced with real data
  const companies = [
    { id: "1", name: "Acme Corporation" },
    { id: "2", name: "TechStart LLC" },
    { id: "3", name: "Global Industries" },
    { id: "4", name: "Innovate Solutions" }
  ];

  const categories = [
    { value: "payroll", label: "Payroll" },
    { value: "setup", label: "Setup" },
    { value: "lms", label: "LMS" },
    { value: "benefits", label: "Benefits" },
    { value: "consulting", label: "Consulting" }
  ];

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems([...lineItems, { 
      id: newId, 
      description: "", 
      quantity: 1, 
      unit_price: 0, 
      total: 0 
    }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateInvoice = async () => {
    if (!selectedCompany || !invoiceDate || !dueDate || lineItems.some(item => !item.description)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual invoice creation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      toast.success("Invoice created successfully!");
      
      // Reset form
      setSelectedCompany("");
      setInvoiceDate(new Date());
      setDueDate(undefined);
      setCategory("");
      setNotes("");
      setLineItems([{ id: "1", description: "", quantity: 1, unit_price: 0, total: 0 }]);
      setIsExpanded(false);
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button 
        onClick={() => setIsExpanded(true)} 
        className="w-full flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Invoice
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create New Invoice
        </CardTitle>
        <CardDescription>
          Generate a new invoice for a client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
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
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Invoice Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !invoiceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {invoiceDate ? format(invoiceDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={invoiceDate}
                  onSelect={setInvoiceDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Line Items</Label>
            <Button onClick={addLineItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                <div className="col-span-12 md:col-span-5">
                  <Input
                    placeholder="Description *"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Rate"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Input
                    value={`$${item.total.toFixed(2)}`}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    onClick={() => removeLineItem(item.id)}
                    size="sm"
                    variant="outline"
                    disabled={lineItems.length === 1}
                    className="h-10 w-10 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">
                ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Optional notes for this invoice..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateInvoice}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};