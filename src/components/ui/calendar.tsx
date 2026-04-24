"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-transparent", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-black tracking-widest text-white uppercase flex items-center gap-2",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100 rounded-lg hover:bg-white/10 transition-all absolute left-1 text-white border border-white/5"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 opacity-50 hover:opacity-100 rounded-lg hover:bg-white/10 transition-all absolute right-1 text-white border border-white/5"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between mb-2",
        weekday:
          "text-primary/40 w-9 font-black text-[10px] uppercase tracking-tighter flex items-center justify-center",
        week: "flex w-full mt-1 justify-between",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-bold rounded-xl flex items-center justify-center transition-all hover:bg-primary/20 active:scale-90 text-white/80 text-xs"
        ),
        selected:
          "bg-primary text-slate-950 hover:bg-primary hover:text-slate-950 focus:bg-primary focus:text-slate-950 shadow-[0_0_15px_rgba(0,255,255,0.5)] rounded-xl font-black scale-110 z-10",
        today: "text-primary font-black border-b-2 border-primary rounded-none",
        outside:
          "outside text-white/10 aria-selected:bg-primary/50 aria-selected:text-white/20",
        disabled: "text-white/5 opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        dropdowns: "flex gap-2 items-center font-headline font-bold text-white",
        dropdown_month: "relative",
        dropdown_year: "relative",
        dropdown: "bg-slate-900 text-white font-bold cursor-pointer hover:text-primary transition-colors outline-none appearance-none p-1 rounded-lg border border-white/10",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className="h-4 w-4 text-primary" />;
          return <ChevronRight className="h-4 w-4 text-primary" />;
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
