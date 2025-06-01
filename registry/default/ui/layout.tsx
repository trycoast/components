import * as React from "react";

import { cn } from "@/lib/utils";

const Layout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "container flex flex-col h-full gap-2 mx-auto overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
};

export { Layout };
