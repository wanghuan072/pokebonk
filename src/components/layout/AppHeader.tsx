"use client";
import gameVersion from "@/data/site/game-version.json";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/common/Icon";
import { mainLinks, wikiLinks } from "@/config/navigation";
import type { SearchEntry } from "@/types/wiki";
import "@/style/layout/header.css";
export default function AppHeader({
  searchIndex,
}: {
  searchIndex: SearchEntry[];
}) {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wikiRef = useRef<HTMLDetailsElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navIcons: Record<string, string> = {
    "/": "home", "/play": "controller", "/pokedex": "ball",
    "/tier-list": "chart", "/builds": "fusion", "/guides": "book", "/wiki/leaderboard": "trophy", "/updates": "calendar", "/events": "star",
  };
  const results = query.trim()
    ? searchIndex
        .filter((e) =>
          e.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 7)
    : [];
  const navLink = (n: { href: string; label: string }) => (
    <a
      href={n.href}
      key={n.href}
      className={
        path === n.href || (n.href !== "/" && path.startsWith(n.href))
          ? "active"
          : ""
      }
      aria-current={path === n.href ? "page" : undefined}
    >
      <Icon name={navIcons[n.href]} />
      <span>{n.label}</span>
    </a>
  );
  return (
    <header className="app-header" onKeyDown={(e) => {
      if (e.key === "Escape") setMobile(false);
    }}>
      <div className="container header-content">
        <a href="/" className="brand" aria-label="PokeBonk Wiki home">
          <Image src="/images/logo-mark.png" alt="" width={42} height={42} />
          <span>
            <b>Poke</b>Bonk
            <span className="brand-sub">INDEPENDENT FAN SITE</span>
          </span>
        </a>
        <button
          className="mobile-menu-button"
          aria-label="Toggle navigation"
          aria-expanded={mobile}
          aria-controls="main-navigation"
          onClick={() => setMobile(!mobile)}
        >
          {mobile ? "✕" : "☰"}
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={`main-navigation ${mobile ? "is-open" : ""}`}
        >
          <a href="/" className="brand" aria-label="PokeBonk home">
            <Image src="/images/logo-mark.png" alt="" width={48} height={48} />
          </a>
          {mainLinks.slice(0, 3).map(navLink)}
          <details
            ref={wikiRef}
            className="wiki-menu"
            onKeyDown={(e) => {
              if (e.key === "Escape" && wikiRef.current)
                wikiRef.current.open = false;
            }}
          >
            <summary className={path.startsWith("/wiki") ? "active" : ""}>
              <Icon name="book" /><span>Wiki</span><span className="wiki-chevron">⌄</span>
            </summary>
            <div className="wiki-dropdown">
              {wikiLinks.map((n) => (
                <a key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
                  <Icon name={n.icon} />
                  {n.label}
                  <span>›</span>
                </a>
              ))}
            </div>
          </details>
          {mainLinks.slice(3).map(navLink)}
          <div className="header-utilities">
            <button type="button" onClick={() => { setMobile(false); searchRef.current?.focus(); }}>
              <Icon name="search" /><span>Search</span>
            </button>
            <small>A Pokémon<br />fan guide.</small>
          </div>
        </nav>
        <div className="header-actions">
          <form
            className="site-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (results[0]) window.location.assign(results[0].href);
            }}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
            }}
          >
            <Icon name="search" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setFocused(false);
              }}
              aria-label="Search Pokémon, attacks, items and guides"
              placeholder="Search Pokémon, attacks, guides..."
              autoComplete="off"
            />
            {focused && query.trim() ? (
              <div className="search-results" aria-live="polite">
                {results.length ? (
                  results.map((r) => (
                    <a href={r.href} key={r.href}>
                      <span>{r.name}</span>
                      <small>{r.category}</small>
                    </a>
                  ))
                ) : (
                  <p>No matches. Try a Pokémon or move name.</p>
                )}
              </div>
            ) : null}
          </form>
          <a href="/play" className="button button-gold header-play">
            <Icon name="controller" /> Play Now
          </a>
          <span className="header-version">LATEST PATCH v{gameVersion.version}</span>
        </div>
      </div>
    </header>
  );
}
