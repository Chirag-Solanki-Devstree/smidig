import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MatchView } from "@/components/site/match-view";
import { MATCHES, matchByNo } from "@/lib/data";

export function generateStaticParams() {
  return MATCHES.map((m) => ({ slug: m.tournamentSlug, no: String(m.no) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/t/[slug]/m/[no]">): Promise<Metadata> {
  const { slug, no } = await params;
  const m = matchByNo(slug, Number(no));
  return { title: m ? `${m.teamA} v ${m.teamB} · Match ${m.no}` : "Match" };
}

export default async function MatchPage({ params }: PageProps<"/t/[slug]/m/[no]">) {
  const { slug, no } = await params;
  const m = matchByNo(slug, Number(no));
  if (!m) notFound();
  return <MatchView slug={slug} no={Number(no)} />;
}
