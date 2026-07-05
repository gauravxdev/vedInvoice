"use client";

import * as React from "react";
import { Sidebar, SidebarToggle } from '@/components/layout/sidebar';
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';


function MobileSidebar() {
  const { open, setOpen } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-64 p-0 bg-black border-neutral-800" showCloseButton={false}>
        <div className="sr-only">
          <SheetTitle>Navigation menu</SheetTitle>
        </div>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar() {
  const { open } = useSidebar();
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <div
      className="hidden md:block flex-shrink-0 transition-all duration-300 h-full"
      style={{ width: open ? '16rem' : '0' }}
    >
      <Sidebar />
    </div>
  );
}

function SidebarTrigger() {
  const { setOpen } = useSidebar();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition"
        aria-label="Open sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>
    );
  }

  return <SidebarToggle />;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="h-screen flex bg-neutral-50 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
        <div className="print:hidden h-full flex flex-col">
          <DesktopSidebar />
        </div>
        <MobileSidebar />
        <main className="flex-1 flex flex-col overflow-y-auto print:overflow-visible print:block">
          <header className="flex items-center p-4 border-b border-neutral-200 bg-white print:hidden">
            <SidebarTrigger />
            <div className="ml-3 flex items-center gap-2 md:hidden">
              <div className="h-7 w-7 bg-black text-white flex items-center justify-center rounded-lg font-bold text-sm">
                I
              </div>
              <span className="font-semibold">Invoice App</span>
            </div>
          </header>
          <div className="flex-1 print:block">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
