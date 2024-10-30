import { SignalImpl } from "@game/state/lib/signals";
import { Signal } from "@game/state/lib/types";

import {
  cleanupSymbol,
  ContainerElement,
  ImageElement,
  PhaserGameObjectProps,
  RectangleElement,
  SignalCleanup,
  SpriteElement,
  TextElement,
} from "./types";

function createSignalBinding(
  gameObject: Phaser.GameObjects.GameObject & Partial<SignalCleanup>,
  property: string,
  signal: Signal<any>
): () => void {
  const cleanup = signal.subscribe((value) => {
    if (property === "style") {
      (gameObject as any).setStyle(value);
    } else if (property === "frame") {
      (gameObject as any).setFrame(value);
    } else {
      (gameObject as any)[property] = value;
    }
  });

  if (!gameObject[cleanupSymbol]) {
    gameObject[cleanupSymbol] = [];
  }

  gameObject[cleanupSymbol].push(cleanup);

  return cleanup;
}

export function setupGameObject<T extends Phaser.GameObjects.GameObject>(
  type: string,
  props: PhaserGameObjectProps<T>
) {
  const scene = (window as any).currentScene as Phaser.Scene;

  if (!scene) {
    throw new Error("No scene found");
  }

  let gameObject: T;

  switch (type) {
    case "sprite":
      const spriteProps = props as SpriteElement;

      gameObject = scene.add.sprite(
        spriteProps.x instanceof SignalImpl
          ? spriteProps.x.get()
          : spriteProps.x,
        spriteProps.y instanceof SignalImpl
          ? spriteProps.y.get()
          : spriteProps.y,
        spriteProps.texture instanceof SignalImpl
          ? spriteProps.texture.get()
          : spriteProps.texture,
        spriteProps.frame instanceof SignalImpl
          ? spriteProps.frame.get()
          : spriteProps.frame
      ) as unknown as T;
      break;

    case "image":
      const imageProps = props as ImageElement;

      gameObject = scene.add.image(
        imageProps.x instanceof SignalImpl ? imageProps.x.get() : imageProps.x,
        imageProps.y instanceof SignalImpl ? imageProps.y.get() : imageProps.y,
        imageProps.texture instanceof SignalImpl
          ? imageProps.texture.get()
          : imageProps.texture
      ) as unknown as T;
      break;

    case "text":
      const textProps = props as TextElement;

      gameObject = scene.add.text(
        textProps.x instanceof SignalImpl ? textProps.x.get() : textProps.x,
        textProps.y instanceof SignalImpl ? textProps.y.get() : textProps.y,
        // TODO: qué?
        textProps.text instanceof SignalImpl
          ? textProps.text.get()
          : textProps.text
        //textProps.style
      ) as unknown as T;
      break;

    case "rectangle":
      const rectangleProps = props as RectangleElement;

      gameObject = scene.add.rectangle(
        rectangleProps.x instanceof SignalImpl
          ? rectangleProps.x.get()
          : rectangleProps.x,
        rectangleProps.y instanceof SignalImpl
          ? rectangleProps.y.get()
          : rectangleProps.y,
        rectangleProps.width instanceof SignalImpl
          ? rectangleProps.width.get()
          : rectangleProps.width,
        rectangleProps.height instanceof SignalImpl
          ? rectangleProps.height.get()
          : rectangleProps.height,
        rectangleProps.fillColor instanceof SignalImpl
          ? rectangleProps.fillColor.get()
          : rectangleProps.fillColor
      ) as unknown as T;
      break;

    case "container":
      const containerProps = props as unknown as ContainerElement;

      const container = scene.add.container(
        containerProps.x instanceof SignalImpl
          ? containerProps.x.get()
          : containerProps.x,
        containerProps.y instanceof SignalImpl
          ? containerProps.y.get()
          : containerProps.y
      );
      container.add(containerProps.children as Phaser.GameObjects.GameObject[]);
      gameObject = container as unknown as T;
      break;

    default:
      throw new Error(`Unknown JSX element type: ${type}`);
  }

  Object.entries(props).forEach(([key, value]) => {
    if (value instanceof SignalImpl) {
      createSignalBinding(gameObject, key, value);
    } else if (typeof value !== "undefined") {
      // TODO: This is still a bad idea
      //(gameObject as any)[key] = value;
    }
  });

  if (props.bind) {
    Object.entries(props.bind).forEach(([key, value]) => {
      createSignalBinding(gameObject, key, value);
    });
  }

  if (props.ref) {
    props.ref(gameObject);
  }

  return gameObject;
}
