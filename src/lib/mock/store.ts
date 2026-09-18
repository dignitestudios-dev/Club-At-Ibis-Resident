import { seedResidents } from "./users";
import { seedRequests } from "./requests";
import { seedNotifications } from "./notifications";
import { seedDrafts } from "./drafts";

// Bump this whenever the seed data shape changes (new/renamed fields,
// statuses, etc.) so stale localStorage from a previous schema gets
// replaced instead of causing runtime errors against the new code.
const SCHEMA_VERSION = "7";

const KEYS = {
  version: "cai.schema-version",
  residents: "cai.residents",
  requests: "cai.requests",
  notifications: "cai.notifications",
  drafts: "cai.drafts",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeeded() {
  if (!isBrowser()) return;
  const currentVersion = window.localStorage.getItem(KEYS.version);
  const outOfDate = currentVersion !== SCHEMA_VERSION;
  if (outOfDate) {
    write(KEYS.residents, seedResidents);
    write(KEYS.requests, seedRequests);
    write(KEYS.notifications, seedNotifications);
    write(KEYS.drafts, seedDrafts);
    window.localStorage.setItem(KEYS.version, SCHEMA_VERSION);
    return;
  }
  if (!window.localStorage.getItem(KEYS.residents)) {
    write(KEYS.residents, seedResidents);
  }
  if (!window.localStorage.getItem(KEYS.requests)) {
    write(KEYS.requests, seedRequests);
  }
  if (!window.localStorage.getItem(KEYS.notifications)) {
    write(KEYS.notifications, seedNotifications);
  }
  if (!window.localStorage.getItem(KEYS.drafts)) {
    write(KEYS.drafts, seedDrafts);
  }
}

export function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const db = {
  getResidents(): Resident[] {
    ensureSeeded();
    return read(KEYS.residents, seedResidents);
  },
  setResidents(residents: Resident[]) {
    write(KEYS.residents, residents);
  },
  getRequests(): RequestRecord[] {
    ensureSeeded();
    return read(KEYS.requests, seedRequests);
  },
  setRequests(requests: RequestRecord[]) {
    write(KEYS.requests, requests);
  },
  getNotifications(): NotificationRecord[] {
    ensureSeeded();
    return read(KEYS.notifications, seedNotifications);
  },
  setNotifications(notifications: NotificationRecord[]) {
    write(KEYS.notifications, notifications);
  },
  getDrafts(): RequestDraft[] {
    ensureSeeded();
    return read(KEYS.drafts, seedDrafts);
  },
  setDrafts(drafts: RequestDraft[]) {
    write(KEYS.drafts, drafts);
  },
};
