/**
 * After a failed validation, bring the first invalid control into view and focus it.
 * Deferred a tick so a step change / error state has rendered first.
 * Covers dynamic fields (`aria-invalid` / `data-invalid`) and the HOA card.
 */
export function scrollToFirstError(selector?: string) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    const target =
      (selector ? document.querySelector<HTMLElement>(selector) : null) ??
      document.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      document.querySelector<HTMLElement>('[data-invalid="true"]') ??
      document.querySelector<HTMLElement>("#hoa-error-msg");
    if (!target) return;

    const block = target.closest<HTMLElement>('[data-slot="field"], [role="group"], label') ?? target;
    block.style.scrollMarginBottom = "7rem"; // clear the sticky action bar
    block.scrollIntoView({ behavior: "smooth", block: "center" });

    const focusable = target.matches("input, textarea, select, button, [tabindex]")
      ? target
      : target.querySelector<HTMLElement>("input, textarea, select, button, [tabindex]");
    focusable?.focus({ preventScroll: true });
  }, 160);
}
