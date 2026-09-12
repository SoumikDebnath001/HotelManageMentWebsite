import { useEffect, useState } from "react";

/*
  Two-step action button: first click arms it, second click within 4s runs onConfirm.
  Avoids window.confirm dialogs while still protecting one-way actions.
*/
const ConfirmButton = ({ onConfirm, children, confirmLabel = "Confirm?", disabled = false, className = "", armedClassName = "" }) => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [armed]);

  const handleClick = () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    onConfirm();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onBlur={() => setArmed(false)}
      className={`${className} ${armed ? armedClassName : ""}`}
    >
      {armed ? confirmLabel : children}
    </button>
  );
};

export default ConfirmButton;
