'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '@/components/ui/input';
import { ArrowUpDown, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [data]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Get table headers
    const headers = columns.map(column => {
      if (typeof column.header === 'string') {
        return column.header;
      }
      return '';
    });
    
    // Get table data
    const tableData = data.map(row => {
      return columns.map(column => {
        if ('accessorKey' in column) {
          const value = row[column.accessorKey as keyof TData];
          if (column.cell && typeof column.cell === 'function') {
            // If there's a custom cell renderer, we need to handle it
            const cell = column.cell({ row: { getValue: () => value } } as any);
            return cell?.toString() || '';
          }
          return value?.toString() || '';
        }
        return '';
      });
    });

    // Add title
    doc.setFontSize(16);
    doc.text('Faridabad Power Outage Information', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Area
        1: { cellWidth: 30 }, // Feeder
        2: { cellWidth: 40 }, // Start Time
        3: { cellWidth: 40 }, // Restoration Time
        4: { cellWidth: 40 }, // Reason
      },
    });

    // Save the PDF
    doc.save('power-outage-report.pdf');
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId) as string;
      return value?.toLowerCase().includes(filterValue.toLowerCase());
    },
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        {data.length > 0 && (
          <div className="relative w-40 sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 text-sm"
            />
          </div>
        )}
        {data.length > 0 && (
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="break-words">
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className={`
                          ${cell.column.id === 'area' ? 'min-w-[150px] sm:min-w-[200px] break-words' : ''}
                          ${cell.column.id === 'feeder' ? 'min-w-[100px] sm:min-w-[150px] break-words' : ''}
                          ${cell.column.id === 'start_time' ? 'min-w-[150px] sm:min-w-[200px] break-words' : ''}
                          ${cell.column.id === 'restoration_time' ? 'min-w-[150px] sm:min-w-[200px] break-words' : ''}
                          ${cell.column.id === 'reason' ? 'min-w-[150px] sm:min-w-[300px] break-words' : ''}
                        `}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 