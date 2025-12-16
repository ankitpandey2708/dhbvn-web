'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { ArrowUpDown } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>): React.ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div>
      <div className="rounded-xl border border-neutral-200/60 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isTimeColumn = header.column.id === 'start_time' || header.column.id === 'restoration_time';
                    return (
                      <TableHead
                        key={header.id}
                        className={`wrap-break-word ${isTimeColumn ? 'text-right' : ''}`}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? `cursor-pointer select-none flex items-center gap-2 hover:text-neutral-900 transition-colors ${isTimeColumn ? 'justify-end' : ''}`
                                : isTimeColumn ? 'flex justify-end' : ''
                            }
                            onClick={header.column.getToggleSortingHandler()}
                            role={header.column.getCanSort() ? 'button' : undefined}
                            tabIndex={header.column.getCanSort() ? 0 : -1}
                            aria-label={header.column.getCanSort() ? 'Sort column' : undefined}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <ArrowUpDown className="h-4 w-4 text-neutral-400" />
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const isTimeColumn = cell.column.id === 'start_time' || cell.column.id === 'restoration_time';
                      return (
                        <TableCell
                          key={cell.id}
                          className={`
                            ${cell.column.id === 'area' ? 'min-w-col-sm sm:min-w-col-md wrap-break-word font-semibold text-neutral-900' : ''}
                            ${cell.column.id === 'feeder' ? 'min-w-col-sm wrap-break-word' : ''}
                            ${cell.column.id === 'start_time' ? 'min-w-col-sm sm:min-w-col-md wrap-break-word text-right' : ''}
                            ${cell.column.id === 'restoration_time' ? 'min-w-col-sm sm:min-w-col-md wrap-break-word text-right' : ''}
                            ${cell.column.id === 'reason' ? 'min-w-col-sm sm:min-w-col-lg wrap-break-word' : ''}
                          `}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-neutral-600"
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