/** Plain module (no "use client") so the server layout can inline this value
 *  into the no-flash script. Importing it from a client module would hand the
 *  server a client-reference stub instead of the string. */
export const MODE_KEY = "smidig.mode";

export type Mode = "dark" | "light";
