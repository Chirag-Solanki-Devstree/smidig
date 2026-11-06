/** Ready-made banners and logos so an organizer can publish without having
 *  artwork to hand. Each can be replaced with an upload. */

export type BannerPreset = { id: string; label: string; className: string };

export const BANNER_PRESETS: BannerPreset[] = [
  { id: "turf", label: "Night turf", className: "from-[#1b2a12] via-[#243a16] to-[#0b1108]" },
  { id: "amber", label: "Floodlight", className: "from-[#2a1f12] via-[#3a2a16] to-[#110b08]" },
  { id: "ocean", label: "Coastal", className: "from-[#101f2a] via-[#16303a] to-[#080f11]" },
  { id: "dusk", label: "Dusk", className: "from-[#2a1225] via-[#3a1630] to-[#110810]" },
  { id: "clay", label: "Clay", className: "from-[#2a2412] via-[#3a3316] to-[#111008]" },
  { id: "steel", label: "Steel", className: "from-[#1a1f26] via-[#252c36] to-[#0b0e12]" },
];

export type LogoPreset = { id: string; label: string; colour: string; glyph: string };

export const LOGO_PRESETS: LogoPreset[] = [
  { id: "bat", label: "Bat", colour: "#c8ff2e", glyph: "M7 17 17 7M5 19l2-2" },
  { id: "ball", label: "Ball", colour: "#ff6a4d", glyph: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M8 4.5c3 4 3 11 0 15M16 4.5c-3 4-3 11 0 15" },
  { id: "stump", label: "Stumps", colour: "#4aa3ff", glyph: "M8 5v14M12 5v14M16 5v14M6 5h12" },
  { id: "cup", label: "Trophy", colour: "#ff9f3d", glyph: "M7 4h10v5a5 5 0 0 1-10 0zM9 19h6M12 14v5" },
  { id: "shield", label: "Shield", colour: "#b06bff", glyph: "M12 3l7 3v6c0 4-3 7-7 9c-4-2-7-5-7-9V6z" },
  { id: "flag", label: "Flag", colour: "#3ddc84", glyph: "M6 4v16M6 5h11l-2 3l2 3H6" },
];

export const bannerById = (id: string) =>
  BANNER_PRESETS.find((b) => b.id === id) ?? BANNER_PRESETS[0];
export const logoById = (id: string) =>
  LOGO_PRESETS.find((l) => l.id === id) ?? LOGO_PRESETS[0];
