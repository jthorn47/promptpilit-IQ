import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingTable } from "./PricingTable";

interface PricingTier {
  id: string;
  min_users: number;
  max_users: number;
  is_active: boolean;
}

interface CoursePackage {
  id: string;
  name: string;
  description: string;
  course_count: number;
  display_order: number;
  is_active: boolean;
}

interface PricingMatrix {
  id: string;
  pricing_tier_id: string;
  course_package_id: string;
  price_per_user: number;
  annual_discount_percentage: number;
  three_year_discount_percentage: number;
  pricing_tier: PricingTier;
  course_package: CoursePackage;
}

interface PackageTabProps {
  packageName: string;
  packages: CoursePackage[];
  matrix: PricingMatrix[];
  onEditPricing: (item: PricingMatrix) => void;
}

export const PackageTab = ({
  packageName,
  packages,
  matrix,
  onEditPricing
}: PackageTabProps) => {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{packageName} Package Settings</CardTitle>
          <CardDescription>Manage the {packageName} training package pricing</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PricingTable
            matrix={matrix}
            packageName={packageName}
            onEdit={onEditPricing}
          />
        </div>
      </CardContent>
    </Card>
  );
};