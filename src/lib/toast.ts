// Fire-and-forget notifications. <Toaster /> (in the site layout) shows them.
export type ToastKind = "success" | "error" | "info";
export type ToastInput = { kind?: ToastKind; title: string; message?: string };

export const TOAST_EVENT = "yubi:toast";

export function toast(t: ToastInput) {
  window.dispatchEvent(new CustomEvent<ToastInput>(TOAST_EVENT, { detail: t }));
}
