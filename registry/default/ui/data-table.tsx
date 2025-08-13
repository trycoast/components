import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Group } from "@/registry/default/ui/group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, LoaderCircleIcon, SearchIcon, Settings2, TriangleIcon } from "lucide-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as ReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const variants = cva("", {
  variants: {
    variant: {
      default: "",
      compact: "p-1",
    },
    size: {
      default: "",
      xs: "text-xs",
      sm: "text-sm",
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "default",
  },
});

interface TableContextValue<TData> {
  table: ReactTable<TData>;
  globalFilter: string;
  config?: Config;
  setGlobalFilter: (value: string) => void;
}

const TableContext = React.createContext<TableContextValue<any> | undefined>(undefined);

const useTableContext = <TData,>(): TableContextValue<TData> => {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};

export interface Config {
  enableRowSelection?: boolean;
  initialPageSize?: number;
  initialSortBy?: string;
  initialColumnVisibility?: VisibilityState;
  onLoadMore?: () => void; // <- explicit callback
  isLoadingMore?: boolean; // <- to show spinner
  hasMore?: boolean; // <- disable button if false
}

interface Meta {
  disableDisplay?: boolean;
  enableSort?: boolean;
  justify?: "start" | "center" | "end";
  className?: string;
}

export type ExtendedColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  meta?: Meta;
};

function Root<TData, TValue>({
  columns,
  data,
  config,
  children,
  onRowSelectionChange,
  ...props
}: {
  key?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config?: Config;
  className?: string;
  children?: React.ReactNode;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>(config?.initialSortBy ? [{ id: config.initialSortBy, desc: true }] : []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    if (props.key) {
      const storedVisibility = localStorage.getItem(`${props.key}-columns`);
      return storedVisibility ? JSON.parse(storedVisibility) : {};
    }

    if (config?.initialColumnVisibility) {
      return config.initialColumnVisibility;
    }

    return {};
  });

  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  React.useEffect(() => {
    if (props.key) {
      localStorage.setItem(`${props.key}-columns`, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      // ...(config?.onLoadMore ? { pagination: {} } : {}),
      // ...(config?.onLoadMore ? { pagination: undefined } : {}),
    },
    initialState: {
      pagination: {
        pageSize: config?.initialPageSize || 20,
      },
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // getPaginationRowModel: getPaginationRowModel(),
    ...(config?.onLoadMore ? {} : { getPaginationRowModel: getPaginationRowModel() }),
  });

  React.useEffect(() => {
    if (onRowSelectionChange) {
      requestIdleCallback(() => {
        onRowSelectionChange(table.getSelectedRowModel().rows.map((row) => row.original));
      });
    }
  }, [table.getState().rowSelection, onRowSelectionChange]);

  return (
    <TableContext.Provider value={{ table, config, globalFilter, setGlobalFilter }}>
      <div className={cn("flex flex-col flex-1 overflow-hidden", props.className)}>{children}</div>
    </TableContext.Provider>
  );
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function Toolbar({ className, children, search = true }: { className?: string; children?: React.ReactNode; search?: boolean }) {
  const { table, globalFilter, setGlobalFilter } = useTableContext();
  const [inputValue, setInputValue] = React.useState(globalFilter);
  const [open, setOpen] = React.useState(false);

  // Use a debounced value to update global filter
  const debouncedValue = useDebounce(inputValue, 300);

  React.useEffect(() => {
    setGlobalFilter(debouncedValue);
  }, [debouncedValue, setGlobalFilter]);

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  return (
    <div className={cn("flex justify-between mb-1", className)}>
      <div className="flex items-center w-full gap-1">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="" size="icon">
                <Settings2 size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* {search && <Input placeholder="Search..." className="max-w-xs" value={inputValue} onChange={handleInputChange} />} */}
        {search && (
          <div className="flex gap-0">
            <Button size="icon" variant="outline" onClick={() => setOpen(true)} className={cn(open && "rounded-r-none")}>
              <SearchIcon />
            </Button>

            <div className={cn("overflow-hidden transition-[max-width] duration-300 ease-in-out", open ? "max-w-xs" : "max-w-0")}>
              {open && (
                <Input
                  value={inputValue}
                  autoFocus={open}
                  onBlur={() => {
                    if (!inputValue) setOpen(false);
                  }}
                  onChange={handleInputChange}
                  className="w-72 focus-visible:border-ring-0 focus-visible:ring-ring/0 focus-visible:ring-[0px] rounded-l-none"
                />
              )}
            </div>
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Pagination({ className, variant = "default" }: { className?: string; variant: string }) {
  const { table } = useTableContext();

  if (variant === "default") {
    return (
      <div className={cn("flex items-center justify-between w-full gap-4 mt-1", className)}>
        <div className="flex text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {new Intl.NumberFormat("en-US").format(table.getFilteredRowModel().rows.length)} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="items-center hidden gap-2 lg:flex">
            <Label className="text-sm font-normal">Rows per page</Label>
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger className="w-20" size="sm">
                <SelectValue placeholder={table.getState().pagination.pageSize.toString()} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Group>
            <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <ChevronFirst size={15} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft size={15} />
            </Button>
            <Button variant="outline" size="sm" className="items-center w-20 text-xs font-semibold" disabled>
              Page {table.getState().pagination.pageIndex + 1}
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight size={15} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <ChevronLast size={15} />
            </Button>
          </Group>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    const { pageIndex, pageSize } = table.getState().pagination;
    const total = table.getFilteredRowModel().rows.length;

    const start = total === 0 ? 0 : pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, total);

    const formatter = new Intl.NumberFormat();

    return (
      <div className={cn("flex items-center justify-between w-full gap-4 mt-1", className)}>
        <span className="text-xs text-foreground/50">
          {formatter.format(start)}–{formatter.format(end)} of {formatter.format(total)}
        </span>
        <Group>
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft size={15} />
          </Button>
          {/* <Button variant="outline" size="sm" className="items-center w-20 text-xs font-semibold" disabled>
          {formatter.format(start)}–{formatter.format(end)} of {formatter.format(total)}
        </Button> */}
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight size={15} />
          </Button>
        </Group>
      </div>
    );
  }
}

function Content({ children }: { children?: React.ReactNode }) {
  return (
    <div data-slot="table-container" className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-foreground scrollbar-track-background">
      <table data-slot="table" className="w-full caption-bottom">
        {children}
      </table>
    </div>
  );
}

function Header({
  size,
  className,
  variant,
}: {
  variant?: VariantProps<typeof variants>["variant"];
  size?: VariantProps<typeof variants>["size"];
  className?: string;
}) {
  const { table, config } = useTableContext();

  return (
    <TableHeader className={cn("sticky top-0", className)}>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {config?.enableRowSelection && (
            <TableHead className={cn(variants({ variant, size }))}>
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                  onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                  aria-label="Select all"
                />
              </div>
            </TableHead>
          )}
          {headerGroup.headers.map((header) => {
            const column = header.column;
            const columnDef = header.column.columnDef as ExtendedColumnDef<unknown, unknown>;

            if (columnDef.meta?.disableDisplay) {
              return null;
            }

            const justify = columnDef.meta?.justify || "start";

            if (columnDef.meta?.enableSort) {
              const isSortedAsc = column.getIsSorted() === "asc";
              const isSortedDesc = column.getIsSorted() === "desc";

              return (
                <TableHead className={cn(variants({ variant, size }))} key={header.id} onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  <div
                    className={cn(
                      "cursor-pointer flex gap-1.5 items-center",
                      justify === "end" && "flex-row-reverse",
                      justify === "center" && "justify-center",
                      variants({ variant, size })
                    )}
                  >
                    {flexRender(columnDef.header, header.getContext())}
                    <div className="flex flex-col gap-[1.5px]">
                      <TriangleIcon className={cn("w-1.5 h-1.5 text-foreground/25", isSortedAsc && "text-foreground/100")} />
                      <TriangleIcon className={cn("w-1.5 h-1.5 text-foreground/25 rotate-180", isSortedDesc && "text-foreground/100")} />
                    </div>
                  </div>
                </TableHead>
              );
            }

            return (
              <TableHead className={cn(variants({ variant, size }))} key={header.id}>
                <div className={cn("flex gap-1.5 items-center", justify === "end" && "flex-row-reverse", justify === "center" && "justify-center")}>
                  {flexRender(columnDef.header, header.getContext())}
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}

function Body({
  size,
  variant,
}: {
  variant?: VariantProps<typeof variants>["variant"];
  size?: VariantProps<typeof variants>["size"];
} = {}) {
  const { table, config } = useTableContext();

  return (
    <TableBody>
      {table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className="border-0 hover:bg-foreground/5 data-[state=selected]:bg-foreground/5"
          >
            {config?.enableRowSelection && (
              <TableCell className={cn(variants({ variant, size }))}>
                <div className="flex items-center justify-center">
                  <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
                </div>
              </TableCell>
            )}
            {row.getVisibleCells().map((cell) => {
              const columnDef = cell.column.columnDef as ExtendedColumnDef<unknown, unknown>;

              const justify = columnDef.meta?.justify || "start";
              const className = columnDef.meta?.className || "";

              if (columnDef.meta?.disableDisplay) {
                return null;
              }

              return (
                <TableCell
                  className={cn(justify === "end" && "text-right", justify === "center" && "text-center", variants({ variant, size }), className)}
                  key={cell.id}
                >
                  {flexRender(columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={table.getVisibleLeafColumns().length} className={cn("text-center h-24", variants({ variant, size }))}>
            No results.
          </TableCell>
        </TableRow>
      )}

      {config?.onLoadMore && (
        <TableRow>
          <TableCell
            colSpan={table.getVisibleLeafColumns().length + (config?.enableRowSelection ? 1 : 0)}
            className={cn("text-center", variants({ variant, size }))}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                config?.onLoadMore && config.onLoadMore();
              }}
              disabled={config.isLoadingMore || !config.hasMore}
            >
              {config.isLoadingMore ? (
                <div className="flex items-center gap-1">
                  <LoaderCircleIcon size={15} className="animate-spin" /> Loading
                </div>
              ) : config.hasMore ? (
                "Load more"
              ) : (
                "No more data"
              )}
            </Button>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}

export const DataTable = {
  Root: Root,
  Toolbar,
  Pagination,
  Content,
  Header,
  Body,
};
