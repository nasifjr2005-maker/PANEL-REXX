import { getSiteContent } from "@/lib/content-store";
import { PortfolioClient } from "@/components/portfolio-client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();
  return <PortfolioClient content={content} />;
}
