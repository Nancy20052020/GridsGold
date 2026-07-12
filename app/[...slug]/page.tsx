import { notFound } from "next/navigation";
import { AppShell } from "../components/AppShell";
import { ErpScreen } from "../components/ErpScreen";
import { getScreen, screenConfigs } from "../data";

// Paths that now have dedicated, fully-built pages (handled outside this
// catch-all). Excluded here so the catch-all doesn't also try to render them.
const explicitPaths = new Set([
  "/pos",
  "/inventory",
  "/inventory/new",
  "/inventory/item-details",
  "/inventory/movements",
  "/inventory/transfers",
  "/inventory/adjustments",
  "/inventory/cycle-count",
  "/customers",
  "/repairs",
  "/gold-rates",
  "/jewelry",
  "/suppliers",
  "/purchase-orders",
  "/sales/invoices",
  "/finance",
  "/wholesale",
  "/reports",
  "/analytics",
  "/manufacturing",
  "/settings",
]);

export function generateStaticParams() {
  return screenConfigs
    .filter((screen) => screen.path !== "/" && !explicitPaths.has(screen.path))
    .map((screen) => ({ slug: screen.path.replace(/^\//, "").split("/") }));
}

export default async function ScreenRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const screen = getScreen(path);

  if (!screen) {
    notFound();
  }

  return (
    <AppShell searchPlaceholder={`Search ${screen.title.toLowerCase()}...`}>
      <ErpScreen screen={screen} />
    </AppShell>
  );
}
