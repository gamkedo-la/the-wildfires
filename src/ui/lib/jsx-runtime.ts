import { setupGameObject } from "./phaser-jsx";

/*
  JSX runtime

  This is the runtime for JSX. It is used by esbuild to transform JSX into calls.
  It must exists as a separated file as it is hardcoded import in esbuild

  https://esbuild.github.io/api/#jsx-import-source
*/

export function jsx(
  type: string | Function,
  props: Record<string, any>
): Phaser.GameObjects.GameObject {
  // Handle functional components
  if (typeof type === "function") {
    return type(props);
  }

  return setupGameObject(type, props);
}

export function jsxs(
  type: string | Function,
  props: any
): Phaser.GameObjects.GameObject {
  return jsx(type, props);
}

export function Fragment({ children }: { children: any[] }) {
  return children;
}