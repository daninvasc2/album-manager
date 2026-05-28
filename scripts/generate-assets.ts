import { writeFileSync, mkdirSync } from "fs";

// Minimal valid PNG (1x1 pixel, dark blue #1a1a2e)
function createMinimalPng(width: number, height: number, r: number, g: number, b: number): Buffer {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk("IHDR", ihdrData);

  // IDAT chunk (raw image data)
  const rawData: number[] = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte (none)
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b);
    }
  }

  // Compress with deflate (zlib)
  const { deflateSync } = require("zlib");
  const compressed = deflateSync(Buffer.from(rawData));
  const idat = createChunk("IDAT", compressed);

  // IEND chunk
  const iend = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);

  // CRC32
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Create assets directory
mkdirSync("assets", { recursive: true });

// Generate placeholder images
const icon = createMinimalPng(1024, 1024, 0x1a, 0x1a, 0x2e);
const splash = createMinimalPng(1284, 2778, 0x1a, 0x1a, 0x2e);
const adaptiveIcon = createMinimalPng(1024, 1024, 0x1a, 0x1a, 0x2e);

writeFileSync("assets/icon.png", icon);
writeFileSync("assets/splash.png", splash);
writeFileSync("assets/adaptive-icon.png", adaptiveIcon);

console.log("✓ Assets generated:");
console.log("  - assets/icon.png (1024x1024)");
console.log("  - assets/splash.png (1284x2778)");
console.log("  - assets/adaptive-icon.png (1024x1024)");
