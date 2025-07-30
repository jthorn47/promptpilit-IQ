import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, DollarSign, Edit, Download } from "lucide-react";

interface ContractData {
  contractValue?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  originalDealOwner?: string;
  dateWon?: string;
  paymentStatus?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  linkedDocuments?: any[];
  notes?: string;
}

interface ContractTabProps {
  data: ContractData;
  onEditContract?: () => void;
  onDownloadContract?: () => void;
  readonly?: boolean;
}

export const ContractTab = ({ 
  data, 
  onEditContract, 
  onDownloadContract,
  readonly = false 
}: ContractTabProps) => {
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'overdue':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Information
              </CardTitle>
              <CardDescription>Detailed contract and billing information</CardDescription>
            </div>
            <div className="flex gap-2">
              {!readonly && onEditContract && (
                <Button onClick={onEditContract} size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDownloadContract && (
                <Button onClick={onDownloadContract} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Details
              </h4>
              
              {data.contractValue && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Value</label>
                  <p className="font-medium text-lg">
                    {data.currency || 'USD'} {data.contractValue.toLocaleString()}
                  </p>
                </div>
              )}
              
              {data.paymentStatus && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                  <div className="mt-1">
                    <Badge className={getPaymentStatusColor(data.paymentStatus)} variant="outline">
                      {data.paymentStatus}
                    </Badge>
                  </div>
                </div>
              )}

              {data.stripeCustomerId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stripe Customer ID</label>
                  <p className="font-mono text-sm">{data.stripeCustomerId}</p>
                </div>
              )}
            </div>

            {/* Timeline Information */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h4>
              
              {data.dateWon && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date Won</label>
                  <p className="font-medium">{new Date(data.dateWon).toLocaleDateString()}</p>
                </div>
              )}
              
              {data.startDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract Start</label>
                  <p className="font-medium">{new Date(data.startDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {data.endDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contract End</label>
                  <p className="font-medium">{new Date(data.endDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {data.originalDealOwner && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Original Deal Owner</label>
                  <p className="font-medium">{data.originalDealOwner}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Documents */}
      {data.linkedDocuments && data.linkedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Documents</CardTitle>
            <CardDescription>Related contracts and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.linkedDocuments.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name || `Document ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">{doc.type || 'Contract'}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Notes */}
      {data.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{data.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};