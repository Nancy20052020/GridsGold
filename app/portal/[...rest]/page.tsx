import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";
import { CustomerShell } from "../../components/CustomerShell";

const titles: Record<string, { title: string; copy: string }> = {};

export function generateStaticParams() {
  return Object.keys(titles).map((key) => ({ rest: [key] }));
}

export default async function PortalPlaceholder({
  params,
}: {
  params: Promise<{ rest: string[] }>;
}) {
  const { rest } = await params;
  const key = rest?.[0] ?? "";
  const info = titles[key] ?? {
    title: "Coming Soon",
    copy: "This screen is being crafted as we build Grids Gold one screen at a time.",
  };

  return (
    <CustomerShell>
      <section className="portal-placeholder">
        <span className="portal-placeholder-icon">
          <Hammer size={26} />
        </span>
        <h1>{info.title}</h1>
        <p>{info.copy}</p>
        <span className="portal-placeholder-tag">Coming next</span>
        <Link className="portal-btn ghost" href="/portal">
          <ArrowLeft size={17} /> Back to Shop
        </Link>
      </section>
    </CustomerShell>
  );
}
