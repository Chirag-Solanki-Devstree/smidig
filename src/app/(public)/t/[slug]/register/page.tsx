import { notFound } from "next/navigation";
import { RegisterWizard } from "@/components/site/register-wizard";
import { TOURNAMENTS, tournamentBySlug } from "@/lib/data";

export function generateStaticParams() {
  return TOURNAMENTS.map((t) => ({ slug: t.slug }));
}

export const metadata = { title: "Register a team" };

export default async function RegisterPage({ params }: PageProps<"/t/[slug]/register">) {
  const { slug } = await params;
  if (!tournamentBySlug(slug)) notFound();
  return <RegisterWizard slug={slug} />;
}
