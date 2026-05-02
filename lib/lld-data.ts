import { Calendar, type LucideIcon } from "lucide-react";

export interface LLDItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  problem: string;
  icon: LucideIcon;
  color: string;
}

export const lldItems: LLDItem[] = [
  {
    id: 24,
    title: "Calendar",
    slug: "24-calendar",
    description:
      "Build a fully interactive calendar component with month navigation, date selection, and today highlighting.",
    problem: `## Problem Statement

Design and implement a **Calendar** component from scratch.

### Requirements

1. **Month grid view** — Display a 7-column grid (Sun–Sat) showing all days in the current month, with correct weekday offsets.
2. **Month navigation** — Previous / Next buttons to move between months.
3. **Today highlight** — Visually distinguish today's date.
4. **Date selection** — Clicking a date marks it as selected and shows the selected date below the grid.
5. **Edge cases** — Handle leap years, month boundaries, and first-day-of-month alignment correctly.

### Constraints

- Pure JavaScript / TypeScript — no external date libraries.
- Implement the calendar logic yourself (month days, leap year, weekday offsets).

### Bonus

- Week numbers in the first column.
- Range selection (start date → end date).
- Keyboard navigation (arrow keys to move focus, Enter to select).`,
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
  },
];
