import { daysAgo, hoursAgo, currentYear } from "./date-helpers";

const RES_1 = "res-1";
const RES_2 = "res-2";
const YR = currentYear();

export const seedNotifications: NotificationRecord[] = [
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1012",
    type: "revision_required",
    title: "Changes required",
    message: `The ARB has flagged items on your Generator request (ARB-${YR}-1012).`,
    read: false,
    createdAt: hoursAgo(18),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1003",
    type: "revision_required",
    title: "Changes required",
    message: `The ARB has flagged items on your Paint Color Change request (ARB-${YR}-1003).`,
    read: false,
    createdAt: daysAgo(1, 2),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1011",
    type: "revision_required",
    title: "Changes required",
    message: `The ARB has flagged items on your Pool Deck/Driveway request (ARB-${YR}-1011).`,
    read: false,
    createdAt: daysAgo(2, 1),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1002",
    type: "updated",
    title: "Request assigned to reviewer",
    message: `Your Windows/Doors request (ARB-${YR}-1002) is currently under review by D. Okafor.`,
    read: false,
    createdAt: daysAgo(3, 4),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1004",
    type: "resubmitted",
    title: "Request resubmitted",
    message: `Your revised Hurricane Shutters request (ARB-${YR}-1004) was resubmitted successfully.`,
    read: true,
    createdAt: daysAgo(6, 1),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1005",
    type: "approved",
    title: "Request approved",
    message: `Your Roof Replacement request (ARB-${YR}-1005) has been approved by the Board.`,
    read: true,
    createdAt: daysAgo(8, 5),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1006",
    type: "completed",
    title: "Request completed & Letter ready",
    message: `Your Landscaping request (ARB-${YR}-1006) is complete. Your approval letter is ready to download.`,
    read: true,
    createdAt: daysAgo(12, 3),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1007",
    type: "rejected",
    title: "Review decision: Not approved",
    message: `Your Pool Installation request (ARB-${YR}-1007) was not approved. See details for reviewer notes.`,
    read: true,
    createdAt: daysAgo(20, 2),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1008",
    type: "withdrawn",
    title: "Request withdrawn",
    message: `Your Demolition request (ARB-${YR}-1008) has been withdrawn.`,
    read: true,
    createdAt: daysAgo(30, 1),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_1,
    requestId: "req-1010",
    type: "refund_updated",
    title: "Refund status updated",
    message: `The refund status for your Screen Enclosure request (ARB-${YR}-1010) has been updated.`,
    read: true,
    createdAt: daysAgo(40, 3),
  },
  {
    id: crypto.randomUUID(),
    residentId: RES_2,
    requestId: "req-2001",
    type: "submitted",
    title: "Request submitted",
    message: `Your Addition to Dwelling request (ARB-${YR}-2001) was submitted successfully.`,
    read: false,
    createdAt: daysAgo(2, 4),
  },
];

export function getNotificationsForResident(
  residentId: string
): NotificationRecord[] {
  return seedNotifications
    .filter((n) => n.residentId === residentId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
