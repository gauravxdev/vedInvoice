"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Users, Settings, PlusCircle, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/use-sidebar';

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    label: 'Create Invoice',
    icon: PlusCircle,
    href: '/invoices/create',
  },
  {
    label: 'Invoices',
    icon: FileText,
    href: '/invoices',
  },
  {
    label: 'Customers',
    icon: Users,
    href: '/customers',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open, toggle } = useSidebar();

  return (
    <div
      className={cn(
        "space-y-4 py-4 flex flex-col h-full bg-black text-white border-r border-neutral-800 transition-all duration-300",
        open ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div className="px-3 py-2 flex-1 min-w-[256px]">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white text-black flex items-center justify-center rounded-lg font-bold text-xl">
              I
            </div>
            <h1 className="text-2xl font-bold">Invoice App</h1>
          </div>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-neutral-800 rounded-lg transition",
                pathname === route.href ? "text-white bg-neutral-800" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SidebarToggle() {
  const { open, toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      className="hidden md:flex"
      aria-label={open ? "Close sidebar" : "Open sidebar"}
    >
      {open ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
    </Button>
  );
}
