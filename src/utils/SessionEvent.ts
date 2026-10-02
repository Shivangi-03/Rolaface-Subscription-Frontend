const SESSION_EXPIRED_EVENT = "session-expired";

export const emitSessionExpired = (): void => {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

export const onSessionExpired = (handler: () => void): (() => void) => {
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
};