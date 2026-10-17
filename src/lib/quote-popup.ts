// Lets any button on the site open the quote popup without prop drilling.
export const OPEN_QUOTE_EVENT = "yubi:open-quote";

export function openQuotePopup() {
  window.dispatchEvent(new Event(OPEN_QUOTE_EVENT));
}
