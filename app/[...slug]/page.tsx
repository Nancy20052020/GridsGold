import { notFound } from "next/navigation";
import { AppShell } from "../components/AppShell";
import { ErpScreen } from "../components/ErpScreen";
import { getScreen, screenConfigs } from "../data";

export function generateStaticParams() {
  return screenConfigs
    .filter((screen) => screen.path !== "/")
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
