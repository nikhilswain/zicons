import type { Icon } from "../data/icons";

export function searchIcons<T extends Pick<Icon, "name" | "group" | "tags">>(list: T[], query: string, group: string | null): T[] {
  const inGroup = group ? list.filter((i) => i.group === group) : list;
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return inGroup;
  const q = tokens.join(" ");
  const qDash = tokens.join("-");
  const hits = inGroup.filter((i) =>
    tokens.every((t) => i.name.includes(t) || i.tags.some((tag) => tag.split(" ").some((w) => w.startsWith(t)) || tag.startsWith(t))),
  );
  const rank = (i: T) => (i.name === q || i.name === qDash ? 0 : i.name.startsWith(tokens[0]) ? 1 : i.name.includes(tokens[0]) ? 2 : 3);
  return hits.map((i, k) => ({ i, k, r: rank(i) })).sort((a, b) => a.r - b.r || a.k - b.k).map((x) => x.i);
}
