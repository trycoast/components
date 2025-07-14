import { cn } from "@/lib/utils";
import React from "react";
import { type RouteObject, useRoutes } from "react-router-dom";

const Root = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col h-screen overflow-hidden">{children}</div>;

const Block = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cn("w-full p-4", className)}>{children}</div>;

const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("container [@media(min-width:1920px)]:max-w-[1920px] mx-auto h-full overflow-hidden", className)}>{children}</div>;
};

const Routes = ({ routes }: { routes: RouteObject[] }) => {
  const element = useRoutes(routes);

  return (
    <main className="flex-1 overflow-auto">
      <div className="min-h-full h-full">{element}</div>
    </main>
  );
};

export const Layout = {
  Root,
  Block,
  Container,
  Routes,
};
