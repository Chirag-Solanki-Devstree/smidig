/** Prototype session. Real build swaps this for Auth.js (task 04). */
export const SESSION_KEY = "smidig.session";

export type Role =
  | "admin"
  | "organizer"
  | "captain"
  | "spectator"
  | "sponsor"
  | "vendor";

export type Session = { name: string; email: string; role: Role };

export const ROLES: {
  id: Role;
  label: string;
  blurb: string;
  home: string;
}[] = [
  { id: "organizer", label: "Tournament organizer", blurb: "Create tournaments, take entries, tickets, sponsors and stalls.", home: "/dashboard" },
  { id: "captain", label: "Team captain", blurb: "Register a squad and pay the entry fee.", home: "/me/tickets" },
  { id: "spectator", label: "Spectator", blurb: "Buy tickets and follow matches live.", home: "/live" },
  { id: "sponsor", label: "Sponsor", blurb: "Buy a logo package on a tournament.", home: "/tournaments" },
  { id: "vendor", label: "Food vendor", blurb: "Book a stall at a venue.", home: "/tournaments" },
  { id: "admin", label: "Platform admin", blurb: "Run the marketplace, approve organizers, set fees.", home: "/admin" },
];

export const roleById = (r: Role) => ROLES.find((x) => x.id === r)!;

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    return s && s.email && s.role ? s : null;
  } catch {
    return null;
  }
}
