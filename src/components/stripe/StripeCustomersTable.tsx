import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  email: string;
  name?: string;
  created: number;
  description?: string;
}

interface StripeCustomersTableProps {
  customers: Customer[];
}

export const StripeCustomersTable = ({ customers }: StripeCustomersTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name || "Unknown"}
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  {new Date(customer.created * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};