const sharp = require("sharp");
const fs = require("fs");

// Luminance thresholds for separating dark "ink" from the light background.
const T_BG = 232;   // luminance >= this  -> fully transparent (background)
const T_INK = 90;   // luminance <= this  -> fully opaque (ink)

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function processLogo(src, baseName) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const inkBuf = Buffer.alloc(width * height * 4);
  const whiteBuf = Buffer.alloc(width * height * 4);

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const L = lum(r, g, b);

      // continuous alpha for smooth anti-aliased edges
      let a = ((T_BG - L) / (T_BG - T_INK)) * 255;
      a = Math.max(0, Math.min(255, Math.round(a)));

      const o = (y * width + x) * 4;
      // ink version keeps original brand color
      inkBuf[o] = r; inkBuf[o + 1] = g; inkBuf[o + 2] = b; inkBuf[o + 3] = a;
      // white version for dark backgrounds
      whiteBuf[o] = 255; whiteBuf[o + 1] = 255; whiteBuf[o + 2] = 255; whiteBuf[o + 3] = a;

      if (a > 20) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) throw new Error("No foreground pixels found in " + src);

  // padding around content (proportional, small)
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;

  const mk = (buf) =>
    sharp(buf, { raw: { width, height, channels: 4 } })
      .extract({ left: minX, top: minY, width: cw, height: ch });

  await mk(inkBuf).png().toFile(`assets/${baseName}.png`);
  await mk(whiteBuf).png().toFile(`assets/${baseName}-white.png`);

  console.log(`${baseName}: cropped to ${cw}x${ch}`);
  return { cw, ch };
}

(async () => {
  await processLogo("autoniq-long-logo.png", "autoniq-wordmark");
  await processLogo("autoniq-short-logo.png", "autoniq-mark");

  // Favicons from the mark (ink, transparent)
  await sharp("assets/autoniq-mark.png")
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("assets/favicon-64.png");

  await sharp("assets/autoniq-mark.png")
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile("assets/favicon-32.png");

  // Apple touch icon: white mark on brand navy rounded square
  const navy = { r: 13, g: 39, b: 72, alpha: 1 };
  const markWhite = await sharp("assets/autoniq-mark-white.png")
    .resize(120, 120, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: navy },
  })
    .composite([{ input: markWhite, gravity: "center" }])
    .png()
    .toFile("assets/apple-touch-icon.png");

  console.log("favicons created");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
