import { Widgets } from 'blessed';
import { Position } from './types';

export abstract class Box {
  readonly #box: Widgets.BoxElement;

  get instance() {
    return this.#box;
  }

  constructor(position?: Position) {
    this.#box = this.build(position);
  }

  async postInit(): Promise<void> {}

  abstract build(position?: Position): Widgets.BoxElement;
}
