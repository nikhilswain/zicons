import { useEffect, useMemo, useRef, useState } from "react";
import type { Icon } from "../data/icons";
import { DEFAULTS, loadSettings, sanitize, saveSettings, type Settings } from "../lib/settings";
import { FORMATS, snippet, type Format } from "../lib/snippets";
import { copyText, download } from "../lib/copy";
import { svgToPng } from "../lib/png";
import { toast } from "../lib/toast";

type Props = {
  icon: Icon;
  index: number;
  total: number;
  ui: { back: string; action: string; bar: string[]; copy: string; download: string; link: string };
};

const SWATCHES = [
  { label: "ink", value: "currentColor" },
  { label: "coral", value: "#ff6b5b" },
  { label: "blue", value: "#5b8cff" },
  { label: "green", value: "#3dbe8b" },
  { label: "violet", value: "#b07cff" },
];

const SIZES = [14, 18, 24, 32, 48];
const TAB_KEY = "zicons:tab";

function Glyph({ d, size, color, stroke, className }: { d: string; size: number | string; color?: string; stroke?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color && color !== "currentColor" ? color : "currentColor"}
      strokeWidth={stroke ?? 2.2}
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
  const [grid, setGrid] = useState(true);
  const [ready, setReady] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setS(loadSettings());
    try {
      const t = localStorage.getItem(TAB_KEY) as Format | null;
      if (t && FORMATS.some((f) => f.key === t)) setTab(t);
    } catch {}
    setReady(true);
  }, []);

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

  const code = useMemo(() => snippet(tab, icon, s), [tab, icon, s]);
  const shown = useMemo(() => code.split(icon.d).join(`${icon.d.slice(0, 42)}…`), [code, icon.d]);
  const label = FORMATS.find((f) => f.key === tab)!.label.replace("+ ", "");
  const color = s.color === "currentColor" ? undefined : s.color;
  const custom = s.color !== DEFAULTS.color || s.size !== DEFAULTS.size || s.stroke !== DEFAULTS.stroke;

  const onCopy = async () => {
    if (await copyText(code)) return toast(`copied ${label}`);
    if (codeRef.current) {
      codeRef.current.classList.remove("sr-only");
      codeRef.current.classList.add("code-fallback");
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

  const onLink = async () => {
    toast((await copyText(location.href)) ? "copied the link" : "couldn't copy the link");
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
    <div className="spread">
      <div className="rings" aria-hidden="true">
        {Array.from({ length: 9 }, (_, k) => (
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
          {grid && <div className="stage-grid" aria-hidden="true" />}
          {grid && (
            <div className="stage-live" aria-hidden="true">
              <span className="hand">3..21 live area</span>
            </div>
          )}
          <Glyph d={icon.d} size="78%" color={color} stroke={s.stroke} className={`stage-icon${s.boil ? " zi-boil" : ""}`} />
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
                <input type="color" value={color ?? "#1d1b18"} onChange={(e) => update({ color: e.target.value })} />
              </label>
            </div>
            <div className="row toggles">
              <button type="button" className="chip sk" aria-pressed={s.boil} onClick={() => update({ boil: !s.boil })}>
                boil
              </button>
              <button type="button" className="chip sk" aria-pressed={grid} onClick={() => setGrid(!grid)}>
                grid
              </button>
            </div>
          </div>

          <label className="slider-row">
            <span className="lbl">size</span>
            <input type="range" min={12} max={256} step={1} value={s.size} onChange={(e) => update({ size: Number(e.target.value) })} />
            <span className="val hand">{s.size}px</span>
          </label>
          <label className="slider-row">
            <span className="lbl">stroke</span>
            <input type="range" min={1} max={3.5} step={0.1} value={s.stroke} onChange={(e) => update({ stroke: Number(e.target.value) })} />
            <span className="val hand">{s.stroke.toFixed(1)}</span>
          </label>
          <button type="button" className={`reset hand${custom ? "" : " invisible"}`} onClick={() => setS({ ...DEFAULTS, boil: s.boil })}>
            reset to the default pen
          </button>
        </div>

        <div className="wild">{sheet("light")}</div>
      </section>

      <section className="page page-right" aria-label="Get the code">
        <div>
          <h1 className="icon-name">{icon.name}</h1>
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
          <pre className="code" role="tabpanel" tabIndex={0}>
            {shown}
          </pre>
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
          <button type="button" className="btn sk link-btn" onClick={onLink} aria-label="Copy link to this icon" title="Copy link">
            <Glyph d={ui.link} size={18} />
          </button>
        </div>
        <p className="hand note">the code follows your colour, size and stroke on the left ✓</p>
        <div className="wild">{sheet("dark")}</div>
      </section>
    </div>
  );
}
