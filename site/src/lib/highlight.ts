export type Token = { kind: "str" | "tag" | "kw" | "attr" | "num" | "punct" | "text"; text: string };

const PATTERN =
  /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(<\/?)([A-Za-z][\w.-]*)|\b(export|function|return|let|const|import|from|default|true|false|null|undefined)\b|([A-Za-z_:@][\w:.-]*)(?==)|(\b\d+(?:\.\d+)?\b)|([{}()<>/=;,])/g;

export function tokenize(code: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(PATTERN)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: "text", text: code.slice(last, at) });
    if (m[1]) out.push({ kind: "str", text: m[1] });
    else if (m[2]) out.push({ kind: "punct", text: m[2] }, { kind: "tag", text: m[3] });
    else if (m[4]) out.push({ kind: "kw", text: m[4] });
    else if (m[5]) out.push({ kind: "attr", text: m[5] });
    else if (m[6]) out.push({ kind: "num", text: m[6] });
    else out.push({ kind: "punct", text: m[7] });
    last = at + m[0].length;
  }
  if (last < code.length) out.push({ kind: "text", text: code.slice(last) });
  return out;
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function highlightHtml(code: string): string {
  return tokenize(code)
    .map((t) => (t.kind === "text" ? escape(t.text) : `<span class="tk-${t.kind}">${escape(t.text)}</span>`))
    .join("");
}
