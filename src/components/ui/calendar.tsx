"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  periodDays?: Record<string, number>;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  periodDays,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-[#010411] border border-white/10 rounded-[2.5rem] shadow-2xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-4 min-h-[40px]",
        caption_label: "text-sm font-black tracking-widest text-white uppercase px-12",
        nav: "flex items-center justify-between absolute inset-x-0 top-1 px-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 opacity-70 hover:opacity-100 rounded-xl hover:bg-white/10 text-primary transition-all"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 opacity-70 hover:opacity-100 rounded-xl hover:bg-white/10 text-primary transition-all"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-2",
        weekday: "text-primary/50 w-9 font-black text-[9px] uppercase tracking-widest flex items-center justify-center",
        week: "flex w-full mt-1 justify-between",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-bold rounded-xl flex items-center justify-center transition-all hover:bg-primary/20 text-white text-xs relative overflow-visible"
        ),
        selected: "bg-primary text-slate-950 hover:bg-primary hover:text-slate-950 focus:bg-primary focus:text-slate-950 shadow-[0_0_20px_rgba(0,255,255,0.5)] rounded-xl font-black scale-105 z-10",
        today: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full font-black text-primary",
        outside: "opacity-10 pointer-events-none",
        disabled: "opacity-10 pointer-events-none",
        range_middle: "bg-primary/10 text-primary",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className="h-5 w-5" />;
          return <ChevronRight className="h-5 w-5" />;
        },
        DayContent: ({ date }) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayNumber = periodDays?.[dateStr];
          
          return (
            <div className="relative flex items-center justify-center w-full h-full">
              <span className="relative z-10">{date.getDate()}</span>
              {dayNumber !== undefined && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7F50] rounded-full flex items-center justify-center shadow-lg border border-black/50 z-[100] animate-in zoom-in-50 duration-300"
                >
                  <span className="text-[8px] font-black text-white leading-none pointer-events-none">{dayNumber}</span>
                </div>
              )}
            </div>
          );
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }