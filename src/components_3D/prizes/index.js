import createStaticImagesPrize from "./static_images";
import createSkatingPrize from "./skating";

// Each entry is a prize function that takes the popped gumball's border color
// and returns a fully-built THREE.Sprite. Image-based cards are built from the
// shared static_images factory; give it the image paths (relative to public/)
// and a caption. Add a new card by pushing another entry here.
const favoriteAlbum = createStaticImagesPrize({
  imagePaths: ["/prizes/album_cover.jpeg", "/prizes/album_code.jpeg"],
  text: "current fave album: some things never leave by annabelle dinda",
});

const beli = createStaticImagesPrize({
  imagePaths: ["/prizes/beli.jpg", "/prizes/beli_qr.jpg"],
  text: "check out my beli! i love food :)",
});

const bakingAndCooking = createStaticImagesPrize({
  imagePaths: ["/prizes/baking.jpeg", "/prizes/cooking.jpeg"],
  text: "baking and cooking with friends :)",
});

const nails = createStaticImagesPrize({
  imagePaths: ["/prizes/nails1.png", "/prizes/nails2.png"],
  text: "i also do gelX nails ❤️",
});

const PRIZES = [
  createSkatingPrize,
  bakingAndCooking,
  favoriteAlbum,
  beli,
  nails,
];

// Fetch every prize's images and video. Deliberately NOT called at import: that
// downloaded ~17MB of photos and video on every page load, including for visitors
// who never touched the machine. gacha.js calls this on the first crank pull, so
// the roll and flight animations cover the fetch.
export function preloadPrizes() {
  PRIZES.forEach((createPrize) => createPrize.preload?.());
}

export default PRIZES;
