import { useEffect, useRef, useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import wordmark from "../../imports/App_Logo.png";

const SITES = ["Robin Rigg", "Walney", "Hornsea One", "Dogger Bank", "Beatrice"];

export function TopBar() {
  const [site, setSite] = useState("Robin Rigg");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = SITES.filter((s) => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border-default bg-bg-base px-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-[86px] overflow-hidden">
          <img src={wordmark} alt="WindAI" className="h-full w-auto max-w-none object-left" />
        </div>
        <span className="h-5 w-px bg-border-strong" />
        <span className="text-[15px] font-medium text-text-primary">Blade Repair Tracking</span>
      </div>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-[6px] bg-surface-raised px-3 py-1.5 text-sm text-text-primary transition hover:brightness-110"
        >
          {site}
          <ChevronDown size={15} className="text-text-muted" />
        </button>
        {open && (
          <div className="absolute z-40 mt-1 w-56 rounded-[6px] border border-border-strong bg-surface-raised p-1 shadow-xl">
            <div className="mb-1 flex items-center gap-2 rounded-[4px] border border-border-default px-2">
              <Search size={14} className="text-text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sites"
                className="h-8 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
            {filtered.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSite(s);
                  setOpen(false);
                  setQuery("");
                }}
                className={`block w-full rounded-[4px] px-2 py-1.5 text-left text-sm transition hover:bg-surface-active ${
                  s === site ? "text-accent-primary" : "text-text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="text-text-muted transition hover:text-text-primary"
          aria-label="Help"
        >
          <HelpCircle size={20} />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-dim text-[13px] font-medium text-accent-primary">
          JD
        </div>
      </div>
    </header>
  );
}
