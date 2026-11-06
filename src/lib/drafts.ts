"use client";

import type { SportId } from "@/lib/sports";

/**
 * Tournaments created in the prototype, kept in localStorage so a newly
 * published one shows up in the list until the browser data is cleared.
 * The real build writes these through a server action to Postgres.
 */
export const DRAFTS_KEY = "smidig.tournaments";
export const DRAFTS_EVENT = "smidig:tournaments-changed";

export type DraftTournament = {
  id: string;
  slug: string;
  name: string;
  sport: SportId;
  city: string;
  venue: string;
  start: string;
  end: string;
  format: string;
  matchType: string;
  ballType: string;
  entryFee: number;
  maxTeams: number;
  bannerId: string;
  logoId: string;
  createdAt: string;
};

export function readDrafts(): DraftTournament[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addDraft(t: DraftTournament) {
  try {
    const next = [t, ...readDrafts()];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(DRAFTS_EVENT));
  } catch {
    /* storage can be unavailable; the prototype just forgets the draft */
  }
}

export function clearDrafts() {
  try {
    localStorage.removeItem(DRAFTS_KEY);
    window.dispatchEvent(new CustomEvent(DRAFTS_EVENT));
  } catch {}
}

export function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "tournament"
  );
}
