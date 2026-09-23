const WIZARD_STORAGE_KEY = "ibis_active_request_wizard_state";

export interface StoredRequestState {
  requestTypeId: string;
  stepIndex: number;
  fieldValues: Record<string, unknown>;
  savedAt: number;
}

export function saveWizardState(state: {
  requestTypeId: string;
  stepIndex: number;
  fieldValues: Record<string, unknown>;
}) {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      WIZARD_STORAGE_KEY,
      JSON.stringify({ ...state, savedAt: Date.now() })
    );
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

export function getWizardState(): StoredRequestState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredRequestState;
  } catch {
    return null;
  }
}

export function clearWizardState() {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
