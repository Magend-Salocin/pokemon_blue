// A transparent scene holding a stack of widgets drawn over the scene below. Only the top
// widget gets input. `open(widget)` resolves with the widget result and removes it.
// Widget contract: update(dt, input) → undefined while open, or { value } to close;
// render(ctx). Widgets below the top one stay visible (nested menus).

export class MenuLayer {
  transparent = true;
  blocksInput = true;

  constructor() {
    this.entries = [];
  }

  enter(manager) {
    this.manager = manager;
  }

  open(widget) {
    return new Promise((resolve) => {
      this.entries.push({ widget, resolve });
    });
  }

  /**
   * Keeps a widget visible without input (money window, or a parent menu while a sub-menu is
   * open). Drawn under the open widgets. Returns a remover.
   */
  show(widget) {
    const entry = { widget, passive: true };
    const firstOpen = this.entries.findIndex((other) => !other.passive);
    this.entries.splice(firstOpen < 0 ? this.entries.length : firstOpen, 0, entry);
    return () => {
      this.entries = this.entries.filter((other) => other !== entry);
    };
  }

  close() {
    if (this.manager?.top === this) this.manager.pop();
  }

  update(dt, input) {
    const top = [...this.entries].reverse().find((entry) => !entry.passive);
    if (!top) return;
    const result = top.widget.update(dt, input);
    if (result) {
      this.entries = this.entries.filter((entry) => entry !== top);
      top.resolve(result.value);
    }
  }

  render(ctx) {
    for (const { widget } of this.entries) widget.render(ctx);
  }
}

/** Opens a widget and keeps it drawn (inactive) while `then(value)` runs. */
export async function openAndKeep(layer, widget, then) {
  const value = await layer.open(widget);
  const hide = layer.show(widget);
  try {
    return await then(value);
  } finally {
    hide();
  }
}

/** Pushes a layer, runs `flow(layer)` and pops the layer afterwards. */
export async function withMenuLayer(manager, flow) {
  const layer = manager.push(new MenuLayer());
  try {
    return await flow(layer);
  } finally {
    layer.close();
  }
}
