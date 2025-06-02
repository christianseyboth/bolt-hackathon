"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../logo";
import {
  IconDashboard,
  IconMail,
  IconShieldCheck,
  IconUsers,
  IconSettings,
  IconLogout,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/use-toast";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <div
      className={cn(
        "w-64 border-r border-neutral-800 h-screen py-6 px-4 flex flex-col bg-neutral-950",
        className
      )}
    >
      <div className="px-2 mb-8">
        <Logo />
      </div>
      
      <nav className="flex-1 space-y-1">
        <SidebarItem 
          href="/dashboard" 
          icon={<IconDashboard className="h-5 w-5" />} 
          isActive={pathname === "/dashboard"}
        >
          Dashboard
        </SidebarItem>
        
        <SidebarItem 
          href="/dashboard/emails" 
          icon={<IconMail className="h-5 w-5" />} 
          isActive={pathname === "/dashboard/emails" || pathname.startsWith("/dashboard/emails/")}
        >
          Email Analysis
        </SidebarItem>
        
        <SidebarItem 
          href="/dashboard/security" 
          icon={<IconShieldCheck className="h-5 w-5" />} 
          isActive={pathname === "/dashboard/security"}
        >
          Security
        </SidebarItem>
        
        <SidebarItem 
          href="/dashboard/team" 
          icon={<IconUsers className="h-5 w-5" />} 
          isActive={pathname === "/dashboard/team"}
        >
          Team
        </SidebarItem>
      </nav>
      
      <div className="space-y-1 pt-6 mt-6 border-t border-neutral-800">
        <SidebarItem 
          href="/dashboard/settings" 
          icon={<IconSettings className="h-5 w-5" />} 
          isActive={pathname === "/dashboard/settings"}
        >
          Settings
        </SidebarItem>
        
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors w-full text-neutral-400 hover:text-white hover:bg-neutral-900"
        >
          <IconLogout className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

function SidebarItem({ href, icon, children, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive
          ? "bg-neutral-900 text-white"
          : "text-neutral-400 hover:text-white hover:bg-neutral-900"
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}