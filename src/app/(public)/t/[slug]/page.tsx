import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TournamentView } from "@/components/site/tournament-view";
import { TOURNAMENTS, tournamentBySlug } from "@/lib/data";

export function generateStaticParams() {
  return TOURNAMENTS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/t/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = tournamentBySlug(slug);
  return t ? { title: t.name, description: t.blurb } : { title: "Tournament" };
}

export default async function TournamentPage({ params }: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  const t = tournamentBySlug(slug);
  if (!t) notFound();
  return <TournamentView slug={slug} />;
}
