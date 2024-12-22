import { RESOURCES } from "@game/assets";
import { TEXT_STYLE } from "@game/consts";
import { computed, signal } from "@game/state/lib/signals";
import { Signal } from "@game/state/lib/types";
import { AbstractScene } from "../..";

export function KeyButton({
  keyName,
  x,
  y,
  press,
}: {
  keyName: string;
  x: number;
  y: number;
  press?: Signal<number>;
}) {
  return (
    <>
      <nineslice
        texture={RESOURCES["key-nine-slice"]}
        frame={0}
        originX={0.5}
        scale={1.5}
        x={x}
        y={y}
        width={25}
        height={25}
        leftWidth={4}
        rightWidth={4}
        topHeight={4}
        bottomHeight={5}
        tint={
          press
            ? computed(() => (press.get() === 1 ? 0xa56243 : 0xffffff))
            : 0xffffff
        }
      />
      <text
        text={keyName}
        originX={0.5}
        x={x}
        y={
          press ? computed(() => y - 11 + (press.get() === 1 ? 3 : 0)) : y - 11
        }
        style={{
          ...TEXT_STYLE,
          fontSize: "18px",
          fontStyle: "bold",
          color: "#45230d",
        }}
      />
    </>
  );
}

export function Directions({
  x,
  y,
  scene,
}: {
  x: number;
  y: number;
  scene: AbstractScene;
}) {
  const width = 350;
  const height = 300;

  const startingPlaneY = 100;

  const planeX = signal(0);
  const planeY = signal(startingPlaneY);
  const planeAngle = signal(0);
  const planeFrame = signal(2);
  const keyPressLeft = signal(0);
  const keyPressRight = signal(0);

  const follower = {
    t: 0,
    vec: new Phaser.Math.Vector2(),
    tangent: new Phaser.Math.Vector2(),
  };

  const startX = 122;
  const startY = 170;
  const path = new Phaser.Curves.Path(startX, startY);

  // First ellipse (right loop)
  path.ellipseTo(75, 75, 45, 315);

  // Move to the starting point of the second ellipse
  path.lineTo(startX + 100, startY);

  // Second ellipse (left loop) - counter-clockwise
  path.ellipseTo(75, 75, 315, 45, true, 180);

  path.closePath();

  scene.tweens.add({
    targets: follower,
    t: 1,
    ease: "Linear",
    duration: 6000,
    repeat: -1,
    onUpdate: () => {
      path.getPoint(follower.t, follower.vec);
      path.getTangent(follower.t, follower.tangent);
      planeX.set(follower.vec.x);
      planeY.set(follower.vec.y);
      planeAngle.set((follower.tangent.angle() * 180) / Math.PI - 90);

      if (follower.t < 0.1) {
        keyPressRight.set(1);
        planeFrame.set(3);
      } else if (follower.t > 0.33 && follower.t < 0.4) {
        keyPressRight.set(0);
        planeFrame.set(2);
      } else if (follower.t > 0.5 && follower.t < 0.6) {
        keyPressLeft.set(1);
        planeFrame.set(1);
      } else if (follower.t > 0.83) {
        keyPressLeft.set(0);
        planeFrame.set(2);
      }
    },
  });

  return (
    <container x={x + 40} y={y} width={width} height={height} scale={0.75}>
      <container x={-128} y={30}>
        <KeyButton keyName="W" x={width / 2} y={height - 78} />
        <KeyButton
          keyName="A"
          x={width / 2 - 48}
          y={height - 30}
          press={keyPressLeft}
        />
        <KeyButton keyName="S" x={width / 2} y={height - 30} />
        <KeyButton
          keyName="D"
          x={width / 2 + 48}
          y={height - 30}
          press={keyPressRight}
        />
      </container>
      <container x={128} y={30}>
        <KeyButton keyName="↑" x={width / 2} y={height - 78} />
        <KeyButton
          keyName="←"
          x={width / 2 - 48}
          y={height - 30}
          press={keyPressLeft}
        />
        <KeyButton keyName="↓" x={width / 2} y={height - 30} />
        <KeyButton
          keyName="→"
          x={width / 2 + 48}
          y={height - 30}
          press={keyPressRight}
        />
      </container>
      <image
        texture={"canadair-spritesheet"}
        frame={planeFrame}
        angle={computed(() => planeAngle.get() % 360)}
        x={planeX}
        y={planeY}
      />
      <text
        x={width / 2}
        y={-55}
        text={"Control plane"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: "26px", color: "#ffffff" }}
      />
    </container>
  );
}
