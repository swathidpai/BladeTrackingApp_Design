import { useLayoutEffect, useState, type RefObject } from "react";

interface Position {
  top: number;
  left: number;
}

const MARGIN = 8;

/**
 * Computes a viewport-clamped fixed position for a floating panel anchored
 * below a trigger element. Meant to be paired with a portal (createPortal to
 * document.body) so the panel escapes any scrollable/narrow ancestor instead
 * of being clipped or spilling into neighbouring layout — the day columns on
 * the planner are exactly this case: narrow, independently-scrolling, and
 * packed edge-to-edge, so a plain `position: absolute` panel has nowhere to
 * safely overflow into.
 */
export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  panelWidth: number,
  align: "left" | "right" = "left",
): Position {
  const [pos, setPos] = useState<Position>({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (!open) return;

    function reposition() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let left = align === "right" ? rect.right - panelWidth : rect.left;
      left = Math.max(MARGIN, Math.min(left, window.innerWidth - panelWidth - MARGIN));
      const top = Math.min(rect.bottom + 6, window.innerHeight - MARGIN);
      setPos({ top, left });
    }

    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, anchorRef, panelWidth, align]);

  return pos;
}
