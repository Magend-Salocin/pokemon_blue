import { flipX, flipY } from '../tiles/tile-helpers.js';

// Window frame tiles (8 × 8): outer line 3, inner line 2, background 0.
const CORNER = ['..333333', '.3000000', '30022222', '30200000', '30200000', '30200000', '30200000', '30200000'];
const TOP = ['33333333', '00000000', '22222222', '00000000', '00000000', '00000000', '00000000', '00000000'];
const LEFT = Array(8).fill('30200000');

export const FRAME_TILES = {
  top_left: CORNER,
  top: TOP,
  top_right: flipX(CORNER),
  left: LEFT,
  right: flipX(LEFT),
  bottom_left: flipY(CORNER),
  bottom: flipY(TOP),
  bottom_right: flipY(flipX(CORNER)),
};
