// src/components/forms/Toggle.tsx //
type Props = { checked: boolean; onChange: (v: boolean) => void; label?: string };
function Toggle({ checked, onChange, label }: Props) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span className="text-sm">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full p-1 transition ${checked ? "bg-[var(--brand-700)]" : "bg-gray-300"}`}
      >
        <span className={`block w-4 h-4 bg-white rounded-full transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </label>
  );
}
