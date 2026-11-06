/** All page copy and sample data in one place, so the design can be re-skinned
 *  without digging through components. Sample scores are illustrative. */

export const BRAND = {
  name: "Smidig",
  tagline: "Run your cricket tournament like a pro league.",
  sub: "Fixtures, ball-by-ball scoring, live points tables and player stats — one platform from the first toss to the trophy.",
};

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#formats", label: "Formats" },
  { href: "#how", label: "How it works" },
  { href: "#stats", label: "Stats" },
  { href: "#pricing", label: "Pricing" },
];

export const TICKER = [
  { a: "Mumbai Mavericks", b: "Pune Panthers", score: "182/4", ov: "18.2", note: "needs 24 off 10" },
  { a: "Chennai Chargers", b: "Kochi Kings", score: "96/7", ov: "14.0", note: "2nd innings" },
  { a: "Delhi Dynamos", b: "Jaipur Jets", score: "211/6", ov: "20.0", note: "innings break" },
  { a: "Baroda Blues", b: "Surat Strikers", score: "77/2", ov: "9.4", note: "live" },
  { a: "Indore Ice", b: "Nagpur Nawabs", score: "154/9", ov: "20.0", note: "chasing 155" },
];

export const CLUBS = [
  "Mumbai Mavericks",
  "Pune Panthers",
  "Chennai Chargers",
  "Delhi Dynamos",
  "Kochi Kings",
  "Jaipur Jets",
  "Baroda Blues",
  "Nagpur Nawabs",
];

export const FEATURES = [
  {
    title: "Fixtures that build themselves",
    body: "Pick league, knockout, round-robin or group-plus-playoff. Smidig generates the full schedule, spreads venues fairly and reshuffles when rain forces a change.",
    span: "lg:col-span-2",
    art: "fixtures",
  },
  {
    title: "Ball-by-ball scoring",
    body: "Tap the runs. Wides, no-balls, free hits and DRS all handled.",
    span: "",
    art: "scoring",
  },
  {
    title: "Points table, always live",
    body: "NRR recalculates the instant a match ends.",
    span: "",
    art: "table",
  },
  {
    title: "Player auction, built in",
    body: "Run an IPL-style auction with purse limits, bid timers and squad caps. Every franchise sees the same board in real time.",
    span: "lg:col-span-2",
    art: "auction",
  },
  {
    title: "Career stats for every player",
    body: "Runs, wickets, strike rate, economy, catches — tracked from club level up.",
    span: "lg:col-span-2",
    art: "stats",
  },
  {
    title: "Broadcast-ready overlays",
    body: "Drop a live scorebug into OBS or embed it on your site.",
    span: "",
    art: "broadcast",
  },
];

export const FORMATS = [
  {
    tag: "T20",
    title: "Twenty20",
    overs: "20 overs",
    body: "Powerplay rules, strategic timeouts, impact player and super over — all configured out of the box.",
  },
  {
    tag: "ODI",
    title: "One Day",
    overs: "50 overs",
    body: "Two new balls, fielding restrictions by phase and DLS par scores computed live.",
  },
  {
    tag: "TEST",
    title: "Multi-day",
    overs: "4–5 days",
    body: "Innings, declarations, follow-on and session tracking with full first-class scorecards.",
  },
  {
    tag: "T10",
    title: "Tennis-ball & T10",
    overs: "6–10 overs",
    body: "Street, corporate and box-cricket rules. Custom overs, custom powerplays, custom everything.",
  },
  {
    tag: "100",
    title: "The Hundred",
    overs: "100 balls",
    body: "Five-ball and ten-ball sets, bowler changes by set, and the shorter-format points model.",
  },
];

export const STEPS = [
  {
    k: "01",
    title: "Create the tournament",
    body: "Name it, pick the format, set the dates and grounds. Smidig lays out every fixture before you finish your chai.",
  },
  {
    k: "02",
    title: "Add teams and squads",
    body: "Invite captains by link. They fill their own squads, upload kits and confirm availability — you stop chasing WhatsApp groups.",
  },
  {
    k: "03",
    title: "Go live on match day",
    body: "One scorer, one phone. Every parent, sponsor and selector watches the same live scorecard and points table.",
  },
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

export const STATS = [
  { value: 12400, suffix: "+", label: "matches scored" },
  { value: 1850, suffix: "", label: "tournaments run" },
  { value: 96000, suffix: "+", label: "players tracked" },
  { value: 99.9, decimals: 1, suffix: "%", label: "live-scoring uptime" },
];

export const QUOTES = [
  {
    quote:
      "We used to publish the points table on Sunday night. Now it updates before the players have left the ground.",
    name: "Rohit Shetty",
    role: "Secretary, Thane District League",
  },
  {
    quote:
      "The auction module alone paid for the season. Eight franchises, 140 players, zero spreadsheet arguments.",
    name: "Farida Qureshi",
    role: "Tournament Director, Deccan Premier",
  },
  {
    quote:
      "Our scorers are volunteers. They learned the app in one practice match and never asked for the paper book again.",
    name: "Kevin Menon",
    role: "Coach, Kochi Cricket Academy",
  },
];

export const PLANS = [
  {
    name: "Club",
    monthly: 0,
    blurb: "One team, one season.",
    features: ["1 active tournament", "Up to 12 teams", "Live scorecard", "Basic player stats"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "League",
    monthly: 29,
    blurb: "For organisers running a full season.",
    features: [
      "Unlimited tournaments",
      "Player auction",
      "Broadcast overlays",
      "Custom points & NRR rules",
      "Sponsor branding",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Association",
    monthly: 89,
    blurb: "District and state bodies.",
    features: [
      "Everything in League",
      "Multi-league hierarchy",
      "Player registry & eligibility",
      "Umpire & venue rosters",
      "Dedicated support",
    ],
    cta: "Talk to us",
    featured: false,
  },
];

export const FOOTER_COLS: { h: string; items: { label: string; href: string }[] }[] = [
  {
    h: "Platform",
    items: [
      { label: "Browse tournaments", href: "/tournaments" },
      { label: "Live scores", href: "/live" },
      { label: "Host a tournament", href: "/host" },
      { label: "My tickets", href: "/me/tickets" },
    ],
  },
  {
    h: "For organizers",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Fixtures", href: "/dashboard/fixtures" },
      { label: "Sponsors", href: "/dashboard/sponsors" },
      { label: "Payouts", href: "/dashboard/payouts" },
    ],
  },
  {
    h: "Reference",
    items: [
      { label: "Styleguide", href: "/styleguide" },
      { label: "Sign in", href: "/signin" },
      { label: "Create account", href: "/signup" },
      { label: "Choose a role", href: "/onboarding" },
    ],
  },
];
