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

// This card plays a looping video above the caption. Since the card is a
// <canvas> baked into a THREE.CanvasTexture (not a DOM element), the video
// can't be a <video> tag — instead we draw the current video frame onto the
// canvas every animation frame and flag the texture for re-upload.
const TEXT = "Lifelong ice skater!";
const VIDEO_PATH = "/prizes/skating.mp4";

const VIDEO_WIDTH = 260;
const TEXT_GAP = 50;

// One shared, muted, looping video. Muted + playsInline is what lets it autoplay
// without a user gesture and without going fullscreen on iOS.
//
// Only the metadata is fetched at import — a few KB of header, enough to know the
// real aspect ratio before any card is popped (the layout is locked in at build
// time and can't be redone later). The multi-megabyte body waits for preload(),
// which gacha.js calls on the first crank pull.
const video = document.createElement("video");
video.src = VIDEO_PATH;
video.muted = true;
video.loop = true;
video.playsInline = true;
video.setAttribute("playsinline", "");
video.preload = "metadata";
video.load();

let warmed = false;

function videoReady() {
  // readyState >= 2 (HAVE_CURRENT_DATA) means there is a frame to draw.
  return video.readyState >= 2 && video.videoWidth > 0;
}

// Dimensions land with the metadata (readyState 1), well before there's any frame
// to paint. Layout only needs this much, which is why metadata alone is fetched
// up front — don't gate it on videoReady() or the card falls back to a square.
function hasDimensions() {
  return video.videoWidth > 0;
}

function videoHeight() {
  return hasDimensions()
    ? VIDEO_WIDTH * (video.videoHeight / video.videoWidth)
    : VIDEO_WIDTH;
}

export default function createSkatingPrize(borderColor = "#0e4749") {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  const ctx = canvas.getContext("2d");
  ctx.font = `bold ${CARD_FONT_SIZE}px sans-serif`;
  const lines = getWrappedLines(ctx, TEXT, canvas.width - 80);

  // Layout is locked in up front (a square placeholder if the video's metadata
  // is still loading) and never recalculated, to avoid resizing the sprite
  // mid-animation.
  const vHeight = videoHeight();
  canvas.height =
    CARD_PADDING + vHeight + TEXT_GAP + lines.length * CARD_LINE_HEIGHT + CARD_PADDING;

  const { sprite, texture } = createCardSprite(canvas);
  // Keep this card on screen longer than the others so the video has time to
  // play (gacha.js reads this in the "holding" phase).
  sprite.userData.holdDuration = 10000;
  const videoX = (canvas.width - VIDEO_WIDTH) / 2;

  function draw() {
    drawCardBackground(ctx, canvas, borderColor);

    if (videoReady()) {
      drawContained(ctx, video, videoX, CARD_PADDING, VIDEO_WIDTH, vHeight);
    }

    ctx.fillStyle = darken(borderColor);
    ctx.font = `bold ${CARD_FONT_SIZE}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textY =
      CARD_PADDING + vHeight + TEXT_GAP + (lines.length * CARD_LINE_HEIGHT) / 2;
    drawWrappedLines(ctx, lines, canvas.width / 2, textY, CARD_LINE_HEIGHT);
    texture.needsUpdate = true;
  }

  // Restart from the beginning each time a card opens, then play (muted
  // autoplay is permitted) and repaint every frame so the moving video shows
  // on the card. The loop stops itself when the card's texture is disposed
  // during cleanup (see gacha.js cleanupPrize).
  video.currentTime = 0;
  video.play().catch(() => {});
  let running = true;
  function tick() {
    if (!running) return;
    draw();
    requestAnimationFrame(tick);
  }
  tick();

  texture.addEventListener("dispose", () => {
    running = false;
  });

  return sprite;
}

// Upgrade from metadata-only to the full download. Guarded because load() resets
// playback, so calling it again mid-card would restart the video.
createSkatingPrize.preload = () => {
  if (warmed) return;
  warmed = true;
  video.preload = "auto";
  video.load();
};
