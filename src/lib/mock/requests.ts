import { daysAgo, hoursAgo, currentYear } from "./date-helpers";

function file(name: string, size: number, uploadedAt: string): UploadedFile {
  return { id: crypto.randomUUID(), name, size, uploadedAt };
}

const RES_1 = "res-1";
const RES_2 = "res-2";
const YR = currentYear();

export const seedRequests: RequestRecord[] = [
  // 1. Standby Generator - Changes Required
  {
    id: "req-1012",
    code: `ARB-${YR}-1012`,
    requestTypeId: "generator",
    residentId: RES_1,
    status: "changes_required",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Installation of a 26kW Generac natural gas whole-home standby generator.",
      contractorName: "Coastal Power Solutions",
      contractorNumber: "(561) 555-8820",
      additionalDetails: "Placed along the east wall on an approved concrete pad.",
      fuelType: "natural_gas",
      kwRating: 26,
    },
    uploads: {
      sitePlan: [file("generator-east-elevation-survey.pdf", 450_000, daysAgo(2, 4))],
      specSheet: [file("generac-26kw-spec-sheet.pdf", 820_000, daysAgo(2, 3))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(2, 3),
      },
      {
        id: crypto.randomUUID(),
        type: "assigned",
        actor: "ARB Administration",
        message: "Assigned to reviewer M. Vance.",
        createdAt: daysAgo(1, 12),
      },
      {
        id: crypto.randomUUID(),
        type: "comment",
        actor: "ARB Administration",
        message: "Reviewer requested landscape buffer and decibel sound documentation.",
        createdAt: hoursAgo(18),
      },
      {
        id: crypto.randomUUID(),
        type: "changes_required",
        actor: "ARB Administration",
        message: "Changes required — see flagged items for required landscape screening and sound specs.",
        createdAt: hoursAgo(18),
      },
    ],
    comments: [
      {
        id: crypto.randomUUID(),
        author: "M. Vance, ARB Reviewer",
        authorRole: "arb",
        message:
          "Per Section 6.2 of the ARB Guidelines, any generator installation visible from the street requires continuous evergreen shrub screening at least 4ft high at installation.",
        createdAt: hoursAgo(18),
      },
      {
        id: crypto.randomUUID(),
        author: "M. Vance, ARB Reviewer",
        authorRole: "arb",
        message:
          "Please upload an updated site plan indicating the landscape screening buffer, and attach the manufacturer's operational decibel (dBA) sound rating certificate.",
        createdAt: hoursAgo(17, 45),
      },
    ],
    flags: [
      {
        fieldId: "sitePlan",
        reason: "Landscape screening detail required for side-yard generator per ARB Design Manual §6.2.",
      },
      {
        fieldId: "specSheet",
        reason: "Manufacturer decibel sound rating specification document is missing.",
      },
    ],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(2, 3),
    createdAt: daysAgo(2, 4),
    updatedAt: hoursAgo(18),
    submittedAt: daysAgo(2, 3),
  },

  // 2. Paint Color Change - Changes Required
  {
    id: "req-1003",
    code: `ARB-${YR}-1003`,
    requestTypeId: "paint-color-change",
    residentId: RES_1,
    status: "changes_required",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Refreshing the exterior facade and front entry to coordinate with recent stone trim upgrades.",
      contractorName: "Palm Beach Precision Painting",
      contractorNumber: "(561) 555-7311",
      additionalDetails: "Body and garage doors to be painted.",
      surfaces: ["body", "trim", "door"],
      manufacturer: "Sherwin-Williams",
      colorName: "Navy Blue",
    },
    uploads: {
      colorSample: [file("navy-swatch-photo.jpg", 240_000, daysAgo(3, 5))],
      currentPhotos: [
        file("front-elevation-daylight.jpg", 1_800_000, daysAgo(3, 5)),
        file("side-elevation-angles.jpg", 1_650_000, daysAgo(3, 4)),
      ],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(3, 4),
      },
      {
        id: crypto.randomUUID(),
        type: "assigned",
        actor: "ARB Administration",
        message: "Assigned to reviewer J. Marsh.",
        createdAt: daysAgo(2, 10),
      },
      {
        id: crypto.randomUUID(),
        type: "comment",
        actor: "ARB Administration",
        message: "Reviewer left feedback on the paint color specification.",
        createdAt: daysAgo(1, 2),
      },
      {
        id: crypto.randomUUID(),
        type: "changes_required",
        actor: "ARB Administration",
        message: "Changes required — see flagged items for exact color code and higher resolution swatch.",
        createdAt: daysAgo(1, 2),
      },
    ],
    comments: [
      {
        id: crypto.randomUUID(),
        author: "J. Marsh, ARB Reviewer",
        authorRole: "arb",
        message:
          "\"Navy Blue\" is too generic. Please provide the exact Sherwin-Williams color name and numerical swatch code (e.g., SW 6244 Naval) along with the chosen sheen/finish.",
        createdAt: daysAgo(1, 2),
      },
      {
        id: crypto.randomUUID(),
        author: "J. Marsh, ARB Reviewer",
        authorRole: "arb",
        message:
          "The uploaded color swatch photo is blurry. Please re-upload a clear high-resolution swatch or digital manufacturer color card.",
        createdAt: daysAgo(1, 1),
      },
    ],
    flags: [
      {
        fieldId: "colorName",
        reason: "Provide the exact manufacturer color name and code (e.g. SW 6244 Naval), not a generic color description.",
      },
      {
        fieldId: "colorSample",
        reason: "Photo is too blurry to verify the color — please reupload a clearer swatch photo.",
      },
    ],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(3, 4),
    createdAt: daysAgo(3, 5),
    updatedAt: daysAgo(1, 2),
    submittedAt: daysAgo(3, 4),
  },

  // 3. Pool Deck & Driveway Replacement - Changes Required
  {
    id: "req-1011",
    code: `ARB-${YR}-1011`,
    requestTypeId: "pool-deck-driveway",
    residentId: RES_1,
    status: "changes_required",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Resurfacing front circular driveway and rear pool deck with interlocking architectural pavers.",
      contractorName: "Heritage Hardscapes LLC",
      contractorNumber: "(561) 555-3920",
      additionalDetails: "Includes replacing existing cracked concrete with sand-set pavers.",
      material: "pavers",
      squareFootage: 1850,
    },
    uploads: {
      sitePlan: [file("driveway-deck-survey-2026.pdf", 710_000, daysAgo(5, 2))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(5, 1),
      },
      {
        id: crypto.randomUUID(),
        type: "assigned",
        actor: "ARB Administration",
        message: "Assigned to reviewer D. Okafor.",
        createdAt: daysAgo(4, 6),
      },
      {
        id: crypto.randomUUID(),
        type: "comment",
        actor: "ARB Administration",
        message: "Reviewer noted missing easement setback dimensions on site survey.",
        createdAt: daysAgo(2, 1),
      },
      {
        id: crypto.randomUUID(),
        type: "changes_required",
        actor: "ARB Administration",
        message: "Changes required — setback lines and paver manufacturer specification required.",
        createdAt: daysAgo(2, 1),
      },
    ],
    comments: [
      {
        id: crypto.randomUUID(),
        author: "D. Okafor, ARB Reviewer",
        authorRole: "arb",
        message:
          "The site plan submitted does not show the 5-foot drainage easement on the eastern property boundary. Please have your contractor mark the boundary setback clearly.",
        createdAt: daysAgo(2, 1),
      },
      {
        id: crypto.randomUUID(),
        author: "D. Okafor, ARB Reviewer",
        authorRole: "arb",
        message:
          "Please also specify the paver manufacturer, collection style, and color pattern (e.g., Tremron Mega Olde Towne in Sand Dune).",
        createdAt: daysAgo(2),
      },
    ],
    flags: [
      {
        fieldId: "sitePlan",
        reason: "Site plan does not display the mandatory 5-ft side drainage easement setback. Please update survey with setback lines.",
      },
      {
        fieldId: "material",
        reason: "Please specify the paver manufacturer, style line, and color blend in project details.",
      },
    ],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(5, 1),
    createdAt: daysAgo(5, 2),
    updatedAt: daysAgo(2, 1),
    submittedAt: daysAgo(5, 1),
  },

  // 4. Aluminum Fence - Under Review
  {
    id: "req-1001",
    code: `ARB-${YR}-1001`,
    requestTypeId: "fence",
    residentId: RES_1,
    status: "under_review",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Rear yard perimeter fence to match neighboring lots.",
      contractorName: "Coastal Fence Co.",
      contractorNumber: "(561) 555-9021",
      additionalDetails: "Black powder-coated aluminum fence with self-closing child-safety gate.",
      material: "aluminum",
      heightFt: 4,
      linearFt: 120,
    },
    uploads: {
      sitePlan: [file("survey-rear-yard.pdf", 620_000, daysAgo(6, 4))],
      productSpec: [file("aluminum-fence-spec.pdf", 310_000, daysAgo(6, 4))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(6, 3),
      },
      {
        id: crypto.randomUUID(),
        type: "assigned",
        actor: "ARB Administration",
        message: "Assigned to reviewer J. Marsh.",
        createdAt: daysAgo(5, 2),
      },
    ],
    comments: [],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(6, 3),
    createdAt: daysAgo(6, 4),
    updatedAt: daysAgo(5, 2),
    submittedAt: daysAgo(6, 3),
  },

  // 5. Impact Windows/Doors - Under Review
  {
    id: "req-1002",
    code: `ARB-${YR}-1002`,
    requestTypeId: "windows-doors",
    residentId: RES_1,
    status: "under_review",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Replacing original front-facing windows with Category 5 impact-rated architectural glass.",
      contractorName: "Sunshine Glass & Glazing",
      contractorNumber: "(561) 555-4410",
      additionalDetails: "White vinyl frames with low-E coating to match existing exterior styling.",
      quantity: 6,
      materialStyle: "White vinyl frame, impact-rated glass",
    },
    uploads: {
      productSpec: [file("impact-window-spec.pdf", 410_000, daysAgo(4, 3))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(4, 2),
      },
      {
        id: crypto.randomUUID(),
        type: "assigned",
        actor: "ARB Administration",
        message: "Assigned to reviewer D. Okafor.",
        createdAt: daysAgo(3, 4),
      },
    ],
    comments: [],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(4, 2),
    createdAt: daysAgo(4, 3),
    updatedAt: daysAgo(3, 4),
    submittedAt: daysAgo(4, 2),
  },

  // 6. Hurricane Shutters - Resubmitted
  {
    id: "req-1004",
    code: `ARB-${YR}-1004`,
    requestTypeId: "hurricane-shutters",
    residentId: RES_1,
    status: "resubmitted",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Adding accordion shutters to all rear-facing openings and lanai sliders.",
      contractorName: "StormGuard Shutters",
      contractorNumber: "(561) 555-2287",
      additionalDetails: "Ivory powder coat to blend with stucco exterior.",
      shutterType: "accordion",
      coverage: "Rear lanai slider (3 panels) and 4 rear bedroom windows",
    },
    uploads: {
      productSpec: [file("stormguard-accordion-spec.pdf", 380_000, daysAgo(9, 2))],
      currentPhotos: [file("rear-openings-current.jpg", 1_100_000, daysAgo(9, 2))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(9, 1),
      },
      {
        id: crypto.randomUUID(),
        type: "changes_required",
        actor: "ARB Administration",
        message: "Changes required — coverage description needed itemized opening list.",
        createdAt: daysAgo(7, 3),
      },
      {
        id: crypto.randomUUID(),
        type: "resubmitted",
        actor: "Avery Collins",
        message: "Revised request resubmitted for ARB review.",
        createdAt: daysAgo(6, 1),
      },
    ],
    comments: [
      {
        id: crypto.randomUUID(),
        author: "D. Okafor, ARB Reviewer",
        authorRole: "arb",
        message: "Please list every specific opening the shutters will cover, not just 'rear openings.'",
        createdAt: daysAgo(7, 3),
      },
    ],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(9, 1),
    createdAt: daysAgo(9, 2),
    updatedAt: daysAgo(6, 1),
    submittedAt: daysAgo(9, 1),
  },

  // 7. Roof Replacement - Approved
  {
    id: "req-1005",
    code: `ARB-${YR}-1005`,
    requestTypeId: "roof-replacement",
    residentId: RES_1,
    status: "approved",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Full barrel tile roof replacement with high-wind rated underlayment.",
      contractorName: "Coastal Roofing Co.",
      contractorNumber: "(561) 555-7733",
      additionalDetails: "Color matches neighborhood Mediterranean standard.",
      material: "tile",
      colorStyle: "Weathered Terra Cotta (Eagle Roofing #3521)",
    },
    uploads: {
      materialSample: [file("tile-sample-terra-cotta.jpg", 410_000, daysAgo(14, 5))],
      proposal: [file("coastal-roofing-proposal.pdf", 780_000, daysAgo(14, 5))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(14, 4),
      },
      {
        id: crypto.randomUUID(),
        type: "approved",
        actor: "ARB Administration",
        message: "Request approved by ARB Committee.",
        createdAt: daysAgo(8, 5),
      },
    ],
    comments: [],
    depositRequired: true,
    depositAmount: 250,
    depositReceived: true,
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(14, 4),
    createdAt: daysAgo(14, 5),
    updatedAt: daysAgo(8, 5),
    submittedAt: daysAgo(14, 4),
    decidedAt: daysAgo(8, 5),
  },

  // 8. Landscaping - Completed
  {
    id: "req-1006",
    code: `ARB-${YR}-1006`,
    requestTypeId: "landscaping",
    residentId: RES_1,
    status: "completed",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription:
        "Replacing front foundation planting with drought-tolerant Florida native shrubs and adding brass low-voltage pathway lighting.",
      contractorName: "Native Grounds Landscaping",
      contractorNumber: "(561) 555-6602",
      additionalDetails: "Includes drip irrigation conversion.",
      scope: ["beds", "lighting"],
    },
    uploads: {
      landscapePlan: [file("landscape-plan-rev2.pdf", 540_000, daysAgo(24, 6))],
      sitePhotos: [file("front-yard-current.jpg", 1_200_000, daysAgo(24, 6))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(24, 5),
      },
      {
        id: crypto.randomUUID(),
        type: "approved",
        actor: "ARB Administration",
        message: "Request approved.",
        createdAt: daysAgo(18, 3),
      },
      {
        id: crypto.randomUUID(),
        type: "completed",
        actor: "ARB Administration",
        message: "Final approval letter issued and request marked completed.",
        createdAt: daysAgo(12, 3),
      },
    ],
    comments: [
      {
        id: crypto.randomUUID(),
        author: "ARB Administration",
        authorRole: "arb",
        message: "Approved as submitted. Your final approval letter is attached and was emailed to you.",
        createdAt: daysAgo(12, 3),
      },
    ],
    approvalLetterAvailable: true,
    approvalLetter: file(`ARB-${YR}-1006-approval-letter.pdf`, 96_000, daysAgo(12, 3)),
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(24, 5),
    createdAt: daysAgo(24, 6),
    updatedAt: daysAgo(12, 3),
    submittedAt: daysAgo(24, 5),
    decidedAt: daysAgo(18, 3),
    completedAt: daysAgo(12, 3),
  },

  // 8b. Driveway & Walkway Pavers - Completed
  {
    id: "req-1000",
    code: `ARB-${YR}-1000`,
    requestTypeId: "driveway-pavers",
    residentId: RES_1,
    status: "completed",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Upgrading asphalt driveway and front entryway to Tremron interlocking concrete pavers in Autumn Blend.",
      contractorName: "Palm Beach Pavers & Hardscape",
      contractorNumber: "(561) 555-7740",
      additionalDetails: "Includes polymer sand joint stabilization.",
      paverType: "interlocking_concrete",
      patternStyle: "Three-piece herringbone",
      colorName: "Autumn Blend",
    },
    uploads: {
      paverSpec: [file("tremron-autumn-blend-spec.pdf", 420_000, daysAgo(45, 6))],
      drivewayLayout: [file("driveway-paver-layout.pdf", 780_000, daysAgo(45, 6))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(45, 5),
      },
      {
        id: crypto.randomUUID(),
        type: "approved",
        actor: "ARB Administration",
        message: "Request approved by ARB Committee.",
        createdAt: daysAgo(38, 2),
      },
      {
        id: crypto.randomUUID(),
        type: "completed",
        actor: "ARB Administration",
        message: "Driveway installation inspection verified and request marked completed.",
        createdAt: daysAgo(30, 4),
      },
    ],
    comments: [
      {
        id: crypto.randomUUID(),
        author: "ARB Administration",
        authorRole: "arb",
        message: "Driveway paver upgrade approved. Work must be completed within 90 days.",
        createdAt: daysAgo(38, 2),
      },
    ],
    approvalLetterAvailable: true,
    approvalLetter: file(`ARB-${YR}-1000-approval-letter.pdf`, 112_000, daysAgo(30, 4)),
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(45, 5),
    createdAt: daysAgo(45, 6),
    updatedAt: daysAgo(30, 4),
    submittedAt: daysAgo(45, 5),
    decidedAt: daysAgo(38, 2),
    completedAt: daysAgo(30, 4),
  },

  // 9. Above-ground Pool - Rejected
  {
    id: "req-1007",
    code: `ARB-${YR}-1007`,
    requestTypeId: "pool-installation",
    residentId: RES_1,
    status: "rejected",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Above-ground temporary pool for the back patio area.",
      contractorName: "Sunbelt Pools",
      contractorNumber: "(561) 555-8814",
      additionalDetails: "Includes pool cover and deck steps.",
      installationType: "aboveground_pool",
      contractor: "Sunbelt Pools",
    },
    uploads: {
      engineeredPlan: [file("pool-layout.pdf", 300_000, daysAgo(28, 4))],
      contractorLicense: [file("sunbelt-license.pdf", 190_000, daysAgo(28, 4))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(28, 3),
      },
      {
        id: crypto.randomUUID(),
        type: "rejected",
        actor: "ARB Administration",
        message: "Request rejected.",
        createdAt: daysAgo(20, 2),
      },
    ],
    comments: [
      {
        id: crypto.randomUUID(),
        author: "ARB Administration",
        authorRole: "arb",
        message:
          "Above-ground pool installations are not permitted per Section 4.3 of the community guidelines. Please resubmit as an in-ground installation if you'd like to proceed.",
        createdAt: daysAgo(20, 2),
      },
    ],
    rejectionReason:
      "Above-ground pools are not a permitted structure type per community architectural guidelines, Section 4.3.",
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(28, 3),
    createdAt: daysAgo(28, 4),
    updatedAt: daysAgo(20, 2),
    submittedAt: daysAgo(28, 3),
    decidedAt: daysAgo(20, 2),
  },

  // 10. Shed Demolition - Withdrawn
  {
    id: "req-1008",
    code: `ARB-${YR}-1008`,
    requestTypeId: "demolition",
    residentId: RES_1,
    status: "withdrawn",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Removal and demolition of legacy rear storage structure.",
      contractorName: "Quick Haul Demolition",
      contractorNumber: "(561) 555-9922",
      additionalDetails: "Holding off on demolition until the fall landscaping phase.",
      structure: "Wood storage shed (8x10)",
      demolitionContractor: "CGC-152881",
    },
    uploads: {
      demolitionPermit: [file("shed-demolition-plan.pdf", 220_000, daysAgo(35, 5))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(35, 4),
      },
      {
        id: crypto.randomUUID(),
        type: "withdrawn",
        actor: "Avery Collins",
        message: "Request withdrawn by resident. Further processing has stopped.",
        createdAt: daysAgo(30, 1),
      },
    ],
    comments: [],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(35, 4),
    createdAt: daysAgo(35, 5),
    updatedAt: daysAgo(30, 1),
    submittedAt: daysAgo(35, 4),
    withdrawnAt: daysAgo(30, 1),
  },

  // 11. Guest Cottage - Withdrawn with Deposit
  {
    id: "req-1009",
    code: `ARB-${YR}-1009`,
    requestTypeId: "new-dwelling",
    residentId: RES_1,
    status: "withdrawn",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Guest cottage construction on the rear lot.",
      contractorName: "Harborview Builders",
      contractorNumber: "(561) 555-3390",
      additionalDetails: "Project put on hold indefinitely; withdrawing to reapply later.",
      builderName: "Harborview Builders",
      squareFootage: 850,
      stories: 1,
    },
    uploads: {
      architecturalPlans: [file("guest-cottage-plans.pdf", 1_400_000, daysAgo(45, 6))],
      sitePlan: [file("guest-cottage-site-plan.pdf", 610_000, daysAgo(45, 6))],
      elevations: [file("guest-cottage-elevations.pdf", 720_000, daysAgo(45, 5))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(45, 5),
      },
      {
        id: crypto.randomUUID(),
        type: "approved",
        actor: "ARB Administration",
        message: "Request approved.",
        createdAt: daysAgo(40, 2),
      },
      {
        id: crypto.randomUUID(),
        type: "withdrawn",
        actor: "Avery Collins",
        message: "Request withdrawn by resident. Further processing has stopped.",
        createdAt: daysAgo(38, 1),
      },
    ],
    comments: [],
    depositRequired: true,
    depositAmount: 500,
    depositReceived: true,
    refundStatus: "awaiting",
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(45, 5),
    createdAt: daysAgo(45, 6),
    updatedAt: daysAgo(38, 1),
    submittedAt: daysAgo(45, 5),
    decidedAt: daysAgo(40, 2),
    withdrawnAt: daysAgo(38, 1),
  },

  // 12. Screen Enclosure - Withdrawn & Refund Processed
  {
    id: "req-1010",
    code: `ARB-${YR}-1010`,
    requestTypeId: "screen-enclosure",
    residentId: RES_1,
    status: "withdrawn",
    fieldValues: {
      propertyAddress: "142 Egret Landing Way",
      lotNo: "LOT-0142",
      projectDescription: "Pool cage enclosure over the existing pool deck.",
      contractorName: "Gulf Coast Screening",
      contractorNumber: "(561) 555-1124",
      additionalDetails: "Bronze aluminum frame with 20/20 no-see-um mesh.",
      enclosureType: "pool_cage",
      dimensions: "28ft x 34ft",
    },
    uploads: {
      sitePlan: [file("pool-cage-site-plan.pdf", 340_000, daysAgo(50, 4))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Avery Collins",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(50, 3),
      },
      {
        id: crypto.randomUUID(),
        type: "approved",
        actor: "ARB Administration",
        message: "Request approved.",
        createdAt: daysAgo(45, 2),
      },
      {
        id: crypto.randomUUID(),
        type: "withdrawn",
        actor: "Avery Collins",
        message: "Request withdrawn by resident. Further processing has stopped.",
        createdAt: daysAgo(42, 1),
      },
      {
        id: crypto.randomUUID(),
        type: "refund_updated",
        actor: "ARB Administration",
        message: "Deposit was applied toward permitting review costs incurred; recorded as No Refund.",
        createdAt: daysAgo(40, 3),
      },
    ],
    comments: [],
    depositRequired: true,
    depositAmount: 150,
    depositReceived: true,
    refundStatus: "no_refund",
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(50, 3),
    createdAt: daysAgo(50, 4),
    updatedAt: daysAgo(40, 3),
    submittedAt: daysAgo(50, 3),
    decidedAt: daysAgo(45, 2),
    withdrawnAt: daysAgo(42, 1),
  },

  // 13. Resident 2 (Priya Anand) Request
  {
    id: "req-2001",
    code: `ARB-${YR}-2001`,
    requestTypeId: "addition-to-dwelling",
    residentId: RES_2,
    status: "under_review",
    fieldValues: {
      propertyAddress: "288 Heron Cove Drive",
      lotNo: "LOT-0288",
      projectDescription: "Enclosed lanai extension with a new outdoor kitchen area.",
      contractorName: "Marlowe Design Studio",
      contractorNumber: "(561) 555-7788",
      additionalDetails: "Includes under-roof summer kitchen with commercial hood vent.",
      additionType: "room_addition",
      squareFootage: 320,
    },
    uploads: {
      drawings: [file("lanai-addition-plans.pdf", 1_100_000, daysAgo(2, 5))],
      elevations: [file("lanai-elevations.pdf", 640_000, daysAgo(2, 5))],
    },
    activity: [
      {
        id: crypto.randomUUID(),
        type: "submitted",
        actor: "Priya Anand",
        message: "Request submitted for ARB review.",
        createdAt: daysAgo(2, 4),
      },
    ],
    comments: [],
    hoaApproved: true,
    hoaConfirmedAt: daysAgo(2, 4),
    createdAt: daysAgo(2, 5),
    updatedAt: daysAgo(2, 4),
    submittedAt: daysAgo(2, 4),
  },
];

export function getRequestsForResident(residentId: string): RequestRecord[] {
  return seedRequests
    .filter((r) => r.residentId === residentId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}
