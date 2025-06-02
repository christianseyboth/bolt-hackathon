"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "../globals.css";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { AuthProvider } from "@/components/auth/auth-provider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side authentication check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies,
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    redirect("/login");
  }
  console.log(session);

  return (
    <AuthProvider>
      <div className="h-screen flex dark:bg-neutral-950">
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col h-screen">
          <MobileHeader />
          <main className="flex-1 flex flex-col space-y-4 px-4 md:px-8 pt-4 pb-12 overflow-y-auto">
            {children}
          </main>
          <Toaster />
        </div>
      </div>
    </AuthProvider>
  );
}