/**
 * Prototype fixture data. Shapes mirror the planned Prisma models so the
 * screens can be wired to the real API later without changing their props.
 * Money is in minor units. Nothing here is real.
 */
import type { SportId } from "@/lib/sports";

export type TournamentStatus =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "ongoing"
  | "completed";

export type MatchStatus = "upcoming" | "live" | "completed" | "abandoned";

export type Team = {
  id: string;
  name: string;
  short: string;
  city: string;
  colour: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  pts: number;
  nrr: number;
};

export type Innings = { runs: number; wickets: number; overs: string };

export type Match = {
  id: string;
  no: number;
  tournamentSlug: string;
  tournamentName: string;
  sport: SportId;
  status: MatchStatus;
  stage: string;
  venue: string;
  startsAt: string;
  teamA: string;
  teamB: string;
  a?: Innings;
  b?: Innings;
  result?: string;
  target?: string;
  streamUrl?: string;
  ticketsFrom?: number;
  ticketsSold?: number;
  capacity?: number;
};

export type Tournament = {
  id: string;
  slug: string;
  name: string;
  sport: SportId;
  organizer: string;
  city: string;
  venue: string;
  start: string;
  end: string;
  status: TournamentStatus;
  format: string;
  matchType: string;
  ballType: string;
  entryFee: number;
  teamsJoined: number;
  maxTeams: number;
  prize: number;
  featured?: boolean;
  banner: string;
  blurb: string;
};

/* ------------------------------------------------------------------ teams */
export const TEAMS: Team[] = [
  { id: "t1", name: "Mumbai Mavericks", short: "MUM", city: "Mumbai", colour: "#c8ff2e", played: 6, won: 5, lost: 1, tied: 0, pts: 10, nrr: 1.42 },
  { id: "t2", name: "Pune Panthers", short: "PUN", city: "Pune", colour: "#ff9f3d", played: 6, won: 4, lost: 2, tied: 0, pts: 8, nrr: 0.78 },
  { id: "t3", name: "Delhi Dynamos", short: "DEL", city: "Delhi", colour: "#4aa3ff", played: 6, won: 4, lost: 2, tied: 0, pts: 8, nrr: 0.31 },
  { id: "t4", name: "Kochi Kings", short: "KOC", city: "Kochi", colour: "#b06bff", played: 6, won: 3, lost: 3, tied: 0, pts: 6, nrr: -0.12 },
  { id: "t5", name: "Jaipur Jets", short: "JAI", city: "Jaipur", colour: "#ff4d4d", played: 6, won: 2, lost: 4, tied: 0, pts: 4, nrr: -0.64 },
  { id: "t6", name: "Baroda Blues", short: "BAR", city: "Baroda", colour: "#3ddc84", played: 6, won: 2, lost: 4, tied: 0, pts: 4, nrr: -0.87 },
  { id: "t7", name: "Nagpur Nawabs", short: "NAG", city: "Nagpur", colour: "#ffb020", played: 6, won: 1, lost: 5, tied: 0, pts: 2, nrr: -1.03 },
  { id: "t8", name: "Surat Strikers", short: "SUR", city: "Surat", colour: "#8c9fff", played: 6, won: 3, lost: 3, tied: 0, pts: 6, nrr: 0.09 },
];

export const teamByShort = (s: string) => TEAMS.find((t) => t.short === s)!;

/* ------------------------------------------------------------ tournaments */
export const TOURNAMENTS: Tournament[] = [
  {
    id: "tr1", slug: "deccan-premier-league-2026", name: "Deccan Premier League 2026",
    sport: "cricket", organizer: "Deccan Sports Trust", city: "Mumbai", venue: "Wankhede Ground B",
    start: "2026-11-02", end: "2026-11-24", status: "ongoing", format: "Groups + Knockout",
    matchType: "T20", ballType: "Leather", entryFee: 1200000, teamsJoined: 8, maxTeams: 8,
    prize: 50000000, featured: true, banner: "banner-turf",
    blurb: "Eight franchises, 22 nights, one trophy. The city's biggest open-entry T20.",
  },
  {
    id: "tr2", slug: "ahmedabad-corporate-cup", name: "Ahmedabad Corporate Cup",
    sport: "cricket", organizer: "GSC Events", city: "Ahmedabad", venue: "Sardar Patel Turf 3",
    start: "2026-11-14", end: "2026-11-16", status: "registration_open", format: "Knockout",
    matchType: "T10", ballType: "Tennis", entryFee: 400000, teamsJoined: 11, maxTeams: 16,
    prize: 7500000, featured: true, banner: "banner-amber",
    blurb: "Weekend knockout for office teams. Tennis ball, ten overs, zero excuses.",
  },
  {
    id: "tr3", slug: "kochi-monsoon-shield", name: "Kochi Monsoon Shield",
    sport: "cricket", organizer: "Kochi Cricket Academy", city: "Kochi", venue: "Marine Drive Ground",
    start: "2026-12-05", end: "2026-12-20", status: "registration_open", format: "League (round robin)",
    matchType: "ODI (50)", ballType: "Leather", entryFee: 0, teamsJoined: 4, maxTeams: 10,
    prize: 0, banner: "banner-ocean",
    blurb: "Free-entry 50-over league for academy and club sides across Ernakulam.",
  },
  {
    id: "tr4", slug: "jaipur-night-sixes", name: "Jaipur Night Sixes",
    sport: "cricket", organizer: "Pink City Sports", city: "Jaipur", venue: "Amer Box Arena",
    start: "2026-10-04", end: "2026-10-12", status: "completed", format: "Groups + Knockout",
    matchType: "T10", ballType: "Tennis", entryFee: 250000, teamsJoined: 16, maxTeams: 16,
    prize: 3000000, banner: "banner-dusk",
    blurb: "Floodlit box cricket, sixteen sides, decided on the last ball.",
  },
  {
    id: "tr5", slug: "surat-school-championship", name: "Surat Inter-School Championship",
    sport: "cricket", organizer: "Surat Schools Board", city: "Surat", venue: "Athwa Sports Complex",
    start: "2026-12-18", end: "2027-01-08", status: "registration_open", format: "Groups + Knockout",
    matchType: "T20", ballType: "Leather", entryFee: 150000, teamsJoined: 6, maxTeams: 24,
    prize: 2500000, banner: "banner-steel",
    blurb: "Under-16 championship across 24 schools, played through the winter break.",
  },
  {
    id: "tr6", slug: "nagpur-veterans-trophy", name: "Nagpur Veterans Trophy",
    sport: "cricket", organizer: "Orange City Club", city: "Nagpur", venue: "VCA Civil Lines",
    start: "2026-11-28", end: "2026-11-30", status: "registration_closed", format: "Knockout",
    matchType: "T20", ballType: "Leather", entryFee: 600000, teamsJoined: 8, maxTeams: 8,
    prize: 5000000, banner: "banner-clay",
    blurb: "Over-40s knockout. Eight sides, one weekend, bragging rights for a year.",
  },
];

export const tournamentBySlug = (slug: string) =>
  TOURNAMENTS.find((t) => t.slug === slug);

/* ----------------------------------------------------------------- matches */
export const MATCHES: Match[] = [
  {
    id: "m14", no: 14, tournamentSlug: "deccan-premier-league-2026",
    tournamentName: "Deccan Premier League 2026", sport: "cricket", status: "live",
    stage: "Group A", venue: "Wankhede Ground B", startsAt: "2026-11-05T19:30",
    teamA: "MUM", teamB: "PUN", a: { runs: 182, wickets: 4, overs: "18.2" },
    b: { runs: 205, wickets: 6, overs: "20.0" }, target: "MUM need 24 off 10",
    streamUrl: "youtube", ticketsFrom: 20000, ticketsSold: 418, capacity: 600,
  },
  {
    id: "m15", no: 15, tournamentSlug: "deccan-premier-league-2026",
    tournamentName: "Deccan Premier League 2026", sport: "cricket", status: "live",
    stage: "Group B", venue: "Wankhede Ground B", startsAt: "2026-11-05T15:00",
    teamA: "DEL", teamB: "KOC", a: { runs: 96, wickets: 7, overs: "14.0" },
    b: { runs: 148, wickets: 8, overs: "20.0" }, target: "DEL need 53 off 36",
    streamUrl: "youtube", ticketsFrom: 0, ticketsSold: 230, capacity: 600,
  },
  {
    id: "m16", no: 16, tournamentSlug: "deccan-premier-league-2026",
    tournamentName: "Deccan Premier League 2026", sport: "cricket", status: "upcoming",
    stage: "Group A", venue: "Wankhede Ground B", startsAt: "2026-11-06T19:30",
    teamA: "JAI", teamB: "BAR", ticketsFrom: 20000, ticketsSold: 88, capacity: 600,
  },
  {
    id: "m17", no: 17, tournamentSlug: "deccan-premier-league-2026",
    tournamentName: "Deccan Premier League 2026", sport: "cricket", status: "upcoming",
    stage: "Group B", venue: "Wankhede Ground B", startsAt: "2026-11-07T15:00",
    teamA: "NAG", teamB: "SUR", ticketsFrom: 20000, ticketsSold: 34, capacity: 600,
  },
  {
    id: "m13", no: 13, tournamentSlug: "deccan-premier-league-2026",
    tournamentName: "Deccan Premier League 2026", sport: "cricket", status: "completed",
    stage: "Group A", venue: "Wankhede Ground B", startsAt: "2026-11-04T19:30",
    teamA: "MUM", teamB: "DEL", a: { runs: 211, wickets: 6, overs: "20.0" },
    b: { runs: 198, wickets: 9, overs: "20.0" }, result: "Mumbai Mavericks won by 13 runs",
    ticketsSold: 512, capacity: 600,
  },
  {
    id: "m12", no: 12, tournamentSlug: "deccan-premier-league-2026",
    tournamentName: "Deccan Premier League 2026", sport: "cricket", status: "completed",
    stage: "Group B", venue: "Wankhede Ground B", startsAt: "2026-11-03T15:00",
    teamA: "KOC", teamB: "SUR", a: { runs: 154, wickets: 9, overs: "20.0" },
    b: { runs: 157, wickets: 4, overs: "18.1" }, result: "Surat Strikers won by 6 wickets",
    ticketsSold: 377, capacity: 600,
  },
];

export const liveMatches = MATCHES.filter((m) => m.status === "live");
export const matchesFor = (slug: string) =>
  MATCHES.filter((m) => m.tournamentSlug === slug);
export const matchByNo = (slug: string, no: number) =>
  MATCHES.find((m) => m.tournamentSlug === slug && m.no === no);

/* ---------------------------------------------------------------- scoring */
export const OVER_BALLS = ["1", "4", "W", "2", "6", "•"] as const;

export const BATTERS = [
  { name: "R. Shetty", runs: 64, balls: 38, fours: 7, sixes: 2, strike: true },
  { name: "S. Patil", runs: 21, balls: 17, fours: 2, sixes: 0, strike: false },
];

export const BOWLERS = [
  { name: "T. Rathore", overs: "3.2", maidens: 0, runs: 28, wickets: 2, econ: 8.4 },
  { name: "M. Fernandes", overs: "4.0", maidens: 0, runs: 41, wickets: 1, econ: 10.25 },
];

export const COMMENTARY = [
  { ball: "18.2", text: "Shetty works it to square leg, one run.", kind: "run" },
  { ball: "18.1", text: "SIX! Slog-swept over deep midwicket.", kind: "six" },
  { ball: "17.6", text: "Dot. Yorker outside off, well bowled.", kind: "dot" },
  { ball: "17.5", text: "WICKET! Caught at long-on, Rathore strikes.", kind: "wicket" },
  { ball: "17.4", text: "FOUR through the covers, timed beautifully.", kind: "four" },
];

export const TOP_RUNS = [
  { pos: 1, name: "R. Shetty", team: "MUM", runs: 486, sr: 148.6, hs: "92*" },
  { pos: 2, name: "A. Qureshi", team: "DEL", runs: 441, sr: 139.2, hs: "88" },
  { pos: 3, name: "K. Menon", team: "KOC", runs: 418, sr: 131.4, hs: "104" },
  { pos: 4, name: "S. Patil", team: "PUN", runs: 390, sr: 144.9, hs: "76" },
  { pos: 5, name: "J. Baruah", team: "NAG", runs: 372, sr: 127.8, hs: "81*" },
];

export const TOP_WICKETS = [
  { pos: 1, name: "T. Rathore", team: "JAI", wkts: 24, econ: 6.4, bbi: "5/19" },
  { pos: 2, name: "M. Fernandes", team: "CHE", wkts: 21, econ: 7.1, bbi: "4/22" },
  { pos: 3, name: "H. Gill", team: "MUM", wkts: 19, econ: 6.9, bbi: "4/15" },
  { pos: 4, name: "D. Naik", team: "BAR", wkts: 18, econ: 7.6, bbi: "3/11" },
  { pos: 5, name: "V. Rao", team: "IND", wkts: 16, econ: 6.2, bbi: "4/27" },
];

/* ------------------------------------------------------- commerce fixtures */
export type OrderKind = "entry" | "ticket" | "sponsor" | "stall" | "stream";

export type Order = {
  id: string;
  date: string;
  buyer: string;
  kind: OrderKind;
  item: string;
  subtotal: number;
  fee: number;
  status: "paid" | "refunded" | "pending";
};

export const ORDERS: Order[] = [
  { id: "SMD-10482", date: "2026-11-05", buyer: "Rohit Shetty", kind: "ticket", item: "Match 14 · Premium × 2", subtotal: 40000, fee: 2000, status: "paid" },
  { id: "SMD-10481", date: "2026-11-05", buyer: "Anita Rao", kind: "ticket", item: "Match 14 · General × 4", subtotal: 0, fee: 0, status: "paid" },
  { id: "SMD-10478", date: "2026-11-04", buyer: "Fresh Bites Co.", kind: "stall", item: "Stall B4 · Full tournament", subtotal: 1800000, fee: 90000, status: "paid" },
  { id: "SMD-10475", date: "2026-11-03", buyer: "Vertex Motors", kind: "sponsor", item: "Gold sponsorship", subtotal: 12000000, fee: 600000, status: "paid" },
  { id: "SMD-10471", date: "2026-11-02", buyer: "Baroda Blues", kind: "entry", item: "Team entry fee", subtotal: 1200000, fee: 60000, status: "paid" },
  { id: "SMD-10468", date: "2026-11-01", buyer: "Kevin Menon", kind: "ticket", item: "Match 12 · Premium × 1", subtotal: 20000, fee: 1000, status: "refunded" },
  { id: "SMD-10465", date: "2026-10-31", buyer: "Nagpur Nawabs", kind: "entry", item: "Team entry fee", subtotal: 1200000, fee: 60000, status: "paid" },
  { id: "SMD-10461", date: "2026-10-30", buyer: "Chai Point", kind: "stall", item: "Stall A2 · Weekend", subtotal: 900000, fee: 45000, status: "paid" },
];

/** Seven-day series behind the stat-card sparklines. */
export const SPARKS = {
  revenue: [12, 18, 15, 24, 31, 28, 42],
  fees: [1, 2, 1.5, 2.4, 3.1, 2.8, 4.2],
  payout: [11, 16, 13, 21, 28, 25, 38],
  teams: [2, 3, 4, 5, 6, 7, 8],
  tickets: [40, 96, 150, 212, 288, 352, 418],
  sponsors: [1, 2, 3, 4, 5, 6, 7],
  stalls: [0, 1, 1, 2, 3, 4, 5],
  gmv: [180, 240, 300, 360, 410, 440, 482],
  orders: [12, 19, 15, 26, 31, 29, 37],
  live: [0, 1, 2, 1, 2, 3, 2],
  scanned: [30, 78, 120, 165, 210, 255, 286],
} as const;

export const REVENUE_BY_DAY = [
  { day: "Oct 30", entry: 24000, tickets: 3200, sponsors: 0, stalls: 9000 },
  { day: "Oct 31", entry: 12000, tickets: 4100, sponsors: 0, stalls: 0 },
  { day: "Nov 1", entry: 0, tickets: 5600, sponsors: 0, stalls: 0 },
  { day: "Nov 2", entry: 12000, tickets: 7200, sponsors: 0, stalls: 0 },
  { day: "Nov 3", entry: 0, tickets: 8800, sponsors: 120000, stalls: 0 },
  { day: "Nov 4", entry: 0, tickets: 11200, sponsors: 0, stalls: 18000 },
  { day: "Nov 5", entry: 0, tickets: 9400, sponsors: 0, stalls: 0 },
];

export type SponsorTier = {
  id: string;
  tier: "Title" | "Gold" | "Silver";
  price: number;
  slots: number;
  taken: number;
  perks: string[];
};

export const SPONSOR_TIERS: SponsorTier[] = [
  { id: "sp1", tier: "Title", price: 25000000, slots: 1, taken: 1, perks: ["Name in tournament title", "Logo on every match page", "Stream lower-third", "Centre-wicket banner"] },
  { id: "sp2", tier: "Gold", price: 12000000, slots: 4, taken: 3, perks: ["Logo on tournament page", "Logo on stream", "Boundary banner"] },
  { id: "sp3", tier: "Silver", price: 5000000, slots: 8, taken: 5, perks: ["Logo on tournament page", "Mention in match recap"] },
];

export const SPONSORS = [
  { name: "Vertex Motors", tier: "Title" },
  { name: "Kasturi Textiles", tier: "Gold" },
  { name: "Nimbus Cloud", tier: "Gold" },
  { name: "Fresh Bites Co.", tier: "Gold" },
  { name: "Orange City Bank", tier: "Silver" },
  { name: "Tharoor Sports", tier: "Silver" },
  { name: "Chai Point", tier: "Silver" },
];

export type Stall = {
  id: string;
  zone: "A" | "B" | "C";
  size: string;
  price: number;
  status: "available" | "booked" | "held";
  vendor?: string;
};

export const STALLS: Stall[] = [
  { id: "A1", zone: "A", size: "3×3 m", price: 900000, status: "booked", vendor: "Chai Point" },
  { id: "A2", zone: "A", size: "3×3 m", price: 900000, status: "booked", vendor: "Chai Point" },
  { id: "A3", zone: "A", size: "3×3 m", price: 900000, status: "available" },
  { id: "A4", zone: "A", size: "3×3 m", price: 900000, status: "held" },
  { id: "B1", zone: "B", size: "4×4 m", price: 1800000, status: "booked", vendor: "Fresh Bites Co." },
  { id: "B2", zone: "B", size: "4×4 m", price: 1800000, status: "available" },
  { id: "B3", zone: "B", size: "4×4 m", price: 1800000, status: "available" },
  { id: "B4", zone: "B", size: "4×4 m", price: 1800000, status: "booked", vendor: "Fresh Bites Co." },
  { id: "C1", zone: "C", size: "2×2 m", price: 450000, status: "available" },
  { id: "C2", zone: "C", size: "2×2 m", price: 450000, status: "booked", vendor: "Kulfi Corner" },
  { id: "C3", zone: "C", size: "2×2 m", price: 450000, status: "available" },
  { id: "C4", zone: "C", size: "2×2 m", price: 450000, status: "available" },
];

export const TICKET_TYPES = [
  { id: "gen", name: "General", price: 0, capacity: 400, sold: 288 },
  { id: "prem", name: "Premium", price: 20000, capacity: 180, sold: 118 },
  { id: "box", name: "Box seat", price: 60000, capacity: 20, sold: 12 },
];

export const FEE_RULES = [
  { flow: "Team registration", bps: 500, fixed: 0, paidBy: "organizer" as const },
  { flow: "Match ticket", bps: 500, fixed: 500, paidBy: "buyer" as const },
  { flow: "Sponsorship", bps: 500, fixed: 0, paidBy: "organizer" as const },
  { flow: "Food stall", bps: 500, fixed: 0, paidBy: "organizer" as const },
  { flow: "Live streaming", bps: 0, fixed: 0, paidBy: "buyer" as const },
];

export const ORGANIZERS = [
  { id: "o1", name: "Deccan Sports Trust", city: "Mumbai", tournaments: 4, gmv: 48200000, status: "approved", payouts: "connected" },
  { id: "o2", name: "GSC Events", city: "Ahmedabad", tournaments: 2, gmv: 9400000, status: "approved", payouts: "connected" },
  { id: "o3", name: "Kochi Cricket Academy", city: "Kochi", tournaments: 1, gmv: 0, status: "approved", payouts: "pending" },
  { id: "o4", name: "Pink City Sports", city: "Jaipur", tournaments: 3, gmv: 16800000, status: "approved", payouts: "connected" },
  { id: "o5", name: "Athwa Turf Club", city: "Surat", tournaments: 0, gmv: 0, status: "pending", payouts: "not started" },
  { id: "o6", name: "Nashik Box League", city: "Nashik", tournaments: 0, gmv: 0, status: "pending", payouts: "not started" },
];

export const PENDING_TEAMS = [
  { id: "pt1", team: "Thane Titans", captain: "A. Deshmukh", squad: 13, paid: true, submitted: "2 hours ago" },
  { id: "pt2", team: "Bandra Blasters", captain: "F. Shaikh", squad: 11, paid: true, submitted: "5 hours ago" },
  { id: "pt3", team: "Dadar Dragons", captain: "P. Joshi", squad: 9, paid: false, submitted: "yesterday" },
];
