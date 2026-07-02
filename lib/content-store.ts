import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import { defaultContent } from "@/lib/default-content";
import type { Project, SiteContent } from "@/types/content";

const STORE_NAME = "portfolio-admin";
const CONTENT_KEY = "site-content";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "site-content.json");

function mergeProjects(projects: Project[] | undefined): Project[] {
  if (!projects) {
    return defaultContent.projects;
  }

  return projects.map((project, index) => ({
    ...(defaultContent.projects[index] ?? {}),
    ...project,
    stack: project.stack ?? defaultContent.projects[index]?.stack ?? []
  }));
}

function mergeContent(content: Partial<SiteContent> | null | undefined): SiteContent {
  return {
    ...defaultContent,
    ...content,
    identity: {
      ...defaultContent.identity,
      ...(content?.identity ?? {})
    },
    profileFacts: content?.profileFacts ?? defaultContent.profileFacts,
    roles: content?.roles ?? defaultContent.roles,
    scannerModules: content?.scannerModules ?? defaultContent.scannerModules,
    skills: content?.skills ?? defaultContent.skills,
    founderStats: content?.founderStats ?? defaultContent.founderStats,
    founderHighlights: content?.founderHighlights ?? defaultContent.founderHighlights,
    interests: content?.interests ?? defaultContent.interests,
    projects: mergeProjects(content?.projects),
    timeline: content?.timeline ?? defaultContent.timeline,
    socials: content?.socials ?? defaultContent.socials
  };
}

function canUseNetlifyBlobs() {
  return Boolean(process.env.NETLIFY || (process.env.NETLIFY_BLOBS_CONTEXT && process.env.NETLIFY_SITE_ID));
}

export async function getSiteContent(): Promise<SiteContent> {
  if (canUseNetlifyBlobs()) {
    try {
      const store = getStore(STORE_NAME);
      const stored = (await store.get(CONTENT_KEY, { type: "json" })) as Partial<SiteContent> | null;
      return mergeContent(stored);
    } catch {
      return defaultContent;
    }
  }

  if (!existsSync(LOCAL_DATA_PATH)) {
    return defaultContent;
  }

  try {
    const raw = await readFile(LOCAL_DATA_PATH, "utf8");
    return mergeContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  const nextContent = mergeContent(content);

  if (canUseNetlifyBlobs()) {
    const store = getStore(STORE_NAME);
    await store.setJSON(CONTENT_KEY, nextContent);
    return nextContent;
  }

  await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await writeFile(LOCAL_DATA_PATH, JSON.stringify(nextContent, null, 2), "utf8");
  return nextContent;
}

export async function resetSiteContent() {
  return saveSiteContent(defaultContent);
}
