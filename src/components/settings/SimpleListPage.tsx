import { Breadcrumb } from "./Breadcrumb";

interface Props {
  title: string;
  subtitle: string;
  items: string[];
}

/** Read-only stand-in for Assets / Sub Assets / Cancellation Reasons — full CRUD wasn't specced yet. */
export function SimpleListPage({ title, subtitle, items }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scroll-slim">
      <div className="mx-auto w-full max-w-[720px] px-8 py-8">
        <Breadcrumb items={[{ label: "Settings", to: "/settings" }, { label: title }]} />
        <h1 className="mt-3 text-[28px] font-medium leading-none tracking-[-0.2px] text-text-primary">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
        <p className="mt-1 text-[12px] text-text-muted">Editing isn't available yet — shown read-only for now.</p>

        <div className="mt-6 divide-y divide-border-default rounded-[8px] border border-border-default bg-surface-raised">
          {items.map((it) => (
            <div key={it} className="px-4 py-3 text-sm text-text-primary">
              {it}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
