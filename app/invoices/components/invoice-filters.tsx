"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function InvoiceFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [query, setQuery] = useState(searchParams.get("query")?.toString() || "");
  const [date, setDate] = useState(searchParams.get("date")?.toString() || "");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentQuery = searchParams.get("query")?.toString() || "";
      const currentDate = searchParams.get("date")?.toString() || "";
      
      if (query === currentQuery && date === currentDate) {
        return;
      }

      const params = new URLSearchParams(searchParams);
      params.set("page", "1"); // reset to page 1 on search change
      
      if (query) {
        params.set("query", query);
      } else {
        params.delete("query");
      }

      if (date) {
        params.set("date", date);
      } else {
        params.delete("date");
      }

      replace(`${pathname}?${params.toString()}`);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, date, pathname, replace, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="relative flex-1">
        <label htmlFor="search" className="sr-only">
          Search Invoices
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by Invoice ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>
      
      <div className="flex-shrink-0 w-full sm:w-[240px] flex gap-2">
        <label htmlFor="date" className="sr-only">
          Filter by Date
        </label>
        <Popover>
          <PopoverTrigger
            className={cn(
              "flex h-9 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(new Date(date), "dd MMMM yyyy") : <span>Pick a date</span>}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(format(selectedDate, "yyyy-MM-dd"));
                }
              }}
            />
          </PopoverContent>
        </Popover>
        {date && (
          <button 
            type="button" 
            onClick={() => setDate("")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent text-sm shadow-sm hover:bg-accent hover:text-accent-foreground"
            title="Clear date"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
