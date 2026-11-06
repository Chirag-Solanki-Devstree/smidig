import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModeProvider } from "@/components/mode-provider";
import { SessionProvider } from "@/components/session-provider";
import { ToastProvider } from "@/components/kit/toast";
import { MODE_KEY } from "@/lib/mode";
import { MotionRoot } from "@/components/motion-root";
import { Backdrop } from "@/components/fx/backdrop";
import { CursorGlow } from "@/components/fx/cursor-glow";
import { ScrollProgress } from "@/components/fx/progress-bar";
import { SmoothScroll } from "@/components/fx/smooth-scroll";

const sans = Geist({ variable: "--font-sans-ui", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono-ui", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Smidig — the tournament marketplace",
    template: "%s · Smidig",
  },
  description:
    "Create and run a tournament for any sport. Teams register, fans buy tickets, sponsors and food vendors book — all in one place.",
  // Client preview of a prototype: keep it out of search results. Remove this
  // (and public/robots.txt) when the real product launches.
  robots: { index: false, follow: false, nocache: true },
};

const noFlash = `(function(){var d=document.documentElement;d.classList.add("js");try{var m=localStorage.getItem("${MODE_KEY}");d.setAttribute("data-mode",m==="light"?"light":"dark");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-mode="dark"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body className="min-h-screen">
        <MotionRoot>
          <SessionProvider>
            <ModeProvider>
              <ToastProvider>
            <SmoothScroll />
            <Backdrop />
            <CursorGlow />
            <ScrollProgress />
            {children}
              </ToastProvider>
            </ModeProvider>
          </SessionProvider>
        </MotionRoot>
      </body>
    </html>
  );
}
