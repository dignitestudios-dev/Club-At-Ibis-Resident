/**
 * Dynamic date helpers for realistic mock data.
 * Generates ISO strings relative to the moment of evaluation
 * so mock dates and relative times (e.g. "2 hours ago", "Yesterday", "3 days ago")
 * always look fresh, active, and authentic.
 */

export function currentYear(): number {
  return new Date().getFullYear();
}

export function minutesAgo(minutes: number): string {
  const d = new Date();
  d.setTime(d.getTime() - minutes * 60 * 1000);
  return d.toISOString();
}

export function hoursAgo(hours: number, minutes = 0): string {
  const d = new Date();
  d.setTime(d.getTime() - (hours * 60 + minutes) * 60 * 1000);
  return d.toISOString();
}

export function daysAgo(days: number, hours = 0, minutes = 0): string {
  const d = new Date();
  d.setTime(d.getTime() - ((days * 24 + hours) * 60 + minutes) * 60 * 1000);
  return d.toISOString();
}
