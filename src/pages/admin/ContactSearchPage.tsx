import { GlobalContactSearch } from "@/components/GlobalContactSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactSearchPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/admin/crm" className="hover:text-foreground">
          CRM
        </Link>
        <span>/</span>
        <span className="text-foreground">Contact Search</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/crm" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Search</h1>
          <p className="text-muted-foreground">
            Find contacts across all companies in your CRM
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Contact Search</CardTitle>
          </CardHeader>
          <CardContent>
            <GlobalContactSearch 
              placeholder="Search by name, email, phone, or company..."
              showHeader={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Use Contact Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Search Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Search by first name, last name, or full name</li>
                  <li>• Find contacts by email address</li>
                  <li>• Filter by company name</li>
                  <li>• View recent contacts when search is empty</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Actions</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click any contact to view their company page</li>
                  <li>• Use phone/email buttons for direct contact</li>
                  <li>• Primary contacts are highlighted with a star</li>
                  <li>• Results show real-time contact information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}