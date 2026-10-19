import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Icon } from "../data/icons";
import { DEFAULTS, loadSettings, sanitize, saveSettings, type Settings } from "../lib/settings";
import { FORMATS, isFramework, npmSnippet, pascal, snippet, type Format } from "../lib/snippets";
import { copyText, download } from "../lib/copy";
import { svgToPng } from "../lib/png";
import { toast } from "../lib/toast";
import { tokenize } from "../lib/highlight";
import { SITE } from "../config";

type Props = {
  icon: Icon;
  index: number;
  total: number;
  ui: { back: string; action: string; bar: string[]; copy: string; download: string; link: string; lede: string };
};

const SWATCHES = [
  { label: "ink", value: "currentColor" },
  { label: "coral", value: "#ff6b5b" },
  { label: "blue", value: "#5b8cff" },
  { label: "green", value: "#3dbe8b" },
  { label: "violet", value: "#b07cff" },
];

const SIZES = [14, 18, 24, 32, 48];
const GRID_MIN = 72;
const WOBBLE_TAG = `<script src="${SITE.url}/wobble/v1.js"></script>`;
const TAB_KEY = "zicons:tab";
const WAY_KEY = "zicons:way";

function Glyph({ d, size, color, stroke, className }: { d: string; size: number | string; color?: string; stroke?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color && color !== "currentColor" ? color : "currentColor"}
      strokeWidth={stroke ?? 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export default function Workbench({ icon, index, total, ui }: Props) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [tab, setTab] = useState<Format>("svg");
  const [way, setWay] = useState<"npm" | "paste">("npm");
  const [grid, setGrid] = useState(true);
  const [view, setView] = useState<"fit" | "real">("fit");
  const [ready, setReady] = useState(false);
  const [siteBoil, setSiteBoil] = useState(true);
  const [ink, setInk] = useState("#1d1b18");
  const codeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const fromUrl = ["color", "size", "stroke"].some((k) => q.has(k));
    const stored = loadSettings();
    setS(
      fromUrl
        ? sanitize({
            ...stored,
            color: q.has("color") ? `#${q.get("color")}` : stored.color,
            size: q.has("size") ? Number(q.get("size")) : stored.size,
            stroke: q.has("stroke") ? Number(q.get("stroke")) : stored.stroke,
          })
        : stored,
    );
    try {
      const t = localStorage.getItem(TAB_KEY) as Format | null;
      if (t && FORMATS.some((f) => f.key === t)) setTab(t);
      if (localStorage.getItem(WAY_KEY) === "paste") setWay("paste");
    } catch {}
    setReady(true);
    const root = document.documentElement;
    const read = () => {
      setSiteBoil(root.dataset.boil !== "off");
      const v = getComputedStyle(root).getPropertyValue("--ink").trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) setInk(v);
    };
    read();
    const watch = new MutationObserver(read);
    watch.observe(root, { attributes: true, attributeFilter: ["data-boil", "data-theme"] });
    return () => watch.disconnect();
  }, []);

  const toggleBoil = () => {
    if (!siteBoil) {
      document.documentElement.dataset.boil = "on";
      try {
        localStorage.setItem("zicons:boil", "on");
      } catch {}
      document.getElementById("boil-toggle")?.setAttribute("aria-pressed", "true");
      update({ boil: true });
      return;
    }
    update({ boil: !s.boil });
  };

  useEffect(() => {
    if (ready) saveSettings(s);
  }, [s, ready]);

  const update = (patch: Partial<Settings>) => setS((prev) => sanitize({ ...prev, ...patch }));
  const pickTab = (t: Format) => {
    setTab(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {}
  };

  const pickWay = (w: "npm" | "paste") => {
    setWay(w);
    try {
      localStorage.setItem(WAY_KEY, w);
    } catch {}
  };

  const fw = isFramework(tab) ? tab : null;
  const npm = useMemo(() => (fw ? npmSnippet(fw, icon, s) : null), [fw, icon, s]);
  const code = useMemo(() => (npm && way === "npm" ? npm.code : snippet(tab, icon, s)), [npm, way, tab, icon, s]);
  const shown = useMemo(() => tokenize(code.split(icon.d).join(`${icon.d.slice(0, 42)}…`)), [code, icon.d]);
  const label = FORMATS.find((f) => f.key === tab)!.label.replace("+ ", "");
  const color = s.color === "currentColor" ? undefined : s.color;
  const real = view === "real";
  const gridFits = !real || s.size >= GRID_MIN;
  const gridOn = grid && gridFits;
  const big = !real || s.size >= 96;
  const custom = s.color !== DEFAULTS.color || s.size !== DEFAULTS.size || s.stroke !== DEFAULTS.stroke;

  const onCopy = async () => {
    if (await copyText(code)) return toast(`copied ${label}`);
    if (codeRef.current) {
      codeRef.current.classList.remove("sr-only");
      codeRef.current.classList.add("code-fallback");
      codeRef.current.removeAttribute("aria-hidden");
      codeRef.current.setAttribute("aria-label", `${label} code`);
      codeRef.current.tabIndex = 0;
      codeRef.current.focus();
      codeRef.current.select();
    }
    toast("couldn't copy. The full code is selected, press Ctrl+C");
  };

  const svgForFile = () => snippet("svg", icon, { ...s, color: s.color === "currentColor" ? "#1d1b18" : s.color });

  const onSvg = () => {
    download(`${icon.name}.svg`, svgForFile());
    toast(`downloaded ${icon.name}.svg`);
  };

  const onPng = async () => {
    const px = Math.max(512, s.size);
    try {
      download(`${icon.name}-${px}.png`, await svgToPng(svgForFile(), px));
      toast(`downloaded ${icon.name}-${px}.png`);
    } catch {
      toast("couldn't make the PNG. Try the SVG instead");
    }
  };

  const shareUrl = () => {
    const url = new URL(`/icons/${icon.name}`, location.origin);
    if (s.color !== DEFAULTS.color) url.searchParams.set("color", s.color.slice(1));
    if (s.size !== DEFAULTS.size) url.searchParams.set("size", String(s.size));
    if (s.stroke !== DEFAULTS.stroke) url.searchParams.set("stroke", String(s.stroke));
    return url.href;
  };

  const onScriptTag = async () => {
    toast((await copyText(WOBBLE_TAG)) ? "copied the script tag" : "couldn't copy the script tag");
  };

  const onInstall = async () => {
    if (npm) toast((await copyText(npm.install)) ? `copied ${npm.install}` : "couldn't copy the install line");
  };

  const onLink = async () => {
    const ok = await copyText(shareUrl());
    toast(ok ? (custom ? "copied a link with your pen" : "copied the link") : "couldn't copy the link");
  };

  const sheet = (tone: "light" | "dark") => (
    <div className={`sheet sheet-${tone}`}>
      <div className="hand sheet-title">{tone === "light" ? "in the wild" : "after dark"}</div>
      <div className="ctx">
        <span className="btn sk btn-accent">
          <Glyph d={icon.d} size={18} stroke={s.stroke} />
          {ui.action}
        </span>
        <span className="bar card">
          {ui.bar.map((d, k) => (
            <Glyph key={k} d={d} size={18} stroke={s.stroke} />
          ))}
          <Glyph d={icon.d} size={18} stroke={s.stroke} color={color ?? "#ff6b5b"} />
        </span>
        <span className="menu card">
          <Glyph d={icon.d} size={16} stroke={s.stroke} color={color} />
          <span>{icon.name}</span>
          <kbd>{icon.name[0].toUpperCase()}</kbd>
        </span>
        {tone === "light" && (
          <span className="inline-text">
            grab the <Glyph d={icon.d} size={16} stroke={s.stroke} color={color} className="inline-glyph" /> and go
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`spread${ready ? "" : " pending"}`}>
      <div className="rings" aria-hidden="true">
        {Array.from({ length: 24 }, (_, k) => (
          <span key={k} />
        ))}
      </div>

      <section className="page page-left" aria-label="Customise">
        <div className="page-top hand">
          <a href="/">{ui.back}</a>
          <span>
            {icon.name} · {index + 1} of {total}
          </span>
        </div>

        <div className="stage card">
          <div className="stage-art" style={{ "--art": real ? `min(${s.size}px, 100cqi)` : "78cqi" } as CSSProperties}>
            {gridOn && <div className="stage-grid" aria-hidden="true" />}
            {gridOn && (
              <div className="stage-live" aria-hidden="true">
                {(!real || s.size >= 160) && <span className="hand">3..21 live area</span>}
              </div>
            )}
            <Glyph
              d={icon.d}
              size="100%"
              color={color}
              stroke={s.stroke}
              className={`stage-icon${s.boil ? (big ? " zi-boil" : " zi-boil-sm") : ""}`}
            />
          </div>
          <div className="stage-view" role="group" aria-label="Preview scale">
            <button type="button" className="hand" aria-pressed={!real} title="Big, to inspect the lines" onClick={() => setView("fit")}>
              fit
            </button>
            <button type="button" className="hand" aria-pressed={real} title="The size you picked, pixel for pixel" onClick={() => setView("real")}>
              1:1
            </button>
          </div>
        </div>

        <div className="controls">
          <div className="row wrap">
            <div className="swatches" role="radiogroup" aria-label="Colour">
              {SWATCHES.map((sw) => (
                <button
                  key={sw.value}
                  type="button"
                  role="radio"
                  aria-checked={s.color === sw.value}
                  aria-label={sw.label}
                  className={`swatch${sw.value === "currentColor" ? " swatch-ink" : ""}`}
                  style={sw.value === "currentColor" ? undefined : { background: sw.value }}
                  onClick={() => update({ color: sw.value })}
                />
              ))}
              <label className="swatch swatch-any" title="Any colour">
                <span className="sr-only">Pick any colour</span>
                <input type="color" value={color ?? ink} onChange={(e) => update({ color: e.target.value })} />
              </label>
            </div>
            <div className="row toggles">
              <button
                type="button"
                className="chip sk"
                aria-pressed={s.boil && siteBoil}
                title={siteBoil ? "Boil this preview" : "The boil is off for the whole site. Click to turn it back on"}
                onClick={toggleBoil}
              >
                boil
              </button>
              <button
                type="button"
                className="chip sk"
                aria-pressed={gridOn}
                disabled={!gridFits}
                title={gridFits ? "Show the 24 grid" : `At 1:1 the grid shows from ${GRID_MIN}px up`}
                onClick={() => setGrid(!grid)}
              >
                grid
              </button>
            </div>
          </div>

          <label className="slider-row">
            <span className="lbl">size</span>
            <input type="range" min={12} max={256} step={1} value={s.size} onChange={(e) => {
                update({ size: Number(e.target.value) });
                setView("real");
              }} />
            <span className="val hand">{s.size}px</span>
          </label>
          <label className="slider-row">
            <span className="lbl">stroke</span>
            <input type="range" min={1} max={3.5} step={0.1} value={s.stroke} onChange={(e) => update({ stroke: Number(e.target.value) })} />
            <span className="val hand">{s.stroke.toFixed(1)}</span>
          </label>
          <button type="button" className={`reset hand${custom ? "" : " invisible"}`} onClick={() => {
              setS({ ...DEFAULTS, boil: s.boil });
              setView("fit");
            }}>
            reset to the default pen
          </button>
        </div>

        <div className="wild">{sheet("light")}</div>
      </section>

      <section className="page page-right" aria-label="Get the code">
        <div>
          <h1 className="icon-name">{icon.name}</h1>
          <p className="lede">{ui.lede}</p>
          <div className="row wrap tags">
            <a className="tape" href={`/?group=${icon.group}`}>
              {icon.groupTitle}
            </a>
            {icon.tags.map((t) => (
              <a key={t} className="chip sk" href={`/?q=${encodeURIComponent(t)}`}>
                {t}
              </a>
            ))}
          </div>
        </div>

        <div className="sizes" aria-label="Sizes">
          {SIZES.map((px) => (
            <figure key={px}>
              <Glyph d={icon.d} size={px} color={color} stroke={s.stroke} />
              <figcaption className="hand">{px}</figcaption>
            </figure>
          ))}
        </div>

        <div className="codebox">
          <div className="tabs" role="tablist" aria-label="Code format">
            {FORMATS.map((f) => (
              <button key={f.key} type="button" role="tab" aria-selected={tab === f.key} className="tab" onClick={() => pickTab(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="code-shell" role="tabpanel">
            {npm && (
              <div className="code-head">
                {way === "npm" ? (
                  <button type="button" className="install" onClick={onInstall} title="Copy the install command">
                    <span className="tk-punct">$</span> {npm.install}
                    <Glyph d={ui.copy} size={14} />
                  </button>
                ) : (
                  <span className="code-hint">a self-contained component, nothing to install</span>
                )}
                <div className="way" role="group" aria-label="How to get it">
                  <button type="button" aria-pressed={way === "npm"} onClick={() => pickWay("npm")}>
                    npm
                  </button>
                  <button type="button" aria-pressed={way === "paste"} onClick={() => pickWay("paste")}>
                    paste
                  </button>
                </div>
              </div>
            )}
            <pre className="code" tabIndex={0}>
              {shown.map((t, k) => (t.kind === "text" ? t.text : <span key={k} className={`tk-${t.kind}`}>{t.text}</span>))}
            </pre>
          </div>
          <textarea ref={codeRef} className="sr-only" value={code} readOnly tabIndex={-1} aria-hidden="true" />
        </div>

        <div className="row wrap actions">
          <button type="button" className="btn sk btn-ink copy-main" onClick={onCopy}>
            <Glyph d={ui.copy} size={18} />
            copy {label}
          </button>
          <button type="button" className="btn sk" onClick={onSvg}>
            <Glyph d={ui.download} size={18} />
            SVG
          </button>
          <button type="button" className="btn sk" onClick={onPng}>
            <Glyph d={ui.download} size={18} />
            PNG
          </button>
          <button type="button" className="btn sk link-btn" onClick={onLink} aria-label="Copy a link to this icon with your colour, size and stroke" title="Copy a link to this icon with your colour, size and stroke">
            <Glyph d={ui.link} size={18} />
          </button>
        </div>
        {tab === "wobble" ? (
          <div className="script-hint">
            <p className="hand note">
              with the npm packages it's one prop: <code>&lt;{pascal(icon.name)}Icon boil /&gt;</code>
            </p>
            <p className="hand note">
              using a few icons? one script tag does this for all of them, then add <code>class="zi-boil-sm"</code> to any icon
            </p>
            <div className="row wrap">
              <button type="button" className="btn sk" onClick={onScriptTag}>
                <Glyph d={ui.copy} size={18} />
                copy the script tag
              </button>
              <a className="hand script-more" href="/use#wobble">
                how it works
              </a>
            </div>
          </div>
        ) : (
          <p className="hand note">the code follows your colour, size and stroke on the left ✓</p>
        )}
        <div className="wild">{sheet("dark")}</div>
      </section>
    </div>
  );
}
