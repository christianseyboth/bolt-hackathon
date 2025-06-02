"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { IconMenu2 } from "@tabler/icons-react";
import { Logo } from "../logo";
import { Sidebar } from "./sidebar";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex md:hidden items-center justify-between px-4 py-2 border-b border-neutral-800">
      <Logo />
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconMenu2 className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}