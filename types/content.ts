export type Identity = {
  name: string;
  onlineName: string;
  country: string;
  city: string;
  education: string;
  institution: string;
  department: string;
  founder: string;
  guild: string;
  email: string;
  whatsapp: string;
  avatarUrl: string;
};

export type LabeledValue = {
  label: string;
  value: string;
};

export type ScannerModule = {
  title: string;
  value: string;
  level: number;
  text: string;
};

export type Skill = {
  name: string;
  detail: string;
};

export type FounderStat = {
  label: string;
  value: number;
  suffix: string;
};

export type Project = {
  title: string;
  status: string;
  description: string;
  stack: string[];
  previewVideoUrl?: string;
  previewPosterUrl?: string;
  featured?: boolean;
};

export type TimelineItem = {
  title: string;
  text: string;
};

export type SocialLink = {
  name: string;
  username: string;
  url: string;
};

export type SiteContent = {
  identity: Identity;
  roles: string[];
  profileFacts: LabeledValue[];
  aboutCopy: string;
  scannerModules: ScannerModule[];
  skills: Skill[];
  founderStats: FounderStat[];
  founderHighlights: string[];
  interests: string[];
  projects: Project[];
  timeline: TimelineItem[];
  socials: SocialLink[];
};
