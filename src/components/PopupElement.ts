import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import BoxElement = Widgets.BoxElement;
import BlessedElement = Widgets.BlessedElement;

export class PopupElement extends Element {
  readonly #box: Widgets.TextElement;

  #parent : Widgets.BoxElement | null = null;

  #initiator : Element | BoxElement | null = null;

  #children : BlessedElement[] = [];

  readonly #git: Git;

  get instance() {
    return this.#box;
  }

  override focus() {
    if (this.#children.length) {
      this.#children.at(-1)?.focus();
    } else {
      this.#box.focus();
    }
  }

  addChild(child: BlessedElement) {
    this.#children.push(child);
    this.#box.append(child);
    child.focus();
    child.key('escape', () => { this.detachChild(child); });
  }

  detachChild(child: BlessedElement) {
    const index = this.#children.indexOf(child);
    if (index > -1) {
      this.#children.splice(index, 1);
    }
    child.detach();
    if (this.#children.length) {
      this.focus();
    } else {
      this.hide();
    }
    this.#box.screen.render();
  }

  show(parent: Widgets.BoxElement, initiator: Element | BoxElement) {
    this.#parent = parent;
    this.#parent.append(this.#box);
    this.#initiator = initiator;
    this.focus();
  }

  shrinkLabel(label: string, maxWidth: number) {
    if (label.length > maxWidth) {
      return `${label.substring(0, maxWidth)}...`;
    }
    return label;
  }

  setLabel(label: string) {
    this.#box.setLabel(this.shrinkLabel(label, this.#box.width as number - 7));
  }

  renderMenu(options: string[], handlers: any[]) {
    const menuBox = contrib.table({
      keys: true,
      columnWidth: [1000],
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      data: { headers: [''], data: options.map((option) => [option]) },
    });
    this.addChild(menuBox);
    (menuBox as any).rows.on('select', (item: any, index: number) => {
      handlers[index]();
    });
    (menuBox as any).rows.key('escape', () => { this.detachChild(menuBox); });
  }

  renderTextInput(label: string, submitHandler: any) {
    const textBox = blessed.textbox({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      inputOnFocus: true,
      label,
      padding: 2,
    });
    textBox.on('submit', async (value: string) => { submitHandler(value); });
    this.addChild(textBox);
  }

  hide() {
    while (this.#children.length) {
      this.detachChild(this.#children.at(-1) as BlessedElement);
    }
    this.#box.detach();
    this.#initiator?.focus();
  }

  onEscape() {
    this.hide();
    this.#box.screen.render();
  }

  constructor({ git, ...config } : ElementConfig) {
    super();
    this.#git = git;
    this.#box = blessed.box({
      ...config,
      border: { type: 'line' },
      keys: true,
      top: 'center',
      left: 'center',
      fg: 'green',
      bg: 'yellow',
    });
    this.#box.key('escape', () => { this.onEscape(); });
    this.applyBorderStyleForFocusedElement(this.#box, this.#box);
  }
}
