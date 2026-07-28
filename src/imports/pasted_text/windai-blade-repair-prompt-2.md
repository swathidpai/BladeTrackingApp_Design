# Figma design prompt — WindAI Blade Repair Tracking
## Flow: resolving jobs that need attention

> Sections 1–12 are the prompt — paste them into Figma Make / Figma AI as one block. Section 13 is a condensed variant for length-limited fields. Section 14 is for you, not for Figma.
>
> Self-contained: navigation, tokens and shared components are repeated here so this can be pasted on its own.

---

## 1. What you are designing

The **interrupted jobs flow** in *Blade Repair Tracking*, a dark-mode internal web application by WindAI. Desktop only — design at 1440×1024 and 1920×1080. No mobile breakpoint.

**The user** is a marine coordinator at an offshore wind farm. He pulls work orders from SAP, breaks each into individual jobs, spreads them across the week on a calendar-style job planner, and marks each one complete or cancelled — usually on the day itself, sometimes a day late. Jobs that never got an outcome pile up as *interrupted*.

**This flow's one job:** clear that pile. He opens a panel listing every stranded job, works down it, and for each one records what happened or pushes it to a new date.

Three outcomes per job, no more: **completed**, **cancelled**, or **moved to a different day**. All three reachable in one click from the row.

The screen has a second, quieter job. Selecting a row swings a small three-day calendar into view beside it, showing the day before, the day of, and the day after that job was planned. He is not just clearing a list — he is remembering what happened that day. If the surrounding days were also cancelled, it was weather, and the reason is obvious.

Density over spaciousness throughout. He is clearing a backlog, not browsing.

---

## 2. Consistency contract

These are shared across every screen in the product. Do not restyle, resize or re-draw them for this flow — reuse them exactly.

| Element | Rule |
|---|---|
| Left nav rail | 64px, icon-only, identical on every page. Job Planner stays selected throughout this flow. |
| Top bar | 64px, identical on every page. Never changes with context. |
| Job card | One component with variants. Same component in the planner, in these three columns, everywhere. |
| Status toggle group | The same three-button group (no status / complete / cancel) wherever a job's status is set. |
| Cancellation modal | One modal, opened from the planner card, the day header, and this panel. Not a variant. |
| Job type tag | Pill, `accent/primary-dim` fill, `accent/primary` text, same size everywhere. |
| Toast | Bottom-centre, always carries **Undo**, always names the job by its full name. |
| Empty states | Icon, one line of `text/primary`, one line of `text/secondary`, one primary button. |
| Icon set | **Bootstrap Icons** only — one family, no mixing. 20px in the nav rail, 16px inside rows, cards and buttons. Uniform optical weight. |
| Radius | 6px on rows, cards, buttons, inputs. 4px on icon buttons and tags. 10px on modals and dropdowns. |
| Focus ring | 2px `accent/primary` at 50% opacity, 2px offset. Every interactive element, no exceptions. |
| Spacing | 4px base unit. 12px card padding, 16px row padding, 24px modal padding. |

---

## 3. Visual system

**Dark mode only. Roboto throughout.** Bootstrap 5 component behaviour where a standard pattern exists — dropdowns, modals, buttons, form controls, badges — restyled to these tokens rather than left stock.

### Colour tokens

| Token | Hex | Use |
|---|---|---|
| `bg/base` | `#020617` | App background, headers |
| `bg/surface` | `#0B1220` | Panel body, day columns |
| `bg/surface-raised` | `#111C33` | Rows, cards, dropdowns, inputs |
| `bg/surface-active` | `#0F1B33` | Group headers, selected row, anchor column |
| `border/default` | `#1E293B` | Dividers, row separators, input borders |
| `border/strong` | `#334155` | Panel edge, dropdown borders |
| `text/primary` | `#F8FAFC` | Job names, dates, headings |
| `text/secondary` | `#94A3B8` | Techs, duration, counts |
| `text/muted` | `#64748B` | Placeholders, disabled dates |
| `accent/primary` | `#84B8FF` | Selection, today, links, primary buttons |
| `accent/primary-dim` | `#1E3A5F` | Filled primary surfaces, job type tags |
| `status/success` | `#22C55E` | Complete action and state |
| `status/success-bg` | `#0D2818` | Completed fill |
| `status/cancelled` | `#EAB308` | Cancelled state |
| `status/cancelled-bg` | `#2A2208` | Cancelled fill |
| `status/attention` | `#EF4444` | Cancel action, attention badge, count |
| `status/attention-bg` | `#4C1218` | Count badge fill |

### Type scale (Roboto)

| Role | Size / weight |
|---|---|
| Panel title, planner month | 22 / Medium (500) |
| Column day name | 11 / Medium, +0.8 tracking, uppercase |
| Column date number | 22 / Regular |
| Group header date | 13 / Medium |
| Row job name, card title | 15 / Medium |
| Row and card metadata | 13 / Regular, `text/secondary` |
| Tag, badge, eyebrow | 11 / Medium |
| Button, dropdown option | 14 / Medium |
| Field label | 13 / Medium |

Panels and cards are separated by borders, not shadows. Dropdowns and modals get a soft shadow plus a `#020617` scrim at 65%.

---

## 4. Screen anatomy

The panel does not replace the planner. It **opens as a column on the left**, and the calendar beside it narrows to exactly **three day columns**.

```
┌──┬────────────────────────────────────────────────────────────┐
│  │  top bar                                                   │
│L ├──────────────────────────┬─────────────────────────────────┤
│e │  ‹  Interrupted jobs  6  │                                 │
│f ├──────────────────────────┼───────────┬───────────┬─────────┤
│t │ Monday 21 July        3  │   SUN     │ PLANNED   │  TUE    │
│  │ ┌──────────────────────┐ │    20     │  MON 21   │   22    │
│n │ │ row                  │ ├───────────┼───────────┼─────────┤
│a │ ├──────────────────────┤ │           │           │         │
│v │ │ row          ◀ SELECTED│ │  [card]   │  [card]   │ [card]  │
│  │ ├──────────────────────┤ │           │  [card]   │         │
│  │ │ row                  │ │           │           │         │
│  │ ├──────────────────────┤ │           │           │         │
│  │ │ Wednesday 23 July  2 │ │           │           │         │
│  │ └──────────────────────┘ │           │           │         │
└──┴──────────────────────────┴───────────┴───────────┴─────────┘
     interrupted jobs panel      the selected job's three days
```

### 4.1 Left navigation rail — unchanged

64px wide, `bg/base`, 1px right border. Bootstrap Icons at 20px, 44px tall hit targets, tooltip on hover. Top to bottom: WindAI turbine mark (a logo, not a nav item) → Dashboard → **Job Planner** → Work Orders → Job Types → Checklists. Settings gear pinned to the bottom.

**Job Planner stays selected while this panel is open.** This is a sub-view of the planner, not a separate destination. Selected state: `accent/primary-dim` rounded square behind the icon, icon in `accent/primary`.

### 4.2 Top bar — unchanged

64px tall, `bg/base`, 1px bottom border. Left: "Wind" in `text/primary` and "AI" in `accent/primary`, a vertical hairline, then "Blade Repair Tracking" in Medium; beside it a site selector chip reading "Robin Rigg" with a caret on `bg/surface-raised`. Right: help icon and a 32px avatar circle, `accent/primary-dim` fill, initials in `accent/primary`.

### 4.3 Panel header

One row, 64px tall, `bg/base`, 1px bottom border, spanning **the panel width only** — the calendar beside it starts at the same vertical position with its own column headers.

- **Back chevron** — 32×32 ghost icon button at the far left. Closes the panel and restores the full seven-column planner. Tooltip: "Back to job planner".
- **Title** — "Interrupted jobs", 22px Medium.
- **Count** — immediately after the title: a pill badge, `status/attention-bg` fill, 1px `status/attention` border, numeral in `status/attention`, 6px radius. Decrements live as rows clear. At zero it turns `text/muted` on `bg/surface-raised`.

The red "interrupted jobs" banner from the planner does **not** carry into this view. The header owns the count now; two live counters on one screen will drift apart in the user's head.

---

## 5. The panel

**480px wide** at 1440, may flex to 520px at 1920. `bg/surface`, 1px `border/strong` right edge, full remaining height, scrolls independently of the calendar.

**Opening:** slides in from the left over 200ms, ease-out, while the calendar collapses from seven columns to three. Design the closed and open frames as a pair so the transition is unambiguous.

### 5.1 Group headers

Rows are grouped by **the date the job was planned for**, oldest group first — a queue to work down, not a reverse-chronological feed.

- Full-width band, 36px tall, `bg/surface-active`, 1px bottom border.
- Left: the date written out — "Monday 21 July" — at 13px Medium.
- Right: the group's job count in `text/secondary`.
- **Sticky**: pins to the top of the scroll area while its own rows are in view.
- When a group's last row resolves, the header goes with it.

### 5.2 The row

Two lines, 76px tall, 16px horizontal padding, `bg/surface-raised`, separated by 1px `border/default`. At 480px a strict five-column table crushes both the job name and the controls, so the row splits into a content block and a control block:

```
┌────────────────────────────────────────────────────────────┐
│  C4 Blade C repair                                     (!)  │
│  2 techs · 8 hr · C4 · [Blade Repair]     [✓] [✕] [21 Jul ▾]│
└────────────────────────────────────────────────────────────┘
```

**Line 1 — job name**, 15px Medium, one line, ellipsis on overflow, full name in a tooltip. If required details are missing, a red circular `!` badge sits at the right end of this line; its tooltip names what is missing — "Missing: work order, duration".

**Line 2, left — metadata**: number of techs, duration in hours, turbine name, job type tag. 12px gaps with thin middot separators.

**Line 2, right — the three controls**, described in section 6.

### 5.3 Row selection — the mechanic that drives the calendar

**Exactly one row is selected at all times.** Selection is what the three-day calendar is showing.

- Clicking anywhere on the row **except the three controls** selects it. The controls act without changing selection.
- **Default on open:** the first row of the oldest group.
- **Selected state:** `bg/surface-active` fill, 1px `border/strong`, a 2px `accent/primary` left edge, and job name in `text/primary` at full opacity while unselected rows sit slightly dimmer.
- **Signature detail:** a small triangular notch, 8px, in `accent/primary`, on the selected row's right edge — pointing at the calendar's middle column. It is the one piece of decoration on the screen, and it earns its place by making the link between the two panes literal. Keep everything else quiet.
- **Hover** on an unselected row: background lifts to `bg/surface-active` at 50%, no left edge. Hover and selected must not look alike.
- **After a row resolves and leaves the list, selection advances to the next row down** and the calendar re-anchors with a 200ms crossfade. If it was the last row in a group, selection moves to the first row of the next group.
- Up and down arrow keys move selection. Enter opens the reschedule picker on the selected row.

---

## 6. The three actions

Every row offers exactly three outcomes, all reachable without opening anything first.

### 6.1 Complete

28×28 icon button, check glyph, `status/success` border and icon, transparent fill. Hover fills `status/success` at 15%.

On click the row fills `status/success-bg` with a `status/success` left edge, holds ~600ms, then animates out. Toast: **"C4 Blade C repair marked complete"** with **Undo**.

### 6.2 Cancel — opens the cancellation modal

28×28 icon button, cross glyph, `status/attention` border and icon. Hover fills `status/attention` at 15%.

Opens **the shared cancellation modal** — the same one used from the planner card and the day header, not a variant of it. 520px wide, `bg/surface`, 10px radius, 24px padding, scrim behind.

- Title: "Why was this job cancelled?" Beneath it, the job name in `text/secondary`.
- **Reason tags** — a wrapping field of multi-select pills: Wind, Fog, Rain, Lightning, Humidity, Gust, Wave Height, then a `+ Add reason` pill in `accent/primary` outline style. Unselected: `bg/surface-raised`, `border/default`, `text/secondary`. Selected: `accent/primary-dim` fill, `accent/primary` border and text, with a small check to the left of the label. Design the field with three selected.
- Below a divider, a **"Confirm the details"** group carrying the job's current values as editable fields: **number of techs** (number stepper, min 1), **duration** (number stepper with an `hr` suffix inside the field), and **turbine status** (single-select: Online / Offline). Prefilled, and obviously editable rather than read-only.
- Footer: **Back** (ghost) / **Cancel job** (solid `status/attention`).

Design the `+ Add reason` sub-state: the pill becomes an inline text input with a tick to confirm, and the new reason appears as an already-selected pill.

On confirm the row fills `status/cancelled-bg`, then leaves. Toast: **"C4 Blade C repair cancelled"** with **Undo**.

### 6.3 Reschedule — the date is the control

Rather than a static date cell sitting next to a separate "reschedule" button — the same information twice, in a row that has no space for it — the row shows the planned date **as a button**: `bg/surface-raised`, 1px `border/default`, 6px radius, label "21 Jul" in `text/primary` with a caret, ~96px wide. Hover: border and label go `accent/primary`.

Clicking opens a **date and time picker**, anchored to the button, 320px wide, `bg/surface-raised`, 1px `border/strong`, 10px radius, soft shadow:

- **Month grid** with month name and chevrons on top. Weekday initials in `text/muted`.
- The job's currently planned date is **outlined** in `accent/primary`; the newly chosen date is **filled** `accent/primary` with `#020617` text.
- **Past dates are disabled** — `text/muted`, no hover, not clickable. **Today remains selectable**: a job interrupted at 07:00 is often re-run the same afternoon.
- Below a divider, a **"Start time"** field — a select stepping in 30-minute increments.
- Footer: **Cancel** (ghost) / **Reschedule** (solid `accent/primary`).

On confirm the row leaves the panel and a toast fires: **"C4 Blade C repair moved to Thursday 24 July, 08:00"** with **Undo**. If the new date falls inside the three columns currently shown, the card appears there and pulses a 2px `accent/primary` outline for ~1s.

Design three states: closed, open with nothing chosen, open with a date and time chosen.

---

## 7. The three-day calendar

Not a week view scaled down. **A three-day window anchored to the selected job**, showing the day before, the day of, and the day after the date that job was planned for.

If the selected job was planned for Monday 21 July, the columns are Sunday 20, **Monday 21**, Tuesday 22. Select a different row and the whole window swings to that job's date. This is context, not navigation: he is looking at what else was happening around the day the job stalled.

**Columns are equal width**, filling the space left by the panel — roughly 285px each at 1440. Each is separated by a 1px `border/default` running full height, and scrolls independently.

### 7.1 Column headers

72px tall, matching the planner's headers exactly:

- Day name, uppercase, 11px, `text/muted`.
- Date number, 22px.
- Right side: the two day-level icon buttons — mark all complete (check, `status/success`) and cancel all (cross, `status/attention`), 28×28, 1px border.

**Two markers that must stay distinguishable**, because they can appear on the same column or on different ones:

| Marker | Meaning | Treatment |
|---|---|---|
| **Anchor** | the selected job's planned date, always the middle column | `bg/surface-active` column fill, 2px `accent/primary` top edge, and an 11px uppercase eyebrow reading **PLANNED FOR** in `accent/primary` above the day name |
| **Today** | wherever today falls, if at all | date number in `accent/primary` with a 4px filled dot centred beneath it — no top edge, no fill |

Design a frame where they coincide and a frame where they do not.

### 7.2 No week navigation here

**Do not add chevrons or a range stepper to this view.** The window is derived from the selection, not steered by hand. Adding navigation creates a second way to change what is on screen, which will immediately contradict the row selection. Week navigation belongs in the planner header — see section 8.

### 7.3 Cards in the columns

The same job card component as the planner, unchanged: job name, "2 techs · 8 hr · C4", job type tag, work order number with a clipboard icon, and the action row with the three status toggles on the left and edit, duplicate, delete on the right. All variants apply — planned, complete, cancelled, needs attention.

Status toggles work here. **Drag is disabled in this view**: only three days are reachable, and the reschedule picker is the sanctioned route. Cursor stays `default` on the card body, and no drag handle appears on hover.

---

## 8. Job planner header — make the chevrons work

A fix on the planner page itself, kept in this prompt so the two screens ship consistent.

The planner header carries a back chevron, the month, and a forward chevron. **These step the visible window by one week**, exactly as a calendar does — the same seven-day window, shifted seven days back or forward. Design them as 32×32 ghost icon buttons using the same chevron glyph as the panel's back button.

Alongside:

- **Month label** — "July 2025". When the visible week spans two months, write both: "July – August 2025".
- **Range line** — beneath or beside the month, 13px `text/secondary`: "22 – 28 July".
- **Today button** — a ghost button that snaps the window back to its default position. Required. Once he has paged three weeks forward there is currently no way home.
- **Default window rule** — the planner opens on a seven-day window where **day 1 is yesterday and day 2 is today**. Yesterday is included because job outcomes routinely arrive a day late.

**One redundancy to resolve:** the current build also has a four-segment control reading `« 7 days · ‹ 1 day · 1 day › · 7 days »`. If the chevrons now handle weeks, its two seven-day segments duplicate them. Reduce that control to a single-day pair — `‹ 1 day` and `1 day ›` — so each control has exactly one job: chevrons for weeks, segments for days, Today to reset.

---

## 9. States to include

- Planner with the panel closed (seven columns) and open (three columns), as a pair.
- Populated panel: three date groups, six rows, one carrying the `!` badge, one selected.
- Row component sheet: default, hover, selected, flagged, completing, cancelling.
- Selection moved to a different group, with the calendar re-anchored to a different three days.
- Anchor and today on the same column; anchor and today on different columns.
- Reschedule picker open, over a dimmed panel, calendar still visible behind.
- Cancellation modal with three reasons selected, and with `+ Add reason` active.
- Scrolled panel with a group header pinned.
- **Empty state:** centred check icon in `status/success`, "All jobs are up to date" at 15px `text/primary`, "Nothing is waiting to be resolved" in `text/secondary`, and a **Back to job planner** primary button. Count badge shows 0 in its muted style. The calendar reverts to the full seven-column planner behind it.
- Toasts for all three actions, each with **Undo**.

---

## 10. Sample content

Realistic offshore data, no lorem ipsum. Keep one consistent week across every frame — do not mix months.

- Turbines: C4, C7, D2, A11, B6.
- Job names: "C4 Blade C repair", "D2 Blade A leading edge", "A11 Tower clean", "B6 Blade B paint touch-up", "C7 Blade C inspection", "D2 Blade B repair".
- Job types: Blade Repair, Blade Painting, Tower Cleaning.
- Techs 2–4. Durations 4, 6, 8, 12 hr.
- Work order numbers as 8-digit strings: 40021874.
- Groups: "Monday 21 July" (3 rows), "Wednesday 23 July" (2 rows), "Thursday 24 July" (1 row). Today is Tuesday 22 July.
- Cancellation reasons drawn from the weather list, three selected.

---

## 11. Copy rules

- Sentence case everywhere. No title case on buttons, labels or headings.
- Name things by what the user controls: "Interrupted jobs", "Start time", "Planned for".
- A button keeps its verb through the flow: "Reschedule" produces "moved to Thursday 24 July"; "Cancel job" produces "cancelled"; "Mark complete" produces "marked complete".
- Empty states invite an action rather than reporting a null result.
- Tooltips are fragments, no full stop.

---

## 12. Deliverables

1. Planner, panel closed / panel open — side by side.
2. Panel populated, three groups, six rows, one flagged, one selected.
3. Row component sheet, all states.
4. Selection changed — calendar re-anchored.
5. Anchor and today coinciding, and separate.
6. Reschedule picker: closed, open, date and time chosen.
7. Cancellation modal: default, three reasons selected, `+ Add reason` active.
8. Rescheduled card landing in a visible column with its pulse outline.
9. Panel empty state.
10. Planner header: chevrons, month, range line, Today button, reduced day stepper.
11. Toast set.
12. Token page — colour, type, icon sizes, radii, focus ring.

---

## 13. Condensed variant

> Design a dark-mode desktop screen for "WindAI Blade Repair Tracking", an internal tool for an offshore wind farm marine coordinator. Roboto, Bootstrap Icons, Bootstrap components restyled. Background #020617, surfaces #0B1220 and #111C33, borders #1E293B, blue #84B8FF, green #22C55E, amber #EAB308, red #EF4444.
>
> A 64px icon-only left nav rail (logo, dashboard, job planner selected, work orders, job types, settings at the bottom) and a 64px top bar ("WindAI | Blade Repair Tracking", a "Robin Rigg" site selector chip, help icon, avatar).
>
> An "Interrupted jobs" panel, 480px wide, opens as a column on the left. Its header has a back chevron, the title, and a red count pill reading 6. The panel is a grouped list: sticky group headers show a date like "Monday 21 July" with a count, and each row is two lines — job name on top with a small red "!" badge if details are missing, and beneath it "2 techs · 8 hr · C4" plus a blue job type pill on the left, with three controls on the right: a green check icon button, a red cross icon button, and a date button reading "21 Jul ▾". One row is always selected, shown by a 2px blue left edge, a lifted background, and a small blue triangular notch on the row's right edge pointing at the calendar.
>
> To the right, a calendar of exactly three day columns — the day before, the day of, and the day after the selected job's planned date. The middle column is the anchor: filled background, 2px blue top edge, and a small uppercase blue eyebrow reading "PLANNED FOR" above the day name. Today, wherever it falls, is marked differently — blue date number with a small dot beneath. No week navigation in this view. Columns hold job cards showing job name, techs, duration, turbine, a job type tag and a work order number.
>
> Also design: the date button's dropdown — a 320px month grid with past dates disabled, a "Start time" select, and Cancel / Reschedule buttons; a "Why was this job cancelled?" modal with multi-select weather pills (Wind, Fog, Rain, Lightning, Humidity, Gust, Wave Height, + Add reason) above editable number-of-techs, duration and turbine online/offline fields; and the panel's empty state reading "All jobs are up to date".

---

## 14. Notes for you, not for Figma

1. **The three-day window is the strongest idea in this flow, and it should be tested as one.** Anchoring on the *selected job's* date rather than on today turns the calendar from decoration into evidence — if Sunday and Tuesday were also cancelled, the reason was weather, and he can fill the cancellation modal without thinking. Worth a specific task in the usability test: give him a stranded job and see whether he looks right before choosing a reason. If he never looks, the three columns are costing 850px for nothing.

2. **Selection has to be unmissable.** Everything on the right depends on which row is lit, and nothing on the right says which row that is. That is why I added the notch on the row's right edge. If it reads as noise in the mock, the fallback is to repeat the job name as an eyebrow above the middle column — heavier, but unambiguous.

3. **Time still has nowhere to land.** The picker captures a start time, but columns are day-level: cards show duration, not a clock time, and they stack in the order they were added. So a rescheduled job carries a time the calendar cannot show. Either the card gains a start time and columns sort by it, or the time goes to SAP without being surfaced, or it comes out of the picker. Decide before build, and watch in testing whether he expects to see the time again afterwards.

4. **The planner's chevrons and its day stepper now overlap.** Section 8 resolves this by giving chevrons the week and reducing the stepper to single days. If you would rather keep the four-segment control exactly as built, the chevrons have no distinct job left and should come out instead — but one of the two has to go.

5. **I have replaced section 5.3 of the job planner prompt.** That earlier file specced rescheduling as dragging a card out of a backlog onto a day column, which contradicts the picker you have described here. It now points at this file instead, so the two can be pasted together without conflict.