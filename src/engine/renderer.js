import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants.js';
import { createCanvas } from '../gfx/bitmap.js';

/**
 * Draws the game into a 160×144 buffer, then copies it to the visible canvas with the
 * largest integer scale that fits, centered, with black bars.
 * Sizes are measured in device pixels so the scale stays integer on HiDPI screens.
 */
export function createRenderer(displayCanvas) {
  const buffer = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
  const ctx = buffer.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const displayCtx = displayCanvas.getContext('2d', { alpha: false });
  let scale = 1;

  function setDisplaySize(width, height) {
    if (displayCanvas.width !== width || displayCanvas.height !== height) {
      displayCanvas.width = width;
      displayCanvas.height = height;
    }
    displayCtx.imageSmoothingEnabled = false;
    scale = Math.max(1, Math.floor(Math.min(width / SCREEN_WIDTH, height / SCREEN_HEIGHT)));
    present();
  }

  function present() {
    const width = SCREEN_WIDTH * scale;
    const height = SCREEN_HEIGHT * scale;
    const x = Math.floor((displayCanvas.width - width) / 2);
    const y = Math.floor((displayCanvas.height - height) / 2);

    displayCtx.fillStyle = '#000';
    displayCtx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    displayCtx.drawImage(buffer, x, y, width, height);
  }

  const observer = new ResizeObserver(([entry]) => {
    const deviceBox = entry.devicePixelContentBoxSize?.[0];
    if (deviceBox) {
      setDisplaySize(deviceBox.inlineSize, deviceBox.blockSize);
    } else {
      const ratio = window.devicePixelRatio || 1;
      setDisplaySize(Math.round(entry.contentRect.width * ratio), Math.round(entry.contentRect.height * ratio));
    }
  });
  observer.observe(displayCanvas, { box: 'device-pixel-content-box' });

  return {
    ctx,
    present,
    get scale() {
      return scale;
    },
  };
}
