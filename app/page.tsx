import { connection } from "next/server";
import { getSiteContent } from "@/lib/content-store";
import { PortfolioClient } from "@/components/portfolio-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  await connection();
  const content = await getSiteContent();
  return <PortfolioClient content={content} />;
}
