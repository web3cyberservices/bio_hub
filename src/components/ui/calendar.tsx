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
      className={cn("p-6 bg-[#010411] border border-white/10 rounded-[2rem] shadow-2xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        month_caption: "flex justify-center pt-2 relative items-center mb-8",
        caption_label: "text-lg font-black tracking-tight text-white flex items-center gap-2 uppercase",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 opacity-50 hover:opacity-100 rounded-xl hover:bg-white/5 transition-colors absolute left-1 text-white"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 opacity-50 hover:opacity-100 rounded-xl hover:bg-white/5 transition-colors absolute right-1 text-white"
        ),
        month_grid: "w-full border-collapse mx-auto",
        weekdays: "flex justify-between mb-4",
        weekday:
          "text-[#00ffff]/40 w-11 font-black text-[9px] uppercase tracking-widest flex items-center justify-center",
        week: "flex w-full mt-2 justify-between gap-1",
        day: "h-11 w-11 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-11 w-11 p-0 font-bold rounded-xl flex items-center justify-center transition-all hover:bg-[#00ffff]/10 active:scale-95 text-white/80"
        ),
        selected:
          "bg-[#00ffff] text-[#010411] hover:bg-[#00ffff] hover:text-[#010411] focus:bg-[#00ffff] focus:text-[#010411] shadow-[0_0_20px_rgba(0,255,255,0.4)] rounded-xl font-black",
        today: "text-[#00ffff] font-black border-b-2 border-[#00ffff] rounded-none",
        outside:
          "outside text-white/5 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-white/5 opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        dropdowns: "flex gap-2 items-center font-headline font-bold text-white",
        dropdown_month: "relative",
        dropdown_year: "relative",
        dropdown: "bg-[#010411] text-white font-bold cursor-pointer hover:text-[#00ffff] transition-colors outline-none appearance-none p-1 rounded-lg",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className="h-5 w-5 text-[#00ffff]" />;
          return <ChevronRight className="h-5 w-5 text-[#00ffff]" />;
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }