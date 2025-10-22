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
      <div className="rounded-xl border bg-card/50 backdrop-blur-sm">
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
                        className={`break-words ${isTimeColumn ? 'text-right' : ''}`}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? `cursor-pointer select-none flex items-center ${isTimeColumn ? 'justify-end' : ''}`
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
                              <ArrowUpDown className="ml-2 h-icon-sm w-icon-sm text-muted-foreground" />
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
                            ${cell.column.id === 'area' ? 'min-w-col-sm sm:min-w-col-md break-words' : ''}
                            ${cell.column.id === 'feeder' ? 'min-w-col-sm break-words' : ''}
                            ${cell.column.id === 'start_time' ? 'min-w-col-sm sm:min-w-col-md break-words text-right' : ''}
                            ${cell.column.id === 'restoration_time' ? 'min-w-col-sm sm:min-w-col-md break-words text-right' : ''}
                            ${cell.column.id === 'reason' ? 'min-w-col-sm sm:min-w-col-lg break-words' : ''}
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
                    className="h-24 text-center text-muted-foreground"
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