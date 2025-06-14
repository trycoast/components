import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  context?: string | number;
}

interface ChecklistProps {
  label: string;
  collapsed?: boolean;
  options: Option[];
  selected: string[];
  setSelected: (values: string[]) => void;
  className?: string;
}

export function Checklist({ label, collapsed = false, options, selected, setSelected, className }: ChecklistProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="">{label}</h3>
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
      </div>

      {!isCollapsed && (
        <div className="space-y-0.25">
          {options.map((option) => (
            <label key={option.value} className="flex items-center justify-between p-1 px-2 space-x-2 rounded-md cursor-pointer hover:bg-foreground/10">
              <div className="flex items-center gap-2">
                <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
                <span className="text-sm">{option.label}</span>
              </div>
              <span className="text-xs">{option?.context}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
