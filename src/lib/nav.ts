import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Banknote,
  CalendarRange,
  ClipboardList,
  Gauge,
  Handshake,
  LayoutGrid,
  Megaphone,
  QrCode,
  Receipt,
  ScanLine,
  Settings,
  ShieldCheck,
  Store,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: string };
export type NavGroup = { heading: string; items: NavItem[] };

export const PUBLIC_LINKS = [
  { href: "/tournaments", label: "Browse" },
  { href: "/live", label: "Live now" },
  { href: "/host", label: "Host" },
];

export const MOBILE_TABS: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/live", label: "Live", icon: Megaphone },
  { href: "/me/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard", label: "Organize", icon: Gauge },
];

export const DASHBOARD_NAV: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Gauge },
      { href: "/dashboard/tournaments", label: "Tournaments", icon: Trophy },
    ],
  },
  {
    heading: "Match day",
    items: [
      { href: "/dashboard/fixtures", label: "Fixtures", icon: CalendarRange },
      { href: "/dashboard/teams", label: "Teams", icon: Users, badge: "3" },
      { href: "/dashboard/scoring", label: "Scoring", icon: ClipboardList },
      { href: "/dashboard/scan", label: "Gate scanner", icon: ScanLine },
    ],
  },
  {
    heading: "Revenue",
    items: [
      { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
      { href: "/dashboard/sponsors", label: "Sponsors", icon: Handshake },
      { href: "/dashboard/stalls", label: "Food stalls", icon: Store },
      { href: "/dashboard/orders", label: "Orders", icon: Receipt },
      { href: "/dashboard/payouts", label: "Payouts", icon: Banknote },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    heading: "Platform",
    items: [
      { href: "/admin", label: "Overview", icon: BarChart3 },
      { href: "/admin/organizers", label: "Organizers", icon: ShieldCheck, badge: "2" },
    ],
  },
  {
    heading: "Money",
    items: [
      { href: "/admin/fees", label: "Fee settings", icon: Settings },
      { href: "/admin/orders", label: "Orders & refunds", icon: Receipt },
    ],
  },
];

export { QrCode };
