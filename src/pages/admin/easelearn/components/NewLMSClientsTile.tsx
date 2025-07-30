import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Building, Calendar, ExternalLink, TrendingUp } from "lucide-react";
import { useNewLMSClients } from "../hooks/useNewLMSClients";
import { useNavigate } from "react-router-dom";

export const NewLMSClientsTile = () => {
  const { data: newClients, isLoading } = useNewLMSClients();
  const navigate = useNavigate();

  const handleViewCompany = (companyId: string) => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleStartOnboarding = (companyId: string) => {
    navigate(`/admin/companies/${companyId}/onboarding-wizard`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-elegant border-0 bg-gradient-to-br from-emerald-50/50 via-card to-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <UserPlus className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg">New LMS Clients</CardTitle>
              <p className="text-sm text-muted-foreground">
                Past 7 days
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            {newClients?.length || 0}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : newClients && newClients.length > 0 ? (
          <div className="space-y-3">
            {newClients.slice(0, 5).map((client: any) => (
              <div
                key={client.id}
                className="group p-3 rounded-xl border border-muted hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer"
                onClick={() => handleViewCompany(client.company_settings_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                      <Building className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {client.company_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(client.date_won)}
                        <Badge variant="outline" className="text-xs">
                          ${client.contract_value?.toLocaleString() || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            ))}
            
            {newClients.length > 5 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => navigate('/admin/clients?filter=new_lms')}
              >
                View All {newClients.length} New Clients
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No new LMS clients this week
            </p>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/admin/client-onboarding')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add New LMS Client
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};