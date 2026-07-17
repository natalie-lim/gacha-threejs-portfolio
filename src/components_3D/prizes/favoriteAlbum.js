import {
  CARD_WIDTH,
  CARD_PADDING,
  CARD_FONT_SIZE,
  CARD_LINE_HEIGHT,
  getWrappedLines,
  drawWrappedLines,
  drawCardBackground,
  drawRoundedRect,
  createCardSprite,
} from "./cardUtils";

// This card is entirely custom: two images (cover on top, Spotify code below)
// stacked over the caption, each sized to its own real aspect ratio.
const TEXT = "current fave album: some things never leave by annabelle dinda";
const IMAGE_PATHS = ["/prizes/album_cover.jpeg", "/prizes/album_code.jpeg"];

const IMAGE_WIDTH = 260;
const IMAGE_GAP = 16;
const TEXT_GAP = 50;

// Preloaded as soon as this module is imported — long before any prize can
// actually be popped — so real aspect ratios are already known by the time a
// card is built. The canvas/sprite are sized once and never resized again:
// resizing after the pop-in animation had already started is what caused a
// visible "double card" glitch (the sprite's scale target jumping mid-tween).
const preloadedImages = IMAGE_PATHS.map((src) => {
  const img = new Image();
  img.src = src;
  return img;
});

function isLoaded(img) {
  return img.complete && img.naturalWidth > 0;
}

function imageHeight(img) {
  return isLoaded(img) ? IMAGE_WIDTH * (img.naturalHeight / img.naturalWidth) : IMAGE_WIDTH;
}

export default function createFavoriteAlbumPrize() {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  const ctx = canvas.getContext("2d");
  ctx.font = `bold ${CARD_FONT_SIZE}px sans-serif`;
  const lines = getWrappedLines(ctx, TEXT, canvas.width - 80);

  // Layout is locked in up front from whatever is known right now (a square
  // placeholder for any image still mid-load) and never recalculated.
  const imageHeights = preloadedImages.map(imageHeight);
  const imagesBlockHeight =
    imageHeights.reduce((sum, h) => sum + h, 0) +
    (preloadedImages.length - 1) * IMAGE_GAP;
  canvas.height =
    CARD_PADDING +
    imagesBlockHeight +
    TEXT_GAP +
    lines.length * CARD_LINE_HEIGHT +
    CARD_PADDING;

  const { sprite, texture } = createCardSprite(canvas);
  const imageX = (canvas.width - IMAGE_WIDTH) / 2;

  function draw() {
    drawCardBackground(ctx, canvas);

    let y = CARD_PADDING;
    preloadedImages.forEach((img, i) => {
      const h = imageHeights[i];
      if (isLoaded(img)) {
        ctx.save();
        drawRoundedRect(ctx, imageX, y, IMAGE_WIDTH, h, 16);
        ctx.clip();
        ctx.drawImage(img, imageX, y, IMAGE_WIDTH, h);
        ctx.restore();
      }
      y += h + IMAGE_GAP;
    });

    ctx.fillStyle = "#0e4749";
    ctx.font = `bold ${CARD_FONT_SIZE}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textY =
      CARD_PADDING + imagesBlockHeight + TEXT_GAP + (lines.length * CARD_LINE_HEIGHT) / 2;
    drawWrappedLines(ctx, lines, canvas.width / 2, textY, CARD_LINE_HEIGHT);
    texture.needsUpdate = true;
  }

  draw();
  preloadedImages.forEach((img) => {
    if (!isLoaded(img)) img.addEventListener("load", draw, { once: true });
  });

  return sprite;
}
