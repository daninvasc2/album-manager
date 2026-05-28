import { describe, test, expect } from "bun:test";
import { ALBUM_DATA, TOTAL_STICKERS, getAllStickerCodes } from "../data/album";

describe("Album Data", () => {
  test("should have exactly 1 special sticker (00)", () => {
    expect(ALBUM_DATA.specialStickers).toEqual(["00"]);
    expect(ALBUM_DATA.specialStickers.length).toBe(1);
  });

  test("should have 19 FWC stickers (FWC1 to FWC19)", () => {
    expect(ALBUM_DATA.fwcStickers.length).toBe(19);
    expect(ALBUM_DATA.fwcStickers[0]).toBe("FWC1");
    expect(ALBUM_DATA.fwcStickers[18]).toBe("FWC19");
  });

  test("should have 14 CC stickers (CC1 to CC14)", () => {
    expect(ALBUM_DATA.ccStickers.length).toBe(14);
    expect(ALBUM_DATA.ccStickers[0]).toBe("CC1");
    expect(ALBUM_DATA.ccStickers[13]).toBe("CC14");
  });

  test("should have 12 groups (A to L)", () => {
    expect(ALBUM_DATA.groups.length).toBe(12);
    const groupIds = ALBUM_DATA.groups.map((g) => g.id);
    expect(groupIds).toEqual(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]);
  });

  test("each group should have exactly 4 teams", () => {
    for (const group of ALBUM_DATA.groups) {
      expect(group.teams.length).toBe(4);
    }
  });

  test("should have 48 teams total", () => {
    const totalTeams = ALBUM_DATA.groups.reduce((sum, g) => sum + g.teams.length, 0);
    expect(totalTeams).toBe(48);
  });

  test("each team should have exactly 20 stickers", () => {
    for (const group of ALBUM_DATA.groups) {
      for (const team of group.teams) {
        expect(team.stickers.length).toBe(20);
      }
    }
  });

  test("team stickers should follow the pattern CODE1 to CODE20", () => {
    const brazil = ALBUM_DATA.groups
      .flatMap((g) => g.teams)
      .find((t) => t.code === "BRA");

    expect(brazil).toBeDefined();
    expect(brazil!.stickers[0]).toBe("BRA1");
    expect(brazil!.stickers[19]).toBe("BRA20");
  });

  test("TOTAL_STICKERS should be 994", () => {
    expect(TOTAL_STICKERS).toBe(994);
  });

  test("getAllStickerCodes should return 994 unique codes", () => {
    const codes = getAllStickerCodes();
    expect(codes.length).toBe(994);
    const unique = new Set(codes);
    expect(unique.size).toBe(994);
  });

  test("getAllStickerCodes should include special, FWC, team, and CC stickers", () => {
    const codes = getAllStickerCodes();
    expect(codes).toContain("00");
    expect(codes).toContain("FWC1");
    expect(codes).toContain("FWC19");
    expect(codes).toContain("BRA1");
    expect(codes).toContain("ARG20");
    expect(codes).toContain("CC1");
    expect(codes).toContain("CC14");
  });

  describe("Team codes from PDF", () => {
    const expectedTeams: Record<string, string> = {
      MEX: "México",
      RSA: "África do Sul",
      KOR: "Coreia do Sul",
      CZE: "Rep. Tcheca",
      CAN: "Canadá",
      BIH: "Bósnia",
      QAT: "Catar",
      SUI: "Suíça",
      BRA: "Brasil",
      MAR: "Marrocos",
      HAI: "Haiti",
      SCO: "Escócia",
      USA: "Estados Unidos",
      PAR: "Paraguai",
      AUS: "Austrália",
      TUR: "Turquia",
      GER: "Alemanha",
      CUW: "Curaçao",
      CIV: "Costa do Marfim",
      ECU: "Equador",
      NED: "Holanda",
      JPN: "Japão",
      SWE: "Suécia",
      TUN: "Tunísia",
      BEL: "Bélgica",
      EGY: "Egito",
      IRN: "Irã",
      NZL: "Nova Zelândia",
      ESP: "Espanha",
      CPV: "Cabo Verde",
      KSA: "Arábia Saudita",
      URU: "Uruguai",
      FRA: "França",
      SEN: "Senegal",
      IRQ: "Iraque",
      NOR: "Noruega",
      ARG: "Argentina",
      ALG: "Argélia",
      AUT: "Áustria",
      JOR: "Jordânia",
      POR: "Portugal",
      COD: "Congo",
      UZB: "Uzbequistão",
      COL: "Colômbia",
      ENG: "Inglaterra",
      CRO: "Croácia",
      GHA: "Gana",
      PAN: "Panamá",
    };

    test("should have all 48 teams with correct codes and names", () => {
      const allTeams = ALBUM_DATA.groups.flatMap((g) => g.teams);
      for (const [code, name] of Object.entries(expectedTeams)) {
        const team = allTeams.find((t) => t.code === code);
        expect(team).toBeDefined();
        expect(team!.name).toBe(name);
      }
    });
  });

  describe("Group assignments from PDF", () => {
    test("Group A: MEX, RSA, KOR, CZE", () => {
      const groupA = ALBUM_DATA.groups.find((g) => g.id === "A");
      const codes = groupA!.teams.map((t) => t.code);
      expect(codes).toEqual(["MEX", "RSA", "KOR", "CZE"]);
    });

    test("Group C: BRA, MAR, HAI, SCO", () => {
      const groupC = ALBUM_DATA.groups.find((g) => g.id === "C");
      const codes = groupC!.teams.map((t) => t.code);
      expect(codes).toEqual(["BRA", "MAR", "HAI", "SCO"]);
    });

    test("Group L: ENG, CRO, GHA, PAN", () => {
      const groupL = ALBUM_DATA.groups.find((g) => g.id === "L");
      const codes = groupL!.teams.map((t) => t.code);
      expect(codes).toEqual(["ENG", "CRO", "GHA", "PAN"]);
    });
  });
});
