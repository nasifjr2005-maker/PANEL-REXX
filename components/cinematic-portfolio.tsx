"use client";

import type { ComponentType, FormEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import { useInView } from "react-intersection-observer";
import {
  FiArrowDown,
  FiCpu,
  FiMail,
  FiMenu,
  FiSend,
  FiTerminal,
  FiX
} from "react-icons/fi";
import {
  SiCss,
  SiFacebook,
  SiGithub,
  SiHtml5,
  SiInstagram,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiSpotify,
  SiTailwindcss,
  SiTelegram,
  SiThreedotjs,
  SiTiktok,
  SiTypescript,
  SiWhatsapp,
  SiYoutube
} from "react-icons/si";
import { FaDiscord, FaGamepad, FaHeadphones, FaLightbulb, FaStore } from "react-icons/fa6";
import {
  defaultContent
} from "@/data/site-config";
import type { SiteContent } from "@/types/content";

type SceneComponent = ComponentType;

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Scanner", id: "scanner" },
  { label: "Skills", id: "skills" },
  { label: "Founder", id: "founder" },
  { label: "Projects", id: "projects" },
  { label: "Timeline", id: "timeline" },
  { label: "Social", id: "social" },
  { label: "Contact", id: "contact" }
];

const bootLines = [
  "Initializing System...",
  "Loading Interface...",
  "Scanning Profile...",
  "Loading Assets...",
  "Welcome, Visitor."
];

const iconBySkill: Record<string, ComponentType<{ className?: string }>> = {
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  React: SiReact,
  "Next.js": SiNextdotjs,
  "Tailwind CSS": SiTailwindcss,
  "Node.js": SiNodedotjs,
  Git: FiTerminal,
  GitHub: SiGithub,
  HTML: SiHtml5,
  CSS: SiCss,
  "Three.js": SiThreedotjs,
  "UI Design": FiCpu,
  "Problem Solving": FaLightbulb,
  "Learning AI": FiCpu,
  "Programming Logic": FiTerminal
};

const iconBySocial: Record<string, ComponentType<{ className?: string }>> = {
  GitHub: SiGithub,
  Facebook: SiFacebook,
  Instagram: SiInstagram,
  Discord: FaDiscord,
  YouTube: SiYoutube,
  TikTok: SiTiktok,
  Spotify: SiSpotify,
  Telegram: SiTelegram,
  WhatsApp: SiWhatsapp,
  Email: FiMail
};

const getSocialIcon = (name: string) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("store")) {
    return FaStore;
  }

  if (lowerName.includes("guild")) {
    return FaDiscord;
  }

  return iconBySocial[name] ?? FiMail;
};

const iconByInterest: Record<string, ComponentType<{ className?: string }>> = {
  Programming: FiTerminal,
  Gaming: FaGamepad,
  "Listening to Music": FaHeadphones,
  "Computer Science": FiCpu,
  Technology: SiReact,
  Learning: FaLightbulb,
  "Building Projects": SiNextdotjs
};

export function CinematicPortfolio({ Scene, initialContent = defaultContent }: { Scene: SceneComponent; initialContent?: SiteContent }) {
  const reduceMotion = useReducedMotion();
  const [content, setContent] = useState(initialContent);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bootRef = useRef<HTMLDivElement | null>(null);
  const navLockUntilRef = useRef(0);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/content", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload?.content) {
          setContent(payload.content);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setLoaded(true);
      return;
    }

    const fallbackId = window.setTimeout(() => setLoaded(true), 5200);
    const bootElement = bootRef.current;
    if (!bootElement) {
      window.clearTimeout(fallbackId);
      setLoaded(true);
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          window.clearTimeout(fallbackId);
          setLoaded(true);
        }
      });

      tl.from(".boot-terminal", { opacity: 0, y: 22, scale: 0.96, duration: 0.55 })
        .from(".boot-line", { opacity: 0, x: -18, stagger: 0.18, duration: 0.42 })
        .to(".boot-terminal", { opacity: 0, y: -16, scale: 1.03, duration: 0.45, delay: 0.25 })
        .to(bootElement, { opacity: 0, duration: 0.42 }, "-=0.16");
    }, bootElement);

    return () => {
      window.clearTimeout(fallbackId);
      ctx.revert();
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined" || reduceMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.9
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduceMotion]);

  useEffect(() => {
    let rafId = 0;

    const onMove = (event: PointerEvent) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    let rafId = 0;

    const updateActiveSection = () => {
      if (Date.now() < navLockUntilRef.current) {
        return;
      }

      const viewportAnchor = window.innerHeight * 0.34;
      const current = navItems.reduce(
        (closest, item) => {
          const element = document.getElementById(item.id);
          if (!element) {
            return closest;
          }

          const distance = Math.abs(element.getBoundingClientRect().top - viewportAnchor);
          return distance < closest.distance ? { id: item.id, distance } : closest;
        },
        { id: "home", distance: Number.POSITIVE_INFINITY }
      );

      setActiveSection(current.id);
    };

    const onScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    navLockUntilRef.current = Date.now() + 1500;
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="cinematic-root">
      <motion.div className="progress-bar" style={{ scaleX }} />
      <div className="fixed-scene">
        <Scene />
      </div>
      <Atmosphere />
      <Navigation content={content} activeSection={activeSection} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} scrollTo={scrollTo} />
      <main style={{ opacity: loaded || reduceMotion ? 1 : 0 }}>
        <Hero content={content} scrollTo={scrollTo} />
        <About content={content} />
        <DigitalScanner content={content} />
        <Skills content={content} />
        <Founder content={content} />
        <Interests content={content} />
        <Projects content={content} />
        <Timeline content={content} />
        <SocialHub content={content} />
        <Contact content={content} />
      </main>
      {!loaded && !reduceMotion ? <BootScreen refEl={bootRef} /> : null}
    </div>
  );
}

function Atmosphere() {
  return (
    <>
      <div className="atmosphere" aria-hidden="true">
        <div className="aurora" />
        <div className="nebula-cloud one" />
        <div className="nebula-cloud two" />
        <div className="nebula-cloud three" />
        <div className="digital-rain" />
        <div className="beam one" />
        <div className="beam two" />
        <div className="holo-grid" />
      </div>
      <div className="cursor-light" aria-hidden="true" />
    </>
  );
}

function BootScreen({ refEl }: { refEl: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={refEl} className="boot-screen">
      <div className="boot-terminal animated-border">
        {bootLines.map((line) => (
          <div className="boot-line" key={line}>
            <span className="boot-dot" />
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Navigation({
  content,
  activeSection,
  mobileOpen,
  setMobileOpen,
  scrollTo
}: {
  content: SiteContent;
  activeSection: string;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  scrollTo: (id: string) => void;
}) {
  return (
    <header className="nav-shell">
      <button className="brand-mark" type="button" onClick={() => scrollTo("home")} aria-label="Go to hero section">
        <span className="brand-icon avatar-brand-icon" style={{ backgroundImage: `url(${content.identity.avatarUrl})` }} aria-hidden="true" />
        <span>Panel Rexx</span>
      </button>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            className={`nav-link ${activeSection === item.id ? "active" : ""}`}
            key={item.id}
            type="button"
            onClick={() => scrollTo(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="mobile-menu-button" type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>
      {mobileOpen ? (
        <motion.nav
          className="glass-panel"
          aria-label="Mobile navigation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(100% + 0.55rem)",
            padding: "0.75rem",
            display: "grid",
            gap: "0.2rem"
          }}
        >
          {navItems.map((item) => (
            <button
              className={`nav-link ${activeSection === item.id ? "active" : ""}`}
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              style={{ textAlign: "left" }}
            >
              {item.label}
            </button>
          ))}
        </motion.nav>
      ) : null}
    </header>
  );
}

function Hero({ content, scrollTo }: { content: SiteContent; scrollTo: (id: string) => void }) {
  const typed = useTypingWords(content.roles);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.22], [0, -52]);
  const opacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.68]);

  return (
    <section id="home" className="hero-shell">
      <motion.div className="hero-content" style={{ y, opacity }}>
        <div>
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.1 }}
          >
            <span />
            Futuristic identity interface
          </motion.div>
          <motion.h1
            className="hero-title glitch"
            data-text="Hi, I'm Nasif"
            aria-label="Hi, I'm Nasif"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 2.28 }}
          >
            <span aria-hidden="true">
              Hi,
              <br />
              I&apos;m <span className="text-gradient">Nasif</span>
            </span>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 2.5 }}
          >
            Also known as <strong>{content.identity.onlineName}</strong>, a {content.identity.department} diploma student from{" "}
            {content.identity.city}, {content.identity.country}, founder of {content.identity.guild} and {content.identity.founder}.
          </motion.p>
          <motion.div
            className="typing-line"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 2.64 }}
            aria-label={`Currently highlighted role: ${typed}`}
          >
            <span>I am a</span>
            <span className="typing-word">{typed}</span>
            <span className="typing-caret" />
          </motion.div>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 2.8 }}
          >
            <button className="cyber-button magnetic" type="button" onClick={() => scrollTo("projects")}>
              <FiCpu />
              Enter Universe
            </button>
            <button className="cyber-button magnetic" type="button" onClick={() => scrollTo("contact")}>
              <FiSend />
              Open Contact
            </button>
          </motion.div>
        </div>
        <motion.aside
          className="hero-console glass-panel animated-border"
          initial={{ opacity: 0, rotateY: -16, y: 34 }}
          animate={{ opacity: 1, rotateY: 0, y: 0 }}
          transition={{ duration: 0.9, delay: 2.42 }}
        >
          <div className="console-top">
            <div className="console-title">Profile Core</div>
            <div className="console-status">Online</div>
          </div>
          <div className="profile-orbit">
            <span className="orbit-ring one" />
            <span className="orbit-ring two" />
            <span className="orbit-ring three" />
            <div className="avatar-core" style={{ backgroundImage: `url(${content.identity.avatarUrl})` }}>
              <span>{getInitials(content.identity.name, content.identity.onlineName)}</span>
            </div>
          </div>
        </motion.aside>
      </motion.div>
      <button className="scroll-cue" type="button" onClick={() => scrollTo("about")} aria-label="Scroll to about section">
        <span />
        Scroll
        <FiArrowDown />
      </button>
    </section>
  );
}

function About({ content }: { content: SiteContent }) {
  return (
    <RevealSection id="about" kicker="About Signal" title="Holographic Profile Cards" copy={content.aboutCopy}>
      <dl className="profile-grid">
        {content.profileFacts.map((fact, index) => (
          <TiltCard className="profile-card glass-panel magnetic" key={fact.label} delay={index * 0.035}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </TiltCard>
        ))}
      </dl>
    </RevealSection>
  );
}

function DigitalScanner({ content }: { content: SiteContent }) {
  return (
    <RevealSection
      id="scanner"
      kicker="AI Profile Scanner"
      title="Identity, Skills, Education, Experience"
      copy="A cinematic scan of the signals shaping Nasif's digital universe."
    >
      <div className="scanner-layout">
        <motion.div className="scanner-core glass-panel animated-border" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.35 }}>
          <div className="scanner-target">
            <span className="scanner-sweep" />
          <div className="scanner-face" style={{ backgroundImage: `url(${content.identity.avatarUrl})` }}>
            <span>{getInitials(content.identity.name, content.identity.onlineName)}</span>
          </div>
          </div>
        </motion.div>
        <div className="analysis-list">
          {content.scannerModules.map((module, index) => (
            <motion.article
              className="analysis-row glass-panel magnetic"
              key={module.title}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.07 }}
            >
              <div className="analysis-heading">
                <span>{module.title}</span>
                <span>{module.value}</span>
              </div>
              <p>{module.text}</p>
              <div className="meter" aria-label={`${module.title} ${module.level}%`}>
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: `${module.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.15 + index * 0.06, ease: "easeOut" }}
                />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

function Skills({ content }: { content: SiteContent }) {
  return (
    <RevealSection
      id="skills"
      kicker="Skill Matrix"
      title="Floating Holographic Cards"
      copy="Each card reacts like a piece of a live operating system, highlighting the tools and thinking Nasif is building with."
    >
      <div className="skills-grid">
        {content.skills.map((skill, index) => {
          const Icon = iconBySkill[skill.name] ?? FiCpu;
          return (
            <TiltCard className="skill-card glass-panel magnetic" key={skill.name} delay={index * 0.025}>
              <div className="skill-icon">
                <Icon />
              </div>
              <h3>{skill.name}</h3>
              <p>{skill.detail}</p>
            </TiltCard>
          );
        })}
      </div>
    </RevealSection>
  );
}

function Founder({ content }: { content: SiteContent }) {
  const storeUrl = getSocialUrl(content, "PANEL 50 Store") ?? "https://panel50store.netlify.app/";
  const guildUrl = getSocialUrl(content, "PANEL 50 Guild") ?? "https://discord.gg/8FNUaEsvzB";

  return (
    <RevealSection
      id="founder"
      kicker="Founder Command"
      title="Founder of PANEL 50 OFFICIAL STORE"
      copy="A premium command dashboard for the business and gaming-inspired identity Nasif is shaping."
    >
      <div className="founder-grid">
        <div className="dashboard-panel glass-panel animated-border">
          <div className="console-top">
            <div className="console-title">Company Dashboard</div>
            <div className="console-status">Synced</div>
          </div>
          <div className="stat-grid">
            {content.founderStats.map((stat, index) => (
              <CounterStat key={stat.label} {...stat} delay={index * 0.1} />
            ))}
          </div>
          <div className="analysis-list" style={{ marginTop: "1rem" }}>
            {content.founderHighlights.map((highlight) => (
              <div className="analysis-row glass-panel" key={highlight}>
                <div className="analysis-heading">
                  <span>Mission</span>
                  <span>Active</span>
                </div>
                <p>{highlight}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="circuit-board glass-panel">
          <div className="circuit-lines">
            <a className="circuit-chip main panel50-logo-chip" href={storeUrl} target="_blank" rel="noreferrer" aria-label="Open PANEL 50 Official Store">
              <img src="/assets/panel50-logo.png" alt="PANEL 50" />
            </a>
            <a className="circuit-chip mini-a" href={storeUrl} target="_blank" rel="noreferrer">
              Store
            </a>
            <a className="circuit-chip mini-b" href={guildUrl} target="_blank" rel="noreferrer">
              Guild
            </a>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}

function Interests({ content }: { content: SiteContent }) {
  return (
    <RevealSection
      id="interests"
      kicker="Personal Frequencies"
      title="The Things That Keep the System Alive"
      copy="Programming, play, music, and learning all feed the same creative engine."
    >
      <div className="interests-grid">
        {content.interests.map((interest, index) => {
          const Icon = iconByInterest[interest] ?? FaLightbulb;
          return (
            <TiltCard className="interest-card glass-panel magnetic" key={interest} delay={index * 0.04}>
              <h3>{interest}</h3>
              <Icon />
            </TiltCard>
          );
        })}
      </div>
    </RevealSection>
  );
}

function Projects({ content }: { content: SiteContent }) {
  const [featured, ...future] = content.projects;

  return (
    <RevealSection
      id="projects"
      kicker="Project Hangar"
      title="Premium Project Showcases"
      copy="Built to present real work and future ideas with the polish of a cinematic product reveal."
    >
      <div className="project-grid">
        {featured ? <TiltCard className="project-card glass-panel animated-border magnetic">
          <div className="project-media">
            <div className="project-media-label">
              <span>Project Image Placeholder</span>
            </div>
          </div>
          <h3>{featured.title}</h3>
          <p>{featured.description}</p>
          <div className="tech-list">
            {featured.stack.map((tech) => (
              <span className="tech-pill" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </TiltCard> : null}
        <div className="future-stack">
          {future.map((project, index) => (
            <TiltCard className="future-card glass-panel magnetic" key={project.title} delay={index * 0.07}>
              <div className="analysis-heading">
                <span>{project.status}</span>
                <span>Queued</span>
              </div>
              <div className="project-copy">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <div className="tech-list">
                {project.stack.map((tech) => (
                  <span className="tech-pill" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}

function Timeline({ content }: { content: SiteContent }) {
  return (
    <RevealSection
      id="timeline"
      kicker="Chronology"
      title="Future-Facing Timeline"
      copy="Milestones rendered as a vertical transmission log."
    >
      <div className="timeline">
        {content.timeline.map((item, index) => (
          <motion.div
            className="timeline-item"
            key={item.title}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.08 }}
          >
            <span className="timeline-node" />
            <article className="timeline-card glass-panel magnetic">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  );
}

function SocialHub({ content }: { content: SiteContent }) {
  return (
    <RevealSection
      id="social"
      kicker="Communication Terminal"
      title="Social Hub"
      copy="All contact channels are driven by one central configuration file, ready to edit when your official links change."
    >
      <div className="terminal-grid">
        {content.socials.map((social, index) => {
          const Icon = getSocialIcon(social.name);
          return (
            <motion.a
              className="social-node glass-panel magnetic"
              href={social.url}
              key={social.name}
              target={social.url.startsWith("http") ? "_blank" : undefined}
              rel={social.url.startsWith("http") ? "noreferrer" : undefined}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <Icon />
              <span>{social.name}</span>
              <span style={{ opacity: 0.62 }}>{social.username}</span>
            </motion.a>
          );
        })}
      </div>
    </RevealSection>
  );
}

function Contact({ content }: { content: SiteContent }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const nextErrors: Record<string, string> = {};

    if (name.length < 2) {
      nextErrors.name = "Enter your name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email.";
    }

    if (message.length < 10) {
      nextErrors.message = "Write at least 10 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSent(true);
      setErrors({});
      event.currentTarget.reset();
      window.setTimeout(() => setSent(false), 4200);
    }
  };

  return (
    <RevealSection
      id="contact"
      kicker="Holographic Console"
      title="Open a Communication Channel"
      copy="A polished contact console with validation and success feedback, ready to connect to an email service later."
    >
      <div className="contact-grid">
        <div className="map-panel glass-panel">
          <div className="map-orbit">
            <div className="map-label">
              <strong>{content.identity.city}</strong>
              <span>{content.identity.country} Transmission Node</span>
            </div>
          </div>
        </div>
        <div className="contact-console glass-panel animated-border">
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="field-wrap">
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <input className="cyber-input" id="name" name="name" type="text" autoComplete="name" />
              {errors.name ? <p style={{ color: "#ff8db3", margin: "0.35rem 0 0" }}>{errors.name}</p> : null}
            </div>
            <div className="field-wrap">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input className="cyber-input" id="email" name="email" type="email" autoComplete="email" />
              {errors.email ? <p style={{ color: "#ff8db3", margin: "0.35rem 0 0" }}>{errors.email}</p> : null}
            </div>
            <div className="field-wrap">
              <label className="field-label" htmlFor="message">
                Message
              </label>
              <textarea className="cyber-input" id="message" name="message" rows={6} />
              {errors.message ? <p style={{ color: "#ff8db3", margin: "0.35rem 0 0" }}>{errors.message}</p> : null}
            </div>
            <button className="cyber-button magnetic" type="submit">
              <FiSend />
              Transmit Message
            </button>
            {sent ? (
              <motion.div className="success-ping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <FiCpu />
                Transmission simulated successfully
              </motion.div>
            ) : null}
          </form>
        </div>
      </div>
    </RevealSection>
  );
}

function RevealSection({
  id,
  kicker,
  title,
  copy,
  children
}: {
  id: string;
  kicker: string;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.16 });

  return (
    <section id={id} className="section-shell" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
        animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
        transition={{ duration: 0.72, ease: "easeOut" }}
      >
        <div className="section-kicker">{kicker}</div>
        <h2 className="section-title text-gradient">{title}</h2>
        <p className="section-copy">{copy}</p>
      </motion.div>
      {children}
    </section>
  );
}

function TiltCard({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 9;
    const rotateX = -((y / rect.height) - 0.5) * 9;
    ref.current.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const onLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "";
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

function CounterStat({ label, value, suffix, delay }: { label: string; value: number; suffix: string; delay: number }) {
  const count = useSpring(0, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(count, "change", (latest) => setDisplay(Math.round(latest)));

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      onViewportEnter={() => count.set(value)}
    >
      <div className="stat-number">
        {display}
        {suffix}
      </div>
      <p>{label}</p>
    </motion.div>
  );
}

function useTypingWords(words: string[]) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      setSubIndex(words[index].length);
      return;
    }

    const current = words[index];
    const timeout = window.setTimeout(
      () => {
        if (!deleting && subIndex < current.length) {
          setSubIndex(subIndex + 1);
        } else if (!deleting && subIndex === current.length) {
          setDeleting(true);
        } else if (deleting && subIndex > 0) {
          setSubIndex(subIndex - 1);
        } else {
          setDeleting(false);
          setIndex((index + 1) % words.length);
        }
      },
      deleting ? 36 : subIndex === current.length ? 1200 : 74
    );

    return () => window.clearTimeout(timeout);
  }, [deleting, index, reduceMotion, subIndex, words]);

  return useMemo(() => words[index].slice(0, subIndex), [index, subIndex, words]);
}

function getInitials(name: string, onlineName: string) {
  const source = `${name} ${onlineName}`.trim();
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "PR";
}

function getSocialUrl(content: SiteContent, name: string) {
  return content.socials.find((social) => social.name.toLowerCase() === name.toLowerCase())?.url;
}
