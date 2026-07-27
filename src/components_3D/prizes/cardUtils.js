import * as THREE from "three";

// Shared drawing primitives + the THREE.Sprite wiring every prize card needs.
// Layout, content, and colors are entirely up to each prize file.

export const CARD_WIDTH = 512;
export const CARD_PADDING = 30;
export const CARD_FONT_SIZE = 30;
export const CARD_LINE_HEIGHT = 38;
export const SPRITE_WIDTH = 2.1;

export function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
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
    new THREE.SpriteMaterial({ map: texture, transparent: true }),
  );
  sprite.userData.targetScale = new THREE.Vector2();
  updateCardScale(sprite, canvas);
  return { sprite, texture };
}

export function updateCardScale(sprite, canvas) {
  sprite.userData.targetScale.set(
    SPRITE_WIDTH,
    SPRITE_WIDTH * (canvas.height / canvas.width),
  );
}
