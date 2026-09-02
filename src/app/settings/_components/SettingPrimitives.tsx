/**
 * Primitive UI pieces used exclusively in the Settings page.
 * Kept co-located so the page is self-contained.
 */

import Button from "@/components/ui/Button";

// ─── Toggle ──────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer flex-shrink-0 ${
        checked ? "bg-[var(--text-1)]" : "bg-[var(--border-strong)]"
      }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-[var(--surface)] shadow-md transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
        style={{ width: "18px", height: "18px" }}
      />
    </button>
  );
}

// ─── SettingSection ───────────────────────────────────────────────────────────

export function SettingSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Section Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--bg-2)]/20 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-2)] flex items-center justify-center text-[var(--text-2)] flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-[var(--text-1)] tracking-tight">{title}</p>
          {description && <p className="text-xs font-normal text-[var(--text-3)] mt-0.5 break-words leading-relaxed">{description}</p>}
        </div>
      </div>
      {/* Section Content */}
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────

export function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-1)] tracking-tight">{label}</p>
        {description && (
          <p className="text-[12px] font-normal text-[var(--text-3)] mt-0.5 leading-relaxed break-words">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto">{children}</div>
    </div>
  );
}

// ─── DangerRow ────────────────────────────────────────────────────────────────

export function DangerRow({
  label,
  description,
  buttonLabel,
  buttonStyle = "mild",
  onClick,
}: {
  label: string;
  description: string;
  buttonLabel: string;
  buttonStyle?: "mild" | "severe";
  onClick: () => void;
}) {
  return (
    <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-1)] tracking-tight">{label}</p>
        <p className="text-[12px] font-normal text-[var(--text-3)] mt-0.5 leading-relaxed break-words">{description}</p>
      </div>
      <Button
        variant={buttonStyle === "severe" ? "destructive" : "secondary"}
        onClick={onClick}
        className={`flex-shrink-0 w-full sm:w-auto h-9 text-xs ${
          buttonStyle !== "severe" ? "text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500/25" : ""
        }`}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
