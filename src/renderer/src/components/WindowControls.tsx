import { Minus, Maximize2, X } from "lucide-react";

export function WindowControls() {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => window.api.window.minimize()}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-pos-text-muted hover:bg-pos-surface-hover hover:text-pos-text transition-all"
        title="Minimize"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={() => window.api.window.maximize()}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-pos-text-muted hover:bg-pos-surface-hover hover:text-pos-text transition-all"
        title="Maximize"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => window.api.window.close()}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-pos-text-muted hover:bg-pos-danger hover:text-white transition-all"
        title="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
