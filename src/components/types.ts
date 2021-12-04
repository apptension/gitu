import { Widgets } from 'blessed';

export type BlockCreator = () => Promise<Widgets.BoxElement>;
