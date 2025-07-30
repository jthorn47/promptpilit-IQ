import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface PricingTableProps {
  matrix: PricingMatrix[];
  packageName: string;
  onEdit: (item: PricingMatrix) => void;
}

export const PricingTable = ({ matrix, packageName, onEdit }: PricingTableProps) => {
  const filteredMatrix = matrix.filter(item => item.course_package.name === packageName);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Pricing for {packageName} Package</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Range</TableHead>
            <TableHead>Price/User</TableHead>
            <TableHead>3-Year Discount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMatrix.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.pricing_tier.min_users} - {item.pricing_tier.max_users} users
              </TableCell>
              <TableCell>${item.price_per_user}</TableCell>
              <TableCell>{item.three_year_discount_percentage}%</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};