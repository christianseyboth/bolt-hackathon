import React from "react";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <main className="min-h-screen flex flex-col">{children}</main>
      <Toaster />
    </div>
  );
}