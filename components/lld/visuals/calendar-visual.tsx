"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarVisual() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstWeekday = getFirstWeekday(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const dateKey = (day: number) => `${viewYear}-${viewMonth + 1}-${day}`;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex h-full items-start justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-sm">
        {/* Month header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border px-2 py-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-y-1 p-2">
          {cells.map((day, i) =>
            day === null ? (
              <div key={`empty-${i}`} />
            ) : (
              <button
                key={day}
                onClick={() => setSelected(dateKey(day))}
                className={cn(
                  "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                  isToday(day) && selected !== dateKey(day)
                    ? "bg-accent/15 font-semibold text-accent"
                    : "",
                  selected === dateKey(day)
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {day}
              </button>
            )
          )}
        </div>

        {/* Selected date */}
        <div className="border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">
            {selected
              ? `Selected: ${selected}`
              : "Click a date to select it"}
          </p>
        </div>
      </div>
    </div>
  );
}
