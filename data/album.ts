export interface Team {
  name: string;
  code: string;
  stickers: string[];
}

export interface Group {
  id: string;
  teams: Team[];
}

export interface AlbumData {
  specialStickers: string[];
  fwcStickers: string[];
  ccStickers: string[];
  groups: Group[];
}

function generateStickers(code: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${code}${i + 1}`);
}

export const ALBUM_DATA: AlbumData = {
  specialStickers: ["00"],
  fwcStickers: generateStickers("FWC", 19),
  ccStickers: generateStickers("CC", 14),
  groups: [
    {
      id: "A",
      teams: [
        { name: "México", code: "MEX", stickers: generateStickers("MEX", 20) },
        { name: "África do Sul", code: "RSA", stickers: generateStickers("RSA", 20) },
        { name: "Coreia do Sul", code: "KOR", stickers: generateStickers("KOR", 20) },
        { name: "Rep. Tcheca", code: "CZE", stickers: generateStickers("CZE", 20) },
      ],
    },
    {
      id: "B",
      teams: [
        { name: "Canadá", code: "CAN", stickers: generateStickers("CAN", 20) },
        { name: "Bósnia", code: "BIH", stickers: generateStickers("BIH", 20) },
        { name: "Catar", code: "QAT", stickers: generateStickers("QAT", 20) },
        { name: "Suíça", code: "SUI", stickers: generateStickers("SUI", 20) },
      ],
    },
    {
      id: "C",
      teams: [
        { name: "Brasil", code: "BRA", stickers: generateStickers("BRA", 20) },
        { name: "Marrocos", code: "MAR", stickers: generateStickers("MAR", 20) },
        { name: "Haiti", code: "HAI", stickers: generateStickers("HAI", 20) },
        { name: "Escócia", code: "SCO", stickers: generateStickers("SCO", 20) },
      ],
    },
    {
      id: "D",
      teams: [
        { name: "Estados Unidos", code: "USA", stickers: generateStickers("USA", 20) },
        { name: "Paraguai", code: "PAR", stickers: generateStickers("PAR", 20) },
        { name: "Austrália", code: "AUS", stickers: generateStickers("AUS", 20) },
        { name: "Turquia", code: "TUR", stickers: generateStickers("TUR", 20) },
      ],
    },
    {
      id: "E",
      teams: [
        { name: "Alemanha", code: "GER", stickers: generateStickers("GER", 20) },
        { name: "Curaçao", code: "CUW", stickers: generateStickers("CUW", 20) },
        { name: "Costa do Marfim", code: "CIV", stickers: generateStickers("CIV", 20) },
        { name: "Equador", code: "ECU", stickers: generateStickers("ECU", 20) },
      ],
    },
    {
      id: "F",
      teams: [
        { name: "Holanda", code: "NED", stickers: generateStickers("NED", 20) },
        { name: "Japão", code: "JPN", stickers: generateStickers("JPN", 20) },
        { name: "Suécia", code: "SWE", stickers: generateStickers("SWE", 20) },
        { name: "Tunísia", code: "TUN", stickers: generateStickers("TUN", 20) },
      ],
    },
    {
      id: "G",
      teams: [
        { name: "Bélgica", code: "BEL", stickers: generateStickers("BEL", 20) },
        { name: "Egito", code: "EGY", stickers: generateStickers("EGY", 20) },
        { name: "Irã", code: "IRN", stickers: generateStickers("IRN", 20) },
        { name: "Nova Zelândia", code: "NZL", stickers: generateStickers("NZL", 20) },
      ],
    },
    {
      id: "H",
      teams: [
        { name: "Espanha", code: "ESP", stickers: generateStickers("ESP", 20) },
        { name: "Cabo Verde", code: "CPV", stickers: generateStickers("CPV", 20) },
        { name: "Arábia Saudita", code: "KSA", stickers: generateStickers("KSA", 20) },
        { name: "Uruguai", code: "URU", stickers: generateStickers("URU", 20) },
      ],
    },
    {
      id: "I",
      teams: [
        { name: "França", code: "FRA", stickers: generateStickers("FRA", 20) },
        { name: "Senegal", code: "SEN", stickers: generateStickers("SEN", 20) },
        { name: "Iraque", code: "IRQ", stickers: generateStickers("IRQ", 20) },
        { name: "Noruega", code: "NOR", stickers: generateStickers("NOR", 20) },
      ],
    },
    {
      id: "J",
      teams: [
        { name: "Argentina", code: "ARG", stickers: generateStickers("ARG", 20) },
        { name: "Argélia", code: "ALG", stickers: generateStickers("ALG", 20) },
        { name: "Áustria", code: "AUT", stickers: generateStickers("AUT", 20) },
        { name: "Jordânia", code: "JOR", stickers: generateStickers("JOR", 20) },
      ],
    },
    {
      id: "K",
      teams: [
        { name: "Portugal", code: "POR", stickers: generateStickers("POR", 20) },
        { name: "Congo", code: "COD", stickers: generateStickers("COD", 20) },
        { name: "Uzbequistão", code: "UZB", stickers: generateStickers("UZB", 20) },
        { name: "Colômbia", code: "COL", stickers: generateStickers("COL", 20) },
      ],
    },
    {
      id: "L",
      teams: [
        { name: "Inglaterra", code: "ENG", stickers: generateStickers("ENG", 20) },
        { name: "Croácia", code: "CRO", stickers: generateStickers("CRO", 20) },
        { name: "Gana", code: "GHA", stickers: generateStickers("GHA", 20) },
        { name: "Panamá", code: "PAN", stickers: generateStickers("PAN", 20) },
      ],
    },
  ],
};

/** Total number of stickers in the album */
export const TOTAL_STICKERS =
  ALBUM_DATA.specialStickers.length +
  ALBUM_DATA.fwcStickers.length +
  ALBUM_DATA.ccStickers.length +
  ALBUM_DATA.groups.reduce(
    (sum, group) => sum + group.teams.reduce((s, team) => s + team.stickers.length, 0),
    0
  );

/** Get all sticker codes as a flat array */
export function getAllStickerCodes(): string[] {
  const teamStickers = ALBUM_DATA.groups.flatMap((g) =>
    g.teams.flatMap((t) => t.stickers)
  );
  return [
    ...ALBUM_DATA.specialStickers,
    ...ALBUM_DATA.fwcStickers,
    ...teamStickers,
    ...ALBUM_DATA.ccStickers,
  ];
}
