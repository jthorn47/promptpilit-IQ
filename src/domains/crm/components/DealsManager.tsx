import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, DollarSign, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeals } from "../hooks/useDeals";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const DealsManager = () => {
  const { deals, loading, updateDeal } = useDeals();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [converting, setConverting] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contact_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-800';
      case 'proposal':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    if (probability >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleCloseDeal = async (dealId: string, status: 'won' | 'lost') => {
    setConverting(dealId);
    try {
      const success = await updateDeal(dealId, { status });
      if (success && status === 'won') {
        toast({
          title: "Deal Closed Successfully",
          description: "Company will be automatically migrated to client",
        });
      }
    } catch (error) {
      console.error("Error closing deal:", error);
    } finally {
      setConverting(null);
    }
  };

  const handlePropGENAnalysis = (deal: any) => {
    const queryParams = new URLSearchParams({
      company_name: deal.company_name,
      deal_id: deal.id,
      ...(deal.company_id && { company_id: deal.company_id }),
    });
    navigate(`/admin/proposals/propgen?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-2">Companies you're actively selling to</p>
        </div>
        
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Deal</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            onClick={() => setStatusFilter("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "won" ? "default" : "outline"}
            onClick={() => setStatusFilter("won")}
            size="sm"
          >
            Won
          </Button>
          <Button
            variant={statusFilter === "lost" ? "default" : "outline"}
            onClick={() => setStatusFilter("lost")}
            size="sm"
          >
            Lost
          </Button>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{deal.title}</CardTitle>
                <Badge className={getStatusColor(deal.status)}>
                  {deal.status}
                </Badge>
              </div>
              <CardDescription>{deal.company_name}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">
                  ${(deal.value || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Probability:</span>
                <span className={`font-medium ${getProbabilityColor(deal.probability || 0)}`}>
                  {deal.probability || 0}%
                </span>
              </div>

              <div className="text-sm text-gray-600">
                <strong>Contact:</strong> {deal.contact_name}
              </div>

              {deal.contact_email && (
                <div className="text-sm text-gray-600">
                  <strong>Email:</strong> {deal.contact_email}
                </div>
              )}

              {deal.expected_close_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Expected: {new Date(deal.expected_close_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {deal.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {deal.notes}
                </p>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-400">
                  {new Date(deal.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => handlePropGENAnalysis(deal)}
                  >
                    <BarChart3 className="h-3 w-3" />
                    PropGEN
                  </Button>
                  {deal.status === 'active' && (
                    <Button 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleCloseDeal(deal.id, 'won')}
                      disabled={converting === deal.id}
                    >
                      <TrendingUp className="h-3 w-3" />
                      {converting === deal.id ? 'Converting...' : 'Close Won'}
                    </Button>
                  )}
                  {deal.status === 'won' && (
                    <Badge className="bg-green-100 text-green-800">
                      Converted to Client
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No deals found matching your criteria.</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Deal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};