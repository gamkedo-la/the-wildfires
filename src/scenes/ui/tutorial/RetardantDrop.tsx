import { TEXT_STYLE } from "@game/consts";
import {
  createTransitionSignal,
  Parallel,
  Repeat,
  Sequence,
  Step,
  Transition,
  Wait,
} from "../../../ui/animation/animation";
import { AbstractScene } from "../..";
import { RESOURCES } from "@game/assets";
import { computed } from "@game/state/lib/signals";
import { Math as PMath } from "phaser";
import { Signal } from "@game/state/lib/types";
import { KeyButton } from "./Directions";

export function RetardantDrop({
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

  const startingPlaneY = 100;

  const planeX = createTransitionSignal(0);
  const planeY = createTransitionSignal(startingPlaneY);

  const keyPressPos = createTransitionSignal(0);
  const keyPressTint = createTransitionSignal(0);
  const keyPressPickTint = createTransitionSignal(0);

  const waterFx = scene.add.particles(0, 0, "water", {
    quantity: 10,
    speedX: { random: [-20, 20] },
    speedY: { random: [-20, 20] },
    gravityY: 50,
    frequency: 10,
    lifespan: 1200,
    emitting: false,
    tint: 0xff3333,
  });

  const tint = [
    [0x664433, 0x927e6a, 0xefd8a1, 0x927e6a],
    [0x434033, 0xefd8a1, 0x927e6a],
    [0x3f4033, 0x927e6a, 0xefd8a1],
    [0x504033, 0xefd8a1],
  ];

  const smokeFx = scene.add.particles(0, 0, "smoke-spritesheet", {
    x: () => PMath.RND.between(x + 95, x + 120),
    y: () => PMath.RND.between(190, 210),
    color: PMath.RND.pick(tint),
    anim: "smoke-out",
    quantity: 2,
    angle: () => PMath.RND.between(-180, -90),
    speed: [5, 15],
    gravityX: -5,
    gravityY: -10,
    frequency: 25,
    lifespan: [2000, 4000],
  });

  smokeFx.setDepth(2);

  // TODO: Lost the z-index battle here (the particles go above everything no matter what depth)
  waterFx.setDepth(2);

  const tintSignal = createTransitionSignal(0xffffff);

  scene.animationEngine.run(
    <Repeat times={1000}>
      <Parallel>
        <Transition
          signal={planeX}
          from={0}
          to={width + 32}
          duration={5000}
          ease="Linear"
        />
        <Sequence>
          <Wait duration={300} />
          <Transition
            signal={keyPressPickTint}
            to={1}
            duration={0}
            ease="Cubic.easeIn"
          />
          <Wait duration={700} />
          <Transition
            signal={keyPressPickTint}
            to={0}
            duration={0}
            ease="Cubic.easeIn"
          />
          <Parallel>
            <Wait duration={800} />

            <Transition
              signal={keyPressTint}
              to={1}
              duration={100}
              ease="Cubic.easeIn"
            />
            <Transition
              signal={keyPressPos}
              to={5}
              duration={100}
              ease="Cubic.easeIn"
            />
          </Parallel>
          <Parallel>
            <Repeat times={3}>
              <Step
                duration={500}
                action={() =>
                  waterFx.emitParticle(200, x + planeX.get(), y + planeY.get())
                }
              />
            </Repeat>
            <Sequence>
              <Wait duration={1000} />
              <Transition
                signal={tintSignal}
                to={0xff6b6b}
                duration={100}
                ease="Cubic.easeIn"
              />
            </Sequence>
          </Parallel>
          <Parallel>
            <Wait duration={1000} />
            <Transition
              signal={keyPressTint}
              to={0}
              duration={100}
              ease="Cubic.easeIn"
            />
            <Transition
              signal={keyPressPos}
              to={0}
              duration={1}
              ease="Cubic.easeIn"
            />
          </Parallel>
          <Transition
            signal={tintSignal}
            to={0xffffff}
            duration={0}
            ease="Cubic.easeIn"
          />
        </Sequence>
      </Parallel>
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

  return (
    <container x={x} y={y} width={width} height={height}>
      <>{tile(1, 48, 126, tintSignal)}</>
      <>{tile(2, 80, 126)}</>
      <>{tile(3, 112, 126)}</>
      <>{tile(4, 64, 150, tintSignal)}</>
      <>{tile(5, 96, 150)}</>
      <>{tile(6, 128, 150)}</>
      <>{tile(7, 48, 174, tintSignal)}</>
      <>{tile(8, 80, 174)}</>
      <>{tile(9, 112, 174)}</>
      <>{tile(20, 16, 126)}</>
      <>{tile(21, 0, 150)}</>
      <>{tile(22, 32, 150, tintSignal)}</>
      <>{tile(23, 16, 174)}</>

      <>{tile(90, 128, 150)}</>

      <sprite
        texture={"tilemap-spritesheet"}
        frame={computed(() => 30 + fireFrames.get())}
        x={16 + width / 2 - 2 * 32}
        y={126}
        scale={2}
      />
      <sprite
        texture={"tilemap-spritesheet"}
        frame={computed(() => 31 + fireFrames.get())}
        x={width / 2 - 2 * 32}
        y={150}
        scale={2}
      />
      <sprite
        texture={"tilemap-spritesheet"}
        frame={computed(() => 32 + fireFrames.get())}
        x={16 + width / 2 - 2 * 32}
        y={174}
        scale={2}
      />

      <image
        texture={"martin-spritesheet"}
        frame={0}
        angle={-90}
        x={planeX}
        y={155}
        tint={0x000000}
        alpha={0.5}
      />
      <image
        texture={"martin-spritesheet"}
        frame={0}
        angle={-90}
        x={planeX}
        y={planeY}
        depth={-1}
      />

      {/*
      <text
        x={width / 2}
        y={20}
        text={"Drop water"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: "24px", color: "#ffffff" }}
      />
      */}

      <KeyButton keyName="2" x={width / 2} y={0} press={keyPressPickTint} />

      <nineslice
        texture={RESOURCES["key-nine-slice"]}
        frame={0}
        originX={0.5}
        x={width / 2}
        y={height - 30}
        width={150}
        height={25}
        scale={2}
        leftWidth={4}
        rightWidth={4}
        topHeight={4}
        bottomHeight={5}
        tint={computed(() => (keyPressTint.get() === 1 ? 0xa56243 : 0xffffff))}
      />
      <text
        x={width / 2}
        y={computed(() => height - 45 + keyPressPos.get())}
        text={"space"}
        originX={0.5}
        style={{ ...TEXT_STYLE, fontSize: "20px", color: "#45230d" }}
      />
    </container>
  );
}
