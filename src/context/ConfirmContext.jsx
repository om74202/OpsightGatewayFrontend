import { useState, createContext, useContext, useEffect, useRef } from "react";

const ConfirmContext = createContext(null);
const NotifyContext = createContext(null);

const ENTER_MS = 250;
const EXIT_MS = 250;

export const ConfirmProvider = ({ children }) => {
  // ---------------- Confirm state ----------------
  const [confirmState, setConfirmState] = useState({
    message: "",
    resolve: null,
  });
  const confirmBtnRef = useRef(null);

  const confirm = (message) =>
    new Promise((resolve) => setConfirmState({ message, resolve }));

  const handleConfirm = () => {
    confirmState.resolve?.(true);
    setConfirmState({ message: "", resolve: null });
  };

  const handleCancel = () => {
    confirmState.resolve?.(false);
    setConfirmState({ message: "", resolve: null });
  };

  useEffect(() => {
    if (confirmState.message && confirmBtnRef.current) {
      requestAnimationFrame(() => confirmBtnRef.current?.focus());
    }
  }, [confirmState.message]);

  const onDialogKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // ---------------- Notification state ----------------
  // phase: "hidden" | "enter" | "show" | "exit"
  const [notification, setNotification] = useState({
    type: "success",
    message: "",
    phase: "hidden",
  });

  const hideTimerRef = useRef(null);
  const transitionRef = useRef(null);

  const clearTimers = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (transitionRef.current) {
      clearTimeout(transitionRef.current);
      transitionRef.current = null;
    }
  };

  const showNotification = (type, message, { duration = 3000 } = {}) => {
    clearTimers();

    // mount + start enter
    setNotification({ type, message, phase: "enter" });

    // after one frame, switch to "show" so CSS transition plays
    requestAnimationFrame(() => {
      setNotification((n) => ({ ...n, phase: "show" }));
    });

    // schedule auto-hide
    hideTimerRef.current = setTimeout(() => {
      // start exit
      setNotification((n) => ({ ...n, phase: "exit" }));
      // after exit animation, fully hide
      transitionRef.current = setTimeout(() => {
        setNotification((n) => ({ ...n, phase: "hidden" }));
      }, EXIT_MS);
      hideTimerRef.current = null;
    }, Math.max(duration, ENTER_MS + 50)); // ensure we don't cut off enter anim
  };

  const notify = {
    success: (message, opts) => showNotification("success", message, opts),
    error: (message, opts) => showNotification("error", message, opts),
    show: showNotification,
    hide: () => {
      clearTimers();
      // trigger exit animation
      setNotification((n) => ({ ...n, phase: "exit" }));
      transitionRef.current = setTimeout(() => {
        setNotification((n) => ({ ...n, phase: "hidden" }));
      }, EXIT_MS);
    },
  };

  useEffect(() => {
    // cleanup on unmount
    return () => clearTimers();
  }, []);

  const isRendered = notification.phase !== "hidden";
  const isVisible = notification.phase === "show";

  return (
    <ConfirmContext.Provider value={confirm}>
      <NotifyContext.Provider value={notify}>
        {children}

        {/* -------- Confirm Dialog -------- */}
        {confirmState.message && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onKeyDown={onDialogKeyDown}
          >
            <div
              className="bg-white p-6 rounded shadow-md max-w-sm w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              <p id="confirm-title" className="text-gray-800">
                {confirmState.message}
              </p>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  ref={confirmBtnRef}
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------- Toast Notification (top-right, animated) -------- */}
        <div
          aria-live="assertive"
          aria-atomic="true"
          className="pointer-events-none fixed top-4  left-1/2 -translate-x-1/2 -translate-y-1/  z-[60]"
        >
          {isRendered && (
            <div
              className={[
                "px-6 py-4 rounded-lg shadow-lg text-white font-semibold will-change-transform transition-all",
                `duration-${notification.phase === "enter" || notification.phase === "exit" ? EXIT_MS : ENTER_MS}`,
                "transform",
                notification.type === "success" ? "bg-green-500" : "bg-red-500",
                // Anim states:
                notification.phase === "enter" ? "opacity-55 -translate-y-12 scale-75" : "",
                notification.phase === "show" ? "opacity-100 translate-y-0 scale-100" : "",
                notification.phase === "exit" ? "opacity-55 -translate-y-12 scale-75" : "",
              ].join(" ")}
              role="status"
            >
              {notification.message}
            </div>
          )}
        </div>
      </NotifyContext.Provider>
    </ConfirmContext.Provider>
  );
};

// Existing API (unchanged)
export const useConfirm = () => useContext(ConfirmContext);

// New API for toasts
export const useNotify = () => useContext(NotifyContext);
