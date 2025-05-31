import React from "react";
import { cn } from "@/lib/utils";
import { IconBell, IconSettings } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DashboardHeaderProps {
  heading: string;
  subheading?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  subheading,
  className,
  children,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-center",
        className
      )}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{heading}</h1>
        {subheading && (
          <p className="text-neutral-400 text-sm mt-1">{subheading}</p>
        )}
      </div>
      <div className="flex items-center mt-4 md:mt-0 space-x-2">
        <Button variant="ghost" size="icon">
          <IconBell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <IconSettings className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {children}
    </div>
  );
}