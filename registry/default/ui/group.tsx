import { cn } from "@/lib/utils";
import React from "react";

export interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const Group = React.forwardRef<HTMLDivElement, GroupProps>(
  ({ className, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);

    return (
      <div className={cn("inline-flex", className)} ref={ref} {...props}>
        {React.Children.map(childrenArray, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              className: cn(
                child.props.className,
                "rounded-none border-r-0",
                index === 0 && "rounded-l-md",
                index === childrenArray.length - 1 && "rounded-r-md border-r",
                "first:rounded-l-md last:rounded-r-md"
              ),
            });
          }
          return child;
        })}
      </div>
    );
  }
);
Group.displayName = "Group";

export { Group };
