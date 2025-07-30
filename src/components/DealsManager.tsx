import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, DollarSign, Calendar, User, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Deal {
  id: string;
  title: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  value: number;
  currency: string;
  stage_id: string;
  status: string;
  probability: number;
  expected_close_date: string;
  created_at: string;
  deal_stages?: {
    name: string;
    color: string;
  };
}

interface DealStage {
  id: string;
  name: string;
  color: string;
  probability: number;
  stage_order: number;
}

export function DealsManager() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<DealStage[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    contact_name: "",
    contact_email: "",
    value: "",
    stage_id: "",
    expected_close_date: "",
    notes: ""
  });

  useEffect(() => {
    fetchDeals();
    fetchStages();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchTerm, selectedStage]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          deal_stages (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deals.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from('deal_stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_order');

      if (error) throw error;
      setStages(data || []);
    } catch (error: any) {
      console.error('Error fetching stages:', error);
    }
  };

  const filterDeals = () => {
    let filtered = deals;

    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStage !== "all") {
      filtered = filtered.filter(deal => deal.stage_id === selectedStage);
    }

    setFilteredDeals(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('deals')
        .insert({
          title: formData.title,
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          value: parseFloat(formData.value),
          stage_id: formData.stage_id,
          expected_close_date: formData.expected_close_date || null,
          notes: formData.notes,
          status: 'open',
          probability: stages.find(s => s.id === formData.stage_id)?.probability || 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal created successfully.",
      });

      setIsDialogOpen(false);
      setFormData({
        title: "",
        company_name: "",
        contact_name: "",
        contact_email: "",
        value: "",
        stage_id: "",
        expected_close_date: "",
        notes: ""
      });
      fetchDeals();
    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const totalPipelineValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const averageDealSize = filteredDeals.length > 0 ? totalPipelineValue / filteredDeals.length : 0;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading deals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deals Management</h2>
          <p className="text-muted-foreground">
            Manage your sales pipeline and track opportunities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Deal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Deal Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter deal title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="value">Deal Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Contact person"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="email@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select
                    value={formData.stage_id}
                    onValueChange={(value) => setFormData({ ...formData, stage_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expected_close_date">Expected Close</Label>
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this deal..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Deal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {filteredDeals.length} deals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageDealSize.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per opportunity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDeals.filter(d => d.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Deals List */}
      <div className="grid gap-4">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-lg">{deal.title}</h3>
                      <p className="text-sm text-muted-foreground">{deal.company_name}</p>
                    </div>
                    <Badge className={getStatusColor(deal.status)}>
                      {deal.status}
                    </Badge>
                    {deal.deal_stages && (
                      <Badge variant="outline" style={{ borderColor: deal.deal_stages.color }}>
                        {deal.deal_stages.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{deal.currency} {deal.value.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{deal.contact_name}</span>
                    </div>
                    {deal.expected_close_date && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{deal.probability}% chance</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deals found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStage !== "all" 
                ? "Try adjusting your search or filters"
                : "Create your first deal to start tracking your sales pipeline"
              }
            </p>
            {!searchTerm && selectedStage === "all" && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}