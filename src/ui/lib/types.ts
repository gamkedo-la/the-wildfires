import { SignalValue, Signal } from "@game/state/lib/types";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      container: ContainerElement;
      text: TextElement;
      rectangle: RectangleElement;
      sprite: SpriteElement;
      image: ImageElement;
      circle: CircleElement;
      zone: ZoneElement;
    }
  }
}

export type ContainerElement =
  PhaserGameObjectProps<Phaser.GameObjects.Container>;

export type TextElement = PhaserGameObjectProps<Phaser.GameObjects.Text> & {
  text?: SignalValue<string>;
  style?: SignalValue<Phaser.Types.GameObjects.Text.TextStyle>;
};

export type RectangleElement =
  PhaserGameObjectProps<Phaser.GameObjects.Rectangle> & {
    width: SignalValue<number>;
    height: SignalValue<number>;
    fillColor: SignalValue<number>;
  };

export type SpriteElement = PhaserGameObjectProps<Phaser.GameObjects.Sprite> & {
  texture: SignalValue<string>;
  frame?: SignalValue<string | number>;
};

export type ImageElement = PhaserGameObjectProps<Phaser.GameObjects.Image> & {
  texture: SignalValue<string>;
  frame?: SignalValue<string | number>;
};

export type CircleElement = PhaserGameObjectProps<Phaser.GameObjects.Arc> & {
  radius: SignalValue<number>;
  fillColor?: SignalValue<number>;
};

export type ZoneElement = PhaserGameObjectProps<Phaser.GameObjects.Zone> & {
  width: SignalValue<number>;
  height: SignalValue<number>;
};

export interface PhaserGameObjectProps<
  T extends Phaser.GameObjects.GameObject
> {
  // JSX children prop
  children?: PhaserGameObjectProps<Phaser.GameObjects.GameObject>[];

  key?: string;
  active?: SignalValue<boolean>;
  visible?: SignalValue<boolean>;

  x?: SignalValue<number>;
  y?: SignalValue<number>;
  alpha?: SignalValue<number>;
  angle?: SignalValue<number>;
  scale?: SignalValue<number>;
  scaleX?: SignalValue<number>;
  scaleY?: SignalValue<number>;

  origin?: SignalValue<number>;
  originX?: SignalValue<number>;
  originY?: SignalValue<number>;

  depth?: SignalValue<number>;
  scrollFactor?: SignalValue<number>;
  scrollFactorX?: SignalValue<number>;
  scrollFactorY?: SignalValue<number>;

  interactive?: SignalValue<boolean>;
  onPointerdown?: (pointer: Phaser.Input.Pointer) => void;
  onPointerup?: (pointer: Phaser.Input.Pointer) => void;
  onPointerover?: (pointer: Phaser.Input.Pointer) => void;
  onPointerout?: (pointer: Phaser.Input.Pointer) => void;
  onPointermove?: (pointer: Phaser.Input.Pointer) => void;

  bind?: Record<string, Signal<any>>;
  ref?: (gameObject: T) => void;
}

export const cleanupSymbol = Symbol("cleanup");

export interface SignalCleanup {
  [cleanupSymbol]: Array<() => void>;
}
