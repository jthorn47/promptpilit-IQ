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

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer?: string;
  description?: string;
}

interface StripeTransactionsTableProps {
  transactions: Transaction[];
}

export const StripeTransactionsTable = ({ transactions }: StripeTransactionsTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-mono text-sm">
                  {transaction.id.substring(0, 20)}...
                </TableCell>
                <TableCell className="font-medium">
                  ${transaction.amount.toFixed(2)} {transaction.currency.toUpperCase()}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(transaction.created * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transaction.description || "No description"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};