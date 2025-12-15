import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-base [&_th]:py-4 [&_td]:py-4", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <thead ref={ref} className={cn("[&_tr]:border-b [&_tr]:border-neutral-200/60", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-neutral-50/30", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <tfoot
      ref={ref}
      className={cn("bg-neutral-50 font-medium text-neutral-900 border-t border-neutral-200/60", className)}
      {...props}
    />
  )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-neutral-200/60 transition-all duration-150 hover:bg-neutral-50/50 data-[state=selected]:bg-primary-50/30",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-6 text-left align-middle font-semibold text-sm text-neutral-700 uppercase tracking-wide [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <td
      ref={ref}
      className={cn("px-6 align-middle text-neutral-700 [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref): React.ReactElement => (
    <caption
      ref={ref}
      className={cn("mt-6 text-sm text-neutral-500", className)}
      {...props}
    />
  )
);
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};