"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { format, isValid } from "date-fns"

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
      className={cn("p-4 bg-[#010411] border border-white/10 rounded-[2.5rem] shadow-2xl relative", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-2 relative items-center h-12 mb-4 px-10", 
        caption_label: "text-sm font-black tracking-widest text-white uppercase text-center",
        nav: "flex items-center justify-between absolute inset-x-4 top-4 z-[100] w-[calc(100%-2rem)]", 
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 opacity-70 hover:opacity-100 rounded-xl text-primary transition-all bg-white/5 border border-white/5 flex items-center justify-center"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 opacity-70 hover:opacity-100 rounded-xl text-primary transition-all bg-white/5 border border-white/5 flex items-center justify-center"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-2",
        weekday: "text-primary/50 w-9 font-black text-[9px] uppercase tracking-widest flex items-center justify-center",
        week: "flex w-full mt-2 justify-between",
        day: "h-10 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-9 p-0 font-bold rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white text-xs relative overflow-visible"
        ),
        selected: "bg-primary text-slate-950 shadow-[0_0_20px_rgba(0,255,255,0.5)] rounded-xl font-black scale-105 z-10",
        today: "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full font-black text-primary",
        outside: "opacity-10 pointer-events-none",
        disabled: "opacity-10 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className="h-5 w-5" />;
          return <ChevronRight className="h-5 w-5" />;
        },
        DayContent: ({ date, ...dayProps }: any) => {
          if (!date || !isValid(date)) return null;
          
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayNumber = periodDays ? periodDays[dateStr] : undefined;

          return (
            <div className="relative w-full h-full flex items-center justify-center">
              <span className="relative z-10">{date.getDate()}</span>
              
              {dayNumber !== undefined && (
                <div 
                  className="pointer-events-none"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '18px',
                    height: '18px',
                    backgroundColor: '#FF7F50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    border: '2px solid #010411',
                    boxShadow: '0 0 8px rgba(255,127,80,0.4)',
                  }}
                >
                  <span style={{
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: '900',
                    lineHeight: '1',
                  }}>{dayNumber}</span>
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