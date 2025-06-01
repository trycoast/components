import * as React from "react";
import { Button } from "@/registry/default/ui/button";
import { Checkbox } from "@/registry/default/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/registry/default/ui/dropdown-menu";
import { Group } from "@/registry/default/ui/group";
import { Input } from "@/registry/default/ui/input";
import { Label } from "@/registry/default/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/default/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/default/ui/table";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
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
}

interface Meta {
  disableDisplay?: boolean;
}

export type ExtendedColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  meta?: Meta;
};

function Root<TData, TValue>({
  columns,
  data,
  config,
  children,
  ...props
}: {
  key?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  config?: Config;
  className?: string;
  children?: React.ReactNode;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    props.key ? JSON.parse(localStorage.getItem(`${props.key}-columns`) || "{}") : {}
  );
  const [rowSelection, setRowSelection] = React.useState({});
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
      rowSelection,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: config?.initialPageSize || 20,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

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

function Toolbar({ className }: { className?: string }) {
  const { table, globalFilter, setGlobalFilter } = useTableContext();
  const [inputValue, setInputValue] = React.useState(globalFilter);

  // Use a debounced value to update global filter
  const debouncedValue = useDebounce(inputValue, 300);

  React.useEffect(() => {
    setGlobalFilter(debouncedValue);
  }, [debouncedValue, setGlobalFilter]);

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  return (
    <div className={cn("flex justify-between", className)}>
      <div className="flex items-center w-full gap-1 mb-1">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Settings2 size={15} /> View
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
        <Input placeholder="Search..." className="max-w-xs" value={inputValue} onChange={handleInputChange} />
      </div>
    </div>
  );
}

function Pagination({ className }: { className?: string }) {
  const { table } = useTableContext();

  return (
    <div className={cn("flex items-center justify-between w-full gap-4 my-1", className)}>
      <div className="flex text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of {new Intl.NumberFormat("en-US").format(table.getFilteredRowModel().rows.length)} row(s) selected.
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 lg:flex">
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

function Content({ children }: { children?: React.ReactNode }) {
  return (
    <div data-slot="table-container" className="h-full overflow-y-auto">
      <table data-slot="table" className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  );
}

function Header() {
  const { table, config } = useTableContext();

  return (
    <Content>
      <TableHeader className="sticky top-0">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {config?.enableRowSelection && (
              <TableHead>
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                  />
                </div>
              </TableHead>
            )}
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className={header.isPlaceholder ? "hidden" : ""}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
    </Content>
  );
}

function Body() {
  const { table, config } = useTableContext();

  return (
    <Content>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {config?.enableRowSelection && (
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
                  </div>
                </TableCell>
              )}
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Content>
  );
}

export const DataTable = { Root, Toolbar, Pagination, Content, Header, Body };
