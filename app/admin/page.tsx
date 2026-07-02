"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiLock, FiRefreshCcw, FiSave, FiShield, FiTerminal } from "react-icons/fi";
import { defaultContent } from "@/lib/default-content";
import type { SiteContent, SocialLink } from "@/types/content";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [jsonDraft, setJsonDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const stored = window.localStorage.getItem("panel-rexx-admin-token");
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.content) {
          setContent(payload.content);
          setJsonDraft(JSON.stringify(payload.content, null, 2));
        }
      })
      .catch(() => {
        setJsonDraft(JSON.stringify(defaultContent, null, 2));
      });
  }, []);

  const socialRows = useMemo(() => content.socials, [content.socials]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("Authenticating with KeyAuth...");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json().catch(() => ({ message: "Login failed." }));

    if (!response.ok || !payload.token) {
      const missing = Array.isArray(payload.missing) && payload.missing.length ? ` Missing: ${payload.missing.join(", ")}.` : "";
      setMessage(`${payload.message ?? "Login failed."}${missing}`);
      return;
    }

    window.localStorage.setItem("panel-rexx-admin-token", payload.token);
    setToken(payload.token);
    setMessage("Admin session online.");
  };

  const logout = () => {
    window.localStorage.removeItem("panel-rexx-admin-token");
    setToken("");
    setMessage("Admin session closed.");
  };

  const updateIdentity = (key: keyof SiteContent["identity"], value: string) => {
    setContent((current) => {
      const next = {
        ...current,
        identity: {
          ...current.identity,
          [key]: value
        }
      };
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const updateSocial = (index: number, key: keyof SocialLink, value: string) => {
    setContent((current) => {
      const socials = current.socials.map((social, socialIndex) =>
        socialIndex === index
          ? {
              ...social,
              [key]: value
            }
          : social
      );
      const next = { ...current, socials };
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const addSocial = () => {
    setContent((current) => {
      const next = {
        ...current,
        socials: [...current.socials, { name: "New Link", username: "username", url: "https://" }]
      };
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const removeSocial = (index: number) => {
    setContent((current) => {
      const next = {
        ...current,
        socials: current.socials.filter((_, socialIndex) => socialIndex !== index)
      };
      setJsonDraft(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft) as SiteContent;
      setContent(parsed);
      setMessage("JSON applied locally. Save to publish.");
    } catch {
      setMessage("JSON is invalid. Fix it before applying.");
    }
  };

  const save = async () => {
    setSaveState("saving");
    setMessage("Saving content...");

    const response = await fetch("/api/content", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-admin-token": token
      },
      body: JSON.stringify({ content })
    });
    const payload = await response.json();

    if (!response.ok) {
      setSaveState("error");
      setMessage(payload.message ?? "Save failed.");
      return;
    }

    setContent(payload.content);
    setJsonDraft(JSON.stringify(payload.content, null, 2));
    setSaveState("saved");
    setMessage("Saved. Public site will update from storage.");
    window.setTimeout(() => setSaveState("idle"), 2200);
  };

  const reset = async () => {
    setSaveState("saving");
    const response = await fetch("/api/admin/reset", {
      method: "POST",
      headers: {
        "x-admin-token": token
      }
    });
    const payload = await response.json();

    if (!response.ok) {
      setSaveState("error");
      setMessage(payload.message ?? "Reset failed.");
      return;
    }

    setContent(payload.content);
    setJsonDraft(JSON.stringify(payload.content, null, 2));
    setSaveState("saved");
    setMessage("Content reset to defaults.");
  };

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-topbar glass-panel">
          <div>
            <div className="section-kicker">Admin OS</div>
            <h1>Panel Rexx Control Room</h1>
          </div>
          <div className="admin-actions">
            <Link className="cyber-button magnetic" href="/">
              View Site
            </Link>
            {isAuthenticated ? (
              <button className="cyber-button magnetic" type="button" onClick={logout}>
                Logout
              </button>
            ) : null}
          </div>
        </div>

        {!isAuthenticated ? (
          <form className="admin-login glass-panel animated-border" onSubmit={login}>
            <FiShield />
            <h2>KeyAuth Required</h2>
            <p>Enter your KeyAuth username and password to unlock the content manager. App credentials stay server-side.</p>
            <label className="field-wrap">
              <span className="field-label">Username</span>
              <input className="cyber-input" value={username} onChange={(event) => setUsername(event.target.value)} type="text" autoComplete="username" />
            </label>
            <label className="field-wrap">
              <span className="field-label">Password</span>
              <input
                className="cyber-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </label>
            <button className="cyber-button magnetic" type="submit">
              <FiLock />
              Authenticate
            </button>
            {message ? <p className="admin-message">{message}</p> : null}
          </form>
        ) : (
          <div className="admin-grid">
            <section className="admin-panel glass-panel">
              <div className="admin-panel-heading">
                <FiTerminal />
                <h2>Identity</h2>
              </div>
              <div className="admin-form-grid">
                {(Object.keys(content.identity) as Array<keyof SiteContent["identity"]>).map((key) => (
                  <label className="field-wrap" key={key}>
                    <span className="field-label">{key}</span>
                    <input className="cyber-input" value={content.identity[key]} onChange={(event) => updateIdentity(key, event.target.value)} />
                  </label>
                ))}
              </div>
            </section>

            <section className="admin-panel glass-panel">
              <div className="admin-panel-heading">
                <FiTerminal />
                <h2>Social Hub</h2>
              </div>
              <div className="admin-social-list">
                {socialRows.map((social, index) => (
                  <div className="admin-social-row" key={`${social.name}-${index}`}>
                    <input value={social.name} onChange={(event) => updateSocial(index, "name", event.target.value)} aria-label="Social name" />
                    <input value={social.username} onChange={(event) => updateSocial(index, "username", event.target.value)} aria-label="Social username" />
                    <input value={social.url} onChange={(event) => updateSocial(index, "url", event.target.value)} aria-label="Social URL" />
                    <button type="button" onClick={() => removeSocial(index)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button className="cyber-button magnetic" type="button" onClick={addSocial}>
                Add Social
              </button>
            </section>

            <section className="admin-panel glass-panel admin-json-panel">
              <div className="admin-panel-heading">
                <FiTerminal />
                <h2>Full Site JSON</h2>
              </div>
              <textarea value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} spellCheck={false} />
              <div className="admin-actions">
                <button className="cyber-button magnetic" type="button" onClick={applyJson}>
                  Apply JSON
                </button>
                <button className="cyber-button magnetic" type="button" onClick={reset}>
                  <FiRefreshCcw />
                  Reset Defaults
                </button>
                <button className="cyber-button magnetic" type="button" onClick={save} disabled={saveState === "saving"}>
                  <FiSave />
                  {saveState === "saving" ? "Saving..." : "Save All"}
                </button>
              </div>
              {message ? <p className="admin-message">{message}</p> : null}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
