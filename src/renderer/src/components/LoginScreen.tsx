import { useState } from "react";
import { Wine } from "lucide-react";

interface LoginScreenProps {
  onLogin: (pin: string) => Promise<boolean>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    setIsLoading(true);
    try {
      const success = await onLogin(pin);
      if (!success) {
        setError("Invalid PIN");
        setPin("");
      }
    } catch {
      setError("Login failed");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-pos-bg">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <Wine className="w-10 h-10 text-pos-accent" />
          <h1 className="text-3xl font-bold text-pos-text">GustoOSX</h1>
        </div>

        <div className="flex gap-3 mb-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? "bg-pos-accent border-pos-accent"
                  : "border-pos-border"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-pos-danger text-sm">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key, i) => (
            <button
              key={i}
              disabled={key === ""}
              onClick={() => {
                if (key === "del") handleDelete();
                else if (key) handleDigit(key);
              }}
              onDoubleClick={() => key && key !== "del" && handleSubmit()}
              className={`w-20 h-16 rounded-xl text-xl font-semibold transition-all active:scale-95 ${
                key === ""
                  ? "invisible"
                  : key === "del"
                  ? "bg-pos-surface text-pos-text-muted hover:bg-pos-surface-hover"
                  : "bg-pos-surface text-pos-text hover:bg-pos-surface-hover"
              }`}
            >
              {key === "del" ? "⌫" : key}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={pin.length < 4 || isLoading}
          className="w-64 h-14 bg-pos-accent text-black font-semibold rounded-xl hover:bg-pos-accent-hover transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-pos-text-muted text-xs mt-4">
          Double-tap any digit to submit
        </p>
      </div>
    </div>
  );
}
