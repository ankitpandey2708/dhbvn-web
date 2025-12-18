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

import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

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
    <div className="rounded-xl glass overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-neutral-800/50 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const isTimeColumn = header.column.id === 'start_time' || header.column.id === 'restoration_time';
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={`${isTimeColumn ? 'text-right' : ''}`}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? `cursor-pointer select-none flex items-center gap-2 hover:text-primary-400 transition-colors ${isTimeColumn ? 'justify-end' : ''}`
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
                            <span className="flex flex-col -space-y-1">
                              <ChevronUp
                                className={`h-3 w-3 ${isSorted === 'asc' ? 'text-primary-500' : 'text-neutral-600'}`}
                              />
                              <ChevronDown
                                className={`h-3 w-3 ${isSorted === 'desc' ? 'text-primary-500' : 'text-neutral-600'}`}
                              />
                            </span>
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
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className="animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: 'both',
                    animationDuration: '300ms'
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isTimeColumn = cell.column.id === 'start_time' || cell.column.id === 'restoration_time';
                    return (
                      <TableCell
                        key={cell.id}
                        className={`
                          ${cell.column.id === 'area' ? 'min-w-col-sm sm:min-w-col-md font-semibold text-foreground' : ''}
                          ${cell.column.id === 'feeder' ? 'min-w-col-sm font-mono text-primary-400' : ''}
                          ${cell.column.id === 'start_time' ? 'min-w-col-sm sm:min-w-col-md text-right' : ''}
                          ${cell.column.id === 'restoration_time' ? 'min-w-col-sm sm:min-w-col-md text-right' : ''}
                          ${cell.column.id === 'reason' ? 'min-w-col-sm sm:min-w-col-lg text-neutral-400' : ''}
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
                  className="h-24 text-center text-neutral-500"
                >
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
