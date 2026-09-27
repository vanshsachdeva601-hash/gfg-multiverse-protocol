import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Menu, X, Crosshair, Zap, Radio, Award, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { event } from "@/lib/event-config";
import portal from "@/assets/portal.jpg";
import doom from "@/assets/armored-hero.jpg";
import hulk from "@/assets/titan-hero.jpg";
import loki from "@/assets/loki.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "GFG: The Multiverse Protocol | Bennett University" },
    { name: "description", content: "Enter The Multiverse Protocol, a Marvel-inspired technology event by the GeeksForGeeks Student Chapter at Bennett University. 24 October 2026." },
    { property: "og:title", content: "GFG: The Multiverse Protocol" },
    { property: "og:description", content: "Where heroes don't wear capes. They write code. A cinematic tech event at Bennett University." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const nav = [
  { label: "MISSION", href: "#mission" }, { label: "HIGHLIGHTS", href: "#highlights" },
  { label: "HEROES", href: "#heroes" }, { label: "TIMELINE", href: "#timeline" },
  { label: "REGISTER", href: "#register" },
];
const characters = [
  { name: "DOCTOR DOOM", role: "THE MIND", number: "01", line: "Every universe needs a mastermind.", description: "Strategy is your greatest superpower.", image: doom, className: "doom" },
  { name: "HULK", role: "THE POWER", number: "02", line: "Break limits. Build bigger.", description: "Turn raw potential into unstoppable momentum.", image: hulk, className: "hulk" },
  { name: "LOKI", role: "THE ILLUSION", number: "03", line: "Rewrite the rules of reality.", description: "The best solution is the one nobody saw coming.", image: loki, className: "loki" },
];
const benefits = [
  { number: "01", title: "LEARN", detail: "Meet fellow developers and builders." },
  { number: "02", title: "BUILD", detail: "Turn ideas into working experiences." },
  { number: "03", title: "COMPETE", detail: "Test your problem-solving skills." },
  { number: "04", title: "CONNECT", detail: "Become part of the tech community." },
];
const icons = [Crosshair, Zap, Radio, Award];

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 32);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max * 100 : 0);
      let current = "";
      for (const item of nav) {
        const section = document.querySelector(item.href);
        if (section && section.getBoundingClientRect().top < window.innerHeight * .38) current = item.label;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -35px 0px" });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    const scenes = Array.from(document.querySelectorAll<HTMLElement>(".character-panel"));
    const hero = document.querySelector<HTMLElement>(".hero");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
    let frame = 0;
    const updateScenes = () => {
      frame = 0;
      if (hero) hero.style.setProperty("--hero-depth", reducedMotion.matches ? "0" : String(smooth(window.scrollY / (window.innerHeight * .8))));
      for (const scene of scenes) {
        if (reducedMotion.matches) { scene.classList.remove("scene-ready"); continue; }
        const bounds = scene.getBoundingClientRect();
        const start = window.innerHeight * .88;
        const end = window.innerHeight * .08;
        const position = clamp((start - bounds.top) / (start - end));
        const entrance = smooth(position / .44);
        const fog = smooth(position / .28);
        // Once the artwork lands, these values stop changing while the copy is read.
        const depth = 1 - smooth(position / .44);
        const nextScene = scene.nextElementSibling;
        const nextTop = nextScene instanceof HTMLElement && nextScene.classList.contains("character-panel")
          ? nextScene.getBoundingClientRect().top : window.innerHeight;
        const handoff = smooth((window.innerHeight * .94 - nextTop) / (window.innerHeight * .48));
        const text = (from: number, to: number) => smooth((position - from) / (to - from));
        const isHulk = scene.classList.contains("hulk");
        const isLoki = scene.classList.contains("loki");
        const artScale = isHulk
          ? position < .4 ? .9 + smooth(position / .4) * .108 : 1.008 - smooth((position - .4) / .1) * .008
          : isLoki ? .96 + entrance * .04 : 1.035 - entrance * .035;
        const variables: Record<string, number> = {
          "--art-opacity": smooth(position / .32),
          "--atmosphere-progress": isLoki ? fog : entrance,
          "--label-progress": text(.52, .61),
          "--role-progress": text(.58, .67),
          "--title-progress": text(.63, .74),
          "--line-progress": text(.74, .83),
          "--description-progress": text(.81, .9),
          "--indicator-progress": text(.88, .96),
          "--handoff-progress": handoff,
          "--accent-progress": isHulk ? Math.sin(Math.PI * clamp(position / .62)) * .42 + .38 * entrance : isLoki ? fog : entrance,
        };
        for (const [name, value] of Object.entries(variables)) scene.style.setProperty(name, String(value));
        scene.style.setProperty("--art-x", `${(1 - entrance) * (isLoki ? 42 : isHulk ? 0 : 105)}px`);
        scene.style.setProperty("--art-y", `${(1 - entrance) * (isHulk ? 75 : isLoki ? 13 : 6)}px`);
        scene.style.setProperty("--art-scale", String(artScale));
        scene.style.setProperty("--art-blur", `${(1 - entrance) * (isLoki ? 7 : 0)}px`);
        scene.style.setProperty("--atmosphere-y", `${(1 - (isLoki ? fog : entrance)) * (isLoki ? 30 : 14)}px`);
        scene.style.setProperty("--background-drift", `${depth * (isLoki ? -16 : 13)}px`);
        scene.style.setProperty("--light-scale", String(isHulk ? .86 + entrance * .14 : .94 + entrance * .06));
        scene.style.setProperty("--light-opacity", String(isLoki ? fog : entrance));
        scene.style.setProperty("--accent-drift", `${(1 - entrance) * (isHulk ? 22 : isLoki ? -18 : 14)}px`);
        scene.style.setProperty("--accent-turn", `${(isLoki ? -12 : 11) * entrance}deg`);
        for (const key of ["label", "role", "title", "line", "description", "indicator"] as const) {
          scene.style.setProperty(`--${key}-y`, `${(1 - (variables[`--${key}-progress`] ?? 0)) * (key === "title" ? 29 : 18)}px`);
        }
        scene.classList.add("scene-ready");
      }
    };
    const scheduleScenes = () => { if (!frame) frame = requestAnimationFrame(updateScenes); };
    scheduleScenes();
    window.addEventListener("scroll", scheduleScenes, { passive: true });
    window.addEventListener("resize", scheduleScenes);
    reducedMotion.addEventListener("change", scheduleScenes);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("scroll", scheduleScenes); window.removeEventListener("resize", scheduleScenes); reducedMotion.removeEventListener("change", scheduleScenes); cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  const register = () => {
    if (event.registrationUrl) window.open(event.registrationUrl, "_blank", "noopener,noreferrer");
    else setNotice(true);
  };
  const move = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
    if (e.currentTarget.classList.contains("hero")) setMouse({ x: (e.clientX / window.innerWidth - .5) * 16, y: (e.clientY / window.innerHeight - .5) * 12 });
    const bounds = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--pointer-x", String((e.clientX - bounds.left) / bounds.width * 2 - 1));
    e.currentTarget.style.setProperty("--pointer-y", String((e.clientY - bounds.top) / bounds.height * 2 - 1));
  };
  const resetPointer = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--pointer-x", "0");
    e.currentTarget.style.setProperty("--pointer-y", "0");
  };
  return <main>
    <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
    <header className={`site-header ${scrolled || menuOpen ? "scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label="GeeksForGeeks Bennett University, back to top">
        <span className="brand-mark" aria-hidden="true"><span /><span /></span>
        <span className="brand-type"><strong>GEEKSFORGEEKS</strong><small>BENNETT UNIVERSITY</small></span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">{nav.map(item => <a key={item.label} className={active === item.label ? "active" : ""} href={item.href}>{item.label}</a>)}</nav>
      <Button className="nav-register" variant="ghost" onClick={register}>REGISTER <ArrowUpRight size={16} /></Button>
      <Button className="mobile-toggle" size="icon" variant="ghost" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</Button>
      {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(item => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={18} /></a>)}</nav>}
    </header>

    <section id="top" className="hero" onMouseMove={move} onMouseLeave={resetPointer}>
      <div className="hero-portal" style={{ transform: `translate3d(${mouse.x * -.4}px,${mouse.y * -.4}px,0) scale(1.06)` }}><img src={portal} alt="Emerald energy portal in a dark futuristic world" width={1536} height={1024} fetchPriority="high" /></div>
      <div className="energy-core" aria-hidden="true"><span className="energy-core-rim"><i /><b /><em /></span></div>
      <div className="hero-figure" aria-hidden="true"><img src={doom} alt="" width={1024} height={1280} /></div><div className="hero-grid" aria-hidden="true" /><div className="hero-vignette" aria-hidden="true" />
      <div className="hero-coordinate hero-coordinate-left" aria-hidden="true">PROTOCOL // 001<br />UNIVERSE // PRIME</div>
      <div className="hero-coordinate hero-coordinate-right" aria-hidden="true">EST. 2026 &nbsp; / &nbsp; GFG × BU</div>
      <div className="hero-content">
        <p className="eyebrow hero-eyebrow"><span className="signal-dot" /> GEEKSFORGEEKS STUDENT CHAPTER <span className="eyebrow-separator">/</span> BENNETT UNIVERSITY</p>
        <p className="hero-pretitle">THE FUTURE IS NOT WRITTEN.</p>
        <h1><span className="hero-title-line">THE MULTIVERSE</span><span className="hero-title-line outlined">PROTOCOL<span className="title-period">.</span></span></h1>
        <div className="hero-under"><p>WHERE HEROES DON'T WEAR CAPES.<br /><strong>THEY WRITE CODE.</strong></p><Button className="primary-cta" onClick={() => document.querySelector("#mission")?.scrollIntoView({ behavior: "smooth" })}>ENTER THE MISSION <ArrowUpRight size={18} /></Button></div>
      </div>
      <div className="hero-bottom"><span className="hero-index">001 <span>/</span> 007</span><div className="hero-meta"><span>{event.date}</span><span>{event.time}</span><span>{event.venue}</span></div><a href="#mission" className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={16} /></a></div>
    </section>

    <section id="mission" className="mission section-pad">
      <div className="section-container mission-layout"><div className="mission-aside reveal"><SectionLabel number="01" text="THE MISSION" /><div className="mission-sigil" aria-hidden="true"><span>G</span><i>∞</i></div><p className="side-note">A NEW UNIVERSE<br />IS WAITING TO BE BUILT.</p></div><div className="mission-main"><p className="mission-kicker reveal">THE BRIEFING / 001</p><h2 className="mission-statement reveal">THIS ISN'T JUST<br />AN EVENT. <em>IT'S AN<br />ORIGIN STORY.</em></h2><div className="mission-copy reveal"><span className="small-cross">✳</span><div><p>The Multiverse Protocol is a Marvel-inspired technology experience by the GeeksForGeeks Student Chapter at Bennett University — built around creativity, coding, problem solving and competition.</p><p>Different minds. One mission. Find your people, push your limits, and create something extraordinary.</p></div></div></div></div>
    </section>

    <section id="highlights" className="objectives section-pad"><div className="section-container"><div className="section-heading reveal"><SectionLabel number="02" text="YOUR OBJECTIVES" /><h2>MISSION <em>OBJECTIVES</em></h2><p>FOUR WAYS TO CHANGE THE GAME.</p></div><div className="objectives-grid">{event.highlights.map((item, i) => { const Icon = icons[i] ?? Crosshair; return <article className="objective reveal" key={item.number} style={{ transitionDelay: `${i * 85}ms` }}><div className="objective-top"><span>{item.number} / 04</span><Icon size={23} strokeWidth={1.4} /></div><div className="objective-bottom"><span className="objective-symbol" aria-hidden="true">{item.symbol}</span><h3>{item.title}</h3><p>{item.description}</p><ArrowUpRight className="objective-arrow" size={18} /></div></article>; })}</div></div></section>

    <section id="heroes" className="heroes"><div className="heroes-intro section-container reveal"><SectionLabel number="03" text="SELECT YOUR PATH" /><h2>CHOOSE<br /><em>YOUR HERO.</em></h2><p>THREE FORCES. INFINITE POSSIBILITIES.</p><ChevronDown size={22} /></div>{characters.map(character => <article className={`character-panel ${character.className}`} key={character.name} onMouseMove={move} onMouseLeave={resetPointer}><div className="character-atmosphere" /><div className="character-image"><img src={character.image} alt={`Cinematic artwork representing ${character.name}`} loading="lazy" width={1024} height={1280} /></div><SceneAccent kind={character.className} /><div className="character-ghost" aria-hidden="true">{character.name}</div><div className="character-content section-container"><div className="character-heading"><span className="character-number">CHARACTER FILE / {character.number}</span><span className="character-dash" /></div><div className="character-text"><p className="eyebrow">{character.role}</p><h3>{character.name}</h3><p className="character-line">{character.line}</p><p className="character-description">{character.description}</p><span className="character-indicator">◈ &nbsp; MULTIVERSE ENTITY {character.number}</span></div></div><div className="character-edge" aria-hidden="true">{character.number} / 03 &nbsp; — &nbsp; {character.role}</div></article>)}</section>

    <section id="timeline" className="timeline section-pad"><div className="section-container timeline-layout"><div className="timeline-title reveal"><SectionLabel number="04" text="THE SEQUENCE" /><h2>MISSION<br /><em>TIMELINE.</em></h2><p>EVERY GREAT STORY HAS A BEGINNING.</p><span className="placeholder-note">SAMPLE SCHEDULE — SUBJECT TO CHANGE</span></div><div className="timeline-list">{event.timeline.map((item, i) => <div className="timeline-item reveal" key={item.time} style={{ transitionDelay: `${i * 50}ms` }}><span className="timeline-node" /><span className="timeline-time">{item.time}</span><h3>{item.title}</h3><span className="timeline-count">0{i+1}</span></div>)}</div></div></section>

    <section className="benefits section-pad"><div className="section-container"><div className="section-heading reveal"><SectionLabel number="05" text="THE REASON" /><h2>WHY ENTER THE<br /><em>MULTIVERSE?</em></h2></div><div className="benefits-list">{benefits.map(item => <div className="benefit reveal" key={item.title}><span>{item.number}</span><h3>{item.title}</h3><p>{item.detail}</p><ArrowUpRight size={22} /></div>)}</div></div></section>

    <section className="gallery section-pad"><div className="section-container"><div className="section-heading reveal"><SectionLabel number="06" text="VISUAL ARCHIVE" /><h2>PREVIOUS <em>MISSIONS.</em></h2><p>AN IMAGINED WORLD. A REAL CHANCE TO BUILD.</p></div><div className="gallery-grid"><div className="gallery-frame gallery-main reveal"><img src={portal} alt="Conceptual emerald portal artwork, not event photography" loading="lazy" width={1536} height={1024} /><span>01 / INTO THE UNKNOWN</span></div><div className="gallery-frame gallery-detail reveal"><div className="gallery-code" aria-hidden="true"><span>INITIALIZING PROTOCOL_</span><span>const future = build(ideas);</span><span>while (possibility) {'{'}</span><span>&nbsp;&nbsp;create.something(new);</span><span>{'}'}</span><span>_</span></div><span>02 / THE CODE</span></div><div className="gallery-frame gallery-symbol reveal"><span className="gallery-rings" aria-hidden="true"><i /><i /><i /></span><span>03 / THE ENERGY</span></div></div><p className="gallery-disclaimer">Conceptual artwork only. No previous event photography is shown.</p></div></section>

    <section id="register" className="final-cta"><div className="final-background"><img src={portal} alt="" loading="lazy" width={1536} height={1024} /></div><div className="final-inner section-container reveal"><SectionLabel number="07" text="THE FINAL CALL" /><h2>YOUR MISSION<br /><em>STARTS NOW.</em></h2><p>Step into the Multiverse Protocol.</p><Button className="primary-cta final-button" onClick={register}>REGISTER NOW <ArrowUpRight size={20} /></Button><span className="final-caption">THE NEXT CHAPTER BEGINS WITH YOU.</span></div></section>

    <section className="details"><div className="section-container details-grid"><div><span>DATE</span><strong>{event.date}</strong></div><div><span>TIME</span><strong>{event.time}</strong></div><div><span>VENUE</span><strong>{event.venue}</strong></div><div><span>HOSTED BY</span><strong>{event.host}</strong></div></div><p className="details-note">Event date, time, venue and schedule shown are sample placeholder details.</p></section>
    <footer className="footer"><div className="section-container"><div className="footer-top"><div><span className="footer-brand">GEEKSFORGEEKS <b>×</b> BENNETT UNIVERSITY</span><strong>THE MULTIVERSE<br />PROTOCOL<span>.</span></strong></div><div className="footer-links">{Object.entries(event.social).map(([label, url]) => url ? <a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={15} /></a> : <Button key={label} variant="ghost" onClick={() => setNotice(true)}>{label}<ArrowUpRight size={15} /></Button>)}</div></div><div className="footer-bottom"><span>© 2026 GeeksForGeeks Student Chapter</span><span>BUILT FOR THE NEXT UNIVERSE</span><a href="#top">BACK TO TOP ↑</a></div></div></footer>
    {notice && <div className="notice-backdrop" onClick={() => setNotice(false)}><div className="notice-dialog" role="dialog" aria-modal="true" aria-labelledby="notice-title" onClick={e => e.stopPropagation()}><Button className="notice-close" variant="ghost" size="icon" onClick={() => setNotice(false)} aria-label="Close"><X size={20} /></Button><span className="eyebrow">TRANSMISSION PENDING</span><h2 id="notice-title">PORTAL OPENING SOON.</h2><p>The official link isn't available yet. Check back for registration and chapter updates.</p><Button className="primary-cta" onClick={() => setNotice(false)}>GOT IT <ArrowRight size={17} /></Button></div></div>}
  </main>;
}
function SectionLabel({ number, text }: { number: string, text: string }) { return <div className="section-label"><span className="label-diamond">◇</span><span>{number} / 07</span><i />{text}</div>; }
function SceneAccent({ kind }: { kind: string }) {
  if (kind === "doom") return <div className="scene-accent doom-insignia" aria-hidden="true"><span className="insignia-shell"><i /><b /><em /></span></div>;
  if (kind === "hulk") return <div className="scene-accent hulk-fragments" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>;
  return <div className="scene-accent loki-gateway" aria-hidden="true"><span className="gateway-outer"><i /><b /><em /></span></div>;
}
