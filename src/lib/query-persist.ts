import { dehydrate, hydrate, type QueryClient } from "@tanstack/react-query";

/**
 * Keeps already-loaded data on the device so the app still shows it when offline (and starts instantly
 * on the next open). It is restored into the react-query cache and refreshed from the server as soon as
 * a connection exists. Cleared on sign-out because it holds the resident's data.
 */
const KEY = "cai.query-cache";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_BYTES = 2_500_000; // stay well under the ~5 MB localStorage quota

interface Stored {
  savedAt: number;
  state: ReturnType<typeof dehydrate>;
}

export function clearPersistedQueries() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Restores the saved cache, then keeps saving it (throttled). Returns an unsubscribe function. */
export function startQueryPersistence(client: QueryClient): () => void {
  let loggedIn = false;
  try {
    loggedIn = !!localStorage.getItem("auth-token") && localStorage.getItem("cai.logged-out") !== "true";
    if (!loggedIn) clearPersistedQueries();
    else {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Stored;
        if (Date.now() - saved.savedAt < MAX_AGE_MS) hydrate(client, saved.state);
        else clearPersistedQueries();
      }
    }
  } catch {
    clearPersistedQueries();
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  function save() {
    timer = null;
    try {
      // Stop saving once signed out so the cleared cache is not rewritten.
      if (!localStorage.getItem("auth-token") || localStorage.getItem("cai.logged-out") === "true") return;
      const state = dehydrate(client, { shouldDehydrateQuery: (q) => q.state.status === "success" });
      const json = JSON.stringify({ savedAt: Date.now(), state } satisfies Stored);
      if (json.length > MAX_BYTES) return;
      localStorage.setItem(KEY, json);
    } catch {
      // Quota exceeded or storage blocked: offline copy is a bonus, never an error.
    }
  }

  const unsubscribe = client.getQueryCache().subscribe(() => {
    if (!timer) timer = setTimeout(save, 1500);
  });
  return () => {
    unsubscribe();
    if (timer) clearTimeout(timer);
  };
}
