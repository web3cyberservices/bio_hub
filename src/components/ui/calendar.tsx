
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DayProps } from "react-day-picker"
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
      className={cn("p-4 bg-transparent", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        month_caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-black tracking-widest text-white uppercase flex items-center gap-2",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 opacity-70 hover:opacity-100 rounded-xl hover:bg-white/10 transition-all absolute left-1 text-primary border border-primary/20"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 opacity-70 hover:opacity-100 rounded-xl hover:bg-white/10 transition-all absolute right-1 text-primary border border-primary/20"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-4",
        weekday:
          "text-primary/50 w-10 font-black text-[10px] uppercase tracking-widest flex items-center justify-center",
        week: "flex w-full mt-2 justify-between",
        day: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-bold rounded-xl flex items-center justify-center transition-all hover:bg-primary/20 active:scale-90 text-white text-xs relative"
        ),
        selected:
          "bg-primary text-slate-950 hover:bg-primary hover:text-slate-950 focus:bg-primary focus:text-slate-950 shadow-[0_0_25px_rgba(0,255,255,0.6)] rounded-xl font-black scale-110 z-10",
        today: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full font-black text-primary",
        outside: "opacity-20 pointer-events-none",
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
        Day: (dayProps: DayProps) => {
          const dateStr = format(dayProps.day.date, 'yyyy-MM-dd');
          const dayNumber = periodDays?.[dateStr];
          
          return (
            <div className="relative h-10 w-10 flex items-center justify-center">
              <button 
                {...dayProps.htmlAttributes}
                className={cn(
                  dayProps.htmlAttributes.className,
                  "w-full h-full flex items-center justify-center relative"
                )}
              >
                {dayProps.day.date.getDate()}
                {dayNumber !== undefined && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7F50] rounded-full flex items-center justify-center shadow-lg border border-black/40 z-[100] animate-in zoom-in-50 duration-300">
                    <span className="text-[8px] font-black text-white leading-none">{dayNumber}</span>
                  </div>
                )}
              </button>
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
