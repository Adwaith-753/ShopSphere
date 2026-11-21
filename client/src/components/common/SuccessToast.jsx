import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import "./SuccessToast.css";

function SuccessToast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;

    const timeoutId = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [message, onClose]);

  if (!message) return null;

  return createPortal(
    <div className="success-toast" role="status" aria-live="polite">
      <CheckCircle2 size={22} aria-hidden="true" />
      <span>{message}</span>
    </div>,
    document.body,
  );
}

export default SuccessToast;
