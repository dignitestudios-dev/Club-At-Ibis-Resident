const WIZARD_STORAGE_KEY = "ibis_active_request_wizard_state";

export interface StoredRequestState {
  requestTypeId: string;
  stepIndex: number;
  fieldValues: Record<string, unknown>;
  savedAt: number;
}

/**
 * Disabled: Form progress is autosaved directly to the backend draft API.
 * Local/session storage is never used for wizard form data.
 */
export function saveWizardState(_state: {
  requestTypeId: string;
  stepIndex: number;
  fieldValues: Record<string, unknown>;
}) {
  // No-op: Draft state is persisted exclusively via the backend API.
}

/**
 * Disabled: Form progress is fetched directly from the backend draft API.
 */
export function getWizardState(): StoredRequestState | null {
  return null;
}

/**
 * Cleans up any legacy storage keys from previous sessions.
 */
export function clearWizardState() {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(WIZARD_STORAGE_KEY);
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

