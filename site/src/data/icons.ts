import raw from "zicons/icons.json";

export type Icon = { name: string; group: string; groupTitle: string; tags: string[]; d: string };

export const icons: Icon[] = raw as Icon[];
export const iconByName = new Map(icons.map((i) => [i.name, i]));
const indexOf = new Map(icons.map((i, k) => [i.name, k]));

export const groups = [...new Map(icons.map((i) => [i.group, i.groupTitle]))].map(([key, title]) => ({
  key,
  title,
  count: icons.filter((i) => i.group === key).length,
}));

export function getIcon(name: string): Icon {
  const icon = iconByName.get(name);
  if (!icon) throw new Error(`Unknown icon "${name}"`);
  return icon;
}

export function related(name: string, n = 6): Icon[] {
  const me = getIcon(name);
  const at = indexOf.get(name)!;
  const tags = new Set(me.tags);
  return icons
    .filter((i) => i.name !== name)
    .map((i) => ({
      i,
      score: 2 * i.tags.filter((t) => tags.has(t)).length + (i.group === me.group ? 1 : 0),
      dist: Math.abs(indexOf.get(i.name)! - at),
    }))
    .sort((a, b) => b.score - a.score || a.dist - b.dist)
    .slice(0, n)
    .map((x) => x.i);
}

export function trail(name: string): Icon[] {
  const r = related(name, 6);
  return [r[1], r[3], r[5], getIcon(name), r[4], r[2], r[0]].filter(Boolean);
}

export function neighbours(name: string): { prev: Icon; next: Icon } {
  const at = indexOf.get(name)!;
  return {
    prev: icons[(at - 1 + icons.length) % icons.length],
    next: icons[(at + 1) % icons.length],
  };
}
