export type SignalValue<T> = T | Signal<T>;

export type SignalBindings<T> = {
  [P in keyof T]?: Signal<any>;
};

export type Subscriber<T> = (value: T) => void;
export type EqualityFn<T> = (a: T, b: T) => boolean;
export type Effect = () => void;
export type Cleanup = () => void;

export interface Signal<T> {
  get(): T;
  set(value: T): void;
  update(fn: (value: T) => T): void;
  subscribe(subscriber: Subscriber<T>): () => void;
  dispose(): void;
}

export interface MutableSignal<T> extends Signal<T> {
  mutate(fn: (value: T) => boolean): void;
}
