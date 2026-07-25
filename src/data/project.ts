// Central content source for the Sai World Dreams landing page.
// Sourced from official Paradise Group brochure, leaflet & cost sheet (W.E.F. 13/10/2025).
// TODO: CONTACT.whatsappHref still uses a placeholder mobile number — none of the source
// documents list a WhatsApp/mobile number, only the corporate landlines below. Replace it
// with the real sales mobile number before going live.

export const CONTACT = {
  phoneDisplay: "022 2783 1000",
  phoneHref: "tel:+912227831000",
  phoneAltDisplay: "022 2783 9000",
  phoneAltHref: "tel:+912227839000",
  whatsappHref:
    "https://wa.me/919876543210?text=Hi%2C%20I%27m%20interested%20in%20Sai%20World%20Dreams%2C%20Dombivli.%20Please%20share%20more%20details.",
  email: "saiworlddreams@paradisegroup.co.in",
  salesEmail: "sales@paradisegroup.co.in",
  enquiryEmail: "enquiry@paradisegroup.co.in",
};

export const SITE = {
  projectName: "Sai World Dreams",
  tagline: "Live the Dream",
  location: "Dombivli",
  url: "https://saiworlddreams.example.com",
  reraNumber: "P51700035191",
  reraUrl: "https://maharera.mahaonline.gov.in",
  siteAddress: "Sai World Dreams, Kalyan Shil Road, Dombivli",
  seoTitle: "Sai World Dreams Dombivli | Luxury 1, 2, 3 BHK Homes",
  metaDescription:
    "Book your dream home at Sai World Dreams Dombivli. Premium 1, 2, 2.5 & 3 BHK residences with world-class amenities, retail boulevard, and excellent connectivity.",
  primaryKeyword: "Sai World Dreams Dombivli",
  secondaryKeywords: [
    "Luxury Flats in Dombivli",
    "1 BHK in Dombivli",
    "2 BHK Flats Dombivli",
    "3 BHK Flats Dombivli",
    "Premium Apartments Dombivli",
    "New Launch Projects in Dombivli",
    "Integrated Township Dombivli",
    "Homes Near Kalyan Shil Road",
    "MahaRERA Approved Project Dombivli",
  ],
};

// The promoter/developer entity — required for a legally complete real estate footer.
export const DEVELOPER = {
  brand: "Paradise Group",
  fullName: "Paradise Group Builders & Developers",
  legalEntity: "M/s. Out N Out Infotech (India) LLP",
  brandTagline: "Your World. Our Vision.",
  isoCertified: "ISO 9001:2015 Certified Organization",
  website: "https://www.paradisegroup.co.in",
  corporateOffice:
    "1701, Satra Plaza, Plot No. 19 & 20, Sector - 19D, Vashi, Navi Mumbai - 400 705",
  experienceYears: "32+",
  stats: [
    { label: "Years of Legacy", value: "32+" },
    { label: "Projects Completed", value: "125+" },
    { label: "Sq. Ft. Delivered", value: "5M+" },
    { label: "Sq. Ft. Under Development", value: "12.5M+" },
  ],
  presence: [
    "Kharghar",
    "Upper Kharghar",
    "Panvel",
    "Ulwe",
    "Taloja",
    "Dombivli",
    "Kalyan NX",
    "Lonavala",
  ],
  projectFinancedBy: "IndusInd Bank",
};

export const CONSULTANTS = [
  { role: "Architect", name: "Hiten Sethi Architects" },
  { role: "Liasoning Architect", name: "Spaceage Consultants" },
  { role: "Landscape Architect", name: "Newarch Landscapes LLP" },
  { role: "Interior Consultant", name: "Vini & Asso." },
  { role: "RCC Consultant", name: "Structural Concept Designs Pvt. Ltd." },
  { role: "MEP Consultant", name: "Anil Verma & Asso." },
];

export const TOWERS = [
  "Castle",
  "Vista",
  "Mist",
  "Spring",
  "Orchard",
  "Meadows",
  "Breeze",
  "Heaven",
];

export const HERO = {
  heading: "Live the Dream at Sai World Dreams, Dombivli",
  subheading:
    "Luxury 1, 2, 2.5 & 3 BHK Homes in an 18-Acre Integrated Global Lifestyle Township",
};

export const HIGHLIGHT_CARDS = [
  { label: "MahaRERA Approved", icon: "ShieldCheck" },
  { label: "Phase 1 Possession: Dec 2026", icon: "CalendarCheck2" },
  { label: "Phase 2 Possession: Dec 2027", icon: "CalendarClock" },
  { label: "Starting From ₹51 Lakhs*", icon: "IndianRupee" },
  { label: "Premium Lifestyle Amenities", icon: "Sparkles" },
  { label: "Excellent Connectivity", icon: "TrainFront" },
];

export const CONFIG_OPTIONS = [
  "1 BHK",
  "2 BHK",
  "2.5 BHK",
  "3 BHK",
  "Not Sure Yet",
];

export const ABOUT = {
  title: "Experience a Global Lifestyle Like Never Before",
  paragraphs: [
    "Sai World Dreams is an integrated 18-acre premium township in Dombivli that combines luxury residences, commercial spaces, retail avenues, premium amenities, landscaped open spaces and exceptional connectivity into one landmark destination.",
    'Designed around the concept of "Live the Dream," the development offers an all-inclusive lifestyle for modern families — Dombivli\'s first mixed-use themed luxury world, inspired by the Dubai lifestyle.',
  ],
};

export const PROJECT_HIGHLIGHTS = [
  { label: "18 Acre Integrated Township", icon: "LandPlot" },
  { label: "8 Residential Towers (G+35)", icon: "Building2" },
  { label: "Premium 1, 2, 2.5 & 3 BHK Homes", icon: "Home" },
  { label: "Themed Landscaping Across 6 Acres", icon: "Trees" },
  { label: "High Street Shopping Boulevard", icon: "ShoppingBag" },
  { label: "G+3 World Dreams Plaza (Retail)", icon: "Store" },
  { label: "Business Complex with Office Spaces", icon: "Briefcase" },
  { label: "G+23 Storey 5-Star Luxury Hotel", icon: "BedDouble" },
  { label: "La Dreams Club — Luxury Clubhouse", icon: "Gem" },
  { label: "Premium Lifestyle Amenities", icon: "Sparkles" },
  { label: "Excellent Connectivity", icon: "TrainFront" },
  { label: "Future Growth Location", icon: "TrendingUp" },
];

export const PRICING = [
  { config: "1 BHK", carpet: 450, saleable: 720, price: "₹51 Lakhs*" },
  { config: "1 BHK", carpet: 473, saleable: 760, price: "₹53.75 Lakhs*" },
  { config: "1 BHK", carpet: 477, saleable: 765, price: "₹54.25 Lakhs*" },
  { config: "2 BHK", carpet: 609, saleable: 975, price: "₹69 Lakhs*" },
  { config: "2 BHK", carpet: 711, saleable: 1140, price: "₹80.75 Lakhs*" },
  { config: "2 BHK", carpet: 720, saleable: 1155, price: "₹81.75 Lakhs*" },
  { config: "2 BHK", carpet: 730, saleable: 1170, price: "₹83 Lakhs*" },
  { config: "2.5 BHK", carpet: 825, saleable: 1320, price: "₹93.50 Lakhs*" },
  { config: "3 BHK", carpet: 1194, saleable: 1910, price: "₹1.35 Cr*" },
  { config: "3 BHK", carpet: 1313, saleable: 2100, price: "₹1.49 Cr*" },
];

// Sample floor-wise cost sheet for one tower, from the official "TOWER 6 MEADOWS - COST SHEET"
// (W.E.F. 13/10/2025). Other towers are priced separately — request the latest sheet per tower.
export const FLOOR_WISE_COST_SHEET = {
  tower: "Meadows",
  effectiveDate: "13/10/2025",
  floorBands: ["6th – 12th Floor", "13th – 20th Floor", "21st – 27th Floor", "28th – 35th Floor"],
  rows: [
    {
      config: "1 BHK",
      saleable: 720,
      exclusive: 450,
      prices: ["₹51,00,000", "₹52,50,000", "₹53,75,000", "₹55,25,000"],
    },
    {
      config: "2 BHK",
      saleable: 1155,
      exclusive: 720,
      prices: ["₹81,75,000", "₹84,00,000", "₹86,00,000", "₹88,50,000"],
    },
    {
      config: "2.5 BHK",
      saleable: 1320,
      exclusive: 825,
      prices: ["₹93,50,000", "₹96,00,000", "₹98,50,000", "₹1,01,00,000"],
    },
  ],
  notes: [
    "Rates are subject to change without prior intimation.",
    "Covered car parking is optional.",
    "Stamp duty, registration and GST to be paid separately as applicable.",
    "Society maintenance and other government charges apply at possession.",
  ],
};

export const FLOOR_PLAN_TABS = ["1 BHK", "2 BHK", "2.5 BHK", "3 BHK"];

export const AMENITIES = [
  {
    world: "Nirvana World",
    category: "Health & Fitness Zones",
    icon: "Dumbbell",
    items: [
      "Open Air Gymnasium",
      "Yoga Plaza & Sitting",
      "Futsal Court with Flood Lights",
      "Leisure Pool & Lap Pool with Sunken Pool Bar",
      "Basketball Court",
      "Cricket Practice Pitch",
      "Lawn Tennis Court with Flood Lights",
      "600 Mtr. Long Elevated Jogging Track & Pathway",
    ],
  },
  {
    world: "Zen World",
    category: "Landscape & Leisure Zones",
    icon: "Trees",
    items: [
      "Designer Fountain",
      "Landscaped Garden with Water Bodies",
      "Exclusive Open-air Chess Play Area",
      "Designer Pergolas & Gazebos for Relaxation",
      "Barbeque Pavilion",
      "Senior Citizen Chit-chat Zone with Sit-outs",
      "Pets Park with Play Equipment",
      "Miyawaki Forest",
    ],
  },
  {
    world: "Euphoria World",
    category: "Entertainment & Social Life Zones",
    icon: "PartyPopper",
    items: [
      "Kids Splash Pad with Water Play Station",
      "Open-air Celebration Lawn",
      "Amphitheatre with Performance Stage",
      "Well-equipped Kids Play Area with Rubber Flooring",
      "Peaceful Saibaba & Lord Ganesha Temple",
      "Open Air Jacuzzi",
      "Skating Rink",
      "Musical Pavilion",
      "3 Level Clubhouse with Open-air Cafeteria",
    ],
  },
  {
    world: "La Dreams Club",
    category: "The High-Society Clubhouse",
    icon: "Gem",
    items: [
      "Well-equipped Fitness Centre",
      "Big Banquet Hall for Celebrations",
      "Indoor Games Arena",
      "Private Theatre for Movies & Live Sports",
      "Spa with Steam, Sauna & Jacuzzi",
      "Indoor Badminton Court",
      "Air-conditioned Squash Court",
      "Well-equipped Karaoke Studio",
      "Simulator Golf Play Zone",
      "Health Zone for Zumba & Aerobics",
      "Well-stocked Library & Reading Zone",
    ],
  },
];

export const INFRASTRUCTURE = [
  { label: "Metro Line 12", icon: "TrainFront" },
  { label: "Metro Line 5", icon: "TrainFront" },
  { label: "Metro Line 14", icon: "TrainFront" },
  { label: "Airoli Katai Freeway", icon: "Route" },
  { label: "Bullet Train Connectivity", icon: "Rocket" },
  { label: "Mumbai Nagpur Expressway", icon: "Route" },
  { label: "Delhi Mumbai Expressway", icon: "Route" },
  { label: "Kalyan Ring Road", icon: "CircleDot" },
  { label: "Multi Modal Corridor", icon: "Waypoints" },
  { label: "Mothagaon Bridge", icon: "Landmark" },
];

export const CONNECTIVITY = [
  { place: "Kalyan-Shil Road", time: "0 Min" },
  { place: "Upcoming Kalyan-Taloja Metro", time: "2 Min" },
  { place: "Multimodal Corridor", time: "5 Min" },
  { place: "Dombivli Railway Station", time: "12 Min" },
  { place: "Navi Mumbai Airport", time: "30 Min" },
];

export const SCHOOLS = [
  { name: "Ira Global School", time: "2 Mins" },
  { name: "Vidya Niketan School", time: "3 Mins" },
  { name: "Sriram School", time: "4 Mins" },
  { name: "Ryan International School", time: "5 Mins" },
  { name: "Omkar Cambridge International School", time: "8 Mins" },
];

export const HOSPITALS = [
  { name: "Sai Hospital", time: "2 Mins" },
  { name: "AIMS Hospital", time: "3 Mins" },
  { name: "RR Hospital", time: "4 Mins" },
  { name: "Icon Hospital", time: "4 Mins" },
  { name: "Neon Hospital", time: "10 Mins" },
];

export const APARTMENT_SPECIFICATIONS = [
  "Big Size Vitrified Tiles in Living, Dining & Passage Area",
  "Vitrified Tiles in Kitchen and Common Bedroom",
  "European Wooden Flooring in Master Bedroom",
  "Granite Kitchen Platform with Service Platform",
  "4 / 3 Burner Gas Hob with Exhaust Chimney",
  "Water Purifier & Geyser for Hot Water at Kitchen Sink",
  "Exhaust Fan in Kitchen Window",
  "Shower Panel in Master Bedrooms",
  "Branded Geyser in Bathrooms",
  "Designer Bathroom with Branded Sanitary Ware & Fixtures",
  "TV, Telephone & Internet Points in All Rooms",
  "Concealed Plumbing with Premium Quality C.P. Fittings",
  "Branded Concealed Copper Wiring with MCB / ELCB",
  "Attractive Main Door with Elegant Handles & Night Latch",
  "Premium Quality Plastic Paints on Interior Walls",
  "Ample Electrical Points & Modular Switches",
  "Marble & Granite Window Sill",
  "Gypsum Finished Internal Walls",
  "Video Door Security System in Each Flat with Cameras",
];

export const TOWER_FEATURES = [
  "Double-height Entrance Lobbies",
  "Air-conditioned Lounge & Art Gallery",
  "24x7 Security & CCTV Surveillance",
  "Designer Floor Lobbies",
  "High-speed Lifts & Generator Backup",
  "Intercom System",
  "Shopping Centre with Famous Brand Stores",
];

// Representational stock photography (Unsplash) — swap for real project photography
// as it becomes available. Keep the "Representational Image" captions when you do.
export const STOCK_IMAGES = {
  skylineDusk: "1758608307526-00c44ba7bb37",
  luxuryHomeDusk: "1757359056339-22968344cce6",
  resortPool: "1781255276587-2470a25ea4ba",
  beachResortPool: "1753724933350-c2e0e2990445",
  mallShops: "1758448500717-2e4bcd79108b",
  mallStorefronts: "1758448501002-8c7bb7a7d9ff",
  hotelLobby: "1758193783649-13371d7fb8dd",
  gardenPath: "1692339267725-ce644ac805ec",
  officeGlass: "1778961419928-2968ddd57c05",
  gym: "1758957646695-ec8bce3df462",
  tropicalGarden: "1750762286053-28632f48e717",
  marbleLobby: "1758448500688-3ababa93fd67",
};

export const LIFESTYLE = [
  {
    title: "World Dreams Plaza",
    subtitle: "High Street Shopping Boulevard",
    icon: "ShoppingBag",
    image: STOCK_IMAGES.mallStorefronts,
  },
  {
    title: "World Dreams Business Park",
    subtitle: "Premium Commercial Offices",
    icon: "Briefcase",
    image: STOCK_IMAGES.officeGlass,
  },
  {
    title: "World Dreams Hotel",
    subtitle: "G+23 Storey 5-Star Luxury Hotel",
    icon: "BedDouble",
    image: STOCK_IMAGES.hotelLobby,
  },
  {
    title: "La Dreams Club",
    subtitle: "High-Society Clubhouse",
    icon: "Gem",
    image: STOCK_IMAGES.beachResortPool,
  },
  {
    title: "Integrated Township",
    subtitle: "Residential + Retail + Commercial",
    icon: "LandPlot",
    image: STOCK_IMAGES.luxuryHomeDusk,
  },
];

export const GALLERY_CATEGORIES = [
  { label: "Exterior", image: STOCK_IMAGES.luxuryHomeDusk },
  { label: "Clubhouse", image: STOCK_IMAGES.hotelLobby },
  { label: "Amenities", image: STOCK_IMAGES.gym },
  { label: "Swimming Pool", image: STOCK_IMAGES.resortPool },
  { label: "Podium", image: STOCK_IMAGES.tropicalGarden },
  { label: "Gardens", image: STOCK_IMAGES.gardenPath },
  { label: "Lobby", image: STOCK_IMAGES.marbleLobby },
  { label: "Elevation", image: STOCK_IMAGES.officeGlass },
  { label: "Night View", image: STOCK_IMAGES.skylineDusk },
  { label: "Retail Plaza", image: STOCK_IMAGES.mallShops },
];

export const CONSTRUCTION_STATUS = [
  { phase: "Foundation & Piling", status: "Completed" },
  { phase: "Podium Structure", status: "Completed" },
  { phase: "Tower Structure (Phase 1)", status: "In Progress" },
  { phase: "Finishing Works (Phase 1)", status: "Upcoming" },
  { phase: "Phase 1 Possession", status: "Dec 2026" },
  { phase: "Phase 2 Possession", status: "Dec 2027" },
];

export const FAQS = [
  {
    q: "What configurations are available?",
    a: "Sai World Dreams offers premium 1 BHK, 2 BHK, 2.5 BHK and 3 BHK homes across 8 residential towers — Castle, Vista, Mist, Spring, Orchard, Meadows, Breeze & Heaven (all G+35) — within an 18-acre integrated township.",
  },
  {
    q: "What is the starting price?",
    a: "Homes are priced starting from ₹51 Lakhs* for a 1 BHK. Pricing varies by tower and floor — for example, 1 BHK homes in Tower Meadows range from ₹51 Lakhs on the 6th–12th floor up to ₹55.25 Lakhs on the 28th–35th floor. Request the latest tower-wise price sheet for exact details.",
  },
  {
    q: "What is possession?",
    a: "Phase 1 possession is scheduled for December 2026, and Phase 2 possession is scheduled for December 2027. As per MahaRERA registration, the RERA-registered completion date is December 2028 for Phase 1 and December 2029 for Phase 2.",
  },
  {
    q: "Is parking available?",
    a: "Yes, dedicated parking is available for residents; covered car parking is optional and chargeable separately. Please speak with our sales team for specific allotment and pricing details.",
  },
  {
    q: "Are banks approved?",
    a: "The project is MahaRERA approved (Registration No. P51700035191) and is financed by IndusInd Bank, with home loan assistance also available through other leading nationalised and private banks.",
  },
  {
    q: "How do I schedule a visit?",
    a: 'Click "Book Free Site Visit" anywhere on this page, or call/WhatsApp us directly and our team will arrange a convenient time for your site visit.',
  },
  {
    q: "What amenities are included?",
    a: "The township features 40+ lifestyle amenities organised across four branded zones — Nirvana World (health & fitness), Zen World (landscape & leisure), Euphoria World (entertainment) and La Dreams Club (the high-society clubhouse).",
  },
  {
    q: "Who is developing Sai World Dreams?",
    a: "Sai World Dreams is developed by Paradise Group Builders & Developers, an ISO 9001:2015 certified organisation with 32+ years of experience and 125+ completed projects across Navi Mumbai and Mumbai.",
  },
];
