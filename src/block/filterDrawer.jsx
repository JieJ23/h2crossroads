import { useEffect } from "react";

// Slide-in drawer (from the left). Generic: pass any children / footer.
//   open    : boolean
//   onClose : () => void
export default function FilterDrawer({ open, onClose, title = "Filters", children, footer }) {
  // Esc closes it, and the page behind stops scrolling while it is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
        open ? "visible" : "invisible pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute left-0 top-0 h-full w-[85%] max-w-sm flex flex-col bg-[#0e0c12] border-r border-white/10 shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-[Ale]">{title}</h2>
          <button
            type="button"
            className="btn btn-sm btn-square btn-ghost"
            onClick={onClose}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && <div className="p-4 border-t border-white/10 flex gap-2">{footer}</div>}
      </aside>
    </div>
  );
}
