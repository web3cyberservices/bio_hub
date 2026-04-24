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
      className={cn("p-8 bg-slate-950 border border-white/10 rounded-[2rem]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        month_caption: "flex justify-center pt-2 relative items-center mb-8",
        caption_label: "text-xl font-bold tracking-tight text-white flex items-center gap-2",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 opacity-50 hover:opacity-100 rounded-xl hover:bg-primary/10 transition-colors absolute left-1 text-white"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 opacity-50 hover:opacity-100 rounded-xl hover:bg-primary/10 transition-colors absolute right-1 text-white"
        ),
        month_grid: "w-full border-collapse mx-auto",
        weekdays: "flex justify-between mb-4",
        weekday:
          "text-primary/60 w-11 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center",
        week: "flex w-full mt-2 justify-between gap-1",
        day: "h-11 w-11 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-11 w-11 p-0 font-medium rounded-xl flex items-center justify-center transition-all hover:bg-primary/20 active:scale-95 text-white/90"
        ),
        selected:
          "bg-primary text-slate-950 hover:bg-primary hover:text-slate-950 focus:bg-primary focus:text-slate-950 shadow-[0_0_20px_rgba(0,255,255,0.4)] rounded-xl font-black",
        today: "text-primary font-black border-b-2 border-primary rounded-none",
        outside:
          "outside text-white/10 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-white/5 opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        dropdowns: "flex gap-2 items-center font-headline font-bold text-white",
        dropdown_month: "relative",
        dropdown_year: "relative",
        dropdown: "bg-slate-900 text-white font-bold cursor-pointer hover:text-primary transition-colors outline-none appearance-none p-1 rounded-lg",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className="h-5 w-5" />;
          return <ChevronRight className="h-5 w-5" />;
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
