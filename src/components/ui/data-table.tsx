import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Column {
  accessorKey?: string;
  id?: string;
  header: string;
  cell?: ({ row }: { row: any }) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchKey?: string;
  searchPlaceholder?: string;
  loading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  loading = false
}) => {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(item => {
    if (!search || !searchKey) return true;
    const searchValue = item[searchKey]?.toString().toLowerCase() || '';
    return searchValue.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey || column.id}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey || column.id}>
                      {column.cell ? 
                        column.cell({ row: item }) :
                        item[column.accessorKey || column.id]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {loading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};