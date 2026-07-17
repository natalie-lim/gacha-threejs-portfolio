import createFavoriteAlbumPrize from "./favoriteAlbum";
import createSkatingPrize from "./skating";

// Add a new prize by writing its own file next to this one (see
// favoriteAlbum.js for the pattern: a function that takes a CSS border color
// string — the popped gumball's color — and returns a fully-built
// THREE.Sprite) and listing it here.
const PRIZES = [createFavoriteAlbumPrize, createSkatingPrize];

export default PRIZES;
