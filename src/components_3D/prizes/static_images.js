import {
  CARD_WIDTH,
  CARD_PADDING,
  CARD_FONT_SIZE,
  CARD_LINE_HEIGHT,
  getWrappedLines,
  drawWrappedLines,
  drawCardBackground,
  drawContained,
  createCardSprite,
  darken,
} from "./cardUtils";

// A reusable card type: one or more images stacked over a caption, each image
// sized to its own real aspect ratio. Call this once per card (see index.js)
// with the image paths and caption; it returns a prize function that gacha.js
// invokes with the popped gumball's border color, carrying a .preload() that
// fetches the images without building anything.
const IMAGE_WIDTH = 260;
const IMAGE_GAP = 16;
const TEXT_GAP = 50;

function isLoaded(img) {
  return img.complete && img.naturalWidth > 0;
}

function imageHeight(img) {
  return isLoaded(img) ? IMAGE_WIDTH * (img.naturalHeight / img.naturalWidth) : IMAGE_WIDTH;
}

export default function createStaticImagesPrize({ imagePaths, text }) {
  // Nothing is fetched at import. These are multi-megabyte photos, and someone
  // who never turns the crank shouldn't pay to download every prize on the site.
  // gacha.js calls preload() on the first crank pull instead, which leaves the
  // roll and flight animations (~1.2s at the very least) to fetch and decode.
  let images = null;

  // Idempotent: the Image objects are created once and reused by every card, so
  // repeat pops of the same prize come from cache.
  function loadImages() {
    if (!images) {
      images = imagePaths.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
      });
    }
    return images;
  }

  function createCard(borderColor = "#0e4749") {
    const preloadedImages = loadImages();
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${CARD_FONT_SIZE}px sans-serif`;
    const lines = getWrappedLines(ctx, text, canvas.width - 80);

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
      drawCardBackground(ctx, canvas, borderColor);

      let y = CARD_PADDING;
      preloadedImages.forEach((img, i) => {
        const h = imageHeights[i];
        if (isLoaded(img)) drawContained(ctx, img, imageX, y, IMAGE_WIDTH, h);
        y += h + IMAGE_GAP;
      });

      ctx.fillStyle = darken(borderColor);
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

  // Warms the cache without building anything. Safe to call repeatedly.
  createCard.preload = loadImages;

  return createCard;
}
