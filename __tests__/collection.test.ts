import { describe, test, expect, beforeEach } from "bun:test";

/**
 * Tests for collection logic.
 * Since expo-sqlite requires native runtime, we test the logic
 * by simulating the database operations with an in-memory Map.
 * This mirrors the exact behavior of database/db.ts.
 */
class MockCollection {
  private data = new Map<string, number>();

  addSticker(code: string): void {
    const current = this.data.get(code) ?? 0;
    this.data.set(code, current + 1);
  }

  removeSticker(code: string): void {
    const current = this.data.get(code) ?? 0;
    if (current <= 1) {
      this.data.delete(code);
    } else {
      this.data.set(code, current - 1);
    }
  }

  isOwned(code: string): boolean {
    return this.data.has(code);
  }

  getQuantity(code: string): number {
    return this.data.get(code) ?? 0;
  }

  getOwnedCount(): number {
    return this.data.size;
  }

  getDuplicates(): Map<string, number> {
    const dupes = new Map<string, number>();
    for (const [code, qty] of this.data) {
      if (qty > 1) {
        dupes.set(code, qty - 1);
      }
    }
    return dupes;
  }

  searchOwned(query: string): { code: string; quantity: number }[] {
    const upper = query.toUpperCase();
    const results: { code: string; quantity: number }[] = [];
    for (const [code, quantity] of this.data) {
      if (code.startsWith(upper)) {
        results.push({ code, quantity });
      }
    }
    return results.sort((a, b) => a.code.localeCompare(b.code));
  }
}

describe("Collection Logic", () => {
  let collection: MockCollection;

  beforeEach(() => {
    collection = new MockCollection();
  });

  describe("addSticker", () => {
    test("should add a new sticker with quantity 1", () => {
      collection.addSticker("BRA1");
      expect(collection.isOwned("BRA1")).toBe(true);
      expect(collection.getQuantity("BRA1")).toBe(1);
    });

    test("should increment quantity when adding existing sticker", () => {
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      expect(collection.getQuantity("BRA1")).toBe(2);
    });

    test("should handle multiple different stickers", () => {
      collection.addSticker("BRA1");
      collection.addSticker("ARG5");
      collection.addSticker("FWC3");
      expect(collection.getOwnedCount()).toBe(3);
    });
  });

  describe("removeSticker", () => {
    test("should remove sticker completely when quantity is 1", () => {
      collection.addSticker("BRA1");
      collection.removeSticker("BRA1");
      expect(collection.isOwned("BRA1")).toBe(false);
      expect(collection.getQuantity("BRA1")).toBe(0);
    });

    test("should decrement quantity when more than 1", () => {
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      collection.removeSticker("BRA1");
      expect(collection.getQuantity("BRA1")).toBe(2);
    });

    test("should handle removing non-existent sticker gracefully", () => {
      collection.removeSticker("BRA1");
      expect(collection.isOwned("BRA1")).toBe(false);
    });
  });

  describe("getOwnedCount", () => {
    test("should return 0 for empty collection", () => {
      expect(collection.getOwnedCount()).toBe(0);
    });

    test("should count unique stickers, not total quantity", () => {
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      collection.addSticker("ARG5");
      expect(collection.getOwnedCount()).toBe(2);
    });
  });

  describe("getDuplicates", () => {
    test("should return empty map when no duplicates", () => {
      collection.addSticker("BRA1");
      collection.addSticker("ARG5");
      const dupes = collection.getDuplicates();
      expect(dupes.size).toBe(0);
    });

    test("should return extras count (quantity - 1)", () => {
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      const dupes = collection.getDuplicates();
      expect(dupes.get("BRA1")).toBe(2);
    });

    test("should only include stickers with quantity > 1", () => {
      collection.addSticker("BRA1");
      collection.addSticker("BRA1");
      collection.addSticker("ARG5");
      const dupes = collection.getDuplicates();
      expect(dupes.has("BRA1")).toBe(true);
      expect(dupes.has("ARG5")).toBe(false);
    });
  });

  describe("searchOwned", () => {
    beforeEach(() => {
      collection.addSticker("BRA1");
      collection.addSticker("BRA5");
      collection.addSticker("BRA10");
      collection.addSticker("ARG3");
      collection.addSticker("FWC1");
    });

    test("should find stickers by prefix", () => {
      const results = collection.searchOwned("BRA");
      expect(results.length).toBe(3);
      expect(results.map((r) => r.code)).toEqual(["BRA1", "BRA10", "BRA5"]);
    });

    test("should find exact sticker code", () => {
      const results = collection.searchOwned("BRA1");
      expect(results.length).toBe(2);
      expect(results.map((r) => r.code)).toContain("BRA1");
      expect(results.map((r) => r.code)).toContain("BRA10");
    });

    test("should return empty when no match", () => {
      const results = collection.searchOwned("ESP");
      expect(results.length).toBe(0);
    });

    test("should be case-insensitive", () => {
      const results = collection.searchOwned("bra");
      expect(results.length).toBe(3);
    });

    test("should find FWC stickers", () => {
      const results = collection.searchOwned("FWC");
      expect(results.length).toBe(1);
      expect(results[0].code).toBe("FWC1");
    });

    test("should not return stickers user does not own", () => {
      const results = collection.searchOwned("BRA2");
      expect(results.length).toBe(0);
    });
  });
});

describe("Export format", () => {
  test("should format duplicates as PREFIX NUM1, NUM2;PREFIX2 NUM1, NUM2", () => {
    const duplicates = [
      { code: "ESP1", extras: 2 },
      { code: "ESP3", extras: 1 },
      { code: "BRA4", extras: 1 },
      { code: "BRA6", extras: 3 },
    ];

    const grouped = new Map<string, number[]>();
    for (const { code, extras } of duplicates) {
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
    for (const [prefix, nums] of Array.from(grouped.entries()).sort()) {
      nums.sort((a, b) => a - b);
      lines.push(`${prefix} ${nums.join(", ")}`);
    }
    const content = lines.join(";\n");

    expect(content).toBe("BRA 4, 6, 6, 6;\nESP 1, 1, 3");
  });

  test("should handle single sticker export", () => {
    const duplicates = [{ code: "ARG10", extras: 1 }];

    const grouped = new Map<string, number[]>();
    for (const { code, extras } of duplicates) {
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
    for (const [prefix, nums] of Array.from(grouped.entries()).sort()) {
      nums.sort((a, b) => a - b);
      lines.push(`${prefix} ${nums.join(", ")}`);
    }
    const content = lines.join(";\n");

    expect(content).toBe("ARG 10");
  });
});
