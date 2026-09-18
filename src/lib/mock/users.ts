import { daysAgo } from "./date-helpers";

export const seedResidents: Resident[] = [
  {
    id: "res-1",
    residentIdNumber: "RES-30291",
    firstName: "Avery",
    lastName: "Collins",
    email: "avery.collins@example.com",
    password: "password123",
    phone: "(561) 555-0142",
    address: "142 Egret Landing Way",
    lotNo: "LOT-0142",
    createdAt: daysAgo(120),
  },
  {
    id: "res-2",
    residentIdNumber: "RES-30455",
    firstName: "Priya",
    lastName: "Anand",
    email: "priya.anand@example.com",
    password: "password123",
    phone: "(561) 555-0288",
    address: "288 Heron Cove Drive",
    lotNo: "LOT-0288",
    createdAt: daysAgo(90),
  },
];
