import React, { useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  selectedRowId?: string | number;
  getRowId?: (row: TData) => string;
  globalFilter?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  selectedRowId,
  getRowId,
  globalFilter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: getRowId || ((row: any) => row.id),
  });

  const { rows } = table.getRowModel();
  
  // Virtualizer setup
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // approximate row height in px
    overscan: 10,
  });

  return (
    <div className="flex-1 overflow-auto bg-card" ref={tableContainerRef}>
      <table className="w-full text-sm text-left relative">
        <thead className="text-textSecondary sticky top-0 bg-card border-b border-borderLight z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    "px-4 py-3 font-medium text-nowrap",
                    header.column.getCanSort() ? "cursor-pointer hover:text-foreground select-none" : ""
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span className="text-[10px] text-textMuted">
                        {{
                          asc: ' ▲',
                          desc: ' ▼',
                        }[header.column.getIsSorted() as string] ?? ' ↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-borderLight/30">
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} />
          )}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isSelected = selectedRowId === row.id;
            
            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={cn(
                  "hover:bg-sidebar/50 transition-colors group cursor-pointer",
                  virtualRow.index % 2 === 0 ? "bg-transparent" : "bg-sidebar/20",
                  isSelected && "bg-sidebar/80 border-l-2 border-primary"
                )}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td 
                    key={cell.id} 
                    className="px-4 py-3 text-textSecondary overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <tr style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} />
          )}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="text-center py-10 text-textMuted text-sm">
          No data found
        </div>
      )}
    </div>
  );
}
