"use client";

import dynamic from "next/dynamic";
import { CinematicPortfolio } from "@/components/cinematic-portfolio";
import type { SiteContent } from "@/types/content";

const Scene = dynamic(() => import("@/components/three/hero-scene"), {
  ssr: false,
  loading: () => <div className="scene-fallback" aria-hidden="true" />
});

export function PortfolioClient({ content }: { content: SiteContent }) {
  return <CinematicPortfolio Scene={Scene} initialContent={content} />;
}
