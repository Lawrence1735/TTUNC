import React, { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '../ui/utils';

interface Column {
  key: string;
  label: string;
  className?: string;
  mobileLabel?: string; // Optional different label for mobile
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  renderCell: (item: any, column: Column) => ReactNode;
  renderActions?: (item: any) => ReactNode;
  emptyMessage?: string;
  ariaLabel?: string;
  caption?: string;
  className?: string;
}

/**
 * ResponsiveTable Component
 * Displays as table on desktop, converts to card layout on mobile (< 768px)
 * WCAG 2.1 Compliant with proper ARIA labels and keyboard navigation
 */
export function ResponsiveTable({
  columns,
  data,
  renderCell,
  renderActions,
  emptyMessage = 'No data available',
  ariaLabel,
  caption,
  className
}: ResponsiveTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" role="status" aria-live="polite">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View (≥ 768px) */}
      <div className="hidden md:block overflow-x-auto">
        <Table className={className} aria-label={ariaLabel}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
              {renderActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={item.id || idx}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {renderCell(item, col)}
                  </TableCell>
                ))}
                {renderActions && (
                  <TableCell className="text-right">
                    {renderActions(item)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden space-y-4 overflow-y-auto max-h-[640px]" role="list" aria-label={ariaLabel}>
        {data.map((item, idx) => (
          <Card key={item.id || idx} role="listitem">
            <CardContent className="pt-6 space-y-3">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                    {col.mobileLabel || col.label}:
                  </span>
                  <span className="text-sm text-right flex-1">
                    {renderCell(item, col)}
                  </span>
                </div>
              ))}
              {renderActions && (
                <div className="pt-3 border-t flex gap-2 justify-end">
                  {renderActions(item)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
