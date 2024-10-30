export type SignalValue<T> = T | Signal<T>;

export type SignalBindings<T> = {
  [P in keyof T]?: Signal<any>;
};

// TODO: These are not used yet
export type Effect = () => void | (() => void);
export type Cleanup = () => void;

export type Subscriber<T> = (value: T) => void;

export interface Signal<T> {
  get(): T;
  set(value: T): void;
  update(fn: (value: T) => T): void;
  rawObjectUpdate(fn: (value: T) => void): void;
  subscribe(subscriber: Subscriber<T>): () => void;
  dispose(): void;
}
