import React from "react";
import "../../globals.css";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { MobileHeader } from "@/components/dashboard/mobile-header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full flex dark:bg-neutral-950">
      <Sidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="flex-1 px-4 md:px-8 pt-4 pb-12">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}