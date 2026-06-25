import { useEffect } from "react";
import "./Toast.css";

export type ToastType = "error" | "success" | "info";

interface Props {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "info", onClose, duration = 4000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast--${type}`} role="alert">
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}
