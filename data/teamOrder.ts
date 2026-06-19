import { ALBUM_DATA } from "./album";

/** Flat list of all team codes in group order */
export const ALL_TEAMS_ORDERED = ALBUM_DATA.groups.flatMap((g) => g.teams);

/** Get previous and next team codes for navigation */
export function getTeamNavigation(code: string): { prev: string | null; next: string | null; prevName: string; nextName: string } {
  const index = ALL_TEAMS_ORDERED.findIndex((t) => t.code === code);
  if (index === -1) return { prev: null, next: null, prevName: "", nextName: "" };

  const prevTeam = index > 0 ? ALL_TEAMS_ORDERED[index - 1] : null;
  const nextTeam = index < ALL_TEAMS_ORDERED.length - 1 ? ALL_TEAMS_ORDERED[index + 1] : null;

  return {
    prev: prevTeam?.code ?? null,
    next: nextTeam?.code ?? null,
    prevName: prevTeam?.name ?? "",
    nextName: nextTeam?.name ?? "",
  };
}

/** Order codes following group order (for export/display) */
export function orderCodesByGroup(codes: { code: string; extras: number }[]): { code: string; extras: number }[] {
  const codeMap = new Map(codes.map((c) => [c.code, c]));
  const ordered: { code: string; extras: number }[] = [];

  // Special stickers first
  for (const s of ["00", ...ALBUM_DATA.fwcStickers]) {
    if (codeMap.has(s)) ordered.push(codeMap.get(s)!);
  }

  // Teams in group order
  for (const group of ALBUM_DATA.groups) {
    for (const team of group.teams) {
      for (const sticker of team.stickers) {
        if (codeMap.has(sticker)) ordered.push(codeMap.get(sticker)!);
      }
    }
  }

  // CC last
  for (const s of ALBUM_DATA.ccStickers) {
    if (codeMap.has(s)) ordered.push(codeMap.get(s)!);
  }

  return ordered;
}

/** Generate clipboard text in group order */
export function formatForClipboard(items: { code: string; extras: number }[]): string {
  const ordered = orderCodesByGroup(items);

  // Group by prefix maintaining insertion order
  const grouped = new Map<string, number[]>();
  for (const { code, extras } of ordered) {
    const match = code.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const [, prefix, num] = match;
      if (!grouped.has(prefix)) grouped.set(prefix, []);
      for (let i = 0; i < extras; i++) {
        grouped.get(prefix)!.push(parseInt(num));
      }
    }
  }

  const lines: string[] = [];
  for (const [prefix, nums] of grouped) {
    nums.sort((a, b) => a - b);
    lines.push(`${prefix} ${nums.join(", ")}`);
  }
  return lines.join("; ");
}
