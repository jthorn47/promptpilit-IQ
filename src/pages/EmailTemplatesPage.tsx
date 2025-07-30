import { BulkEmailManager } from "@/components/BulkEmailManager";
import { SystemEmailTemplatesManager } from "@/components/SystemEmailTemplatesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings } from "lucide-react";

export const EmailTemplatesPage = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">Manage campaigns, templates, and brand-specific configurations</p>
      </div>
      
      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">
            <Mail className="w-4 h-4 mr-2" />
            Campaigns & Marketing
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="w-4 h-4 mr-2" />
            System Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <BulkEmailManager />
        </TabsContent>
        
        <TabsContent value="system">
          <SystemEmailTemplatesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};