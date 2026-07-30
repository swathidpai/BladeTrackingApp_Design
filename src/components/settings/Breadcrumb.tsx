import { Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <Home size={14} className="text-text-muted" />
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-text-muted">/</span>}
          {c.to ? (
            <Link to={c.to} className="text-accent-primary transition hover:brightness-110">
              {c.label}
            </Link>
          ) : (
            <span className="text-text-muted">{c.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
