import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import { defaultContent } from "@/lib/default-content";
import type { Project, SiteContent } from "@/types/content";

const STORE_NAME = "portfolio-admin";
const CONTENT_KEY = "site-content";
const LOCAL_DATA_PATH = path.join(process.cwd(), ".data", "site-content.json");

export type ContentStorageDetails = {
  provider: "netlify-blobs" | "local-file";
  label: string;
  persistent: boolean;
  path?: string;
};

export class ContentStorageError extends Error {
  storage: ContentStorageDetails;

  constructor(action: "read" | "write", storage: ContentStorageDetails, error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown storage error";
    super(`Content storage ${action} failed on ${storage.label}: ${details}`);
    this.name = "ContentStorageError";
    this.storage = storage;
  }
}

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

function getStorageDetails(): ContentStorageDetails {
  if (canUseNetlifyBlobs()) {
    return {
      provider: "netlify-blobs",
      label: "Netlify Blobs",
      persistent: true
    };
  }

  return {
    provider: "local-file",
    label: "Local JSON file",
    persistent: true,
    path: LOCAL_DATA_PATH
  };
}

async function readStoredContent(storage: ContentStorageDetails) {
  if (storage.provider === "netlify-blobs") {
    const store = getStore(STORE_NAME);
    return (await store.get(CONTENT_KEY, { type: "json" })) as Partial<SiteContent> | null;
  }

  if (!existsSync(LOCAL_DATA_PATH)) {
    return null;
  }

  const raw = await readFile(LOCAL_DATA_PATH, "utf8");
  return JSON.parse(raw) as Partial<SiteContent>;
}

export async function getSiteContentWithStorage() {
  const storage = getStorageDetails();

  try {
    const stored = await readStoredContent(storage);
    return {
      content: mergeContent(stored),
      storage,
      warning: null as string | null
    };
  } catch (error) {
    const storageError = new ContentStorageError("read", storage, error);

    return {
      content: defaultContent,
      storage,
      warning: storageError.message
    };
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const result = await getSiteContentWithStorage();
  return result.content;
}

export async function saveSiteContentWithStorage(content: SiteContent) {
  const nextContent = mergeContent(content);
  const storage = getStorageDetails();

  try {
    if (storage.provider === "netlify-blobs") {
      const store = getStore(STORE_NAME);
      await store.setJSON(CONTENT_KEY, nextContent);
      return { content: nextContent, storage };
    }

    await mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
    await writeFile(LOCAL_DATA_PATH, JSON.stringify(nextContent, null, 2), "utf8");
    return { content: nextContent, storage };
  } catch (error) {
    throw new ContentStorageError("write", storage, error);
  }
}

export async function saveSiteContent(content: SiteContent) {
  const result = await saveSiteContentWithStorage(content);
  return result.content;
}

export async function resetSiteContentWithStorage() {
  return saveSiteContentWithStorage(defaultContent);
}

export async function resetSiteContent() {
  const result = await resetSiteContentWithStorage();
  return result.content;
}
