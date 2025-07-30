import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageTab } from "./pricing/PackageTab";
import { SeatLicensingTab } from "./pricing/SeatLicensingTab";
import { TrainingCatalogTab } from "./pricing/TrainingCatalogTab";
import { CompanyManagementTab } from "./pricing/CompanyManagementTab";
import { usePricingData } from "./pricing/usePricingData";
import { useSeatManagement } from "@/hooks/useSeatManagement";

export const AdminPricing = () => {
  const { packages, tiers, matrix, loading, updatePricingMatrix } = usePricingData();
  const { seatConfigs, trainingModules, companyAllocations, loading: seatLoading, refetch } = useSeatManagement();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("packages");

  const handlePricingEdit = (item: any) => {
    setEditingItem(item);
    // Handle pricing editing here if needed
    console.log("Edit pricing item:", item);
  };

  if (loading || seatLoading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">
            Unified pricing management for traditional packages and seat-based licensing
          </p>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-primary mb-3">How to Use Pricing Management</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-2">Package Pricing (Easy/Easier/Easiest)</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Configure traditional tiered pricing packages</li>
              <li>• Set volume discounts and term pricing</li>
              <li>• Manage package features and capabilities</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Seat Licensing</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Set per-seat pricing for flexible scaling</li>
              <li>• Configure minimum seat requirements</li>
              <li>• Manage additional seat pricing</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Training Catalog</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Set individual course pricing</li>
              <li>• Configure bundle discounts</li>
              <li>• Manage certification costs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Company Management</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• View company seat allocations</li>
              <li>• Add additional seats as needed</li>
              <li>• Monitor usage across companies</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Changes to pricing take effect immediately. Always test with a development company before applying to production clients.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="packages">Easy</TabsTrigger>
          <TabsTrigger value="tiers">Easier</TabsTrigger>
          <TabsTrigger value="matrix">Easiest</TabsTrigger>
          <TabsTrigger value="seat-licensing">Seat Licensing</TabsTrigger>
          <TabsTrigger value="training-catalog">Training Catalog</TabsTrigger>
          <TabsTrigger value="company-management">Company Management</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <PackageTab
            packageName="Easy"
            packages={packages}
            matrix={matrix}
            onEditPricing={handlePricingEdit}
          />
        </TabsContent>

        <TabsContent value="tiers">
          <PackageTab
            packageName="Easier"
            packages={packages}
            matrix={matrix}
            onEditPricing={handlePricingEdit}
          />
        </TabsContent>

        <TabsContent value="matrix">
          <PackageTab
            packageName="Easiest"
            packages={packages}
            matrix={matrix}
            onEditPricing={handlePricingEdit}
          />
        </TabsContent>

        <TabsContent value="seat-licensing">
          <SeatLicensingTab
            seatConfigs={seatConfigs}
            onUpdate={refetch}
          />
        </TabsContent>

        <TabsContent value="training-catalog">
          <TrainingCatalogTab
            trainingModules={trainingModules}
            onUpdate={refetch}
          />
        </TabsContent>

        <TabsContent value="company-management">
          <CompanyManagementTab
            allocations={companyAllocations}
            onUpdate={refetch}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};