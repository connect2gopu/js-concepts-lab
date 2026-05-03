# Session Handoff — Day View Calendar (LLD #24)

## 1. Task Overview

Building a **Day View Calendar** component (Google Calendar-style vertical timeline with timed events) as a learning exercise for LLD problem #24 in the `js-concepts-lab` Next.js project. The session is structured as interactive mentorship — user attempts each part before seeing the solution.

---

## 2. Current State

**Files involved:**
- `components/lld/visuals/calendar-visual.tsx` — currently a **Month Grid** (date picker). This is what gets rendered in the Visual tab. Will be replaced/upgraded with the Day View.
- `app/lld/[slug]/page.tsx` — VISUAL_REGISTRY at line 59 maps `"24-calendar"` → `CalendarVisual`. No changes needed here.
- `snippets/24-calender-helper.js` — user's scratch file for iterating on logic before wiring into React.

**Decisions made:**
- `TOTAL_HEIGHT = 1200px` (24 hours), giving `HOUR_HEIGHT = 50px` per hour
- Using a **two-column layout**: left gutter (60px, hour labels) + right side (flex: 1, grid lines + events layer)
- The events layer must be `position: relative` so child events can use `position: absolute`

**User has correctly implemented:**

```js
// ✅ Confirmed correct
function timeToPixels(hour, minute, totalHeight) {
  const totalMinutes = hour * 60 + minute;
  const pixelsPerMinute = totalHeight / (24 * 60);
  return totalMinutes * pixelsPerMinute;
}

// ✅ Confirmed correct
function generateHourLabels() {
  let labels = [];
  for (let i = 0; i < 24; i++) {
    let amOrPm = i > 11 ? 'PM' : 'AM';
    let hour = i % 12;
    let finalHour = hour === 0 ? 12 : hour;
    labels.push(finalHour + ' ' + amOrPm);
  }
  return labels;
}
```

---

## 3. Pending Work (ordered)

**Part A — Time Grid & Gutter** ← **currently here**
- [ ] User to answer two design questions (see open questions below)
- [ ] Fill in the `TimeGrid` JSX scaffold with label positioning + horizontal lines
- [ ] Wrap in overflow-y scroll container
- [ ] Add `position: relative` events layer div inside the right column

**Part B — Event Positioning Engine**
- [ ] Define `CalendarEvent` type: `{ id, title, startHour, startMin, endHour, endMin }`
- [ ] Use `timeToPixels` to compute `top` and `height` for each event
- [ ] Render events as `position: absolute` blocks inside the events layer

**Part C — Overlap / Column Packing Algorithm**
- [ ] Detect overlapping events (interval intersection)
- [ ] Assign each event to a column index
- [ ] Compute `left` and `width` as percentages based on column count

**Part D — Click-to-Create Interaction**
- [ ] `onClick` on grid → get `clientY`, compute offset from grid top → convert to minutes → snap to 15-min intervals
- [ ] Open a modal/inline form to set title, confirm creates event in state

---

## 4. Blockers / Open Questions

Two design questions the user was asked but hasn't answered yet — the next session should start by getting answers to these before writing the JSX:

> **Q1:** The label `"12 AM"` should appear at the **top edge** of its hour row, not vertically centered. What CSS would you use on the label element?

> **Q2:** The horizontal grid line uses `border-top` on each hour row. But the very first row (`i === 0`) would put a line at `0px` — the very top of the container. How do you conditionally skip it?

---

## 5. Key Context

| Item | Value |
|------|-------|
| Project root | `/Users/whogopu/projects/nextjs-projects/js-concepts-lab` |
| Branch | `feature/lld/aman/24-calender` |
| Framework | Next.js (App Router), TypeScript, Tailwind CSS |
| Visual registry | `app/lld/[slug]/page.tsx` line 59, key `"24-calendar"` |
| Visual component | `components/lld/visuals/calendar-visual.tsx` → export `CalendarVisual` |
| Scratch file | `snippets/24-calender-helper.js` |
| Grid constants | `TOTAL_HEIGHT = 1200`, `HOUR_HEIGHT = 50`, gutter width `= 60px` |
| Teaching approach | User attempts each part first, mentor corrects and guides — **do not skip to full solutions** |

---

## 6. Resume Prompt

```
We are building a Day View Calendar (Google Calendar-style) for LLD problem #24 in the js-concepts-lab Next.js project (branch: feature/lld/aman/24-calender). Act as a Senior Frontend Engineer and Interactive Coding Mentor — don't give full solutions upfront, guide the user to attempt each piece first.

**Current file:** `components/lld/visuals/calendar-visual.tsx` — this is what renders in the Visual tab via the VISUAL_REGISTRY in `app/lld/[slug]/page.tsx` (line 59, key "24-calendar").

**User has already correctly built:**
- `timeToPixels(hour, minute, totalHeight)` — converts a time to a pixel offset (totalHeight=1200 for 24hrs)
- `generateHourLabels()` — returns ["12 AM", "1 AM", ..., "11 PM"]

**Constants agreed on:** TOTAL_HEIGHT=1200px, HOUR_HEIGHT=50px, gutter width=60px. Events layer is position:relative, individual events are position:absolute.

**We are mid-way through Part A (Time Grid & Gutter).** The user was asked two design questions they haven't answered yet. Start by asking them these before writing any code:
1. The "12 AM" label should sit at the top edge of its hour row — what CSS positioning would they use on the label?
2. Grid lines use border-top on each hour row — how do they skip the border on the very first row (i===0)?

Once they answer, help them complete the TimeGrid JSX with: hour labels in left gutter, horizontal lines in right column, overflow-y scroll wrapper, and position:relative events layer.

After Part A is done, the remaining parts are:
- B: Render positioned event blocks using timeToPixels
- C: Overlap/column-packing algorithm (interval intersection + width splitting)
- D: Click-to-create (clientY → minutes → snap to 15min)
```
