# Figma design prompt — WindAI Blade Repair Tracking
## Flow 1: Job planning, drag-and-drop, and resolving job status

> Paste sections 1–9 into Figma Make / Figma AI as a single prompt. Section 10 is a condensed variant for tools with a character limit. Section 11 is for you, not for Figma — open questions to settle before the design is final.

---

## 1. What you are designing

Design the **Job Planner** screen of *Blade Repair Tracking*, a web application by WindAI. It is a desktop-only internal tool (design at 1440×1024 and 1920×1080; no mobile breakpoint needed).

**The single user:** a marine coordinator at an offshore wind farm. He pulls work orders from SAP, breaks each one into individual jobs, spreads those jobs across the days of the week, and then — usually on the day itself — marks each job as completed or cancelled. When a job is cancelled he records why, almost always weather.

**The screen's one job:** let him see the whole week at a glance, move jobs between days by dragging, and close out each job's status in as few clicks as possible.

Design for speed and density over spaciousness. This is a screen he keeps open all day.

---

## 2. Visual system

**Dark mode only.** Roboto throughout. Bootstrap 5 component behaviour and grid conventions where a standard pattern exists (modals, dropdowns, form controls, badges, buttons) — but restyled to the tokens below, not stock Bootstrap.

### Colour tokens

| Token | Hex | Use |
|---|---|---|
| `bg/base` | `#020617` | App background, outside the planner |
| `bg/surface` | `#0B1220` | Day columns, modal body |
| `bg/surface-raised` | `#111C33` | Job cards, dropdowns, inputs |
| `bg/surface-active` | `#0F1B33` | Today's column, hover on rows |
| `border/default` | `#1E293B` | Column dividers, card borders, input borders |
| `border/strong` | `#334155` | Focus-adjacent, dividers in modals |
| `text/primary` | `#F8FAFC` | Job names, dates, headings |
| `text/secondary` | `#94A3B8` | Techs, duration, metadata |
| `text/muted` | `#64748B` | Inactive day numbers, placeholders |
| `accent/primary` | `#84B8FF` | Selected nav item, today's date, links, primary buttons |
| `accent/primary-dim` | `#1E3A5F` | Filled primary surfaces, tag backgrounds |
| `status/success` | `#22C55E` | Completed job border + icon |
| `status/success-bg` | `#0D2818` | Completed card fill |
| `status/cancelled` | `#EAB308` | Cancelled job border + icon |
| `status/cancelled-bg` | `#2A2208` | Cancelled card fill |
| `status/attention` | `#EF4444` | Needs-attention badge, danger actions |
| `status/attention-bg` | `#4C1218` | Interrupted-jobs banner fill |

Job type tags use `accent/primary-dim` fill with `accent/primary` text, pill radius.

### Type scale (Roboto)

| Role | Size / weight / tracking |
|---|---|
| Screen title (month + year) | 28 / Medium (500) / -0.2 |
| Column day name | 11 / Medium / +0.8, uppercase |
| Column date number | 22 / Regular |
| Card title | 15 / Medium |
| Card metadata | 13 / Regular, `text/secondary` |
| Tag / badge | 11 / Medium, uppercase off |
| Modal heading | 18 / Medium |
| Field label | 13 / Medium |
| Input text | 14 / Regular |
| Button | 14 / Medium |

### Geometry

- Radius: 6px on cards, inputs, buttons; 4px on small icon buttons and tags; 10px on modals.
- Base spacing unit 4px. Card padding 12px. Column gutter 0 (columns are separated by a 1px `border/default` divider, edge to edge).
- Icon buttons: 28×28 with a 1px border, 4px radius.
- Elevation: modals use a scrim of `#020617` at 65% plus a soft shadow; cards use borders, not shadows.

---

## 3. Screen anatomy

Four fixed regions, then a scrolling planner:

```
┌──┬────────────────────────────────────────────────────────────┐
│  │  top bar                                                   │
│L ├────────────────────────────────────────────────────────────┤
│e │  planner header: ‹ July 2025 ›   [view range control]      │
│f ├────────────────────────────────────────────────────────────┤
│t │  ⚠ 6 jobs need attention                        [Resolve]  │
│  ├────────┬────────┬────────┬────────┬────────┬───────┬───────┤
│n │ MON 22 │ TUE 23 │ WED 24 │ THU 25 │ FRI 26 │ SAT 27│ SUN 28│
│a │ ✓  ✕   │ ✓  ✕   │ ✓  ✕   │ ✓  ✕   │ ✓  ✕   │ ✓  ✕  │ ✓  ✕  │
│v ├────────┼────────┼────────┼────────┼────────┼───────┼───────┤
│  │ + New  │ + New  │ + New  │ + New  │ + New  │ + New │ + New │
│  ├────────┼────────┼────────┼────────┼────────┼───────┼───────┤
│  │ [card] │ [card] │ [card] │        │        │       │       │
│  │ [card] │ [card] │ [card] │        │        │       │       │
│  │ [card] │        │ [card] │        │        │       │       │
└──┴────────┴────────┴────────┴────────┴────────┴───────┴───────┘
```

### 3.1 Left navigation rail

64px wide, `bg/base`, 1px right border. Icons only, 20px, centred, 44px tall hit targets.

Top to bottom: WindAI turbine mark (logo, not a nav item) → Dashboard → **Job Planner** (selected) → Work Orders → Job Types → Checklists / Tasks. Settings gear pinned to the bottom.

Selected state: `accent/primary-dim` rounded square behind the icon, icon in `accent/primary`. Hover: icon shifts from `text/muted` to `text/primary`. Every icon needs a tooltip on hover with its label.

### 3.2 Top bar

64px tall, `bg/base`, 1px bottom border.

- Left: wordmark — "Wind" in `text/primary`, "AI" in `accent/primary`, then a vertical hairline, then "Blade Repair Tracking" in Medium.
- Immediately right of that: the **site selector** — a button styled as a subtle chip (`bg/surface-raised`, 6px radius) reading "Robin Rigg" with a caret. Opens a dropdown listing other sites with a search field at the top.
- Right: help icon (`?` in a circle) and account avatar (32px circle, `accent/primary-dim` fill, initials in `accent/primary`).

### 3.3 Planner header

- Left: back chevron, "July 2025" in the screen-title style, forward chevron. Chevrons are 32×32 ghost icon buttons.
- Directly beneath or beside the month, show the visible range in `text/secondary` at 13px: "22 – 28 July".
- Right of the month: a **segmented range control**, four joined buttons in a single bordered group: `« 7 days` · `‹ 1 day` · `1 day ›` · `7 days »`. These step the visible window backward and forward. Give the group a `bg/surface-raised` fill with `border/default` and dividers between segments.
- Add a **Today** ghost button that snaps the window back to its default position. Include it — it is missing from the current build and he will need it once he has paged forward.

**Default window rule:** the planner always shows 7 days, where **day 1 is yesterday and day 2 is today**. Reflect this in the mock: if today is Tuesday 23, the columns run Mon 22 → Sun 28. Yesterday's column is included because job outcomes often arrive a day late.

### 3.4 Attention banner

Full-width strip below the header, `status/attention-bg` fill, no radius, ~48px tall.

- Left: a count badge (solid `status/attention`, white numeral, 4px radius) followed by the label. Write it as **"6 jobs need attention"** rather than "Interrupted Jobs" — it says what the state is from his side of the screen.
- Right: a **Resolve** button, solid `status/attention`, white label. It navigates to the resolve screen (5.3) — it does not open a modal.
- The banner only appears when the count is 1 or more. Also produce the variant with it absent so the spacing above the columns is defined in both cases.

### 3.5 Day columns

Seven equal columns, each divided by a 1px vertical `border/default` running the full height.

**Column header** (fixed, ~72px tall):
- Day name, uppercase, 11px, `text/muted`.
- Date number, 22px. Today's column: date number in `accent/primary`, column background `bg/surface-active`, and a 2px `accent/primary` top edge. Past days: date number in `text/muted`. Weekend columns: header background one step darker than weekdays.
- Right side of the header: two 28×28 icon buttons — **mark all jobs complete** (check icon, `status/success` border and icon) and **cancel all jobs** (cross icon, `status/attention` border and icon). These act on every job in that day. Both need a confirmation step; see 4.4.
- On hover the header buttons fill with their colour at 15% opacity.

**Add-job row** (below the header): a full-width ghost row, ~52px, centred `+ New job` in `text/secondary`. Hover: text goes `accent/primary`, background `bg/surface-active`, and a 1px dashed `accent/primary` inset border appears. Opens the new-job modal with that day pre-filled.

**Card stack:** cards fill downward with 8px gaps and 8px horizontal column padding. Columns scroll independently if the stack overflows; the header and add-job row stay pinned.

---

## 4. The job card

The most important component on the screen. Design it as a Figma component with variants.

### Content, top to bottom

1. **Job name** — 15px Medium, truncates to one line with ellipsis, full name in tooltip.
2. **Metadata row** — `2 techs` · `8 hr` · turbine name (e.g. `C4`), all 13px `text/secondary`, separated by 12px gaps, no bullet characters.
3. **Job type tag** — right-aligned on the metadata row: pill, `accent/primary-dim` on `accent/primary`. Values: Blade Repair, Blade Painting, Tower Cleaning.
4. **Work order row** — small clipboard icon plus the work order number in `text/secondary`. If no work order is linked, this row is replaced by a `+ Link work order` ghost affordance.
5. **Action row** — separated from the content above by a 1px `border/default` inset divider. Left: three 28×28 status toggle buttons. Right: three ghost icon buttons — edit (pencil), duplicate (copy), delete (trash), each 16px icon in `text/muted`, going `text/primary` on hover, delete going `status/attention`.
6. **Reason footer** — cancelled cards only. A row beneath the action divider showing the cancellation reasons as text, truncated: `Rain, Lightning and 3 more…`. Clicking it reopens the cancellation modal. Show the full list in a tooltip.

### The three status toggles

A tight group of three, left to right:

| Button | Icon | Meaning | Resting style |
|---|---|---|---|
| No status | horizontal bar / minus in a box | clears back to planned | `border/default`, icon `text/muted` |
| Complete | check in a box | job was done | `status/success` border, `status/success` icon |
| Cancel | cross in a box | job did not happen | `status/attention` border, `status/attention` icon |

Only one is active at a time. The active button gets a filled background in its own colour at ~20% opacity plus a 1px solid border in the full colour. Show all three states of the group in the variant sheet.

### Card variants

| Variant | Border | Fill | Extra |
|---|---|---|---|
| **Planned** (no status) | `border/default` | `bg/surface-raised` | — |
| **Complete** | `status/success` | `status/success-bg` | Complete toggle active |
| **Cancelled** | `status/cancelled` | `status/cancelled-bg` | Cancel toggle active; reason footer visible |
| **Needs attention** | `status/attention` at 60% | `bg/surface-raised` | Red circular `!` badge, 16px, top-right corner, overlapping the card edge by 4px |
| **Hover** | `border/strong` | +4% lightness | Cursor `grab`; drag handle dots appear at the left edge |
| **Dragging** | `accent/primary`, 2px | `bg/surface-raised` at 90% | Rotated 2°, shadow, cursor `grabbing` |
| **Drop placeholder** | 1px dashed `accent/primary` | transparent | Same height as the dragged card, shows the insertion point |

**Needs attention** stacks with the others — a cancelled job can also need attention. Show at least one combined example.

The attention badge appears when required fields are missing: no work order linked, no tech count, no duration, or no turbine status. Tooltip on the badge names what is missing, e.g. "Missing: work order, duration".

### Drag behaviour to illustrate

Cards drag between columns and reorder within a column. Show a frame mid-drag: source column with a faded gap where the card was, cursor carrying the tilted card, destination column showing the dashed placeholder. Dropping onto a past day should be allowed (he backfills), so do not design a blocked state for it.

---

## 5. Modals and the resolve screen

**5.1, 5.2 and 5.4 are modals. 5.3 is a full screen.**

All modals: centred, `bg/surface` body, 10px radius, 1px `border/strong`, scrim of `#020617` at 65%. Header row with title and a close ✕. Footer row right-aligned with a ghost **Cancel** and a solid `accent/primary` primary action. 24px padding throughout, 20px between field groups.

### 5.1 New job / Edit job — 560px wide

Title: "New job" / "Edit job". Beneath the title, a `text/secondary` line naming the day it will land on: "Tuesday 23 July".

Fields, in order:

1. **Job name** — text input, full width.
2. **Job type** — single-select dropdown. Options: Blade Repair, Blade Painting, Tower Cleaning, then a divider, then a persistent `+ Add job type` row at the bottom in `accent/primary`. Each option shows its name plus a one-line description in `text/muted` beneath.
3. **Number of techs** — number stepper, whole numbers, min 1.
4. **Duration** — number stepper with a `hr` suffix inside the field, whole numbers.
   - Put 3 and 4 side by side in a two-column row.
5. **Turbine status** — single-select dropdown: Online, Offline. Place beside a **Turbine** field if turbine is captured separately.
6. **Work order number** — text input.
7. **Linked work orders** — the Asana-style linker. A search input with placeholder "Search work orders by number or description". Typing opens a results list showing work order number, description, and turbine on each row. Selecting one adds it as a **removable chip** in a wrapping chip area directly above the search field. Chips use `bg/surface-raised` with a ✕. Design the empty, typing-with-results, and three-chips states.

Footer: **Cancel** / **Create job**. Keep the same verb on the button and in the resulting toast — "Create job" produces "Job created".

Also design a **partial-save state**: the modal can be submitted with fields missing, which is exactly what produces a needs-attention card. Do not block submission. Instead show an inline note above the footer: "Some details are missing. This job will be flagged for attention."

### 5.2 Cancellation reason — 520px wide

Opens when the cancel toggle is clicked on a card. Title: "Why was this job cancelled?"

- **Reason tags** — a wrapping field of multi-select pills: Wind, Fog, Rain, Lightning, Humidity, Gust, Wave Height, and a trailing `+ Add reason` pill in `accent/primary` outline style. Unselected pill: `bg/surface-raised`, `border/default`, `text/secondary`. Selected pill: `accent/primary-dim` fill, `accent/primary` border and text, with a small check to the left of the label. Design the field with three reasons selected.
- **Below a divider, a "Confirm the details" group** carrying the values already on the job so he can correct them at the point of cancelling: Number of techs, Duration, Turbine status. Prefilled from the card. Label the group clearly so it is obvious these are editable, not read-only.
- Footer: **Back** / **Cancel job** — the primary button here is `status/attention`, not blue, because it is a destructive-feeling confirmation.

Design the `+ Add reason` sub-state too: the pill becomes an inline text input with a tick to confirm, adding the new reason as a selected pill.

### 5.3 Resolve screen — full page

**This is a screen, not a modal.** Clicking **Resolve** in the attention banner navigates here. It is a sub-view of the Job Planner: the left nav rail keeps **Job Planner** selected, and the top bar is unchanged.

Its purpose is to clear the backlog of flagged jobs, and the primary way to clear one is to **give it a new day** — drag it out of the backlog list and onto the week. Status and missing details can also be fixed in place without leaving the screen.

**Page header** — a row beneath the top bar, ~72px tall, `bg/base`:
- Left: a back chevron and the title "Interrupted jobs" at 22px Medium.
- Right: a **Back to planner** ghost button.

**Status strip** — the same red banner sits below the header and keeps the live count. Change the right-hand control here: a **Resolve** button on the resolve screen is redundant. Replace it with a bulk action — a ghost **Mark all as…** button opening a small menu (Complete / Cancelled). The count decrements as jobs are cleared.

**Body** — a two-pane split, both panes filling the remaining height:

```
┌───────────────────────────┬──────┬──────┬──────┬──────┬──────┐
│ Wednesday 24 February  3  │ MON  │ TUE  │ WED  │ THU  │ FRI  │
│ ┌───────────────────────┐ │  22  │  23  │  24  │  25  │  26  │
│ │ ⣿ C4 Blade C repair ! │ ├──────┼──────┼──────┼──────┼──────┤
│ │   2 techs · 8hr · C4  │ │      │      │      │      │      │
│ │   [–][✓][✕]    ✎ ⧉ 🗑  │ │[card]│      │[card]│      │      │
│ └───────────────────────┘ │      │      │      │      │      │
│ ┌───────────────────────┐ │      │┌ ─ ─ ┐│      │      │      │
│ │ ⣿ D2 Blade A LE     ! │ │      │└ ─ ─ ┘│      │      │      │
│ └───────────────────────┘ │      │      │      │      │      │
│ Thursday 25 February   2  │      │      │      │      │      │
│ ...                       │      │      │      │      │      │
└───────────────────────────┴──────┴──────┴──────┴──────┴──────┘
        backlog pane                    week grid
```

**Left pane — the backlog.** ~460px fixed width, `bg/surface`, 1px right border, scrolls independently.

- Jobs are **grouped by the day they were originally scheduled**, oldest group first, so the backlog reads as a queue to work down.
- Group header: full-width band, `bg/surface-active`, 32px tall, 13px Medium — "Wednesday 24 February" — with the group's job count right-aligned in `text/secondary`.
- Under each header, the flagged jobs as **full-width job cards**. Same component as section 4, with two changes: a 6-dot drag handle at the left edge, always visible rather than hover-only, and the card stretched to the pane width so the metadata row has room to sit on one line.
- Each card keeps its three status toggles and its edit / duplicate / delete icons. Marking a status here clears the job from the pane immediately.
- Cards missing required fields show the red `!` badge and, beneath the metadata row, an inline **`Missing: work order, duration`** line in `status/attention`. Clicking it expands the card in place to reveal just those fields as editable inputs plus a **Save** button — no modal, no navigation away.

**Right pane — the week grid.** The same day columns as the planner: column header with day name, date, and the two day-level ✓/✕ buttons; today highlighted in `accent/primary`; existing jobs shown as normal cards.

- With the backlog pane taking 460px, **five columns are visible** (matching screenshot 2). Reach the remaining two by scrolling the grid horizontally, or by the chevrons — include a compact chevron pair in the grid's top-left corner.
- Columns here are **drop targets only for backlog cards**; cards already on the grid can still be dragged between columns as normal.

**Drag interaction — the core of this screen.** Design a mid-drag frame:
- The dragged backlog card tilts 2° and follows the cursor, as on the planner.
- Its slot in the backlog pane collapses to a dashed outline.
- **Every column in the grid gets a 1px dashed `accent/primary` inset border** so it reads as receptive, and the column under the cursor fills with `accent/primary` at 8%, showing the dashed insertion placeholder in the stack.
- On drop: the card leaves the backlog pane, appears in the column, the group count decrements, and a toast fires — "C4 Blade C repair moved to Thursday 25" with **Undo**. If the group is now empty, its header disappears too.

**Empty state.** When the backlog clears, the left pane shows a centred check icon in `status/success`, "All jobs are up to date" at 15px `text/primary`, a `text/secondary` line "Nothing is waiting to be rescheduled", and a **Back to planner** primary button. The status strip disappears. Design this state.

**Note on the reference screenshot:** its left pane reads "Wednesday 24 Feb" while the columns show 22–26 and the planner header elsewhere says July — treat the dates as placeholder and use one consistent week across all frames.

### 5.4 Day-level confirmation — 420px wide

For the ✓ and ✕ buttons in a column header.

- Complete: "Mark all 3 jobs on Tuesday 23 as complete?" with a plain list of the affected job names. Footer: Cancel / Mark all complete.
- Cancel: same structure, but the body embeds the **reason tag field from 5.2**, since a whole-day cancellation is nearly always one weather event applying to every job. Add a `text/secondary` line: "This reason will be applied to all 3 jobs." Footer: Cancel / Cancel all jobs.
- Both dialogs skip any job that already has a status; state that in the body: "2 jobs already have a status and will not be changed."

---

## 6. States you must include

- Empty week — all seven columns with only the header and add-job row.
- Column with a single card, and a column overflowing so the scroll behaviour is visible.
- All three card statuses visible in one week.
- Needs-attention badge, alone and combined with cancelled.
- Hover on: card, status toggle, add-job row, day-header button, nav icon.
- Focus ring: 2px `accent/primary` at 50% opacity, 2px offset, on every interactive element.
- Mid-drag frame with source gap and destination placeholder.
- Toast pattern: bottom-centre, `bg/surface-raised`, 6px radius, with an **Undo** action. Show one for "Job moved to Wednesday 24" and one for "3 jobs marked complete".

---

## 7. Sample content

Use realistic offshore data, not lorem ipsum. Turbines: C4, C7, D2, A11, B6. Job names in the pattern "C4 Blade C repair", "D2 Blade A leading edge", "A11 Tower clean". Work order numbers as 8-digit strings, e.g. 40021874. Tech counts 2–4. Durations 4, 6, 8, 12 hr. Reasons drawn from the weather list. Populate Mon–Wed heavily and leave Thu–Sun light, matching how the week actually fills.

---

## 8. Copy rules

- Sentence case for all buttons, labels, and headings. No title case.
- Name things by what he controls: "jobs need attention", not "interrupted jobs"; "Turbine status", not "Turbine state flag".
- Buttons name the action and keep that name through the flow: "Create job" → "Job created". "Cancel job" → "Job cancelled".
- Empty states invite an action: an empty day column's add-job row is the invitation; do not add a separate "No jobs" message.
- Tooltips are fragments, not sentences, and carry no full stop.

---

## 9. Deliverables

1. Job Planner — default week, populated, banner present.
2. Job Planner — banner absent, lighter week.
3. Job Planner — mid-drag.
4. New job modal — empty, filled, and with the missing-details note.
5. Work order linker — three sub-states.
6. Cancellation reason modal — default and with `+ Add reason` active.
7. Resolve screen — populated backlog; mid-drag from the backlog onto a day column; cleared empty state.
8. Day-level confirmation — both variants.
9. Component sheet: job card with every variant, status toggle group, tags, buttons, inputs, dropdowns.
10. Colour and type token page.

---

## 10. Condensed variant (for length-limited prompt fields)

> Design a dark-mode desktop web app screen: the Job Planner for "WindAI Blade Repair Tracking", used by an offshore wind farm marine coordinator. Roboto, Bootstrap-style components restyled. Background #020617, surfaces #0B1220 and #111C33, borders #1E293B, primary blue #84B8FF, success #22C55E, cancelled #EAB308, attention #EF4444.
>
> Layout: 64px icon-only left nav rail (logo, dashboard, job planner selected, work orders, job types, settings at the bottom). 64px top bar with "WindAI | Blade Repair Tracking", a "Robin Rigg" site selector chip, and help + avatar on the right. Below that a planner header with chevrons, "July 2025", a 4-segment range stepper, and a Today button. Below that a red banner: "6 jobs need attention" with a Resolve button.
>
> The planner is 7 equal day columns, day 1 being yesterday and day 2 today. Each column header shows day name, date, and two icon buttons to mark the whole day complete or cancelled; today's column is highlighted in blue. Under each header is a full-width "+ New job" ghost row, then a stack of draggable job cards.
>
> Each card shows: job name, then "2 techs · 8 hr · C4" in grey, a blue pill tag for job type, a work order number with a clipboard icon, and an action row with three status toggle buttons (no status / complete / cancel) on the left and edit, duplicate, delete icons on the right. Card variants: planned (grey border), complete (green border and tint), cancelled (amber border and tint, with a footer reading "Rain, Lightning and 3 more…"), needs attention (red border plus a red "!" badge on the top-right corner), hover, and dragging.
>
> Also design: a "New job" modal (job name, job type single-select with an "+ Add job type" option, techs and duration steppers side by side, turbine status online/offline, work order number, and an Asana-style work order search that adds removable chips); a "Why was this job cancelled?" modal with multi-select weather pills (Wind, Fog, Rain, Lightning, Humidity, Gust, Wave Height, + Add reason) above editable techs, duration, and turbine status fields; and a separate "Interrupted jobs" screen reached from the banner's Resolve button — a two-pane layout with a 460px backlog list on the left, where flagged jobs are grouped under date headers like "Wednesday 24 February", and the week's day columns on the right, so jobs can be dragged out of the backlog onto a new day to reschedule them. Show that screen mid-drag, with the backlog slot collapsed to a dashed outline and every day column dashed-outlined as a drop target.

---

## 11. Open questions to settle before this is final

*Not part of the prompt — decisions the design assumes, which you may want to confirm or push back on.*

1. **Day-level cancel semantics.** I have assumed one reason set applies to every job in the day, and that jobs already carrying a status are skipped. This is the same gap flagged in Flow 1 / Task 6 of the usability test — the design here takes a position so there is something concrete to test.
2. **The resolve screen — now specified from your screenshot.** Two things I had to decide to make it work. First, I read the left pane as a **backlog grouped by original scheduled date**, and the right grid as a **drop target**, which makes the screen's primary verb *reschedule* rather than *fill in details*. If it was meant purely as a detail-completion screen, the drag mechanic is wrong and I will strip it. Second, the red strip carries a **Resolve** button on a screen you already reached by pressing Resolve — I have swapped it for a "Mark all as…" bulk action, but it may be simpler to make the strip a plain count with no control at all.
3. **Turbine as a field.** Your card spec lists turbine name, but the new-job modal spec only mentions turbine *status*. I have assumed turbine is either its own field or inherited from the linked work order. Worth confirming which, since it affects whether a job can exist without a work order.
4. **"Needs attention" trigger — this one now matters more.** I had defined it as any missing required field. But the resolve screen groups jobs under *past dates*, which only makes sense if the flag also fires on **jobs whose day has passed with no status set**. I have written the screen assuming both rules apply. Worth confirming, because it changes what the count means: "6 records are incomplete" and "6 jobs happened and nobody told me the outcome" are different problems.

   Two knock-on effects for the test plan: this is where **past jobs needing attention get surfaced** (Flow 1 / Task 7), and the drag-from-backlog-onto-a-day mechanic is the **rescheduling of cancelled work** that study goal 4 lost a task for. Goal 4 can be reinstated with a task pointed at this screen rather than dropped.
5. **Where new job types and new cancellation reasons are created.** Both are specified here as inline additions from within their dropdowns. If they should instead route to the Job Types settings page, the inline option should be removed rather than doing both.