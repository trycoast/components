import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export interface Option {
  value: string;
  label: string;
  context?: string | number;
}

interface ChecklistProps {
  label: string;
  collapsed?: boolean;
  filter?: boolean;
  options: Option[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
}

export function Checklist({ label, collapsed = false, filter = false, options, selected, setSelected, className }: ChecklistProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [search, setSearch] = useState("");

  const toggle = useCallback(
    (value: string) => {
      setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    },
    [setSelected]
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lower));
  }, [search, options]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div>
          {label}
          <span className="mx-2 text-sm text-foreground/50">{options.length}</span>
        </div>
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
      </div>

      {!isCollapsed && (
        <>
          {filter && (
            <div className="px-2 py-1">
              <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="bg-card" />
            </div>
          )}
          <div className="space-y-0.25">
            {filteredOptions.map((option) => (
              <label key={option.value} className="flex items-center justify-between p-1 px-2 space-x-2 rounded-md cursor-pointer hover:bg-foreground/10">
                <div className="flex items-center gap-2">
                  <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
                  <span className="text-sm">{option.label}</span>
                </div>
                <span className="text-xs">{option?.context}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
