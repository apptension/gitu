import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class PopupElement extends Element {
  readonly #box: Widgets.TextElement;

  #parent : Widgets.BoxElement | null = null;

  #menuBox: contrib.Widgets.TableElement | null = null;

  #initiator : Element | null = null;

  readonly #git: Git;

  get instance() {
    return this.#box;
  }

  override focus() {
    if (this.#menuBox) {
      this.#menuBox.focus();
    } else {
      this.#box.focus();
    }
  }

  show(parent: Widgets.BoxElement, initiator: Element) {
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
    this.#menuBox = contrib.table({
      keys: true,
      columnWidth: [1000],
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      data: { headers: [''], data: options.map((option) => [option]) },
    });
    this.#box.append(this.#menuBox);
    (this.#menuBox as any).rows.on('select', (item: any, index: number) => {
      handlers[index]();
    });
    (this.#menuBox as any).rows.key('escape', () => { this.onEscape(); });

    this.#menuBox.focus();
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
    this.#box.append(textBox);
    textBox.focus();
    textBox.on('submit', async (value: string) => { submitHandler(value); });
    textBox.key('escape', () => { textBox.detach(); this.focus(); this.#box.screen.render(); });
  }

  hide() {
    this.#box.detach();
    this.#initiator?.focus();
  }

  onEscape() {
    this.hide();
    this.#menuBox = null;
    this.#box.screen.render();
  }

  constructor({ git, ...config } : ElementConfig) {
    super();
    this.#git = git;
    this.#box = blessed.box({
      ...config,
      label: '',
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
