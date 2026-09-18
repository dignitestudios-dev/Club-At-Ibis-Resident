import { hoursAgo, daysAgo } from "./date-helpers";

const RES_1 = "res-1";

export const seedDrafts: RequestDraft[] = [
  {
    id: "draft-101",
    residentId: RES_1,
    requestTypeId: "paint-color-change",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Repainting garage doors and front decorative shutters to SW 7005 Pure White.",
      contractorName: "Coastal Painting Pro",
      contractorNumber: "(561) 555-4920",
      additionalDetails: "Using satin exterior latex formula.",
      surfaces: ["shutters", "garage"],
      manufacturer: "Sherwin-Williams",
      colorName: "Pure White SW 7005",
    },
    uploads: {},
    stepIndex: 1,
    hoaApproved: true,
    createdAt: daysAgo(1, 4),
    updatedAt: hoursAgo(3),
  },
  {
    id: "draft-102",
    residentId: RES_1,
    requestTypeId: "landscaping",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Adding Sylvester Palm clusters to the front driveway lawn island.",
      contractorName: "Tropical Palms Nursery",
      contractorNumber: "(561) 555-8831",
      additionalDetails: "",
      scope: ["beds"],
    },
    uploads: {},
    stepIndex: 0,
    hoaApproved: false,
    createdAt: daysAgo(3, 2),
    updatedAt: daysAgo(1, 6),
  },
  {
    id: "draft-103",
    residentId: RES_1,
    requestTypeId: "pool-spa-addition",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Custom heated salt-water pool and integrated 8ft raised spa with travertine coping.",
      contractorName: "Palm Beach Pools & Design",
      contractorNumber: "(561) 555-9011",
      additionalDetails: "Standard setback compliance verified.",
      poolType: "in_ground",
      dimensions: "16x32 ft",
      copingMaterial: "Travertine Ivory",
    },
    uploads: {
      sitePlan: [
        {
          id: "f-pool-draft-1",
          name: "pool-engineering-schematic.pdf",
          size: 650000,
          uploadedAt: daysAgo(1, 2),
          url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1400&auto=format&fit=crop",
        },
      ],
    },
    stepIndex: 1,
    hoaApproved: true,
    createdAt: daysAgo(2, 5),
    updatedAt: hoursAgo(5),
  },
];

export function getDraftsForResident(residentId: string): RequestDraft[] {
  return seedDrafts
    .filter((d) => d.residentId === residentId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}
