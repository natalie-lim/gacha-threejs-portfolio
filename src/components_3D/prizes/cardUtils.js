import * as THREE from "three";

// Shared drawing primitives + the THREE.Sprite wiring every prize card needs.
// Layout, content, and colors are entirely up to each prize file.

export const CARD_WIDTH = 512;
export const CARD_PADDING = 30;
export const CARD_FONT_SIZE = 30;
export const CARD_LINE_HEIGHT = 38;
export const SPRITE_WIDTH = 2.1;
export const SPRITE_WIDTH_MOBILE = 1.25;
export const MOBILE_BREAKPOINT = 768;

// A card sprite is flown to a point ~2 world units in front of a 75° camera, so
// the visible height there is fixed (~3.07 units) but the visible width is that
// times the viewport's aspect ratio. On a portrait phone only ~1.7 units are in
// frame, so the desktop width would hang off both edges — use a narrower card.
export function getSpriteWidth() {
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    return SPRITE_WIDTH_MOBILE;
  } else {
    return SPRITE_WIDTH;
  }
}

export function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

// Paint an <img> or <video> inside its slot at the source's own aspect ratio,
// centered and corner-rounded, rather than stretching it to fill. Only bites when
// a slot was laid out before the source's dimensions were known — the layout is
// locked by then, so the image has to give way, and letterboxing beats distortion.
export function drawContained(ctx, source, slotX, slotY, slotW, slotH) {
  const srcW = source.naturalWidth || source.videoWidth;
  const srcH = source.naturalHeight || source.videoHeight;
  const scale = Math.min(slotW / srcW, slotH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  const x = slotX + (slotW - w) / 2;
  const y = slotY + (slotH - h) / 2;
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, 16);
  ctx.clip();
  ctx.drawImage(source, x, y, w, h);
  ctx.restore();
}

export function getWrappedLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  lines.push(line);
  return lines;
}

export function drawWrappedLines(ctx, lines, x, y, lineHeight) {
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return { h, s: s * 100, l: l * 100 };
}

// Same hue as the source color, pushed toward a barely-there pastel tint.
export function pastelize(hex) {
  const { h } = hexToHsl(hex);
  return `hsl(${h}, 30%, 95%)`;
}

// Same hue and saturation as the source color, just darkened for contrast.
export function darken(hex) {
  const { h, s } = hexToHsl(hex);
  return `hsl(${h}, ${s}%, 25%)`;
}

export function drawCardBackground(ctx, canvas, borderColor = "#0e4749") {
  ctx.fillStyle = pastelize(borderColor);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 10;
  drawRoundedRect(ctx, 8, 8, canvas.width - 16, canvas.height - 16, 28);
  ctx.fill();
  ctx.stroke();
}

// Wraps a canvas in the THREE.Sprite + CanvasTexture the gacha break animation
// expects, and seeds userData.targetScale from the canvas's current size.
// Call updateCardScale after any later resize (e.g. once an async image loads).
export function createCardSprite(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  // The canvas is drawn in sRGB; tag the texture so the renderer converts it
  // correctly instead of treating the pixels as linear (which oversaturates).
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      // The renderer runs ACES filmic tone mapping for the gacha machine, and it
      // applies to sprites too. That's a film-emulation curve meant for lit 3D
      // geometry: it rolls off and desaturates vivid colors, pushing saturated
      // pinks and reds toward orange. A card is flat UI, so opt it out and let
      // the canvas pixels reach the screen as drawn.
      toneMapped: false,
    }),
  );
  sprite.userData.targetScale = new THREE.Vector2();
  updateCardScale(sprite, canvas);
  return { sprite, texture };
}

// Read at card-build time (not at import), so a device rotated between pops
// gets the width that matches the viewport it's about to be shown in.
export function updateCardScale(sprite, canvas) {
  const width = getSpriteWidth();
  sprite.userData.targetScale.set(width, width * (canvas.height / canvas.width));
}
