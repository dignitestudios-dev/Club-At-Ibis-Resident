// Seeded here as static defaults. In production this list — and each
// category's additional fields / document requirements — is authored by
// the Super Admin's category & form builder and served from the API. The
// member wizard only ever consumes the RequestType/FieldConfig shape
// below, so nothing in the UI changes when a real backend replaces this
// file. `baseProjectInfoFields` are fixed across every category per the
// PM flow and are not admin-configurable.

const DOCUMENT_ACCEPT = ".png,.jpg,.jpeg,.pdf,.docx";

export const baseProjectInfoFields: FieldConfig[] = [
  {
    id: "propertyAddress",
    label: "Property Address",
    type: "text",
    required: true,
    placeholder: "142 Egret Landing Way",
  },
  {
    id: "lotNo",
    label: "Lot No.",
    type: "text",
    required: true,
    placeholder: "LOT-0142",
  },
  {
    id: "projectDescription",
    label: "Project Description",
    type: "textarea",
    required: true,
    placeholder: "Briefly describe the proposed project",
  },
  {
    id: "contractorName",
    label: "Contractor Name",
    type: "text",
    required: false,
  },
  {
    id: "contractorNumber",
    label: "Contractor Number",
    type: "text",
    required: false,
    placeholder: "License number or phone",
  },
  {
    id: "additionalDetails",
    label: "Additional Details",
    type: "textarea",
    required: false,
  },
];

export const requestTypes: RequestType[] = [
  {
    id: "new-dwelling",
    name: "New Dwelling",
    description: "Construction of a new single-family residence.",
    icon: "Home",
    additionalFields: [
      {
        id: "builderName",
        label: "Builder / Architect of Record",
        type: "text",
        required: true,
      },
      {
        id: "squareFootage",
        label: "Approximate square footage",
        type: "number",
        required: true,
      },
      {
        id: "stories",
        label: "Number of stories",
        type: "number",
        required: false,
      },
    ],
    documentFields: [
      {
        id: "architecturalPlans",
        label: "Architectural plans",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
        multiple: true,
      },
      {
        id: "sitePlan",
        label: "Site plan / survey",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "elevations",
        label: "Exterior elevations",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "addition-to-dwelling",
    name: "Addition to Dwelling",
    description: "Room additions, second-story additions, or garage conversions.",
    icon: "Building2",
    additionalFields: [
      {
        id: "additionType",
        label: "Type of addition",
        type: "select",
        required: true,
        options: [
          { label: "Room addition", value: "room_addition" },
          { label: "Second story addition", value: "second_story" },
          { label: "Garage conversion", value: "garage_conversion" },
        ],
      },
      {
        id: "squareFootage",
        label: "Approximate square footage",
        type: "number",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "drawings",
        label: "Architectural drawings",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
        multiple: true,
      },
      {
        id: "elevations",
        label: "Exterior elevations",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "demolition",
    name: "Demolition",
    description: "Full or partial demolition of an existing structure.",
    icon: "HardHat",
    additionalFields: [
      {
        id: "structure",
        label: "Structure being demolished",
        type: "text",
        required: true,
      },
      {
        id: "demolitionContractor",
        label: "Demolition contractor license",
        type: "text",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "demolitionPermit",
        label: "Demolition plan / permit",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "windows-doors",
    name: "Windows/Doors",
    description: "Replacement or addition of windows and exterior doors.",
    icon: "DoorOpen",
    additionalFields: [
      {
        id: "quantity",
        label: "Quantity",
        type: "number",
        required: true,
      },
      {
        id: "materialStyle",
        label: "Material / style",
        type: "text",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "productSpec",
        label: "Product specification sheet",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "currentPhotos",
        label: "Current photos",
        type: "file",
        required: false,
        accept: DOCUMENT_ACCEPT,
        multiple: true,
      },
    ],
  },
  {
    id: "generator",
    name: "Generator",
    description: "Installation of a standby or portable generator.",
    icon: "Zap",
    additionalFields: [
      {
        id: "fuelType",
        label: "Fuel type",
        type: "select",
        required: true,
        options: [
          { label: "Propane", value: "propane" },
          { label: "Natural gas", value: "natural_gas" },
          { label: "Diesel", value: "diesel" },
        ],
      },
      {
        id: "kwRating",
        label: "kW rating",
        type: "number",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "sitePlan",
        label: "Site plan showing placement",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "specSheet",
        label: "Equipment spec sheet",
        type: "file",
        required: false,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "screen-enclosure",
    name: "Screen Enclosure",
    description: "Pool cage, patio, or lanai screen enclosures.",
    icon: "LayoutGrid",
    additionalFields: [
      {
        id: "enclosureType",
        label: "Enclosure type",
        type: "select",
        required: true,
        options: [
          { label: "Pool cage", value: "pool_cage" },
          { label: "Patio enclosure", value: "patio" },
          { label: "Lanai", value: "lanai" },
        ],
      },
      {
        id: "dimensions",
        label: "Approximate dimensions",
        type: "text",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "sitePlan",
        label: "Site plan",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "productSpec",
        label: "Product specification sheet",
        type: "file",
        required: false,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "pool-deck-driveway",
    name: "Pool Deck/Driveway Replacement",
    description: "Resurfacing or replacement of a pool deck or driveway.",
    icon: "Milestone",
    additionalFields: [
      {
        id: "material",
        label: "Material",
        type: "select",
        required: true,
        options: [
          { label: "Concrete", value: "concrete" },
          { label: "Pavers", value: "pavers" },
          { label: "Travertine", value: "travertine" },
          { label: "Asphalt", value: "asphalt" },
        ],
      },
      {
        id: "squareFootage",
        label: "Approximate square footage",
        type: "number",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "sitePlan",
        label: "Site plan",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "hurricane-shutters",
    name: "Hurricane Shutters",
    description: "Installation of accordion, roll-down, or panel shutters.",
    icon: "ShieldCheck",
    additionalFields: [
      {
        id: "shutterType",
        label: "Shutter type",
        type: "select",
        required: true,
        options: [
          { label: "Accordion", value: "accordion" },
          { label: "Roll-down", value: "roll_down" },
          { label: "Panel", value: "panel" },
        ],
      },
      {
        id: "coverage",
        label: "Openings covered",
        type: "text",
        required: true,
        helpText: "e.g. all windows and the lanai sliding door",
      },
    ],
    documentFields: [
      {
        id: "productSpec",
        label: "Product specification sheet",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "currentPhotos",
        label: "Current photos of openings",
        type: "file",
        required: false,
        accept: DOCUMENT_ACCEPT,
        multiple: true,
      },
    ],
  },
  {
    id: "pool-installation",
    name: "Pool Installation",
    description: "New pool, spa, or major pool equipment additions.",
    icon: "Waves",
    additionalFields: [
      {
        id: "installationType",
        label: "Installation type",
        type: "radio",
        required: true,
        options: [
          { label: "In-ground pool", value: "inground_pool" },
          { label: "Above-ground pool", value: "aboveground_pool" },
          { label: "Spa / hot tub", value: "spa" },
        ],
      },
      {
        id: "contractor",
        label: "Licensed pool contractor",
        type: "text",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "engineeredPlan",
        label: "Engineered pool plan",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "contractorLicense",
        label: "Contractor license / insurance",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "roof-replacement",
    name: "Roof Replacement",
    description: "Full or partial roof replacement or material change.",
    icon: "Construction",
    additionalFields: [
      {
        id: "material",
        label: "Roofing material",
        type: "select",
        required: true,
        options: [
          { label: "Asphalt shingle", value: "asphalt" },
          { label: "Tile", value: "tile" },
          { label: "Metal", value: "metal" },
          { label: "Flat / membrane", value: "membrane" },
        ],
      },
      {
        id: "colorStyle",
        label: "Color / style name",
        type: "text",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "materialSample",
        label: "Material / color sample",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "proposal",
        label: "Contractor proposal",
        type: "file",
        required: false,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "fence",
    name: "Fence",
    description: "New fencing, walls, or gates on your property.",
    icon: "Fence",
    additionalFields: [
      {
        id: "material",
        label: "Material",
        type: "select",
        required: true,
        options: [
          { label: "Wood", value: "wood" },
          { label: "Vinyl / PVC", value: "vinyl" },
          { label: "Aluminum", value: "aluminum" },
          { label: "Masonry / Stucco", value: "masonry" },
          { label: "Wrought iron", value: "iron" },
        ],
      },
      { id: "heightFt", label: "Height (feet)", type: "number", required: true },
      {
        id: "linearFt",
        label: "Approximate linear footage",
        type: "number",
        required: true,
      },
    ],
    documentFields: [
      {
        id: "sitePlan",
        label: "Site plan / property survey",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "productSpec",
        label: "Product specification sheet",
        type: "file",
        required: false,
        accept: DOCUMENT_ACCEPT,
      },
    ],
  },
  {
    id: "paint-color-change",
    name: "Paint Color Change",
    description: "Repainting your home's exterior or changing trim, door, or shutter colors.",
    icon: "PaintBucket",
    additionalFields: [
      {
        id: "surfaces",
        label: "Surfaces to be repainted",
        type: "checkbox",
        required: true,
        options: [
          { label: "Body / siding", value: "body" },
          { label: "Trim", value: "trim" },
          { label: "Front door", value: "door" },
          { label: "Shutters", value: "shutters" },
          { label: "Garage door", value: "garage" },
        ],
      },
      { id: "manufacturer", label: "Paint manufacturer", type: "text", required: true },
      {
        id: "colorName",
        label: "Color name & code",
        type: "text",
        required: true,
        placeholder: "e.g. Naval SW 6244",
      },
    ],
    documentFields: [
      {
        id: "colorSample",
        label: "Color sample / swatch",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "currentPhotos",
        label: "Current exterior photos",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
        multiple: true,
      },
    ],
  },
  {
    id: "landscaping",
    name: "Landscaping",
    description: "Landscape redesigns, hardscaping, or major plantings.",
    icon: "Trees",
    additionalFields: [
      {
        id: "scope",
        label: "Scope of work",
        type: "checkbox",
        required: true,
        options: [
          { label: "Plant beds / plantings", value: "beds" },
          { label: "Hardscape / pavers", value: "hardscape" },
          { label: "Irrigation", value: "irrigation" },
          { label: "Lighting", value: "lighting" },
          { label: "Tree removal", value: "tree_removal" },
        ],
      },
    ],
    documentFields: [
      {
        id: "landscapePlan",
        label: "Landscape plan",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
      },
      {
        id: "sitePhotos",
        label: "Current site photos",
        type: "file",
        required: true,
        accept: DOCUMENT_ACCEPT,
        multiple: true,
      },
    ],
  },
];

export function getRequestTypeById(id: string): RequestType | undefined {
  return requestTypes.find((type) => type.id === id);
}

export function getAllFieldsForType(type: RequestType): FieldConfig[] {
  return [...baseProjectInfoFields, ...type.additionalFields, ...type.documentFields];
}
