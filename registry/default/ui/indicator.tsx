//
// Usage:
//
// <Indicator.Root>
//   <Indicator.Badge variant={"secondary"}>{filters.accounts.length}</Indicator.Badge>
//   <Indicator.Anchor>
//     <Button>
//       <FilterIcon /> Accounts
//     </Button>
//   </Indicator.Anchor>
// </Indicator.Root>
// NOTE: This is a decent start, but could use some more variants and options, other than that, super useful (tried to recreate the daisy-ui indicator logic.)

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type Placement = "top-right" | "top-center" | "top-left" | "right-center" | "center" | "left-center" | "bottom-right" | "bottom-center" | "bottom-left";

const placementClasses: Record<Placement, string> = {
  "top-right": "top-0 right-0 translate-x-1/3 -translate-y-1/3",
  "top-center": "top-0 left-1/2 -translate-x-1/2 -translate-y-1/3",
  "top-left": "top-0 left-0 -translate-x-1/3 -translate-y-1/3",

  "right-center": "top-1/2 right-0 translate-x-1/3 -translate-y-1/2",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "left-center": "top-1/2 left-0 -translate-x-1/3 -translate-y-1/2",

  "bottom-right": "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3",
  "bottom-left": "bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
};

const badgeVariants = cva("absolute z-20 pointer-events-none select-none rounded-full inline-flex items-center justify-center leading-none", {
  variants: {
    variant: {
      // shadcn tokens
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-input bg-background text-foreground",
    },
    size: {
      sm: "text-[10px] min-w-[1rem] min-h-[1rem] px-1 py-0.5",
      md: "text-xs min-w-[1.25rem] min-h-[1.25rem] px-1.5 py-0.5",
      lg: "text-sm min-w-[1.5rem] min-h-[1.5rem] px-2 py-0.5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export function IndicatorRoot({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative inline-flex", className)} {...props}>
      {children}
    </div>
  );
}

export interface IndicatorBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  placement?: Placement;
  /** Extra offset on x/y (in Tailwind spacing classes) */
  offsetClassName?: string; // e.g. "-translate-y-1"
  /** Size for the dot when there is no text */
  dotSizeClassName?: string; // e.g. "w-2.5 h-2.5"
}

export function IndicatorBadge({
  className,
  variant,
  size,
  placement = "top-right",
  offsetClassName,
  dotSizeClassName = "w-2.5 h-2.5", // ~10px
  children,
  ...props
}: IndicatorBadgeProps) {
  const hasRenderableText = React.Children.count(children) > 0 && !(typeof children === "string" && children.trim() === "");

  if (!hasRenderableText) {
    // Dot mode (auto when no text)
    return (
      <span
        role="status"
        aria-label="status"
        className={cn(
          "absolute z-20 rounded-full",
          // use tokens; ring to separate from backgrounds
          "bg-primary ring-2 ring-background",
          dotSizeClassName,
          placementClasses[placement],
          offsetClassName,
          className
        )}
        {...props}
      />
    );
  }

  return (
    <span className={cn(badgeVariants({ variant, size }), placementClasses[placement], offsetClassName, className)} {...props}>
      {children}
    </span>
  );
}

export interface IndicatorAnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function IndicatorAnchor({ asChild, className, children, ...props }: IndicatorAnchorProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp className={cn("relative", className)} {...props}>
      {children}
    </Comp>
  );
}

export const Indicator = {
  Root: IndicatorRoot,
  Badge: IndicatorBadge,
  Anchor: IndicatorAnchor,
};
