import type { LucideIcon } from "lucide-react";
import {
  Bike,
  Dumbbell,
  Footprints,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

/**
 * Sport registry.
 *
 * Phase 1 ships cricket only, but every tournament carries a `sport` key and
 * every screen reads its labels from here. Adding hockey or a marathon later
 * is a new entry plus a scoring module — no changes to routing, filters,
 * cards, dashboards or admin.
 */
export type SportId =
  | "cricket"
  | "hockey"
  | "innebandy"
  | "tennis"
  | "badminton"
  | "racing"
  | "marathon";

export type ScoringModel = "innings" | "goals" | "sets" | "timed";

export type Sport = {
  id: SportId;
  name: string;
  icon: LucideIcon;
  /** Shapes fixtures, result display and the scoring console. */
  scoring: ScoringModel;
  /** Tournament formats this sport offers in the setup wizard. */
  formats: { id: string; label: string }[];
  /** Sport-specific match-length options. */
  matchTypes: { id: string; label: string }[];
  /** What one competing unit is called. */
  entrant: { one: string; many: string };
  /** Live enough to build in phase 1? */
  status: "live" | "planned";
};

export const SPORTS: Sport[] = [
  {
    id: "cricket",
    name: "Cricket",
    icon: Trophy,
    scoring: "innings",
    formats: [
      { id: "league", label: "League (round robin)" },
      { id: "knockout", label: "Knockout" },
      { id: "groups", label: "Groups + Knockout" },
    ],
    matchTypes: [
      { id: "t10", label: "T10" },
      { id: "t20", label: "T20" },
      { id: "odi", label: "ODI (50)" },
      { id: "custom", label: "Custom overs" },
    ],
    entrant: { one: "Team", many: "Teams" },
    status: "live",
  },
  {
    id: "hockey",
    name: "Hockey",
    icon: Zap,
    scoring: "goals",
    formats: [
      { id: "league", label: "League" },
      { id: "knockout", label: "Knockout" },
    ],
    matchTypes: [{ id: "3x20", label: "3 × 20 min" }],
    entrant: { one: "Team", many: "Teams" },
    status: "planned",
  },
  {
    id: "innebandy",
    name: "Innebandy",
    icon: Zap,
    scoring: "goals",
    formats: [{ id: "league", label: "League" }],
    matchTypes: [{ id: "3x20", label: "3 × 20 min" }],
    entrant: { one: "Team", many: "Teams" },
    status: "planned",
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: Target,
    scoring: "sets",
    formats: [{ id: "knockout", label: "Singles draw" }],
    matchTypes: [{ id: "bo3", label: "Best of 3" }],
    entrant: { one: "Player", many: "Players" },
    status: "planned",
  },
  {
    id: "badminton",
    name: "Badminton",
    icon: Target,
    scoring: "sets",
    formats: [{ id: "knockout", label: "Singles draw" }],
    matchTypes: [{ id: "bo3", label: "Best of 3" }],
    entrant: { one: "Player", many: "Players" },
    status: "planned",
  },
  {
    id: "racing",
    name: "Car racing",
    icon: Bike,
    scoring: "timed",
    formats: [{ id: "heats", label: "Heats + Final" }],
    matchTypes: [{ id: "laps", label: "Lap race" }],
    entrant: { one: "Driver", many: "Drivers" },
    status: "planned",
  },
  {
    id: "marathon",
    name: "Marathon",
    icon: Footprints,
    scoring: "timed",
    formats: [{ id: "timed", label: "Timed race" }],
    matchTypes: [
      { id: "10k", label: "10 km" },
      { id: "half", label: "Half" },
      { id: "full", label: "Full" },
    ],
    entrant: { one: "Athlete", many: "Athletes" },
    status: "planned",
  },
];

export const SPORT_BY_ID = Object.fromEntries(SPORTS.map((s) => [s.id, s])) as Record<
  SportId,
  Sport
>;

export const LIVE_SPORTS = SPORTS.filter((s) => s.status === "live");

export { Dumbbell };
