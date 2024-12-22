import { computed, signal } from "@game/state/lib/signals";
import { Signal } from "@game/state/lib/types";
import { Math as PMath } from "phaser";
import { AbstractScene } from "../..";
import {
  createTransitionSignal,
  Repeat,
  Sequence,
  Step,
  Wait,
} from "../../../ui/animation/animation";
import { TEXT_STYLE } from "@game/consts";

export function FireVelocity({
  x,
  y,
  scene,
}: {
  x: number;
  y: number;
  scene: AbstractScene;
}) {
  const width = scene.scale.width / 3;
  const height = 300;

  const tint = [
    [0x664433, 0x927e6a, 0xefd8a1, 0x927e6a],
    [0x434033, 0xefd8a1, 0x927e6a],
    [0x3f4033, 0x927e6a, 0xefd8a1],
    [0x504033, 0xefd8a1],
  ];

  const smokeFx1 = scene.add.particles(0, 0, "smoke-spritesheet", {
    x: () => PMath.RND.between(x + 100, x + 125),
    y: () => PMath.RND.between(470, 480),
    color: PMath.RND.pick(tint),
    frame: [0, 1, 2, 3],
    quantity: 1,
    angle: () => PMath.RND.between(-180, -90),
    speed: [5, 15],
    gravityX: -5,
    gravityY: -10,
    frequency: 25,
    lifespan: [2000, 4000],
    emitting: false,
  });

  const smokeFx2 = scene.add.particles(0, 0, "smoke-spritesheet", {
    x: () => PMath.RND.between(3 * 32 + x + 133, 3 * 32 + x + 155),
    y: () => PMath.RND.between(470, 480),
    color: PMath.RND.pick(tint),
    frame: [0, 1, 2, 3],
    quantity: 1,
    angle: () => PMath.RND.between(-180, -90),
    speed: [5, 15],
    gravityX: -5,
    gravityY: -10,
    frequency: 25,
    lifespan: [2000, 4000],
    emitting: false,
  });

  const smokeFx3 = scene.add.particles(0, 0, "smoke-spritesheet", {
    x: () => PMath.RND.between(-2 * 32 + x + 134, -2 * 32 + x + 156),
    y: () => PMath.RND.between(565, 575),
    color: PMath.RND.pick(tint),
    frame: [0, 1, 2, 3],
    quantity: 1,
    angle: () => PMath.RND.between(-180, -90),
    speed: [5, 15],
    gravityX: -5,
    gravityY: -10,
    frequency: 25,
    lifespan: [2000, 4000],
    emitting: false,
  });

  const smokeFx4 = scene.add.particles(0, 0, "smoke-spritesheet", {
    x: () => PMath.RND.between(1 * 32 + x + 105, 1 * 32 + x + 130),
    y: () => PMath.RND.between(663, 673),
    color: PMath.RND.pick(tint),
    frame: [0, 1, 2, 3],
    quantity: 1,
    angle: () => PMath.RND.between(-180, -90),
    speed: [5, 15],
    gravityX: -5,
    gravityY: -10,
    frequency: 25,
    lifespan: [2000, 4000],
    emitting: false,
  });

  smokeFx1.setDepth(2);
  smokeFx2.setDepth(2);
  smokeFx3.setDepth(2);
  smokeFx4.setDepth(2);

  const fireColumn1 = signal(0);
  const fireColumn2 = signal(0);
  const fireColumn3 = signal(0);
  const fireColumn4 = signal(0);
  const fireColumn5 = signal(0);
  const fireColumn6 = signal(0);

  scene.animationEngine.run(
    <Repeat times={1000}>
      <Sequence>
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(1);
            fireColumn2.set(1);
            fireColumn3.set(1);
            fireColumn4.set(1);
            fireColumn5.set(1);
            fireColumn6.set(1);
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(2);
            fireColumn6.set(2);
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(3);
            fireColumn2.set(2);
            smokeFx1.start();
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(4);
            fireColumn2.set(3);
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(5);
            fireColumn3.set(2);
            smokeFx3.start();
            fireColumn5.set(2);
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(6);
            fireColumn2.set(4);
            fireColumn5.set(3);
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(7);
            fireColumn3.set(3);
            smokeFx2.start();
            fireColumn5.set(4);
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(8);
            fireColumn2.set(5);
            fireColumn3.set(4);
            fireColumn5.set(6);
            fireColumn6.set(4);
            smokeFx4.start();
          }}
        />
        <Wait duration={1000} />
        <Step
          duration={1000}
          action={() => {
            fireColumn1.set(0);
            fireColumn2.set(0);
            fireColumn3.set(0);
            fireColumn4.set(0);
            fireColumn5.set(0);
            fireColumn6.set(0);
            smokeFx1.stop();
            smokeFx2.stop();
            smokeFx3.stop();
            smokeFx4.stop();
          }}
        />
      </Sequence>
    </Repeat>
  );

  const fireFrames = createTransitionSignal(0);

  scene.animationEngine.run(
    <Repeat times={5000}>
      <Step duration={1000} action={() => fireFrames.set(1)} />
      <Step duration={1000} action={() => fireFrames.set(0)} />
    </Repeat>
  );

  const tile = (
    index: number,
    x: number,
    y: number,
    tint: Signal<number> | number = 0xffffff
  ) => (
    <sprite
      texture={"tilemap-spritesheet"}
      frame={index}
      x={x + width / 2 - 2 * 32}
      y={y}
      scale={2}
      tint={tint}
    />
  );

  const fire = (
    fireColumn: Signal<number>,
    index: number,
    sprite: number,
    x: number,
    y: number
  ) => (
    <sprite
      texture={"tilemap-spritesheet"}
      frame={computed(() => 30 + sprite + fireFrames.get())}
      alpha={computed(() => (fireColumn.get() > index ? 1 : 0.0))}
      x={x + width / 2 - 2 * 32}
      y={y}
      scale={2}
    />
  );

  return (
    <container x={x - 10} y={y} width={width} height={height}>
      <>{tile(2, -48, 78)}</>
      <>{tile(8, -16, 78)}</>
      <>{tile(5, 16, 78)}</>
      <>{tile(4, 48, 78)}</>
      <>{tile(1, 80, 78)}</>
      <>{tile(2, 112, 78)}</>
      <>{tile(3, 144, 78)}</>
      <>{tile(3, 176, 78)}</>

      <>{tile(22, -48, 126)}</>
      <>{tile(24, -16, 126)}</>
      <>{tile(22, 16, 126)}</>
      <>{tile(21, 48, 126)}</>
      <>{tile(20, 80, 126)}</>

      <>{tile(2, -48, 174)}</>
      <>{tile(5, -16, 174)}</>
      <>{tile(3, 16, 174)}</>
      <>{tile(7, 48, 174)}</>
      <>{tile(80, -48, 174)}</>
      <>{tile(81, -16, 174)}</>
      <>{tile(85, 16, 174)}</>
      <>{tile(87, 48, 174)}</>

      <>{tile(2, -48, 222)}</>
      <>{tile(62, -16, 222)}</>
      <>{tile(50, 16, 222)}</>

      <>{tile(2, -48, 270)}</>
      <>{tile(4, -16, 270)}</>
      <>{tile(2, 16, 270)}</>
      <>{tile(1, 48, 270)}</>
      <>{tile(0, 80, 270)}</>
      <>{tile(101, -16, 270)}</>

      <>{tile(3, -48, 318)}</>
      <>{tile(170, -16, 318)}</>
      <>{tile(8, 16, 318)}</>
      <>{tile(1, 48, 318)}</>
      <>{tile(200, 16, 318)}</>

      <>{fire(fireColumn1, 0, 0, -48, 78)}</>
      <>{fire(fireColumn1, 1, 1, -16, 78)}</>
      <>{fire(fireColumn1, 2, 2, 16, 78)}</>
      <>{fire(fireColumn1, 3, 1, 48, 78)}</>
      <>{fire(fireColumn1, 4, 1, 80, 78)}</>
      <>{fire(fireColumn1, 5, 0, 112, 78)}</>
      <>{fire(fireColumn1, 6, 2, 144, 78)}</>
      <>{fire(fireColumn1, 7, 1, 176, 78)}</>

      <>{fire(fireColumn2, 0, 2, -48, 126)}</>
      <>{fire(fireColumn2, 1, 0, -16, 126)}</>
      <>{fire(fireColumn2, 2, 2, 16, 126)}</>
      <>{fire(fireColumn2, 3, 1, 48, 126)}</>
      <>{fire(fireColumn2, 4, 0, 80, 126)}</>

      <>{fire(fireColumn3, 0, 2, -48, 174)}</>
      <>{fire(fireColumn3, 1, 1, -16, 174)}</>
      <>{fire(fireColumn3, 2, 0, 16, 174)}</>
      <>{fire(fireColumn3, 3, 1, 48, 174)}</>

      <>{fire(fireColumn4, 0, 2, -48, 222)}</>

      <>{fire(fireColumn5, 0, 2, -48, 270)}</>
      <>{fire(fireColumn5, 1, 0, -16, 270)}</>
      <>{fire(fireColumn5, 2, 2, 16, 270)}</>
      <>{fire(fireColumn5, 3, 1, 48, 270)}</>
      <>{fire(fireColumn5, 4, 0, 80, 270)}</>

      <>{fire(fireColumn6, 0, 3, -48, 318)}</>
      <>{fire(fireColumn6, 1, 1, -16, 318)}</>
      <>{fire(fireColumn6, 2, 0, 16, 318)}</>
      <>{fire(fireColumn6, 3, 1, 48, 318)}</>

      <text
        x={width / 2}
        y={30}
        text={"Watch out"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: "20px", color: "#ffffff" }}
      />
    </container>
  );
}
