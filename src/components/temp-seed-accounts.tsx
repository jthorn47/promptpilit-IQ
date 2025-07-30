import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TempSeedAccounts = () => {
  const { toast } = useToast();

  const seedAccounts = async () => {
    try {
      // Complete chart of accounts with all 60 accounts
      const accounts = [
        // Assets (1001-1010)
        {
          "account_number": "1001",
          "full_name": "Checking Account",
          "account_type": "Asset",
          "detail_type": "Bank",
          "description": "Primary operating checking account",
          "initial_balance": 0.0
        },
        {
          "account_number": "1002",
          "full_name": "Savings Account",
          "account_type": "Asset",
          "detail_type": "Bank",
          "description": "Business savings account",
          "initial_balance": 0.0
        },
        {
          "account_number": "1003",
          "full_name": "Money Market Account",
          "account_type": "Asset",
          "detail_type": "Bank",
          "description": "Money market investment account",
          "initial_balance": 0.0
        },
        {
          "account_number": "1004",
          "full_name": "Petty Cash",
          "account_type": "Asset",
          "detail_type": "Bank",
          "description": "Cash on hand for small expenses",
          "initial_balance": 0.0
        },
        {
          "account_number": "1005",
          "full_name": "Undeposited Funds",
          "account_type": "Asset",
          "detail_type": "Bank",
          "description": "Funds received but not yet deposited",
          "initial_balance": 0.0
        },
        {
          "account_number": "1006",
          "full_name": "Employee Advances",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Advances given to employees",
          "initial_balance": 0.0
        },
        {
          "account_number": "1007",
          "full_name": "Inventory Asset",
          "account_type": "Asset",
          "detail_type": "Inventory",
          "description": "Value of inventory on hand",
          "initial_balance": 0.0
        },
        {
          "account_number": "1008",
          "full_name": "Prepaid Expenses",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Expenses paid in advance",
          "initial_balance": 0.0
        },
        {
          "account_number": "1009",
          "full_name": "Other Current Assets",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Miscellaneous current assets",
          "initial_balance": 0.0
        },
        {
          "account_number": "1010",
          "full_name": "Fixed Assets",
          "account_type": "Asset",
          "detail_type": "Fixed Assets",
          "description": "Long-term tangible assets",
          "initial_balance": 0.0
        },

        // Receivables (1500-1512)
        {
          "account_number": "1500",
          "full_name": "Accounts Receivable",
          "account_type": "Asset",
          "detail_type": "Accounts receivable (A/R)",
          "description": "Money owed by customers",
          "initial_balance": 0.0
        },
        {
          "account_number": "1501",
          "full_name": "Allowance for Doubtful Accounts",
          "account_type": "Asset",
          "detail_type": "Accounts receivable (A/R)",
          "description": "Estimated uncollectible receivables",
          "initial_balance": 0.0
        },
        {
          "account_number": "1502",
          "full_name": "Notes Receivable",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Promissory notes from customers",
          "initial_balance": 0.0
        },
        {
          "account_number": "1503",
          "full_name": "Interest Receivable",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Interest earned but not received",
          "initial_balance": 0.0
        },
        {
          "account_number": "1504",
          "full_name": "Employee Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Money owed by employees",
          "initial_balance": 0.0
        },
        {
          "account_number": "1505",
          "full_name": "Vendor Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Money owed by vendors",
          "initial_balance": 0.0
        },
        {
          "account_number": "1506",
          "full_name": "Insurance Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Insurance claims receivable",
          "initial_balance": 0.0
        },
        {
          "account_number": "1507",
          "full_name": "Tax Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Tax refunds receivable",
          "initial_balance": 0.0
        },
        {
          "account_number": "1508",
          "full_name": "Loan Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Loans made to others",
          "initial_balance": 0.0
        },
        {
          "account_number": "1509",
          "full_name": "Rent Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Rent payments receivable",
          "initial_balance": 0.0
        },
        {
          "account_number": "1510",
          "full_name": "Commission Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Commissions earned but not received",
          "initial_balance": 0.0
        },
        {
          "account_number": "1512",
          "full_name": "Other Receivables",
          "account_type": "Asset",
          "detail_type": "Other Current Assets",
          "description": "Miscellaneous receivables",
          "initial_balance": 0.0
        },

        // Other Assets and Deposits (1600, 1700-1703)
        {
          "account_number": "1600",
          "full_name": "Accumulated Depreciation",
          "account_type": "Asset",
          "detail_type": "Fixed Assets",
          "description": "Accumulated depreciation on fixed assets",
          "initial_balance": 0.0
        },
        {
          "account_number": "1700",
          "full_name": "Security Deposits",
          "account_type": "Asset",
          "detail_type": "Other Assets",
          "description": "Security deposits paid",
          "initial_balance": 0.0
        },
        {
          "account_number": "1701",
          "full_name": "Utility Deposits",
          "account_type": "Asset",
          "detail_type": "Other Assets",
          "description": "Utility company deposits",
          "initial_balance": 0.0
        },
        {
          "account_number": "1702",
          "full_name": "Rental Deposits",
          "account_type": "Asset",
          "detail_type": "Other Assets",
          "description": "Rental and lease deposits",
          "initial_balance": 0.0
        },
        {
          "account_number": "1703",
          "full_name": "Other Deposits",
          "account_type": "Asset",
          "detail_type": "Other Assets",
          "description": "Miscellaneous deposits",
          "initial_balance": 0.0
        },

        // Liabilities Part 1 (2005-2014)
        {
          "account_number": "2005",
          "full_name": "Accounts Payable",
          "account_type": "Liability",
          "detail_type": "Accounts Payable (A/P)",
          "description": "Money owed to suppliers",
          "initial_balance": 0.0
        },
        {
          "account_number": "2006",
          "full_name": "Accrued Expenses",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Expenses incurred but not paid",
          "initial_balance": 0.0
        },
        {
          "account_number": "2007",
          "full_name": "Notes Payable",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Promissory notes payable",
          "initial_balance": 0.0
        },
        {
          "account_number": "2008",
          "full_name": "Interest Payable",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Interest owed but not paid",
          "initial_balance": 0.0
        },
        {
          "account_number": "2009",
          "full_name": "Wages Payable",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Wages owed to employees",
          "initial_balance": 0.0
        },
        {
          "account_number": "2010",
          "full_name": "Payroll Liabilities",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Payroll taxes and deductions",
          "initial_balance": 0.0
        },
        {
          "account_number": "2011",
          "full_name": "Sales Tax Payable",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Sales tax collected but not remitted",
          "initial_balance": 0.0
        },
        {
          "account_number": "2012",
          "full_name": "Income Tax Payable",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Income taxes owed",
          "initial_balance": 0.0
        },
        {
          "account_number": "2013",
          "full_name": "Customer Deposits",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Deposits received from customers",
          "initial_balance": 0.0
        },
        {
          "account_number": "2014",
          "full_name": "Deferred Revenue",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Revenue received but not earned",
          "initial_balance": 0.0
        },

        // Liabilities Part 2 (2100-2110)
        {
          "account_number": "2100",
          "full_name": "Loan Payable",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Long-term loans payable",
          "initial_balance": 0.0
        },
        {
          "account_number": "2101",
          "full_name": "Mortgage Payable",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Real estate mortgage payable",
          "initial_balance": 0.0
        },
        {
          "account_number": "2102",
          "full_name": "Equipment Loan",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Equipment financing payable",
          "initial_balance": 0.0
        },
        {
          "account_number": "2103",
          "full_name": "Vehicle Loan",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Vehicle financing payable",
          "initial_balance": 0.0
        },
        {
          "account_number": "2104",
          "full_name": "Credit Card Payable",
          "account_type": "Liability",
          "detail_type": "Credit Card",
          "description": "Credit card balances",
          "initial_balance": 0.0
        },
        {
          "account_number": "2105",
          "full_name": "Line of Credit",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Line of credit balance",
          "initial_balance": 0.0
        },
        {
          "account_number": "2106",
          "full_name": "Lease Payable",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Lease obligations",
          "initial_balance": 0.0
        },
        {
          "account_number": "2107",
          "full_name": "Warranty Payable",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Warranty obligations",
          "initial_balance": 0.0
        },
        {
          "account_number": "2108",
          "full_name": "Pension Payable",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Pension obligations",
          "initial_balance": 0.0
        },
        {
          "account_number": "2109",
          "full_name": "Health Insurance Payable",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Health insurance premiums payable",
          "initial_balance": 0.0
        },
        {
          "account_number": "2110",
          "full_name": "Workers Comp Payable",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Workers compensation premiums payable",
          "initial_balance": 0.0
        },

        // Remaining Liabilities (2200-2500)
        {
          "account_number": "2200",
          "full_name": "Accrued Vacation",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Accrued vacation pay liability",
          "initial_balance": 0.0
        },
        {
          "account_number": "2300",
          "full_name": "Accrued Sick Pay",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Accrued sick pay liability",
          "initial_balance": 0.0
        },
        {
          "account_number": "2400",
          "full_name": "Accrued Bonuses",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Accrued employee bonuses",
          "initial_balance": 0.0
        },
        {
          "account_number": "2500",
          "full_name": "Other Current Liabilities",
          "account_type": "Liability",
          "detail_type": "Other Current Liabilities",
          "description": "Miscellaneous current liabilities",
          "initial_balance": 0.0
        },
        {
          "account_number": "2600",
          "full_name": "Other Long-term Liabilities",
          "account_type": "Liability",
          "detail_type": "Long Term Liabilities",
          "description": "Miscellaneous long-term liabilities",
          "initial_balance": 0.0
        },

        // Equity Accounts (3000-3200)
        {
          "account_number": "3000",
          "full_name": "Common Stock",
          "account_type": "Equity",
          "detail_type": "Equity",
          "description": "Common stock issued",
          "initial_balance": 0.0
        },
        {
          "account_number": "3100",
          "full_name": "Retained Earnings",
          "account_type": "Equity",
          "detail_type": "Equity",
          "description": "Accumulated retained earnings",
          "initial_balance": 0.0
        },
        {
          "account_number": "3200",
          "full_name": "Owner's Equity",
          "account_type": "Equity",
          "detail_type": "Equity",
          "description": "Owner's equity in business",
          "initial_balance": 0.0
        },

        // Revenue Accounts (4000-4040)
        {
          "account_number": "4000",
          "full_name": "Sales Revenue",
          "account_type": "Revenue",
          "detail_type": "Income",
          "description": "Primary sales revenue",
          "initial_balance": 0.0
        },
        {
          "account_number": "4010",
          "full_name": "Service Revenue",
          "account_type": "Revenue",
          "detail_type": "Income",
          "description": "Service income",
          "initial_balance": 0.0
        },
        {
          "account_number": "4020",
          "full_name": "Interest Income",
          "account_type": "Revenue",
          "detail_type": "Other Income",
          "description": "Interest earned on investments",
          "initial_balance": 0.0
        },
        {
          "account_number": "4030",
          "full_name": "Other Income",
          "account_type": "Revenue",
          "detail_type": "Other Income",
          "description": "Miscellaneous income",
          "initial_balance": 0.0
        },
        {
          "account_number": "4040",
          "full_name": "Discounts Given",
          "account_type": "Revenue",
          "detail_type": "Income",
          "description": "Sales discounts provided",
          "initial_balance": 0.0
        },

        // Cost of Goods Sold (5000) - FIXED
        {
          "account_number": "5000",
          "full_name": "Cost of Goods Sold",
          "account_type": "Expense",
          "detail_type": "Cost of Goods Sold",
          "description": "Direct costs of goods sold",
          "initial_balance": 0.0
        },

        // Existing Expense Accounts (8017-8025, 9000)
        {
          "account_number": "8017",
          "full_name": "Security",
          "account_type": "Expense",
          "detail_type": "Security",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8018",
          "full_name": "Supplies",
          "account_type": "Expense",
          "detail_type": "Supplies",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8019",
          "full_name": "Taxes - Other",
          "account_type": "Expense",
          "detail_type": "Other Taxes",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8020",
          "full_name": "Telephone",
          "account_type": "Expense",
          "detail_type": "Utilities",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8021",
          "full_name": "Travel",
          "account_type": "Expense",
          "detail_type": "Travel",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8022",
          "full_name": "Utilities",
          "account_type": "Expense",
          "detail_type": "Utilities",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8023",
          "full_name": "Vehicle Expenses",
          "account_type": "Expense",
          "detail_type": "Automobile Expenses",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8024",
          "full_name": "Workers Compensation",
          "account_type": "Expense",
          "detail_type": "Employee Benefits",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "8025",
          "full_name": "Other Miscellaneous Expenses",
          "account_type": "Expense",
          "detail_type": "Other Miscellaneous Expense",
          "description": "",
          "initial_balance": 0.0
        },
        {
          "account_number": "9000",
          "full_name": "Ask My Accountant",
          "account_type": "Expense",
          "detail_type": "Ask My Accountant",
          "description": "",
          "initial_balance": 0.0
        }
      ];

      console.log(`🚀 Starting to seed ${accounts.length} accounts...`);

      const { data, error } = await supabase.functions.invoke('seed-chart-of-accounts', {
        body: {
          accounts,
          company_id: 'bc172f1c-e102-4a76-945a-c1de29e9f34c'
        }
      });

      if (error) {
        console.error('Error seeding accounts:', error);
        toast({
          title: "Error",
          description: `Failed to seed accounts: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Seed result:', data);
      toast({
        title: "Success",
        description: `Successfully seeded complete chart of accounts with ${accounts.length} accounts!`,
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to seed accounts",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <Button onClick={seedAccounts} className="w-full">
        Seed Complete Chart of Accounts (60 accounts)
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        This will seed all 60 accounts including assets, liabilities, equity, revenue, and expenses.
        Account 5000 will be corrected from "Retained Earnings" to "Cost of Goods Sold".
      </p>
    </div>
  );
};
